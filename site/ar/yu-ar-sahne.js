// YuMapAI kamera stüdyosu — yüz efektleri sahnesi (three.js, MIT; kendi sitemizden: ./three.min.js).
// Bütün kare WebGL'de çizilir: kamera görüntüsü → (cilt maskesiyle yumuşatma) → makyaj (yüz ağı dokusunda) → 3B nesneler
// (8th Wall yüz ağından hizalanan dönüşümle, yüz/kafa örtücüsüyle örtülür) → renk/ışık işleme → filtre matrisi → ayna.
// Önizleme ile çekilen fotoğraf aynı çizimden gelir (kareAl), bu yüzden efekt fotoğrafa birebir işlenir.
// Gizlilik: yüz verisi yalnız bu cihazda işlenir; hiçbir yere gönderilmez ve saklanmaz.
// 3B modeller bu dosyada parametrik üretilir (dış model dosyası yok; lisans: web/ar/LICENSES/README.txt).
import * as T from './three.min.js';
import { KONUM, UV, INDIS } from './yuz_kanonik.js';

T.ColorManagement.enabled = false; // renkler sRGB değerleriyle işlenir: Flutter filtre matrisiyle aynı uzay

/** Efekt kimlikleri (Dart: lib/kamera_studyosu/ks_efekt.dart ile aynı sıra ve adlar). */
export const EFEKTLER = [
  'puruzsuz', 'allik', 'cil', 'altin_saat', 'film', 'gunes_gozlugu', 'cicek_taci', 'nazar_kupe', 'sim_yagmuru',
];

/** Varsayılan dikey görüş açısı (derece); izleyici gerçek değeri her karede bildirir (veri[3]). */
export const GORUS = 63;

/** Kulak memesi noktaları (MediaPipe 468 ağ; kanonik ağda yüz kenarının çene–kulak birleşimi). */
export const KULAK_MEMESI = { sag: 132, sol: 361 };

const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
  136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
// Dudak halkaları: 0 = sağ ağız köşesi, 0..10 alt dudak, 10 = sol köşe, 10..19 üst dudak.
const DUDAK_DIS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const DUDAK_IC = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
const NOKTA = 478;
/** Filtre yok: her kanal kendisi (r, g, b katsayıları + öteleme). */
const KIMLIK = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];

/** One Euro süzgeci (Casiez vd. 2012) — dizi hâlinde: düşük hızda titremeyi keser, hızlı harekette gecikmez. */
export class OneEuro {
  constructor(n, { minKesim = 1.2, beta = 0.02, dKesim = 1.0 } = {}) {
    this.n = n;
    this.minKesim = minKesim;
    this.beta = beta;
    this.dKesim = dKesim;
    this.x = new Float32Array(n);
    this.dx = new Float32Array(n);
    this.t = -1;
  }

  static alfa(kesim, dt) {
    const tau = 1 / (2 * Math.PI * kesim);
    return 1 / (1 + tau / dt);
  }

  sifirla() { this.t = -1; }

  /** [deger] yerinde süzülür; [t] saniye. */
  suz(deger, t) {
    if (this.t < 0 || t <= this.t) {
      this.x.set(deger.subarray ? deger.subarray(0, this.n) : deger);
      this.dx.fill(0);
      this.t = t;
      return deger;
    }
    const dt = Math.min(t - this.t, 0.25);
    this.t = t;
    const ad = OneEuro.alfa(this.dKesim, dt);
    for (let i = 0; i < this.n; i++) {
      const hiz = (deger[i] - this.x[i]) / dt;
      const d = this.dx[i] + ad * (hiz - this.dx[i]);
      this.dx[i] = d;
      const a = OneEuro.alfa(this.minKesim + this.beta * Math.abs(d), dt);
      const x = this.x[i] + a * (deger[i] - this.x[i]);
      this.x[i] = x;
      deger[i] = x;
    }
    return deger;
  }
}

const TAM_EKRAN_VS = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const ORTAK_GLSL = `
float karma(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float elips(vec2 p, vec2 c, vec2 r) { return length((p - c) / r); }
float gauss(vec2 p, vec2 c, vec2 r) { vec2 d = (p - c) / r; return exp(-dot(d, d)); }`;

const YUZ_VS = `
attribute float kenar;
varying vec2 vUv;
varying float vKenar;
void main() { vUv = uv; vKenar = kenar; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// Cilt maskesi: yüz ovalinin içi 1 (kenarda yumuşak), göz, kaş, dudak ve burun delikleri 0.
const MASKE_FS = `
varying vec2 vUv;
varying float vKenar;
${ORTAK_GLSL}
void main() {
  float m = smoothstep(0.0, 1.0, vKenar);
  m *= smoothstep(1.0, 1.4, elips(vUv, vec2(0.352, 0.385), vec2(0.085, 0.05)));
  m *= smoothstep(1.0, 1.4, elips(vUv, vec2(0.648, 0.385), vec2(0.085, 0.05)));
  m *= smoothstep(1.0, 1.5, elips(vUv, vec2(0.33, 0.275), vec2(0.11, 0.04)));
  m *= smoothstep(1.0, 1.5, elips(vUv, vec2(0.67, 0.275), vec2(0.11, 0.04)));
  m *= smoothstep(1.0, 1.35, elips(vUv, vec2(0.5, 0.695), vec2(0.135, 0.05)));
  m *= smoothstep(0.9, 1.3, elips(vUv, vec2(0.462, 0.565), vec2(0.03, 0.018)));
  m *= smoothstep(0.9, 1.3, elips(vUv, vec2(0.538, 0.565), vec2(0.03, 0.018)));
  gl_FragColor = vec4(m, m, m, 1.0);
}`;

// Taban: kamera karesi; cilt maskesinde kenar koruyan yumuşatma + ışıltı.
const TABAN_FS = `
uniform sampler2D tKaynak;
uniform sampler2D tMaske;
uniform vec2 uTexel;
uniform float uYaricap;
uniform float uPuruz;
uniform float uIsilti;
uniform float uYuz;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tKaynak, vUv).rgb;
  float m = texture2D(tMaske, vUv).r * uYuz;
  if (uPuruz > 0.0 && m > 0.003) {
    vec3 top = c;
    float ag = 1.0;
    for (int i = 0; i < 20; i++) {
      float a = float(i) * 2.39996;
      float r = sqrt((float(i) + 0.5) / 20.0) * uYaricap;
      vec3 s = texture2D(tKaynak, vUv + vec2(cos(a), sin(a)) * r * uTexel).rgb;
      vec3 d = s - c;
      float w = exp(-dot(d, d) * 55.0);
      top += s * w;
      ag += w;
    }
    c = mix(c, top / ag, m * uPuruz);
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c += m * uIsilti * (0.035 + 0.09 * smoothstep(0.5, 0.95, l)) * vec3(1.0, 0.97, 0.94);
  }
  gl_FragColor = vec4(c, 1.0);
}`;

// Makyaj (yüz ağının kanonik dokusunda): allık, çil, ışıltı vurguları.
const MAKYAJ_FS = `
uniform float uAllik;
uniform float uCil;
uniform float uIsilti;
uniform float uYuz;
varying vec2 vUv;
varying float vKenar;
${ORTAK_GLSL}
vec4 ust(vec4 alt, vec3 renk, float a) {
  a = clamp(a, 0.0, 1.0);
  return vec4(renk * a + alt.rgb * (1.0 - a), a + alt.a * (1.0 - a));
}
void main() {
  vec4 o = vec4(0.0);
  float k = smoothstep(0.0, 0.6, vKenar);
  if (uAllik > 0.0) {
    float b = gauss(vUv, vec2(0.255, 0.565), vec2(0.078, 0.055)) + gauss(vUv, vec2(0.745, 0.565), vec2(0.078, 0.055));
    o = ust(o, vec3(0.93, 0.38, 0.47), 0.34 * b * uAllik);
  }
  if (uCil > 0.0) {
    float bolge = gauss(vUv, vec2(0.5, 0.505), vec2(0.23, 0.075));
    o = ust(o, vec3(0.86, 0.45, 0.42), 0.13 * gauss(vUv, vec2(0.5, 0.49), vec2(0.16, 0.035)) * uCil);
    vec2 p = vUv * vec2(120.0, 165.0);
    vec2 h = floor(p);
    vec2 f = fract(p);
    float var = step(0.5, karma(h));
    vec2 m = vec2(karma(h + 1.3), karma(h + 7.1)) * 0.6 + 0.2;
    float boy = 0.13 + 0.16 * karma(h + 3.7);
    float lek = smoothstep(boy, boy * 0.35, length(f - m)) * var;
    o = ust(o, vec3(0.45, 0.27, 0.17), lek * bolge * (0.5 + 0.4 * karma(h + 5.2)) * uCil);
  }
  if (uIsilti > 0.0) {
    float h = gauss(vUv, vec2(0.30, 0.475), vec2(0.06, 0.022)) + gauss(vUv, vec2(0.70, 0.475), vec2(0.06, 0.022))
      + gauss(vUv, vec2(0.5, 0.44), vec2(0.016, 0.07)) * 0.8;
    o = ust(o, vec3(1.0, 0.98, 0.95), 0.10 * h * uIsilti);
  }
  if (o.a < 0.002) discard;
  gl_FragColor = vec4(o.rgb / o.a, o.a * k * uYuz);
}`;

const DUDAK_VS = `
attribute float halka;
attribute float cevre;
varying float vT;
varying float vS;
void main() { vT = halka; vS = cevre; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const DUDAK_FS = `
uniform float uDudak;
uniform float uYuz;
varying float vT;
varying float vS;
float cevreUzak(float s, float m) { float d = abs(s - m); return min(d, 1.0 - d); }
void main() {
  float kenar = smoothstep(0.0, 0.32, vT) * smoothstep(1.0, 0.82, vT);
  vec3 baz = vec3(0.80, 0.17, 0.31);
  float a = 0.44 * kenar;
  float alt = exp(-pow(cevreUzak(vS, 0.25) / 0.075, 2.0)) * exp(-pow((vT - 0.52) / 0.17, 2.0));
  float ust = (exp(-pow(cevreUzak(vS, 0.70) / 0.03, 2.0)) + exp(-pow(cevreUzak(vS, 0.80) / 0.03, 2.0)))
    * exp(-pow((vT - 0.45) / 0.2, 2.0)) * 0.55;
  float p = clamp(alt + ust, 0.0, 1.0);
  vec3 renk = mix(baz, vec3(1.0, 0.94, 0.96), p * 0.85);
  a = max(a, p * 0.8 * kenar);
  gl_FragColor = vec4(renk, a * uDudak * uYuz);
}`;

// Son geçiş: renk/ışık işleme (altın saat, film), filtre matrisi (Dart YuFiltre.matris5), ayna.
const SON_FS = `
uniform sampler2D tSahne;
uniform sampler2D tMaske;
uniform float uAyna;
uniform vec4 uR;
uniform vec4 uG;
uniform vec4 uB;
uniform float uAltin;
uniform float uFilm;
uniform float uZaman;
uniform float uYuz;
uniform vec2 uCoz;
varying vec2 vUv;
${ORTAK_GLSL}
void main() {
  vec2 uv = vUv;
  if (uAyna > 0.5) uv.x = 1.0 - uv.x;
  vec3 c = texture2D(tSahne, uv).rgb;
  float oran = uCoz.x / uCoz.y;
  if (uAltin > 0.0) {
    vec3 s = c * vec3(1.10, 1.0, 0.80) + vec3(0.035, 0.012, -0.01);
    s = clamp(s, 0.0, 1.0);
    s = mix(s, s * s * (3.0 - 2.0 * s), 0.3);
    c = mix(c, s, uAltin);
    vec2 q = vUv - vec2(0.9, 0.93);
    q.x *= oran;
    float gun = exp(-dot(q, q) * 4.5);
    c += vec3(1.0, 0.58, 0.20) * gun * 0.5 * uAltin;
    c += vec3(1.0, 0.82, 0.55) * exp(-dot(q, q) * 70.0) * 0.55 * uAltin;
    vec2 yon = normalize(vec2(0.4 * oran, 0.43));
    float m = texture2D(tMaske, uv).r * uYuz;
    float yan = clamp(dot(normalize((vUv - 0.5) * vec2(oran, 1.0) + 1e-4), yon) * 0.5 + 0.5, 0.0, 1.0);
    c += m * vec3(0.22, 0.12, 0.03) * yan * yan * uAltin;
  }
  if (uFilm > 0.0) {
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 f = mix(vec3(l), c, 0.8);
    f = mix(vec3(0.075, 0.10, 0.11) + f * 0.86, f, smoothstep(0.0, 0.75, l));
    f *= vec3(1.045, 1.0, 0.93);
    float v = length((vUv - 0.5) * vec2(oran, 1.0) * 1.3);
    f *= 1.0 - 0.4 * smoothstep(0.3, 1.0, v);
    float n = karma(floor(gl_FragCoord.xy) + fract(uZaman * 7.13) * 731.0);
    f += (n - 0.5) * 0.08;
    c = mix(c, f, uFilm);
  }
  c = clamp(c, 0.0, 1.0);
  c = clamp(vec3(dot(uR.xyz, c) + uR.w, dot(uG.xyz, c) + uG.w, dot(uB.xyz, c) + uB.w), 0.0, 1.0);
  gl_FragColor = vec4(c, 1.0);
}`;

const SIM_VS = `
attribute vec4 bas;
uniform float uZaman;
uniform float uOlcek;
varying float vFaz;
void main() {
  float faz = bas.w;
  float y = 22.0 - mod(bas.y + uZaman * (5.0 + 4.0 * faz), 50.0);
  vec3 p = vec3(bas.x + sin(uZaman * 1.3 + faz * 20.0) * 0.8, y, bas.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.35 + 0.45 * fract(faz * 13.0)) * uOlcek / -mv.z;
  vFaz = faz;
}`;

const SIM_FS = `
uniform float uZaman;
uniform float uYuz;
varying float vFaz;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float cekirdek = exp(-dot(d, d) * 45.0);
  float isin = exp(-abs(d.x) * 28.0) * exp(-abs(d.y) * 5.0) + exp(-abs(d.y) * 28.0) * exp(-abs(d.x) * 5.0);
  float pirilti = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uZaman * 7.0 + vFaz * 40.0), 3.0);
  vec3 renk = vFaz < 0.45 ? vec3(1.0, 0.84, 0.45) : (vFaz < 0.8 ? vec3(0.95, 0.96, 1.0) : vec3(1.0, 0.62, 0.78));
  float a = (cekirdek + isin * 0.55) * pirilti * uYuz;
  if (a < 0.01) discard;
  gl_FragColor = vec4(renk * a, a);
}`;

function tamEkran(fs, uniforms, ek = {}) {
  const m = new T.ShaderMaterial({ vertexShader: TAM_EKRAN_VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, ...ek });
  const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), m);
  mesh.frustumCulled = false;
  const s = new T.Scene();
  s.add(mesh);
  return { sahne: s, malzeme: m };
}

/** Kanonik ağdan rijit kafa geometrisi (örtücü ve test mankeni için). */
export function kanonikGeometri() {
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(KONUM.slice(), 3));
  g.setAttribute('uv', new T.BufferAttribute(UV.slice(), 2));
  g.setIndex(new T.BufferAttribute(INDIS, 1));
  g.computeVertexNormals();
  return g;
}

/** Her köşenin yüz ovaline uzaklığı (doku uzayında, 0 = kenar, 1 = içeride) — maskenin yumuşak kenarı. */
function kenarDegerleri() {
  const k = new Float32Array(468);
  for (let i = 0; i < 468; i++) {
    let en = 1e9;
    for (const o of OVAL) en = Math.min(en, Math.hypot(UV[i * 2] - UV[o * 2], UV[i * 2 + 1] - UV[o * 2 + 1]));
    k[i] = Math.min(1, en / 0.075);
  }
  return k;
}

function kanonikNokta(i) {
  return new T.Vector3(KONUM[i * 3], KONUM[i * 3 + 1], KONUM[i * 3 + 2]);
}

// ---- parametrik 3B modeller -----------------------------------------------------------------------------------------

function yuvarlakDortgen(gen, yuk, r, ustDaralma = 0) {
  const s = new T.Shape();
  const x0 = -gen / 2, x1 = gen / 2, y0 = -yuk / 2, y1 = yuk / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x1 - r, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1 + ustDaralma, y1 - r);
  s.quadraticCurveTo(x1 + ustDaralma, y1, x1 - r + ustDaralma, y1);
  s.lineTo(x0 + r - ustDaralma, y1);
  s.quadraticCurveTo(x0 - ustDaralma, y1, x0 - ustDaralma, y1 - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

/** Modern güneş gözlüğü: parlak asetat çerçeve, yansımalı degrade cam, metal menteşe; sapları kafanın yanından geriye. */
function gunesGozlugu() {
  const g = new T.Group();
  const cerceve = new T.MeshPhysicalMaterial({ color: 0x15110f, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true });
  const cam = new T.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.04, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.8,
    transparent: true, opacity: 0.94,
  });
  const metal = new T.MeshPhysicalMaterial({ color: 0xd9c08a, roughness: 0.22, metalness: 1, transparent: true });
  const gen = 5.2, yuk = 4.15;
  for (const yon of [-1, 1]) {
    const dis = yuvarlakDortgen(gen + 0.95, yuk + 0.85, 1.75, 0.32);
    const delik = yuvarlakDortgen(gen, yuk, 1.45, 0.28);
    dis.holes.push(delik);
    const cg = new T.ExtrudeGeometry(dis, { depth: 0.38, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 3, curveSegments: 24 });
    const lg = new T.ShapeGeometry(delik, 24);
    // Cam hafif kavisli (dış kenar geride), üstten alta koyudan açığa degrade.
    for (const geo of [cg, lg]) {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - 0.05 * Math.pow(p.getX(i) * yon + 0.6, 2) * (yon * p.getX(i) > -0.6 ? 1 : 0.3));
      geo.computeVertexNormals();
    }
    const p = lg.attributes.position;
    const renk = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) + yuk / 2) / yuk;
      renk[i * 3] = 0.06 + 0.18 * (1 - t);
      renk[i * 3 + 1] = 0.08 + 0.14 * (1 - t);
      renk[i * 3 + 2] = 0.12 + 0.12 * (1 - t);
    }
    lg.setAttribute('color', new T.BufferAttribute(renk, 3));
    const c = new T.Mesh(cg, cerceve);
    c.position.set(yon * 3.35, 2.75, 5.85);
    const l = new T.Mesh(lg, cam);
    l.position.set(yon * 3.35, 2.75, 6.0);
    const men = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.9, 12), metal);
    men.position.set(yon * 6.45, 3.55, 5.85);
    men.rotation.z = Math.PI / 2;
    g.add(c, l, men);
    const sap = new T.TubeGeometry(new T.CatmullRomCurve3([
      new T.Vector3(yon * 6.75, 3.55, 5.8), new T.Vector3(yon * 7.55, 3.4, 2.0),
      new T.Vector3(yon * 7.7, 3.05, -3.0), new T.Vector3(yon * 7.25, 1.6, -6.2),
    ]), 24, 0.17, 8, false);
    g.add(new T.Mesh(sap, cerceve));
  }
  const kopru = new T.TubeGeometry(new T.CatmullRomCurve3([
    new T.Vector3(-0.85, 3.5, 6.1), new T.Vector3(0, 3.95, 6.35), new T.Vector3(0.85, 3.5, 6.1),
  ]), 16, 0.26, 10, false);
  g.add(new T.Mesh(kopru, cerceve));
  return { grup: g, capa: 168 };
}

/** Çiçek tacı: alnın üstünden kafanın arkasına eğik halka; 16 çiçek (6 yaprak + göbek) ve yapraklar (örnekli ağ). */
function cicekTaci() {
  const g = new T.Group();
  const N = 16, YAPRAK = 6;
  const palet = [0xf7a1b5, 0xfff3ea, 0xb9a3e3, 0xffc08a, 0xe25a7a, 0xffd6e0];
  const yaprakGeo = new T.SphereGeometry(1, 14, 10);
  yaprakGeo.scale(0.62, 0.34, 0.14);
  yaprakGeo.translate(0.58, 0, 0);
  const yapraklar = new T.InstancedMesh(yaprakGeo, new T.MeshStandardMaterial({ roughness: 0.55, side: T.DoubleSide, transparent: true }), N * YAPRAK);
  const gobekler = new T.InstancedMesh(new T.SphereGeometry(0.32, 14, 10), new T.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.7, transparent: true }), N);
  const yesilGeo = new T.SphereGeometry(1, 10, 8);
  yesilGeo.scale(0.95, 0.32, 0.1);
  yesilGeo.translate(0.8, 0, 0);
  const yesil = new T.InstancedMesh(yesilGeo, new T.MeshStandardMaterial({ color: 0x5e9e5a, roughness: 0.6, side: T.DoubleSide, transparent: true }), N * 2);
  const o = new T.Object3D();
  const r = new T.Color();
  const merkez = new T.Vector3(0, 9.0, -4.2);
  let yi = 0;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = Math.sin(a) * 8.7, z = Math.cos(a) * 10.2;
    const y = 0.9 * (1 - Math.cos(a)) * 0.5; // önde alçak, arkada yüksek
    const p = new T.Vector3(merkez.x + x, merkez.y + y - 0.3, merkez.z + z);
    const disa = new T.Vector3(Math.sin(a), 0.55, Math.cos(a)).normalize();
    const boy = (i % 3 === 0 ? 1.55 : 1.25) * (0.95 + 0.1 * Math.sin(i * 7.3));
    const don = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), disa);
    r.setHex(palet[i % palet.length]);
    for (let k = 0; k < YAPRAK; k++) {
      o.position.copy(p);
      o.quaternion.copy(don).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 0, 1), (k / YAPRAK) * Math.PI * 2 + i));
      o.rotateY(-0.25);
      o.scale.setScalar(boy);
      o.updateMatrix();
      yapraklar.setMatrixAt(i * YAPRAK + k, o.matrix);
      yapraklar.setColorAt(i * YAPRAK + k, r);
    }
    o.position.copy(p).addScaledVector(disa, 0.12 * boy);
    o.quaternion.copy(don);
    o.scale.setScalar(boy);
    o.updateMatrix();
    gobekler.setMatrixAt(i, o.matrix);
    for (const s of [-1, 1]) {
      const teg = new T.Vector3(Math.cos(a), 0, -Math.sin(a)).multiplyScalar(s);
      o.position.copy(p).addScaledVector(disa, -0.25);
      o.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), teg.add(new T.Vector3(0, 0.15, 0)).normalize());
      o.rotateX(0.5 * s);
      o.scale.setScalar(1.1);
      o.updateMatrix();
      yesil.setMatrixAt(yi++, o.matrix);
    }
  }
  g.add(yapraklar, gobekler, yesil);
  return { grup: g, capa: 10 };
}

function nazarDokusu() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const hal = (r, renk) => { x.beginPath(); x.arc(64, 64, r, 0, Math.PI * 2); x.fillStyle = renk; x.fill(); };
  hal(64, '#0b3a8f');
  hal(46, '#f4f7fb');
  hal(31, '#3fa4ea');
  hal(15, '#0d1016');
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.LinearSRGBColorSpace;
  return t;
}

/** Nazar boncuklu altın küpe: halka + zincir + cam boncuk. Pivot (0,0,0) kulak memesindedir. */
function nazarKupe(doku) {
  const g = new T.Group();
  const altin = new T.MeshPhysicalMaterial({ color: 0xe8b64c, roughness: 0.22, metalness: 1, transparent: true });
  const halka = new T.Mesh(new T.TorusGeometry(0.3, 0.06, 12, 36), altin);
  halka.position.set(0, -0.28, 0);
  const zincir = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.75, 8), altin);
  zincir.position.set(0, -0.95, 0);
  const halka2 = new T.Mesh(new T.TorusGeometry(0.13, 0.045, 10, 24), altin);
  halka2.position.set(0, -1.4, 0);
  const yan = new T.MeshPhysicalMaterial({ color: 0x0b3a8f, roughness: 0.08, clearcoat: 1, transparent: true });
  const yuzey = new T.MeshPhysicalMaterial({ map: doku, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true });
  const boncuk = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 0.4, 48, 1), [yan, yuzey, yuzey]);
  boncuk.rotation.x = Math.PI / 2;
  boncuk.position.set(0, -2.5, 0);
  g.add(halka, zincir, halka2, boncuk);
  return g;
}

/** Sim yağmuru: kafanın çevresinde düşen ışıltılar (kafa konumunu izler, dönüşü izlemez). */
function simYagmuru() {
  const N = 520;
  const bas = new Float32Array(N * 4);
  let s = 1234567;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) {
    bas[i * 4] = (rnd() - 0.5) * 34;
    bas[i * 4 + 1] = rnd() * 50;
    bas[i * 4 + 2] = (rnd() - 0.5) * 22;
    bas[i * 4 + 3] = rnd();
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute('bas', new T.BufferAttribute(bas, 4));
  const m = new T.ShaderMaterial({
    vertexShader: SIM_VS, fragmentShader: SIM_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uZaman: { value: 0 }, uOlcek: { value: 1000 }, uYuz: { value: 1 } },
  });
  m.premultipliedAlpha = true;
  const p = new T.Points(geo, m);
  p.frustumCulled = false;
  return p;
}

// ---- sahne ----------------------------------------------------------------------------------------------------------

export class Sahne {
  /** [tuval]: çizilecek <canvas>. [secenek.gorus]: kamera dikey görüş açısı (test için değiştirilebilir). */
  constructor(tuval, secenek = {}) {
    this.tuval = tuval;
    this.gorus = secenek.gorus ?? GORUS;
    const r = new T.WebGLRenderer({ canvas: tuval, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!secenek.koru });
    r.outputColorSpace = T.LinearSRGBColorSpace;
    r.toneMapping = T.NoToneMapping;
    r.autoClear = false;
    this.r = r;
    this.efekt = null;
    this.ayna = false;
    this.filtre = KIMLIK.slice();
    this.w = 0;
    this.h = 0;
    this.kaynak = null;
    this.doku = null;
    this.zaman = 0;
    this.gorunurluk = 0; // yüz sönümlemesi 0..1
    this.yuzVar = false;
    this.lm = new Float32Array(NOKTA * 2);
    this.lmSuz = new OneEuro(NOKTA * 2, { minKesim: 1.4, beta: 0.025 });
    this.donusSuz = new OneEuro(12, { minKesim: 1.2, beta: 0.6 });
    this.otelemeSuz = new OneEuro(4, { minKesim: 1.2, beta: 0.08 });
    this.matris = new T.Matrix4();
    this.sonVeri = null;
    this.istatistik = { kare: 0, ms: 0 };

    this.orto = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.kam = new T.PerspectiveCamera(this.gorus, 9 / 16, 1, 10000);

    const rtSec = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, depthBuffer: false };
    this.rtMaske = new T.WebGLRenderTarget(4, 4, rtSec);
    this.rtSahne = new T.WebGLRenderTarget(4, 4, { ...rtSec, depthBuffer: true, samples: secenek.ornek ?? 4 });

    // Yüz ağı (2B, landmark konumları) — maske ve makyaj aynı geometriyi paylaşır.
    const yg = new T.BufferGeometry();
    this.yuzKonum = new T.BufferAttribute(new Float32Array(468 * 3), 3);
    this.yuzKonum.setUsage(T.DynamicDrawUsage);
    yg.setAttribute('position', this.yuzKonum);
    yg.setAttribute('uv', new T.BufferAttribute(UV, 2));
    yg.setAttribute('kenar', new T.BufferAttribute(kenarDegerleri(), 1));
    yg.setIndex(new T.BufferAttribute(INDIS, 1));
    this.maskeSahne = new T.Scene();
    const mm = new T.Mesh(yg, new T.ShaderMaterial({ vertexShader: YUZ_VS, fragmentShader: MASKE_FS, depthTest: false, depthWrite: false, side: T.DoubleSide }));
    mm.frustumCulled = false;
    this.maskeSahne.add(mm);

    this.makyaj = new T.ShaderMaterial({
      vertexShader: YUZ_VS, fragmentShader: MAKYAJ_FS, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide,
      uniforms: { uAllik: { value: 0 }, uCil: { value: 0 }, uIsilti: { value: 0 }, uYuz: { value: 0 } },
    });
    this.makyajSahne = new T.Scene();
    const ym = new T.Mesh(yg, this.makyaj);
    ym.frustumCulled = false;
    this.makyajSahne.add(ym);

    // Dudak halkası
    const dg = new T.BufferGeometry();
    this.dudakKonum = new T.BufferAttribute(new Float32Array(40 * 3), 3);
    dg.setAttribute('position', this.dudakKonum);
    const halka = new Float32Array(40), cevre = new Float32Array(40), di = [];
    for (let i = 0; i < 20; i++) {
      halka[i] = 0; halka[20 + i] = 1;
      cevre[i] = cevre[20 + i] = i / 20;
      const j = (i + 1) % 20;
      di.push(i, j, 20 + i, j, 20 + j, 20 + i);
    }
    dg.setAttribute('halka', new T.BufferAttribute(halka, 1));
    dg.setAttribute('cevre', new T.BufferAttribute(cevre, 1));
    dg.setIndex(di);
    this.dudak = new T.ShaderMaterial({
      vertexShader: DUDAK_VS, fragmentShader: DUDAK_FS, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide,
      uniforms: { uDudak: { value: 0 }, uYuz: { value: 0 } },
    });
    const dm = new T.Mesh(dg, this.dudak);
    dm.frustumCulled = false;
    this.makyajSahne.add(dm);

    this.taban = tamEkran(TABAN_FS, {
      tKaynak: { value: null }, tMaske: { value: this.rtMaske.texture }, uTexel: { value: new T.Vector2() },
      uYaricap: { value: 6 }, uPuruz: { value: 0 }, uIsilti: { value: 0 }, uYuz: { value: 0 },
    });
    this.son = tamEkran(SON_FS, {
      tSahne: { value: this.rtSahne.texture }, tMaske: { value: this.rtMaske.texture }, uAyna: { value: 0 },
      uR: { value: new T.Vector4(1, 0, 0, 0) }, uG: { value: new T.Vector4(0, 1, 0, 0) }, uB: { value: new T.Vector4(0, 0, 1, 0) },
      uAltin: { value: 0 }, uFilm: { value: 0 }, uZaman: { value: 0 }, uYuz: { value: 0 }, uCoz: { value: new T.Vector2(9, 16) },
    });

    // 3B sahne
    this.sahne3 = new T.Scene();
    this.sahne3.add(new T.HemisphereLight(0xffffff, 0x3a3530, 0.9));
    const gunes = new T.DirectionalLight(0xffffff, 1.5);
    gunes.position.set(0.4, 1, 1);
    this.sahne3.add(gunes);
    const pm = new T.PMREMGenerator(r);
    this.sahne3.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture;
    pm.dispose();
    this.kafa = new T.Group();
    this.kafa.matrixAutoUpdate = false;
    this.sahne3.add(this.kafa);
    const ortucu = new T.MeshBasicMaterial({ colorWrite: false, side: T.DoubleSide });
    const yuzOrt = new T.Mesh(kanonikGeometri(), ortucu);
    const kafaOrt = new T.Mesh(new T.SphereGeometry(1, 28, 18), ortucu);
    kafaOrt.scale.set(6.9, 10.0, 9.0);
    kafaOrt.position.set(0, 1.5, -5.5);
    for (const m of [yuzOrt, kafaOrt]) m.renderOrder = -1;
    this.kafa.add(yuzOrt, kafaOrt);
    this.nesneler = {};
    this.kupeler = null;
  }

  // ---- ayarlar ----

  efektAyarla(id) {
    if (id !== null && !EFEKTLER.includes(id)) throw new Error('bilinmeyen efekt: ' + id);
    this.efekt = id;
    for (const [k, n] of Object.entries(this.nesneler)) n.grup.visible = k === id;
    if (id === 'gunes_gozlugu' && !this.nesneler[id]) this._ekle(id, gunesGozlugu());
    if (id === 'cicek_taci' && !this.nesneler[id]) this._ekle(id, cicekTaci());
    if (id === 'sim_yagmuru' && !this.nesneler[id]) {
      const p = simYagmuru();
      const grup = new T.Group();
      grup.add(p);
      this.sahne3.add(grup);
      this.nesneler[id] = { grup, sim: p };
    }
    if (id === 'nazar_kupe' && !this.kupeler) {
      const doku = nazarDokusu();
      this.kupeler = [KULAK_MEMESI.sag, KULAK_MEMESI.sol].map((n) => {
        const grup = nazarKupe(doku);
        grup.matrixAutoUpdate = true;
        this.sahne3.add(grup);
        return { nokta: n, grup, aci: 0, hiz: 0, onceki: null, oncekiHiz: null, ekran: [0, 0] };
      });
    }
    if (this.kupeler) for (const k of this.kupeler) k.grup.visible = id === 'nazar_kupe';
  }

  _ekle(id, { grup, capa }) {
    this.kafa.add(grup);
    this.nesneler[id] = { grup, capa };
  }

  aynaAyarla(a) { this.ayna = !!a; }

  /** Yüz izini sıfırlar (kamera değişince): süzgeçler, sönümleme ve küpe sarkacı baştan başlar. */
  sifirla() {
    this.lmSuz.sifirla();
    this.donusSuz.sifirla();
    this.otelemeSuz.sifirla();
    this.yuzVar = false;
    this.gorunurluk = 0;
    this.zaman = 0;
    for (const k of this.kupeler || []) Object.assign(k, { aci: 0, hiz: 0, onceki: null, oncekiHiz: null });
  }

  /** Dart YuFiltre.matris5 (5x5, satır öncelikli, 0..1) ya da null (doğal). */
  filtreAyarla(m) {
    if (!m) { this.filtre = KIMLIK.slice(); return; }
    const f = [];
    for (let i = 0; i < 3; i++) f.push(m[i * 5], m[i * 5 + 1], m[i * 5 + 2], m[i * 5 + 3] + m[i * 5 + 4]);
    this.filtre = f;
  }

  /** Kaynak: <video> ya da <canvas> (test mankeni). */
  kaynakAyarla(el) {
    if (el === this.kaynak) return;
    this.kaynak = el;
    this.doku?.dispose();
    this.doku = null;
    if (!el) return;
    const d = el instanceof HTMLVideoElement ? new T.VideoTexture(el) : new T.CanvasTexture(el);
    d.minFilter = T.LinearFilter;
    d.magFilter = T.LinearFilter;
    d.generateMipmaps = false;
    d.colorSpace = T.LinearSRGBColorSpace;
    this.doku = d;
    this.taban.malzeme.uniforms.tKaynak.value = d;
  }

  _boyut(w, h) {
    // En uzun kenar ≤ 1280: iPhone'da 30 fps için yeterli çözünürlük; çekilen fotoğraf da bu çözünürlüktedir.
    const o = Math.min(1, 1280 / Math.max(w, h));
    const W = Math.round(w * o), H = Math.round(h * o);
    if (W === this.w && H === this.h) return;
    this.w = W;
    this.h = H;
    this.r.setSize(W, H, false);
    this.rtSahne.setSize(W, H);
    this.rtMaske.setSize(Math.max(2, W >> 1), Math.max(2, H >> 1));
    this.kam.aspect = W / H;
    this.kam.updateProjectionMatrix();
    this.taban.malzeme.uniforms.uTexel.value.set(1 / W, 1 / H);
    this.son.malzeme.uniforms.uCoz.value.set(W, H);
  }

  // ---- kare ----

  /**
   * Bir kare işler ve çizer. [veri]: yu-ar.js donustur() dizisi (Float32Array; [0] yüz var, [3] görüş açısı, [8..23] matris,
   * [24..] noktalar)
   * ya da null. [t]: saniye. [filtresiz]: çekim için filtre matrisi uygulanmaz (filtre Düzenle'de aynı matrisle işlenir).
   */
  kare(veri, t, { filtresiz = false } = {}) {
    const bas = performance.now();
    const k = this.kaynak;
    const kw = k ? (k.videoWidth || k.width) : 0, kh = k ? (k.videoHeight || k.height) : 0;
    if (!k || !kw || !kh) return false;
    this._boyut(kw, kh);
    if (k instanceof HTMLCanvasElement && this.doku) this.doku.needsUpdate = true;
    const dt = this.zaman ? Math.min(Math.max(t - this.zaman, 0), 0.1) : 1 / 30;
    this.zaman = t;
    this._yuzGuncelle(veri, t, dt);
    this._ciz(t, dt, filtresiz);
    this.istatistik.kare++;
    this.istatistik.ms = this.istatistik.ms * 0.9 + (performance.now() - bas) * 0.1;
    return true;
  }

  _yuzGuncelle(veri, t, dt) {
    const var_ = !!(veri && veri[0] > 0.5);
    if (var_ && veri[3] > 1 && Math.abs(veri[3] - this.gorus) > 0.01) {
      // İzleyicinin bildirdiği gerçek kamera görüş açısı (8th Wall iç parametreleri)
      this.gorus = veri[3];
      this.kam.fov = veri[3];
      this.kam.updateProjectionMatrix();
    }
    if (var_) {
      const W = this.w, H = this.h;
      for (let i = 0; i < NOKTA; i++) {
        this.lm[i * 2] = veri[24 + i * 3] * W;
        this.lm[i * 2 + 1] = veri[25 + i * 3] * H;
      }
      if (!this.yuzVar) { this.lmSuz.sifirla(); this.donusSuz.sifirla(); this.otelemeSuz.sifirla(); }
      this.lmSuz.suz(this.lm, t);
      const m = veri.subarray(8, 24);
      const don = new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10], 0, 0, 0]);
      const ote = new Float32Array([m[12], m[13], m[14], 0]);
      this.donusSuz.suz(don, t);
      this.otelemeSuz.suz(ote, t);
      // Süzülen dönüşü dik-birim tabana geri çek (Gram–Schmidt), ölçeği koru.
      const x = new T.Vector3(don[0], don[1], don[2]), y = new T.Vector3(don[3], don[4], don[5]);
      const olcek = (x.length() + y.length() + new T.Vector3(don[6], don[7], don[8]).length()) / 3 || 1;
      x.normalize();
      y.addScaledVector(x, -y.dot(x)).normalize();
      const z = new T.Vector3().crossVectors(x, y);
      this.matris.makeBasis(x.multiplyScalar(olcek), y.multiplyScalar(olcek), z.multiplyScalar(olcek));
      this.matris.setPosition(ote[0], ote[1], ote[2]);
    }
    this.yuzVar = var_;
    // Sönümleme: yüz gelince 0,15 sn'de belirir, kaybolunca son pozda 0,3 sn'de söner.
    this.gorunurluk = var_ ? Math.min(1, this.gorunurluk + dt / 0.15) : Math.max(0, this.gorunurluk - dt / 0.3);
  }

  /** Kanonik nokta [n]'in, landmark pikseline oturtulmuş kamera uzayı konumu (derinlik matristen). */
  _capaKonum(n, hedef = new T.Vector3()) {
    hedef.copy(kanonikNokta(n)).applyMatrix4(this.matris);
    const z = -hedef.z;
    const tan = Math.tan((this.gorus * Math.PI) / 360);
    const ndcX = (this.lm[n * 2] / this.w) * 2 - 1, ndcY = 1 - (this.lm[n * 2 + 1] / this.h) * 2;
    hedef.x = ndcX * z * tan * this.kam.aspect;
    hedef.y = ndcY * z * tan;
    return hedef;
  }

  _ciz(t, dt, filtresiz) {
    const r = this.r;
    const e = this.efekt;
    const a = this.gorunurluk;
    const yuzGerek = a > 0.001;
    const maskeGerek = yuzGerek && (e === 'puruzsuz' || e === 'altin_saat');
    const makyajGerek = yuzGerek && (e === 'allik' || e === 'cil' || e === 'puruzsuz');

    if (yuzGerek) {
      const p = this.yuzKonum.array;
      for (let i = 0; i < 468; i++) {
        p[i * 3] = (this.lm[i * 2] / this.w) * 2 - 1;
        p[i * 3 + 1] = 1 - (this.lm[i * 2 + 1] / this.h) * 2;
      }
      this.yuzKonum.needsUpdate = true;
      const d = this.dudakKonum.array;
      for (let i = 0; i < 20; i++) {
        for (const [j, n] of [[i, DUDAK_DIS[i]], [20 + i, DUDAK_IC[i]]]) {
          d[j * 3] = (this.lm[n * 2] / this.w) * 2 - 1;
          d[j * 3 + 1] = 1 - (this.lm[n * 2 + 1] / this.h) * 2;
        }
      }
      this.dudakKonum.needsUpdate = true;
    }

    r.setClearColor(0x000000, 1);
    r.setRenderTarget(this.rtMaske);
    r.clear();
    if (maskeGerek) r.render(this.maskeSahne, this.orto);

    const tu = this.taban.malzeme.uniforms;
    const yuzGen = Math.hypot(this.lm[454 * 2] - this.lm[234 * 2], this.lm[454 * 2 + 1] - this.lm[234 * 2 + 1]);
    tu.uYaricap.value = Math.max(2, yuzGen * 0.018) * (this.rtSahne.width / Math.max(1, this.w));
    tu.uPuruz.value = e === 'puruzsuz' ? 1 : 0;
    tu.uIsilti.value = e === 'puruzsuz' ? 1 : 0;
    tu.uYuz.value = a;
    r.setRenderTarget(this.rtSahne);
    r.clear();
    r.render(this.taban.sahne, this.orto);

    if (makyajGerek) {
      const mu = this.makyaj.uniforms;
      mu.uAllik.value = e === 'allik' ? 1 : 0;
      mu.uCil.value = e === 'cil' ? 1 : 0;
      mu.uIsilti.value = e === 'puruzsuz' ? 1 : 0;
      mu.uYuz.value = a;
      this.dudak.uniforms.uDudak.value = e === 'allik' ? 1 : 0;
      this.dudak.uniforms.uYuz.value = a;
      r.render(this.makyajSahne, this.orto);
    }

    const ucBoyut = yuzGerek && (e === 'gunes_gozlugu' || e === 'cicek_taci' || e === 'nazar_kupe' || e === 'sim_yagmuru');
    if (ucBoyut) {
      this._ucBoyutGuncelle(t, dt, a);
      r.clearDepth();
      r.render(this.sahne3, this.kam);
    }

    const su = this.son.malzeme.uniforms;
    su.uAyna.value = this.ayna ? 1 : 0;
    su.uAltin.value = e === 'altin_saat' ? 1 : 0;
    su.uFilm.value = e === 'film' ? 1 : 0;
    su.uZaman.value = t;
    su.uYuz.value = a;
    const f = filtresiz ? KIMLIK : this.filtre;
    su.uR.value.set(f[0], f[1], f[2], f[3]);
    su.uG.value.set(f[4], f[5], f[6], f[7]);
    su.uB.value.set(f[8], f[9], f[10], f[11]);
    r.setRenderTarget(null);
    r.clear();
    r.render(this.son.sahne, this.orto);
  }

  _malzemeOpaklik(nesne, a) {
    nesne.traverse((o) => {
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) {
        if (m.colorWrite === false) continue;
        if (m.userData.taban === undefined) m.userData.taban = m.opacity;
        m.opacity = m.userData.taban * a;
        if (m.uniforms?.uYuz) m.uniforms.uYuz.value = a;
      }
    });
  }

  _ucBoyutGuncelle(t, dt, a) {
    const e = this.efekt;
    const n = this.nesneler[e];
    // Kafa: matris + anahtar noktayı landmark pikseline oturtan düzlem içi öteleme (görüş açısı farkını giderir).
    const capa = n?.capa ?? 168;
    const hedef = this._capaKonum(capa);
    const ham = kanonikNokta(capa).applyMatrix4(this.matris);
    this.kafa.matrix.copy(this.matris);
    this.kafa.matrix.elements[12] += hedef.x - ham.x;
    this.kafa.matrix.elements[13] += hedef.y - ham.y;
    this.kafa.matrixWorldNeedsUpdate = true;
    if (n) this._malzemeOpaklik(n.grup, a);
    if (e === 'sim_yagmuru' && n) {
      n.grup.position.set(hedef.x, hedef.y, hedef.z - 4);
      n.sim.material.uniforms.uZaman.value = t;
      n.sim.material.uniforms.uOlcek.value = this.h / (2 * Math.tan((this.gorus * Math.PI) / 360));
      n.sim.material.uniforms.uYuz.value = a;
    }
    if (e === 'nazar_kupe' && this.kupeler) this._kupeGuncelle(t, dt, a);
  }

  /** Küpe: pivot kulak memesi noktasında; ekran düşeyinde sarkar, baş hareketine sarkaç gibi tepki verir. */
  _kupeGuncelle(t, dt, a) {
    const R = new T.Matrix4().extractRotation(this.matris);
    const eu = new T.Euler().setFromRotationMatrix(R, 'YXZ');
    for (const k of this.kupeler) {
      const p = this._capaKonum(k.nokta);
      if (k.onceki && dt > 0) {
        const hiz = (p.x - k.onceki.x) / dt;
        const ivme = k.oncekiHiz === null ? 0 : (hiz - k.oncekiHiz) / dt;
        k.oncekiHiz = hiz;
        const L = 2.3, g = 981;
        const acisal = -(g / L) * Math.sin(k.aci) - 3.2 * k.hiz - (Math.max(-3000, Math.min(3000, ivme)) / L) * Math.cos(k.aci);
        k.hiz += acisal * dt;
        k.aci = Math.max(-0.9, Math.min(0.9, k.aci + k.hiz * dt));
      }
      k.onceki = p.clone();
      k.grup.position.copy(p);
      k.grup.rotation.set(0, eu.y * 0.85, k.aci + 0.035 * Math.sin(t * 2.1 + k.nokta), 'ZYX');
      this._malzemeOpaklik(k.grup, a);
      // Ekrandaki pivot (testte landmark ile karşılaştırılır): kameranın gerçek izdüşümü + ayna.
      const v = p.clone().project(this.kam);
      const x = ((v.x + 1) / 2) * this.w;
      k.ekran = [this.ayna ? this.w - x : x, ((1 - v.y) / 2) * this.h];
    }
  }

  /** Test/rapor: küpe pivotlarının ekran konumu ve karşılık gelen (aynalı) landmark pikseli. */
  kupeOlcum() {
    if (!this.kupeler) return [];
    return this.kupeler.map((k) => {
      const lx = this.lm[k.nokta * 2], ly = this.lm[k.nokta * 2 + 1];
      return { nokta: k.nokta, pivot: k.ekran, landmark: [this.ayna ? this.w - lx : lx, ly] };
    });
  }

  /** Şu anki kareyi filtresiz çizip JPEG baytları döndürür (önizlemeyle aynı çizim; ayna dahil). */
  kareAl(veri, t, kalite = 0.95) {
    this.kare(veri, t, { filtresiz: true });
    const tuval = this.tuval;
    const sonuc = new Promise((coz, red) => {
      tuval.toBlob((b) => (b ? b.arrayBuffer().then((x) => coz(new Uint8Array(x)), red) : red(new Error('kare'))), 'image/jpeg', kalite);
    });
    this.kare(veri, t + 1e-4);
    return sonuc;
  }

  /** Kaynakları bırakır: dokular, hedefler, geometri/malzemeler, ortam haritası ve WebGL bağlamı (forceContextLoss). */
  kapat() {
    this.doku?.dispose();
    this.rtMaske.dispose();
    this.rtSahne.dispose();
    this.sahne3.environment?.dispose();
    for (const s of [this.sahne3, this.maskeSahne, this.makyajSahne, this.taban.sahne, this.son.sahne]) {
      s.traverse((o) => {
        o.geometry?.dispose();
        const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        for (const m of ms) {
          m.map?.dispose();
          m.dispose();
        }
      });
    }
    this.r.dispose();
    this.r.forceContextLoss();
  }
}
