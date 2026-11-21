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
  // Tanı: her gerçek getUserMedia çağrısının zamanı ve sonucu (son 20 kayıt; kişisel veri yok: aygıt kimliği/etiket
  // yazılmaz). Konsoldan window.__yuGumLog okunur; n = sayfa açılışından beri toplam çağrı (iOS izin istemi sayımı için).
  var gumLog = [];
  gumLog.n = 0;
  function simdi() { return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now(); }
  window.__yuGumLog = gumLog;
  function gumKaydet(c, bas, sonuc, iz) {
    var v = c && c.video;
    var tur = !v ? 'yok' : v === true ? 'video' : v.deviceId ? 'aygit' : v.facingMode ? 'yon' : 'video';
    gumLog.push({ n: gumLog.n, t: Math.round(bas), ms: Math.round(simdi() - bas), tur: tur,
      ses: !!(c && c.audio), sonuc: sonuc, iz: iz, gizli: gizli() });
    if (gumLog.length > 20) gumLog.shift();
  }
  try {
    var md = navigator.mediaDevices;
    if (md && typeof md.getUserMedia === 'function') {
      var asilGum = md.getUserMedia.bind(md);
      md.getUserMedia = function (c) {
        var bas = simdi();
        gumLog.n++;
        return asilGum.apply(null, arguments).then(function (s) {
          gumKaydet(c, bas, 'ok', s.getTracks().length);
          if (gizli()) s.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
          else akislar.push(s);
          // Durmuş akışlar kayıtta birikmez.
          akislar = akislar.filter(function (a) { return a.getTracks().some(function (t) { return t.readyState !== 'ended'; }); });
          return s;
        }, function (e) {
          gumKaydet(c, bas, (e && e.name) || 'Error', 0);
          throw e;
        });
      };
    }
  } catch (e) {}

  // Kamera listesi tek getUserMedia ile (ks_web_web.dart yuKsKameraListesi). camera_web'in availableCameras'ı HER kamerayı
  // ayrı açıp kapatıyordu (iPhone'da 1+3..5 getUserMedia). Burada: izin yoklaması ({video:true}, hemen stop) +
  // enumerateDevices; yön InputDeviceInfo.getCapabilities, yoklama izinin ayarı ya da etiketten bulunur. Aygıt kimlikleri
  // yalnız bu cihazda localStorage'da tutulur; önbellek varsa listeleme getUserMedia AÇMAZ (açılış tek getUserMedia).
  var LISTE_ANAHTAR = 'yu_kamera_aygitlari_v1';
  function etiketYon(ad) {
    var a = (ad || '').toLowerCase();
    if (/front|user|selfie|(^|\s)ön(\s|$)/.test(a)) return 'user';
    if (/back|rear|environment|(^|\s)arka(\s|$)/.test(a)) return 'environment';
    return null;
  }
  function aygitYon(d, yoklamaId, yoklamaYon) {
    try {
      if (typeof d.getCapabilities === 'function') {
        var f = d.getCapabilities().facingMode;
        if (f && f.length && (f[0] === 'user' || f[0] === 'environment')) return f[0];
      }
    } catch (e) {}
    if (yoklamaId && d.deviceId === yoklamaId && yoklamaYon) return yoklamaYon;
    return etiketYon(d.label);
  }
  window.yuKameraListe = function (onbellek) {
    if (onbellek) {
      try {
        var k = JSON.parse(localStorage.getItem(LISTE_ANAHTAR) || 'null');
        if (k && k.length) return Promise.resolve({ liste: k, onbellekten: true });
      } catch (e) {}
    }
    var md = navigator.mediaDevices;
    if (!md || typeof md.getUserMedia !== 'function') return Promise.resolve({ hata: 'NotSupportedError' });
    var yId = null, yYon = null;
    return md.getUserMedia({ video: true }).then(function (s) {
      var t = s.getVideoTracks()[0];
      var g = t && typeof t.getSettings === 'function' ? t.getSettings() : {};
      yId = g.deviceId || null;
      yYon = g.facingMode || null;
      s.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      return md.enumerateDevices();
    }).then(function (l) {
      var liste = [];
      for (var i = 0; i < l.length; i++) {
        var d = l[i];
        if (d.kind === 'videoinput' && d.deviceId) liste.push({ id: d.deviceId, ad: d.label || '', yon: aygitYon(d, yId, yYon) });
      }
      if (liste.length) { try { localStorage.setItem(LISTE_ANAHTAR, JSON.stringify(liste)); } catch (e) {} }
      return { liste: liste, onbellekten: false };
    }).catch(function (e) { return { hata: (e && e.name) || 'Error' }; });
  };
  window.yuKameraListeSil = function () { try { localStorage.removeItem(LISTE_ANAHTAR); } catch (e) {} };
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
  // Bekleyen akış stüdyoya dönünce: <video> DOM'a yeniden takılırken tarayıcı oynatmayı durdurur; takıldıktan sonra
  // yeniden oynatılır (getUserMedia yok). Döner: video bağlı ve oynuyor.
  window.yuKameraOynat = function () {
    var v = kameraVideo();
    if (!v || gizli()) return false;
    if (!v.paused) return true;
    try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    return false;
  };
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

// Güvenli alan bekçisi (21.11.2026). Flutter web motoru viewPadding'i (env(safe-area-inset-*)) önbelleğe alır ve yalnız
// visualViewport 'resize' olayında yeniden okur; iOS ana ekran uygulamasında açılışta env() 0 gelirse oturum boyunca 0 kalır
// (arama kutusu saatin altına, alt bar ana ekran çizgisine taşır). Burada aynı değerler gizli bir sondayla okunur; motorun
// bildiğinden (başlangıçta 0 varsayılır) farklıysa tek bir sentetik 'resize' yollanır, değişmediyse hiçbir şey yollanmaz.
// Motor kaynağı: window.dart _handleBrowserResize → _viewPadding = computeSafeAreaInsets(); dinleyici visualViewport'ta.
(function () {
  'use strict';
  var sonda = null;
  var bilinen = '0,0,0,0';
  var gozlemci = null;
  function sondaAl() {
    if (sonda && sonda.isConnected) return sonda;
    var ana = document.body || document.documentElement;
    if (!ana) return null;
    sonda = document.createElement('div');
    sonda.setAttribute('aria-hidden', 'true');
    sonda.setAttribute('data-yu-guvenli-alan', '');
    sonda.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    ana.appendChild(sonda);
    try {
      if (window.ResizeObserver) {
        if (gozlemci) gozlemci.disconnect();
        gozlemci = new ResizeObserver(function () { kontrol(); });
        gozlemci.observe(sonda, { box: 'border-box' }); // içerik kutusu 0x0'dır; env() dolgudadır
      }
    } catch (e) {}
    return sonda;
  }
  function oku() {
    var el = sondaAl();
    if (!el) return null;
    var cs = getComputedStyle(el);
    return ['top', 'right', 'bottom', 'left'].map(function (k) {
      return Math.round(parseFloat(cs.getPropertyValue('padding-' + k)) || 0);
    }).join(',');
  }
  function kontrol() {
    var v;
    try { v = oku(); } catch (e) { return; }
    if (v === null || v === bilinen) return;
    bilinen = v;
    try {
      (window.visualViewport || window).dispatchEvent(new Event('resize'));
    } catch (e) {}
  }
  window.yuGuvenliAlanKontrol = kontrol;
  window.addEventListener('flutter-first-frame', kontrol);
  window.addEventListener('pageshow', kontrol);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') kontrol();
  });
  window.addEventListener('resize', kontrol);
  window.addEventListener('orientationchange', kontrol);
  [0, 300, 1000, 3000].forEach(function (ms) { setTimeout(kontrol, ms); });
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
