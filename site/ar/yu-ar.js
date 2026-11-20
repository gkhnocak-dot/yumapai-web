// YuMapAI kamera stüdyosu — yüz efektleri (AR). Yüz takibi: 8th Wall açık kaynak motoru (MIT; @8thwall/engine 0.1.0,
// yalnız Face Effects parçası), çizim: three.js (MIT). Bütün dosyalar KENDİ sitemizden (…/ar/) gelir, CDN yok.
// Gizlilik: yüz verisi yalnız bu cihazda (tarayıcıda) işlenir; hiçbir yere gönderilmez ve saklanmaz.
// Bu modül yalnız kullanıcı bir efekt seçince yu-web.js'teki yuArYukle() ile içeri alınır.
//
// Kamera tek: uygulamanın kamerası (camera_web'in <video>'su) açık kalır; 8th Wall'a o videodan küçültülerek çizilen bir
// tuvalin akışının KLONU verilir (getUserMedia izleyici çalıştığı sürece bu klonu döndürecek şekilde sarılır, izlemeDurdur'da
// geri alınır: 8th Wall pause/resume ya da yeniden deneme ile getUserMedia'yı yeniden çağırırsa da gerçek kamera açılmaz;
// uygulamanın kendi isteği — camera_web'in aygıt kimlikli {deviceId:{exact}} isteği — sarmaldan geçer, ayrıca uygulama her
// yeni açılıştan önce yuKameraBirak ile izleyiciyi durdurur). Böylece ikinci bir kamera açılmaz (iOS Safari ikinci yakalamada ilkini susturur), kamera akışının ayarı
// değişmez ve ön/arka geçişte izleyici yeni akışla yeniden başlar.
// 8th Wall'un yüz verisi (478 nokta, MediaPipe sırası; dönüşüm) yu-ar-sahne.js'in beklediği diziye çevrilir.
import { Sahne } from './yu-ar-sahne.js';
import { KONUM } from './yuz_kanonik.js';

let xr = null;
let yukleniyor = null;

/** 8th Wall motorunu (xr.js + yüz parçası) [taban] (…/ar/) altından yükler. Döner: '8thwall'. */
export function yukle(taban) {
  if (xr) return Promise.resolve('8thwall');
  yukleniyor ??= new Promise((coz, red) => {
    const bitti = () => {
      window.removeEventListener('xrloaded', bitti);
      xr = window.XR8;
      coz('8thwall');
    };
    if (window.XR8 && window.XR8.FaceController) return bitti();
    window.addEventListener('xrloaded', bitti);
    const s = document.createElement('script');
    s.src = new URL('8thwall/xr.js', taban).href;
    s.async = true;
    s.setAttribute('data-preload-chunks', 'face'); // yalnız yüz parçası; SLAM/dünya izleme yok
    s.onerror = () => {
      window.removeEventListener('xrloaded', bitti);
      yukleniyor = null;
      red(new Error('8th Wall yüklenemedi'));
    };
    document.head.appendChild(s);
  });
  return yukleniyor;
}

// ---- yüz verisi dönüşümü --------------------------------------------------------------------------------------------

/** 4x4 simetrik matrisin (satır öncelikli dizi) en büyük özdeğerinin özvektörü (Jacobi). */
function enBuyukOzvektor(a) {
  const v = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (let tur = 0; tur < 30; tur++) {
    let p = 0, q = 1, en = 0;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (Math.abs(a[i * 4 + j]) > en) { en = Math.abs(a[i * 4 + j]); p = i; q = j; }
    if (en < 1e-12) break;
    const th = 0.5 * Math.atan2(2 * a[p * 4 + q], a[q * 4 + q] - a[p * 4 + p]);
    const c = Math.cos(th), s = Math.sin(th);
    for (let k = 0; k < 4; k++) {
      const akp = a[k * 4 + p], akq = a[k * 4 + q];
      a[k * 4 + p] = c * akp - s * akq;
      a[k * 4 + q] = s * akp + c * akq;
    }
    for (let k = 0; k < 4; k++) {
      const apk = a[p * 4 + k], aqk = a[q * 4 + k];
      a[p * 4 + k] = c * apk - s * aqk;
      a[q * 4 + k] = s * apk + c * aqk;
    }
    for (let k = 0; k < 4; k++) {
      const vkp = v[k * 4 + p], vkq = v[k * 4 + q];
      v[k * 4 + p] = c * vkp - s * vkq;
      v[k * 4 + q] = s * vkp + c * vkq;
    }
  }
  let m = 0;
  for (let i = 1; i < 4; i++) if (a[i * 4 + i] > a[m * 4 + m]) m = i;
  return [v[m], v[4 + m], v[8 + m], v[12 + m]];
}

/**
 * Kanonik yüz ağı (cm) → kamera uzayı benzerlik dönüşümü (Horn/Umeyama): b ≈ s·R·a + t. Döner: sütun öncelikli 4x4,
 * ölçek 1'e indirilmiş (kamera uzayı 1/s ile ölçeklenir: izdüşüm değişmez, birimler kanonik cm olur).
 */
export function hizala(a, b, n) {
  let ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0;
  for (let i = 0; i < n; i++) {
    ax += a[i * 3]; ay += a[i * 3 + 1]; az += a[i * 3 + 2];
    bx += b[i * 3]; by += b[i * 3 + 1]; bz += b[i * 3 + 2];
  }
  ax /= n; ay /= n; az /= n; bx /= n; by /= n; bz /= n;
  let sxx = 0, sxy = 0, sxz = 0, syx = 0, syy = 0, syz = 0, szx = 0, szy = 0, szz = 0, aa = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i * 3] - ax, y = a[i * 3 + 1] - ay, z = a[i * 3 + 2] - az;
    const u = b[i * 3] - bx, v = b[i * 3 + 1] - by, w = b[i * 3 + 2] - bz;
    sxx += x * u; sxy += x * v; sxz += x * w;
    syx += y * u; syy += y * v; syz += y * w;
    szx += z * u; szy += z * v; szz += z * w;
    aa += x * x + y * y + z * z;
  }
  const N = [
    sxx + syy + szz, syz - szy, szx - sxz, sxy - syx,
    syz - szy, sxx - syy - szz, sxy + syx, szx + sxz,
    szx - sxz, sxy + syx, -sxx + syy - szz, syz + szy,
    sxy - syx, szx + sxz, syz + szy, -sxx - syy + szz,
  ];
  const [qw, qx, qy, qz] = enBuyukOzvektor(N);
  const R = [
    1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
    2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
    2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy),
  ];
  let ust = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i * 3] - ax, y = a[i * 3 + 1] - ay, z = a[i * 3 + 2] - az;
    const u = b[i * 3] - bx, v = b[i * 3 + 1] - by, w = b[i * 3 + 2] - bz;
    ust += u * (R[0] * x + R[1] * y + R[2] * z) + v * (R[3] * x + R[4] * y + R[5] * z) + w * (R[6] * x + R[7] * y + R[8] * z);
  }
  const s = ust / aa;
  // t = b̄ − s·R·ā ; ölçek 1'e indirilince öteleme t/s.
  const tx = bx / s - (R[0] * ax + R[1] * ay + R[2] * az);
  const ty = by / s - (R[3] * ax + R[4] * ay + R[5] * az);
  const tz = bz / s - (R[6] * ax + R[7] * ay + R[8] * az);
  return new Float32Array([R[0], R[3], R[6], 0, R[1], R[4], R[7], 0, R[2], R[5], R[8], 0, tx, ty, tz, 1]);
}

const NOKTA = 478;
const KAMERA_UZAYI = new Float32Array(NOKTA * 3);

/**
 * 8th Wall faceupdated ayrıntısı → yu-ar-sahne.js dizisi: [0]=yüz var, [1..2]=kare boyutu, [3]=dikey görüş açısı (derece),
 * [8..23]=kanonik→kamera dönüşümü (sütun öncelikli, ölçek 1), [24..]=478 nokta × (x, y, 0) — x, y kameranın karesinde 0..1.
 */
export function donustur(d, gorus, w, h) {
  const out = new Float32Array(24 + NOKTA * 3);
  const uv = d.uvsInCameraFrame, v = d.vertices, t = d.transform;
  if (!uv || uv.length < 468 || !v || v.length < 468) return out;
  const { x: qx, y: qy, z: qz, w: qw } = t.rotation;
  const R = [
    1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
    2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
    2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy),
  ];
  const s = t.scale, p = t.position;
  for (let i = 0; i < 468; i++) {
    const x = v[i].x * s, y = v[i].y * s, z = v[i].z * s;
    KAMERA_UZAYI[i * 3] = p.x + R[0] * x + R[1] * y + R[2] * z;
    KAMERA_UZAYI[i * 3 + 1] = p.y + R[3] * x + R[4] * y + R[5] * z;
    KAMERA_UZAYI[i * 3 + 2] = p.z + R[6] * x + R[7] * y + R[8] * z;
  }
  out[0] = 1;
  out[1] = w;
  out[2] = h;
  out[3] = gorus;
  out.set(hizala(KONUM, KAMERA_UZAYI, 468), 8);
  for (let i = 0; i < NOKTA && i < uv.length; i++) {
    out[24 + i * 3] = uv[i].u;
    out[25 + i * 3] = uv[i].v;
  }
  return out;
}

// ---- izleyici (8th Wall) --------------------------------------------------------------------------------------------

const iz = { video: null, akis: null, calisiyor: false, veri: null, gorus: 0, tuval: null, ozgunGum: null, sayac: 0, modul: null,
  klonlar: [], kucuk: null, sarmal: null, klonIstek: 0 };

/** İzleyicinin girdisi: kamera karesinin uzun kenarı bu boyuta küçültülmüş kopyası (yüz bulmaya yeter). */
const IZLEME_UZUN = 640;

/**
 * Kamera akışı çekim çözünürlüğündedir (1920) ve hiç değiştirilmez (iOS'ta değişim pozlama/odak/alanı sıfırlar). Yüz izleyici
 * tam kareyi değil, her döngüde [video]'dan çizilen küçük bir tuvalin akışını alır: GPU'ya yüklenen kare küçük kalır.
 */
function kucukKaynak(video) {
  const w = video.videoWidth, h = video.videoHeight;
  const o = Math.min(1, IZLEME_UZUN / Math.max(w, h));
  const t = document.createElement('canvas');
  t.width = Math.max(2, Math.round(w * o));
  t.height = Math.max(2, Math.round(h * o));
  t.setAttribute('aria-hidden', 'true');
  Object.assign(t.style, { position: 'fixed', left: '0', top: '0', width: '2px', height: '2px', opacity: '0', pointerEvents: 'none',
    zIndex: '-1' });
  document.body.appendChild(t);
  const cx = t.getContext('2d', { alpha: false });
  const k = { tuval: t, w, h, akis: null, ciz() { cx.drawImage(video, 0, 0, t.width, t.height); } };
  k.ciz();
  k.akis = t.captureStream(30);
  return k;
}

/** Yüz takibi gereken efektler (altın saat ve film yüzsüz çalışır: izleyici hiç başlatılmaz). */
const YUZLU = new Set(['puruzsuz', 'allik', 'cil', 'gunes_gozlugu', 'cicek_taci', 'nazar_kupe', 'sim_yagmuru']);

function gumGeriAl() {
  if (iz.ozgunGum && navigator.mediaDevices.getUserMedia === iz.sarmal) navigator.mediaDevices.getUserMedia = iz.ozgunGum;
  iz.ozgunGum = null;
  iz.sarmal = null;
}

/** Uygulamanın (camera_web) isteği: aygıt kimliği kesin verilmiştir; 8th Wall ön kamerayı facingMode ile ister. */
function uygulamaIstegi(c) {
  const d = c && c.video && c.video.deviceId;
  return !!(d && typeof d === 'object' && d.exact);
}

function izModulu() {
  const guncelle = ({ detail }) => {
    const v = iz.video;
    iz.veri = donustur(detail, iz.gorus || 63, v ? v.videoWidth : 0, v ? v.videoHeight : 0);
    iz.sayac++;
  };
  return {
    name: 'yumapai-yuz',
    listeners: [
      { event: 'facecontroller.facefound', process: guncelle },
      { event: 'facecontroller.faceupdated', process: guncelle },
      { event: 'facecontroller.facelost', process: () => { iz.veri = null; } },
    ],
    onUpdate: ({ processCpuResult }) => {
      const f = processCpuResult && processCpuResult.facecontroller;
      if (f && f.intrinsics && f.intrinsics[5]) iz.gorus = (2 * Math.atan(1 / f.intrinsics[5]) * 180) / Math.PI;
    },
    // Sarmal burada geri ALINMAZ (eskiden 'requesting' sonrası alınıyordu): 8th Wall pause/resume'da getUserMedia'yı
    // yeniden çağırırsa gerçek kamera/izin yolu açılırdı. Geri alma izlemeDurdur'da.
  };
}

/** 8th Wall'u [video]'nun küçültülmüş kopyasıyla başlatır (zaten aynı akış ve boyutla çalışıyorsa bir şey yapmaz). */
export function izlemeBaslat(video) {
  const akis = video && video.srcObject;
  if (!xr || !akis || !akis.getVideoTracks || !akis.getVideoTracks().length || !video.videoWidth) return false;
  if (iz.calisiyor && iz.akis === akis && iz.kucuk && iz.kucuk.w === video.videoWidth && iz.kucuk.h === video.videoHeight) return true;
  izlemeDurdur();
  iz.video = video;
  iz.akis = akis;
  iz.kucuk = kucukKaynak(video);
  const md = navigator.mediaDevices;
  iz.ozgunGum = md.getUserMedia;
  const ozgun = iz.ozgunGum;
  iz.sarmal = (c) => {
    if (!(c && c.video) || !iz.kucuk || uygulamaIstegi(c)) return ozgun.call(md, c);
    const k = iz.kucuk.akis.clone(); // her istek kendi klonunu alır: 8th Wall'un durdurduğu klon kaynağı kesmez
    iz.klonlar.push(k);
    iz.klonIstek++;
    return Promise.resolve(k);
  };
  md.getUserMedia = iz.sarmal;
  const X = xr;
  X.clearCameraPipelineModules();
  X.FaceController.configure({
    meshGeometry: [X.FaceController.MeshGeometry.FACE],
    enableEars: false, // kulak modeli kullanılmaz (kökeni belgesiz): küpe kulak memesini yüz ağından alır
    maxDetections: 1,
    coordinates: { mirroredDisplay: false, origin: { position: { x: 0, y: 0, z: 0 }, rotation: { w: 1, x: 0, y: 0, z: 0 } } },
  });
  iz.modul = izModulu();
  X.addCameraPipelineModules([X.FaceController.pipelineModule(), iz.modul]);
  // 8th Wall'un hesap tuvali: belgede olmalı (boyutunu oradan okur) ama görünmez; çizim yu-ar-sahne.js'te.
  iz.tuval = document.createElement('canvas');
  iz.tuval.width = 360;
  iz.tuval.height = 480;
  iz.tuval.setAttribute('aria-hidden', 'true');
  Object.assign(iz.tuval.style, { position: 'fixed', left: '0', top: '0', width: '360px', height: '480px', opacity: '0',
    pointerEvents: 'none', zIndex: '-1' });
  document.body.appendChild(iz.tuval);
  X.run({ canvas: iz.tuval, allowedDevices: X.XrConfig.device().ANY, cameraConfig: { direction: X.XrConfig.camera().FRONT } });
  iz.calisiyor = true;
  return true;
}

export function izlemeDurdur() {
  if (!iz.calisiyor) return;
  try { xr.stop(); } catch (_) {}
  try { xr.clearCameraPipelineModules(); } catch (_) {}
  gumGeriAl();
  // Klon izler kesin kapanır (özgün kamera akışına dokunulmaz).
  for (const k of iz.klonlar) for (const t of k.getTracks()) t.stop();
  iz.klonlar = [];
  if (iz.kucuk) {
    for (const t of iz.kucuk.akis.getTracks()) t.stop();
    iz.kucuk.tuval.width = iz.kucuk.tuval.height = 0;
    iz.kucuk.tuval.remove();
    iz.kucuk = null;
  }
  iz.calisiyor = false;
  iz.akis = null;
  iz.video = null;
  iz.veri = null;
  if (iz.tuval) baglamBirak(iz.tuval); // 8th Wall'un hesap tuvalinin WebGL bağlamı da bırakılır (iOS'ta bağlam sayısı sınırlı)
  iz.tuval?.remove();
  iz.tuval = null;
}

function baglamBirak(t) {
  try {
    const gl = t.getContext('webgl2') || t.getContext('webgl');
    const k = gl && gl.getExtension('WEBGL_lose_context');
    if (k) k.loseContext();
  } catch (_) {}
  try { t.width = 0; t.height = 0; } catch (_) {}
}

// ---- sahne döngüsü ----

let sahne = null;
let tuval = null;
let dongu = 0;
let videoBul = () => null;
const olcum = { fps: 0, ms: 0, yuz: false, son: 0, izleme: 0 };

// Döngü (yüz izleyiciye kare + çizim) en çok 30 kare/sn: ProMotion ekranda rAF 120 Hz'dir, kamera da 30 fps verir (DERSLER).
const KARE_ARALIGI = 1000 / 30 - 1;
let sonAdim = 0;

function adim() {
  dongu = requestAnimationFrame(adim);
  const t0 = performance.now();
  if (t0 - sonAdim < KARE_ARALIGI) return;
  sonAdim = t0;
  const v = videoBul();
  if (!v || !sahne) return;
  sahne.kaynakAyarla(v);
  // Yüz takibi yalnız yüz gerektiren efekt seçiliyken çalışır; kamera değiştiyse (ön/arka) yeni akışla yeniden başlar.
  if (YUZLU.has(sahne.efekt)) {
    izlemeBaslat(v);
    iz.kucuk?.ciz();
  } else izlemeDurdur();
  const simdi = performance.now();
  sahne.kare(iz.veri, simdi / 1000);
  if (olcum.son) olcum.fps = olcum.fps * 0.9 + (1000 / Math.max(1, simdi - olcum.son)) * 0.1;
  olcum.son = simdi;
  olcum.ms = sahne.istatistik.ms;
  olcum.yuz = !!iz.veri;
  olcum.izleme = iz.sayac;
}

/** Sahneyi [canvas] üzerinde başlatır ya da ayarlarını günceller. [bul]: o anki kamera <video> öğesini döndürür. */
export function sahneBaslat(canvas, bul, efekt, ayna, filtre) {
  videoBul = bul;
  if (!sahne || tuval !== canvas) {
    sahne?.kapat();
    tuval = canvas;
    sahne = new Sahne(canvas);
  }
  sahneAyar(efekt, ayna, filtre);
  if (!dongu) dongu = requestAnimationFrame(adim);
}

export function sahneAyar(efekt, ayna, filtre) {
  if (!sahne) return;
  sahne.efektAyarla(efekt || null);
  sahne.aynaAyarla(ayna);
  sahne.filtreAyarla(filtre && filtre.length >= 25 ? filtre : null);
}

export function sahneDurdur() {
  if (dongu) cancelAnimationFrame(dongu);
  dongu = 0;
  sonAdim = 0;
  izlemeDurdur();
  sahne?.kapat();
  sahne = null;
  tuval = null;
}

/** Önizlemedeki kareyi (efektli, filtresiz, aynalı) JPEG olarak verir. */
export function kareAl() {
  if (!sahne) return Promise.reject(new Error('sahne yok'));
  return sahne.kareAl(iz.veri, performance.now() / 1000);
}

export function olcumAl() { return { ...olcum }; }

/** Test/rapor: küpe pivotları (ekran pikseli) ve izleyicinin son noktaları (0..1). */
export function ayrinti() {
  return {
    kupe: sahne ? sahne.kupeOlcum() : [],
    noktalar: iz.veri ? Array.from(iz.veri.subarray(24)) : null,
    gorus: iz.gorus,
    boyut: sahne ? [sahne.w, sahne.h] : null,
    gumSarili: !!iz.sarmal && navigator.mediaDevices.getUserMedia === iz.sarmal,
    klonIstek: iz.klonIstek,
  };
}

/** Tam kapanış (sayfa kapanırken): döngü, izleyici, klon kamera izleri, WebGL bağlamı (forceContextLoss) bırakılır. */
export function kapat() {
  sahneDurdur();
}
