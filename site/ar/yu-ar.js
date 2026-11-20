// YuMapAI kamera stüdyosu — yüz efektleri (AR). MediaPipe Face Landmarker'ı KENDİ sitemizden yükler (CDN yok).
// Gizlilik: yüz verisi yalnız bu cihazda (tarayıcıda) işlenir; hiçbir yere gönderilmez ve saklanmaz.
// Bu modül yalnız kullanıcı bir yüz efekti seçince yu-web.js'teki yuArYukle() ile içeri alınır.
import { FaceLandmarker, FilesetResolver } from './vision_bundle.js';

let isaretci = null;
let temsilci = '';
let sonZaman = -1;

/** Model + wasm'ı [taban] (…/ar/) altından yükler. Önce GPU, olmazsa CPU. Döner: 'GPU' | 'CPU'. */
export async function yukle(taban) {
  if (isaretci) return temsilci;
  const dosyalar = await FilesetResolver.forVisionTasks(new URL('wasm', taban).href.replace(/\/$/, ''));
  const secenek = (delegate) => ({
    baseOptions: { modelAssetPath: new URL('face_landmarker.task', taban).href, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
  try {
    isaretci = await FaceLandmarker.createFromOptions(dosyalar, secenek('GPU'));
    temsilci = 'GPU';
  } catch (_) {
    isaretci = await FaceLandmarker.createFromOptions(dosyalar, secenek('CPU'));
    temsilci = 'CPU';
  }
  return temsilci;
}

const SEKIL = ['jawOpen', 'eyeBlinkLeft', 'eyeBlinkRight', 'mouthSmileLeft', 'mouthSmileRight'];

/**
 * Bir video karesinde yüzü bulur. Dönüş tek Float32Array (Dart tarafında kopyasız okunur):
 * [0]=yüz var (0/1), [1]=video genişliği, [2]=yüksekliği, [3..7]=jawOpen, eyeBlinkL, eyeBlinkR, smileL, smileR,
 * [8..23]=yüz dönüşüm matrisi (4x4, sütun öncelikli), [24..]=478 nokta × (x, y, z) — x, y video karesine göre 0..1.
 */
export function algila(video) {
  const n = 24 + 478 * 3;
  const out = new Float32Array(n);
  if (!isaretci || !video || video.readyState < 2 || !video.videoWidth) return out;
  let t = performance.now();
  if (t <= sonZaman) t = sonZaman + 1;
  sonZaman = t;
  const r = isaretci.detectForVideo(video, t);
  out[1] = video.videoWidth;
  out[2] = video.videoHeight;
  const lm = r.faceLandmarks && r.faceLandmarks[0];
  if (!lm) return out;
  out[0] = 1;
  const bs = r.faceBlendshapes && r.faceBlendshapes[0] && r.faceBlendshapes[0].categories;
  if (bs) {
    for (const c of bs) {
      const i = SEKIL.indexOf(c.categoryName);
      if (i >= 0) out[3 + i] = c.score;
    }
  }
  const m = r.facialTransformationMatrixes && r.facialTransformationMatrixes[0];
  if (m && m.data) for (let i = 0; i < 16 && i < m.data.length; i++) out[8 + i] = m.data[i];
  for (let i = 0; i < lm.length && i < 478; i++) {
    out[24 + i * 3] = lm[i].x;
    out[25 + i * 3] = lm[i].y;
    out[26 + i * 3] = lm[i].z;
  }
  return out;
}

export function kapat() {
  try { isaretci && isaretci.close(); } catch (_) {}
  isaretci = null;
  temsilci = '';
}
