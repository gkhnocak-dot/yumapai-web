YuMapAI kamera stüdyosu — efekt varlıkları ve lisansları (web/ar/). Ayrıntı ve değişiklik beyanları: ../NOTICE.txt

  8thwall/xr.js, xr-face.js        8th Wall Engine 0.1.0 — MIT (8thwall-MIT.txt)
    └ xr.js içinde 51Degrees        MPL-2.0 (51degrees-MPL-2.0.md); kaynak: 51degrees-getRenderer.js.txt,
                                     https://github.com/51Degrees/Renderer
  8thwall/resources/*.tflite       MediaPipe kökenli yüz modelleri — Apache-2.0 (mediapipe-Apache-2.0.txt)
  yuz_kanonik.js                   MediaPipe kanonik yüz ağı — Apache-2.0 (mediapipe-Apache-2.0.txt)
  three.min.js                     three.js r187 — MIT (three.js-MIT.txt)
  yu-ar.js, yu-ar-sahne.js         YuMapAI'nin kendi kodu

3B modeller ve dokular (güneş gözlüğü, çiçek tacı, nazar küpe, sim parçacıkları, makyaj ve ışık efektleri):
  yu-ar-sahne.js içinde parametrik olarak (geometri + gölgelendirici kodu) üretilir; dışarıdan model, doku ya da görsel
  dosyası YOKTUR. Yansımalar three.js RoomEnvironment (MIT) ile hesaplanır.

Karusel ve Efektler paneli simgeleri: lib/kamera_studyosu/ks_efekt_simge.dart içinde Flutter ile vektör olarak çizilir
(yüz/insan yok, görsel dosyası yok).
Kulak modeli dağıtılmaz; nazar küpe kulak memesini yüz ağının noktalarından (132, 361) alır.

Uzak adres yok: bütün dosyalar kendi sitemizden yüklenir (test/kamera_studyosu/ks_ar_yerel_test.dart, test/web/ar_8w.py).
