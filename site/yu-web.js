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
  //
  // Kamera kaynakları (DERSLER: kapanışta bırakılır). getUserMedia'dan dönen her akış kayda girer. yuKameraBirak() hepsini
  // bırakır: her iz stop(), akışı gösteren <video> durur, srcObject=null, DOM'dan çıkar. Sayfa gizlenince (uygulama arka
  // plana gidince, iPhone ana ekran uygulaması) ya da kapanırken (pagehide) bu iş Flutter'ı beklemeden, eş zamanlı yapılır:
  // iOS sayfayı askıya almadan önce kamera göstergesi söner. Gizliyken sonuçlanan bir açılışın izleri de hemen durur.
  // Kamera yeniden yalnız Flutter isteyince (stüdyo açık ve görünürken) açılır.
  var akislar = [];
  var sonVideo = null;
  function canliIzler() {
    var l = [];
    for (var i = 0; i < akislar.length; i++) {
      var t = akislar[i].getTracks();
      for (var j = 0; j < t.length; j++) if (t[j].readyState !== 'ended') l.push(t[j]);
    }
    return l;
  }
  function gizli() { return document.visibilityState === 'hidden'; }
  function videoBirak(v) {
    try { v.pause(); } catch (e) {}
    try { v.srcObject = null; v.removeAttribute('src'); v.load(); } catch (e) {}
    try { v.remove(); } catch (e) {}
  }
  function kameraBirak() {
    var eski = akislar;
    akislar = [];
    sonVideo = null;
    var kokler = [document];
    document.querySelectorAll('flt-glass-pane, flutter-view').forEach(function (e) { if (e.shadowRoot) kokler.push(e.shadowRoot); });
    kokler.forEach(function (k) {
      k.querySelectorAll('video').forEach(function (v) { if (v.srcObject && eski.indexOf(v.srcObject) >= 0) videoBirak(v); });
    });
    eski.forEach(function (s) { s.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); });
    // Efekt motorunun kamera klonları (yüz izleyici) da durur; sahne açık kalırsa yeni akışla yeniden başlar.
    try { if (arModul && typeof arModul.izlemeDurdur === 'function') arModul.izlemeDurdur(); } catch (e) {}
  }
  window.yuKameraBirak = kameraBirak;
  window.yuKameraIzSayisi = function () { return canliIzler().length; };
  try {
    var md = navigator.mediaDevices;
    if (md && typeof md.getUserMedia === 'function') {
      var asilGum = md.getUserMedia.bind(md);
      md.getUserMedia = function () {
        return asilGum.apply(null, arguments).then(function (s) {
          if (gizli()) s.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
          else akislar.push(s);
          return s;
        });
      };
    }
  } catch (e) {}
  document.addEventListener('visibilitychange', function () { if (gizli()) kameraBirak(); });
  window.addEventListener('pagehide', kameraBirak);
  // Kamera akışının ayarı (çözünürlük, kare hızı) açıldıktan sonra DEĞİŞTİRİLMEZ: iOS'ta kısıt değişimi sensörü yeniden
  // kurar (pozlama/odak sıfırlanır, görüş alanı değişir). Akış baştan çekim çözünürlüğünde açılır (ks_kamera.dart).
  // Canlı izi olan <video>: gizliyken açılıp durdurulan (izleri 'ended') bir akışın öğesi kamera sayılmaz.
  function canliVideo(v) {
    var s = v && v.srcObject;
    if (!s || typeof s.getVideoTracks !== 'function') return false;
    var t = s.getVideoTracks();
    for (var i = 0; i < t.length; i++) if (t[i].readyState !== 'ended') return true;
    return false;
  }
  function kameraVideo() {
    if (sonVideo && sonVideo.isConnected && canliVideo(sonVideo)) return sonVideo;
    sonVideo = null;
    var kokler = [document];
    document.querySelectorAll('flt-glass-pane, flutter-view').forEach(function (e) { if (e.shadowRoot) kokler.push(e.shadowRoot); });
    for (var i = 0; i < kokler.length; i++) {
      var list = kokler[i].querySelectorAll('video');
      for (var j = 0; j < list.length; j++) {
        var v = list[j];
        if (canliVideo(v)) return (sonVideo = v);
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
    if (v.style.filter !== (css || '')) v.style.filter = css || ''; // aynı değer yeniden yazılmaz (gereksiz stil hesabı yok)
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
  // Yüz efektleri (AR): 8th Wall + three.js yalnız kullanıcı efekt seçince, kendi sitemizin ar/ klasöründen yüklenir.
  // Yüz verisi yalnız bu cihazda işlenir; hiçbir yere gönderilmez ve saklanmaz.
  // Kapatılınca (stüdyo kapanır/gizlenir) döngü, 8th Wall izleyicisi, klon kamera izleri ve WebGL bağlamları bırakılır
  // (yu-ar.js kapat). Yükleme sürerken kapatılırsa yükleme bitince kendini bırakır (nesil), sahipsiz motor kalmaz.
  var arModul = null;
  var arBekleyen = null;
  var arNesil = 0;
  window.yuArTaban = function () { return new URL('ar/', runtime).href; };
  window.yuArYukle = function () {
    if (arBekleyen) return arBekleyen;
    var taban = new URL('ar/', runtime).href;
    var n = ++arNesil;
    arBekleyen = import(new URL('yu-ar.js', taban).href)
      .then(function (m) {
        return m.yukle(taban).then(function (d) {
          if (n !== arNesil) { m.kapat(); throw new Error('yu-ar kapatildi'); }
          arModul = m;
          return d;
        });
      })
      .catch(function (e) { if (n === arNesil) { arBekleyen = null; arModul = null; } throw e; });
    return arBekleyen;
  };
  // Efekt sahnesi (three.js): tuval Flutter'ın platform görünümüdür; döngü ar/yu-ar.js'te döner.
  window.yuArSahne = function (tuval, efekt, ayna, filtre) {
    if (!arModul) return false;
    arModul.sahneBaslat(tuval, kameraVideo, efekt, ayna, filtre);
    return true;
  };
  window.yuArSahneAyar = function (efekt, ayna, filtre) { if (arModul) arModul.sahneAyar(efekt, ayna, filtre); };
  window.yuArSahneDurdur = function () { if (arModul) arModul.sahneDurdur(); };
  window.yuArKareAl = function () { return arModul ? arModul.kareAl() : Promise.reject(new Error('ar')); };
  window.yuArOlcum = function () { return arModul ? arModul.olcumAl() : null; };
  window.yuArKapat = function () {
    arNesil++; // yükleme sürüyorsa bitince kendini bırakır
    var m = arModul;
    arModul = null;
    arBekleyen = null;
    if (m) m.kapat();
  };

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
