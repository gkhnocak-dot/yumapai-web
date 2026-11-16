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

  // 3. The branded start plate (same blue + logo as the app's own start screen) leaves with Flutter's first frame.
  window.addEventListener('flutter-first-frame', function () {
    var s = document.getElementById('yu-splash');
    if (s) s.parentNode.removeChild(s);
  });
})();
