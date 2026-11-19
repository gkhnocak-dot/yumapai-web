(function () {
  'use strict';

  const pageVersion = document.querySelector('meta[name="yu-release"]')?.content;
  const service = navigator.serviceWorker;
  if (!pageVersion || !service) return;

  const scope = new URL('.', document.baseURI);
  const workerUrl = new URL('yu_sw.js', scope);
  const legacyUrl = new URL('flutter_service_worker.js', scope);
  const killReloadKey = 'yumapai-sw-kill:' + scope.pathname;
  const cachePrefix = 'yumapai-sw:' + scope.pathname + ':';
  const button = document.querySelector('[data-yu-update]');
  let checked;
  let registerPromise;
  let appStarted = !document.getElementById('yu-splash');
  let target = null;
  let busy = false;
  let disabled = false;

  function isWorker(worker, url = workerUrl) {
    if (!worker) return false;
    const script = new URL(worker.scriptURL);
    return script.origin === url.origin && script.pathname === url.pathname;
  }

  function workerVersion(worker) {
    return new Promise(resolve => {
      if (!isWorker(worker)) return resolve(null);
      const channel = new MessageChannel();
      function finish(version) {
        clearTimeout(timer);
        channel.port1.close();
        resolve(version);
      }
      const timer = setTimeout(() => finish(null), 1000);
      channel.port1.onmessage = event => finish(event.data?.version || null);
      try {
        worker.postMessage({ type: 'YU_SW_VERSION' }, [channel.port2]);
      } catch (_) {
        finish(null);
      }
    });
  }

  function updateButton() {
    if (!button) return;
    button.hidden = !target || disabled;
    button.disabled = busy;
    const en = document.documentElement.lang === 'en';
    button.textContent = busy
      ? (en ? 'Preparing update…' : 'Güncelleme hazırlanıyor…')
      : (en ? 'New version ready · Reload' : 'Yeni sürüm hazır · Yenile');
  }

  async function ownRegistration() {
    const registration = await service.getRegistration(scope.href);
    return registration?.scope === scope.href ? registration : null;
  }

  async function uninstall() {
    disabled = true;
    const controlled = isWorker(service.controller) || isWorker(service.controller, legacyUrl);
    updateButton();
    const registration = await ownRegistration();
    const workers = [registration?.active, registration?.waiting, registration?.installing, service.controller];
    for (const worker of workers) {
      if (isWorker(worker)) {
        try { worker.postMessage({ type: 'SW_KILL' }); } catch (_) {}
      }
    }
    if (registration && workers.some(worker => isWorker(worker) || isWorker(worker, legacyUrl))) {
      await registration.unregister();
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.filter(name => name.startsWith(cachePrefix)).map(name => caches.delete(name)));
    }
    if (controlled) {
      try {
        if (sessionStorage.getItem(killReloadKey)) return;
        sessionStorage.setItem(killReloadKey, '1');
      } catch (_) {}
      location.reload();
    }
  }

  function register() {
    if (disabled) return Promise.resolve(null);
    registerPromise ??= (async () => {
      const old = await ownRegistration();
      if (disabled) return null;
      if (isWorker(old?.active, legacyUrl)) {
        await old.unregister();
        if ('caches' in window) {
          await Promise.all(['flutter-app-cache', 'flutter-temp-cache', 'flutter-app-manifest']
            .map(name => caches.delete(name)));
        }
      }
      if (disabled) return null;
      return service.register(workerUrl, { scope: scope.href, updateViaCache: 'none' });
    })().finally(() => { registerPromise = null; });
    return registerPromise;
  }

  async function check() {
    if (checked) return checked;
    checked = (async () => {
      const response = await fetch(new URL('version.json', scope), { cache: 'no-store' });
      if (!response.ok) return;
      const version = await response.json();
      if (version.swKill === true) return uninstall();
      disabled = false;
      try { sessionStorage.removeItem(killReloadKey); } catch (_) {}
      if (typeof version.swVersion !== 'string' || !/^[a-f0-9]{64}-[a-f0-9]{24}$/.test(version.swVersion)) return;
      target = version.swVersion === pageVersion ? null : version.swVersion;
      updateButton();
      if (target || appStarted) await register();
    })().catch(() => {}).finally(() => { checked = null; });
    return checked;
  }

  async function waitForWorker(registration, version) {
    const limit = Date.now() + 30000;
    while (Date.now() < limit && !disabled) {
      if (await workerVersion(registration.active) === version) return;
      const waiting = registration.waiting;
      if (await workerVersion(waiting) === version) {
        waiting.postMessage({ type: 'SKIP_WAITING', version });
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  button?.addEventListener('click', async () => {
    if (!target || busy) return;
    const wanted = target;
    busy = true;
    updateButton();
    try {
      const registration = await register();
      if (registration) {
        await registration.update().catch(() => {});
        await waitForWorker(registration, wanted);
      }
    } catch (_) {
      // An updated index and versioned assets can also start without a worker.
    }
    if (!disabled) location.reload();
  });

  new MutationObserver(updateButton).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang'],
  });
  window.addEventListener('flutter-first-frame', () => {
    appStarted = true;
    void check();
  }, { once: true });
  window.addEventListener('pageshow', event => {
    if (event.persisted) void check();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check();
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') void check();
  }, 60000);
  void check();
})();
