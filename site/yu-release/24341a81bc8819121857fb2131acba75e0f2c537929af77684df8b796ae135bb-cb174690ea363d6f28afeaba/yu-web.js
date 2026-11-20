// YuMapAI web — first-party start-up helper (D-119W). No network access, no tracking, no storage of its own.
(function () {
  'use strict';
  // 0. The app's base path (the <base href> the build was made for: "/" for the site root, "/onizleme/" for the
  //    owner-only preview). Every path below is relative to it, so the same file works at the root and under a prefix.
  var base = '/';
  try {
    var b = document.querySelector('base');
    var h = b ? b.getAttribute('href') : '/';
    if (h && h.charAt(0) === '/' && h.indexOf('//') !== 0) base = h.charAt(h.length - 1) === '/' ? h : h + '/';
  } catch (e) {}
  // 1. One entry point: every visit starts at the app's home (base) so the app's start-up hub (language, session, account
  //    state, Terms) decides the first screen — a reload on an inner path never skips it. D-119 (zero broken routes): the
  //    inner URL is NOT dropped — it travels as "?yu_next=<app path?query>" (the path WITHOUT the base prefix, i.e. the
  //    app's own route) and the app restores it after the hub's decision (signed-out: after the sign-in) through its own
  //    router. The fragment (auth links) is kept.
  try {
    var p = location.pathname;
    if (p !== base && p !== base + 'index.html' && p.indexOf(base) === 0) {
      var next = '/' + p.substring(base.length) + location.search;
      history.replaceState(null, '', base + '?yu_next=' + encodeURIComponent(next) + location.hash);
    }
  } catch (e) {}
  // 2. <html lang> follows the app language (stored by the app as flutter.ff_appLanguage).
  var KEY = 'flutter.ff_appLanguage';
  function applyLang(v) {
    try {
      var l = v ? JSON.parse(v) : null;
      if (l === 'tr' || l === 'en') document.documentElement.lang = l;
    } catch (e) {}
  }
  try {
    applyLang(localStorage.getItem(KEY));
    var orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      orig.apply(this, arguments);
      if (k === KEY && this === window.localStorage) applyLang(v);
    };
  } catch (e) {}
  // MapLibre is self-hosted. Do not compete with Flutter until a map needs it.
  var runtime = new URL('.', document.currentScript?.src || document.baseURI);
  var pendingMap;
  window.yuMapLibreReady = false;
  window.yuLoadMapLibre = function () {
    if (pendingMap) return pendingMap;
    var script = document.createElement('script');
    var css = document.createElement('link');
    script.src = new URL('maplibre/maplibre-gl.js', runtime).href;
    script.async = true;
    css.rel = 'stylesheet';
    css.href = new URL('maplibre/maplibre-gl.css', runtime).href;
    function load(element) {
      return new Promise(function (resolve, reject) {
        element.onload = resolve;
        element.onerror = function () { reject(new Error('MapLibre asset failed to load')); };
        document.head.appendChild(element);
      });
    }
    var timer;
    var timeout = new Promise(function (_, reject) {
      timer = setTimeout(function () { reject(new Error('MapLibre load timed out')); }, 20000);
    });
    pendingMap = Promise.race([Promise.all([load(css), load(script)]), timeout])
      .then(function () {
        if (!window.maplibregl || typeof window.maplibregl.Map !== 'function') {
          throw new Error('MapLibre global is missing');
        }
        window.yuMapLibreReady = true;
      })
      .catch(function (error) {
        script.remove();
        css.remove();
        pendingMap = null;
        throw error;
      })
      .finally(function () { clearTimeout(timer); });
    return pendingMap;
  };

  // Kamera stüdyosu (sürüm 77). Kameranın <video> öğesi camera_web eklentisinindir; burada yalnız bulunur.
  // Canlı filtre CSS filter ile videoya uygulanır (Flutter katman filtresi platform görünümüne işlemez).
  function kameraVideo() {
    var kokler = [document];
    document.querySelectorAll('flt-glass-pane, flutter-view').forEach(function (e) { if (e.shadowRoot) kokler.push(e.shadowRoot); });
    for (var i = 0; i < kokler.length; i++) {
      var list = kokler[i].querySelectorAll('video');
      for (var j = 0; j < list.length; j++) {
        var v = list[j];
        if (v.srcObject && typeof v.srcObject.getVideoTracks === 'function' && v.srcObject.getVideoTracks().length) return v;
      }
    }
    return null;
  }
  window.yuKameraVideo = kameraVideo;
  window.yuKameraBoyut = function () {
    var v = kameraVideo();
    return v && v.videoWidth ? [v.videoWidth, v.videoHeight] : null;
  };
  window.yuKameraFiltre = function (css) {
    var v = kameraVideo();
    if (!v) return false;
    v.style.filter = css || '';
    return true;
  };
  // Flaş (torch): yalnız kamera izi bu yeteneği açıkça bildiriyorsa (iOS Safari bildirmez → düğme gizlenir).
  window.yuKameraTorchVar = function () {
    try {
      var v = kameraVideo();
      var t = v && v.srcObject.getVideoTracks()[0];
      if (!t || typeof t.getCapabilities !== 'function') return false;
      return t.getCapabilities().torch === true;
    } catch (e) { return false; }
  };
  // Yüz efektleri (AR): MediaPipe yalnız kullanıcı efekt seçince, kendi sitemizin ar/ klasöründen yüklenir.
  // Yüz verisi yalnız bu cihazda işlenir; hiçbir yere gönderilmez ve saklanmaz.
  var arModul = null;
  var arBekleyen = null;
  window.yuArTaban = function () { return new URL('ar/', runtime).href; };
  window.yuArYukle = function () {
    if (arBekleyen) return arBekleyen;
    var taban = new URL('ar/', runtime).href;
    arBekleyen = import(new URL('yu-ar.js', taban).href)
      .then(function (m) { return m.yukle(taban).then(function (d) { arModul = m; return d; }); })
      .catch(function (e) { arBekleyen = null; arModul = null; throw e; });
    return arBekleyen;
  };
  window.yuArAlgila = function () { return arModul ? arModul.algila(kameraVideo()) : null; };
  window.yuArKapat = function () { if (arModul) arModul.kapat(); arModul = null; arBekleyen = null; };

  // 3. Keep the same plate over the engine until the browser can paint Flutter's first frame.
  window.addEventListener('flutter-first-frame', function () {
    requestAnimationFrame(function () {
      document.getElementById('yu-splash')?.remove();
    });
  }, { once: true });
})();

// Yönetim paneli (18.11.2026): bu adreste "Ana Ekrana Ekle" ayrı bir "YuMapAI Yönetim" simgesi oluşturur ve
// simge doğrudan yönetim paneline açılır (uygulamanın kendi simgesi değişmez). Giriş ekranına yönlenirken (yu_next)
// ve uygulama içi geçişlerde de güncel tutulur (Sürüm 43).
(function () {
  'use strict';
  var yol = '/yy-32cb6ba08e';
  function yonetimde() {
    try {
      if (location.pathname.replace(/\/$/, '').slice(-yol.length) === yol) return true;
      return (new URLSearchParams(location.search).get('yu_next') || '').indexOf(yol) === 0;
    } catch (e) { return false; }
  }
  function guncelle() {
    try {
      var y = yonetimde();
      var m = document.querySelector('link[rel="manifest"]');
      if (m) m.setAttribute('href', y ? 'yonetim.webmanifest' : 'manifest.json');
      var t = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (t) t.setAttribute('content', y ? 'YuMapAI Yönetim' : 'YuMapAI');
    } catch (e) {}
  }
  try {
    ['pushState', 'replaceState'].forEach(function (k) {
      var asil = history[k];
      history[k] = function () { var r = asil.apply(this, arguments); guncelle(); return r; };
    });
    window.addEventListener('popstate', guncelle);
  } catch (e) {}
  guncelle();
})();
