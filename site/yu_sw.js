/* Builds embed the immutable release paths and their SHA-256 digests here. */
const BUILD = /* YU_SW_BUILD */ null;
if (!BUILD || typeof BUILD.version !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(BUILD.version) || typeof BUILD.offlineHtml !== 'string') {
  throw new Error('Missing YuMapAI service worker build');
}

const scope = new URL(self.registration.scope);
const release = new URL(`yu-release/${BUILD.version}/`, scope);
const versionUrl = new URL('version.json', scope);
const indexUrl = new URL('index.html', scope);
const cachePrefix = `yumapai-sw:${scope.pathname}:`;
const cacheName = cachePrefix + BUILD.version;
const staticFolders = new Set(['assets', 'canvaskit', 'ff-fonts', 'icons', 'maplibre']);
const staticFiles = new Set([
  'main.dart.js', 'flutter_bootstrap.js', 'flutter.js', 'yu-web.js', 'yu-web.css',
  'yu-sw-init.js', 'favicon.png', 'manifest.json',
]);
const fixedRoutes = [
  'acilisPage', 'aktif-gezi', 'arkadas-bul', 'ayarlar', 'beta', 'bildirim-ayarlari',
  'bildirimler', 'degerlendir', 'dil', 'engellenen-hesaplar', 'eposta-dogrula',
  'gezi', 'gezi-haritam', 'giris', 'gizlilik-ayarlari', 'gonderi', 'gonderi-sec',
  'hesap-dondur', 'hesap-durum', 'hesap-sil', 'hesap-yonetimi', 'hosgeldin',
  'isletme-basvuru', 'isletme-panel', 'kampanya', 'kampanya-olustur', 'kayit',
  'kesfet', 'kesfet-sonuc', 'koleksiyon', 'koleksiyona-ekle', 'kosullar', 'kullanici',
  'lisanslar', 'mekan', 'mekan-oner', 'mesajlar', 'one-cikar', 'one-cikarmalarim',
  'profil', 'profil-duzenle', 'profil-olustur', 'reklam', 'rota', 'rota-plan',
  'sifre-sifirla', 'sohbet', 'sosyal', 'story', 'telefon', 'video-kirp', 'yasal',
  'yasal-taslak', 'yeni-gonderi', 'yeni-mesaj', 'yolUstu', 'yumy',
];
const appRoutes = new Set(['', 'index.html', ...(BUILD.routes || fixedRoutes)]);

const assets = new Map();
for (const [path, hash] of Object.entries(BUILD.files)) {
  const parts = path.split('/');
  const allowed = staticFolders.has(parts[0]) || staticFiles.has(path) || /^main\.dart\.js_\d+\.part\.js$/.test(path);
  if (!allowed || /[\\?#%]|\.(?:html?|br|gz)$/i.test(path) ||
      parts.some(part => !part || part === '.' || part === '..') || !/^[a-f0-9]{64}$/.test(hash)) {
    throw new Error(`Invalid YuMapAI manifest asset: ${path}`);
  }
  const url = new URL(parts.map(encodeURIComponent).join('/'), release).href;
  assets.set(path, { url, hash });
}
const assetsByUrl = new Map(Array.from(assets.values(), asset => [asset.url, asset]));
const precache = BUILD.precache.map(path => {
  const asset = assets.get(path);
  if (!asset) throw new Error(`Missing YuMapAI precache asset: ${path}`);
  return asset;
});

let disabled = false;
let cleanup;

async function deleteAppCaches(keep) {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith(cachePrefix) && name !== keep)
    .map(name => caches.delete(name)));
}

async function disableWorker() {
  disabled = true;
  if (!cleanup) {
    cleanup = (async () => {
      try {
        await self.registration.unregister();
      } finally {
        await deleteAppCaches();
      }
    })();
  }
  return cleanup;
}

async function killRequested(response) {
  if (!response.ok || response.redirected) return false;
  try {
    const metadata = await response.json();
    return metadata?.swKill === true;
  } catch {
    return false;
  }
}

function fetchVersion() {
  return fetch(versionUrl.href, { cache: 'no-store', credentials: 'omit', redirect: 'error' });
}

async function fetchVerified(asset, cache) {
  const response = await fetch(asset.url, { cache, credentials: 'omit', redirect: 'error' });
  if (response.status !== 200 || response.url !== asset.url || response.redirected) {
    throw new Error(`YuMapAI static response invalid: ${asset.url}`);
  }
  // Digest the browser's decoded bytes. Keep the original headers and body
  // together in CacheStorage, including the server's chosen content encoding.
  const bytes = await response.clone().arrayBuffer();
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const hash = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== asset.hash) throw new Error(`YuMapAI asset digest differs: ${asset.url}`);
  return response;
}

async function downloadVerified(asset) {
  try {
    return await fetchVerified(asset, 'force-cache');
  } catch {
    // A stale browser HTTP cache entry can never populate a release cache.
    return fetchVerified(asset, 'no-store');
  }
}

async function installAssets() {
  if (await killRequested(await fetchVersion())) {
    await disableWorker();
    throw new Error('YuMapAI service worker disabled');
  }
  const existed = await caches.has(cacheName);
  const cache = await caches.open(cacheName);
  let cursor = 0;
  let error;
  async function fillCache() {
    while (!error && cursor < precache.length) {
      const asset = precache[cursor++];
      try {
        if (await cache.match(asset.url)) continue;
        const response = await downloadVerified(asset);
        if (disabled) throw new Error('YuMapAI service worker disabled');
        await cache.put(asset.url, response);
        if (disabled) await caches.delete(cacheName);
      } catch (failure) {
        error = failure;
      }
    }
  }
  try {
    await Promise.all(Array.from({ length: Math.min(precache.length, 3) }, fillCache));
    if (error) throw error;
    if (await killRequested(await fetchVersion())) {
      await disableWorker();
      throw new Error('YuMapAI service worker disabled');
    }
  } catch (failure) {
    // An active version with the same digest may still own an existing cache.
    if (!existed) await caches.delete(cacheName);
    throw failure;
  }
}

self.addEventListener('install', event => event.waitUntil(installAssets()));
self.addEventListener('activate', event => event.waitUntil(deleteAppCaches(cacheName)));

async function serveStatic(request, asset) {
  try {
    // An unregistered worker can still serve an old tab until it closes.
    // Never recreate a cache purged by the kill switch from a fetch.
    const cache = await caches.has(cacheName)
      .then(exists => exists ? caches.open(cacheName) : null).catch(() => null);
    if (disabled) {
      await caches.delete(cacheName);
      return fetch(request, { cache: 'no-store' });
    }
    const cached = await cache?.match(asset.url).catch(() => null);
    if (cached && !disabled) return cached;
    const response = await downloadVerified(asset);
    if (!disabled && cache) {
      try {
        await cache.put(asset.url, response.clone());
        if (disabled) await caches.delete(cacheName);
      } catch {
        // A verified response is still usable when storage quota is exhausted.
      }
    }
    return response;
  } catch {
    return new Response('YuMapAI asset unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}

async function serveNavigation(request) {
  try {
    return await fetch(request, { cache: 'no-store' });
  } catch (error) {
    if (disabled || !await caches.has(cacheName).catch(() => false)) throw error;
    return new Response(BUILD.offlineHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' blob: https: wss:; " +
          "worker-src 'self' blob:; base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
}

async function serveVersion(request) {
  const response = await fetch(request, { cache: 'no-store' });
  if (await killRequested(response.clone())) await disableWorker();
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  if (url.pathname === versionUrl.pathname) {
    event.respondWith(serveVersion(request));
    return;
  }
  const path = url.pathname.slice(scope.pathname.length).replace(/\/$/, '');
  if (request.mode === 'navigate' && appRoutes.has(path)) {
    event.respondWith(serveNavigation(request));
    return;
  }
  if (url.pathname === indexUrl.pathname) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }
  if (disabled || request.mode === 'navigate' || request.headers.has('authorization') || request.headers.has('range')) return;
  const asset = assetsByUrl.get(url.href);
  if (asset) event.respondWith(serveStatic(request, asset));
});

self.addEventListener('message', event => {
  const source = event.source;
  if (source?.type !== 'window' || !source.url.startsWith(scope.href)) return;
  const { type, version } = event.data || {};
  const port = event.ports[0];
  if (type === 'YU_SW_VERSION') {
    port?.postMessage({ version: BUILD.version });
  } else if (type === 'SKIP_WAITING' && !disabled && version === BUILD.version) {
    event.waitUntil(self.skipWaiting().then(() => port?.postMessage({ ok: true })));
  } else if (type === 'SW_KILL') {
    event.waitUntil((async () => {
      try {
        const kill = await killRequested(await fetchVersion());
        if (kill) await disableWorker();
        port?.postMessage({ ok: kill });
      } catch {
        port?.postMessage({ ok: false });
      }
    })());
  }
});
