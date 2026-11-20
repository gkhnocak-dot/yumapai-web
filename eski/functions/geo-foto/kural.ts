// geo-foto saf kuralları (test: kural_test.ts). Python pilotu (geo_pilot.py) ve wikimedia_foto_cek.py ile aynı süzgeç.
export const OK = /^(CC BY(-SA)? [0-9]\.[0-9]( [a-z]{2,3})?|CC0.*|Public domain.*|PD.*)$/i;
export const BAD = /NC|ND|fair use|non-?free|free art|GFDL only|unknown|unclear/i;
export const PERSON = /portrait|people|persons|men\b|women|children|man\b|woman|selfie|faces?|self-portrait/i;
export const NOT_PHOTO = /\b(map|maps|harita|logo|diagram|plan|locator|coat of arms|flag)\b/i;
const TR: Record<string, string> = { "ı": "i", "İ": "i", "I": "i", "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g", "ö": "o", "Ö": "o",
  "ş": "s", "Ş": "s", "ü": "u", "Ü": "u", "â": "a", "î": "i", "û": "u" };
// Yalnız bunlardan oluşan ad "genel ad" sayılır ve eşleştirilmez (yanlış foto riski).
export const GENEL = new Set(("the of and ve beach plaj plaji kumsal mosque cami camii merkez park parki bahce bahcesi mesire alani yeri " +
  "kale kalesi muze muzesi museum turbe turbesi kilise kilisesi church han hani hamam hamami kopru koprusu bridge meydan meydani " +
  "cesme cesmesi fountain sahil yolu golu gol lake selale selalesi waterfall magara magarasi cave tepe tepesi seyir terasi " +
  "kultur merkezi galeri gallery sanat tiyatro sinema spor salonu havuz pool club bar studio karaoke").split(" "));
export function clean(s?: string): string { return (s ?? "").replace(/<[^>]+>/g, " ").trim(); }
export function norm(s: string): string {
  let t = [...(s ?? "")].map((c) => TR[c] ?? c).join("").toLowerCase();
  t = t.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return t.replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
export function variants(name: string): string[] {
  const v = new Set<string>([norm(name)]);
  const base = norm(name.split(/[(,/]/)[0]);
  if (base.split(" ").length >= 2) v.add(base);
  return [...v].filter((x) => x.length >= 5 && !x.split(" ").every((w) => GENEL.has(w)));
}
export type Meta = { title: string; lic: string; licurl: string; author: string; cats: string; desc: string; obj: string; w: number; h: number; lat?: number; lon?: number };
export function textOf(m: Meta): string {
  return " " + norm(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj + " " + m.desc) + " ";
}
export function verdict(m: Meta): string | null {
  if (!/\.(jpe?g|png|webp)$/i.test(m.title)) return "bicim";
  if (!m.lic || BAD.test(m.lic) || !OK.test(m.lic)) return "lisans:" + m.lic;
  if (m.lic.toUpperCase().startsWith("CC BY") && !m.author) return "yazar-yok";
  if (PERSON.test(m.cats)) return "kisi";
  if (NOT_PHOTO.test(m.cats) || NOT_PHOTO.test(m.title)) return "fotograf-degil";
  if ((m.w || 0) < 800) return "kucuk";
  return null;
}
// Zayıf foto işaretleri (nesne/detay/belge): dosya adı ya da açıklamada geçerse foto zayıftır.
const ZAYIF = new Set(("book books kitap kitaplar sign signs signboard signpost tabela levha plaque plaques ticket tickets bilet " +
  "inscription inscriptions yazit yazitlar kitabe poster posters afis document documents belge belgeler map maps harita " +
  "closeup detail details detay ayrinti brochure brosur label labels logo newspaper gazete clipping").split(" "));
const ZAYIF_IKILI = ["close up"];
// Genel görünüm (öne alınır) ve iç mekân/sergi (geri itilir) işaretleri.
const GENEL_GORUNUM = new Set(("exterior facade cephe view views manzara panorama panoramic genel general aerial havadan " +
  "overview outside building bina courtyard avlu landscape skyline").split(" "));
const IC_MEKAN = new Set(("interior inside ic ici koridor corridor cell hucre kogus kogustan koguslardan display exhibit exhibition " +
  "sergi sergilenen vitrin heykel heykelleri statue items belongings esyalari projector").split(" "));
const toks = (s: string) => new Set(norm(s).split(" "));
const hasAny = (t: Set<string>, set: Set<string>) => [...t].some((w) => set.has(w));
/** Zayıf işaret: "baslik" (dosya adı/nesne adında; yayından kaldırma için yeterli), "aciklama" (yalnız açıklamada) ya da null. */
export function zayif(m: Meta): "baslik" | "aciklama" | null {
  const bas = m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj;
  const nb = " " + norm(bas) + " ", nd = " " + norm(m.desc) + " ";
  if (hasAny(toks(bas), ZAYIF) || ZAYIF_IKILI.some((x) => nb.includes(" " + x + " "))) return "baslik";
  if (hasAny(toks(m.desc), ZAYIF) || ZAYIF_IKILI.some((x) => nd.includes(" " + x + " "))) return "aciklama";
  return null;
}
/** Güçlü: kurallara uyar, zayıf işareti yok, yatay/kare (en çok 2.2:1; aşırı geniş panorama kartta kırpılır), en az 1000 px. */
export function guclu(m: Meta): boolean {
  return verdict(m) === null && zayif(m) === null && m.w >= 1000 && m.w >= m.h && m.w <= 2.2 * m.h;
}
/** Yer adının ayırt edici kelimeleri (genel kelimeler hariç, en az 4 harf). */
export function ayirt(name: string): string[] { return norm(name).split(" ").filter((w) => w.length >= 4 && !GENEL.has(w)); }
/** Dosya adı/nesne adında yerin ayırt edici bir kelimesi geçiyor mu. */
export function adliDosya(m: Meta, name: string): boolean {
  const t = toks(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj); return ayirt(name).some((w) => t.has(w));
}
export function puan(m: Meta, vs: string[], name = ""): number {
  const bt = " " + norm(m.title.replace(/\.[a-zA-Z0-9]+$/, "")) + " ";
  const t = toks(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj + " " + m.desc);
  return (vs.some((v) => bt.includes(" " + v + " ")) ? 8 : 0) + (name && adliDosya(m, name) ? 6 : 0) +
    (hasAny(t, GENEL_GORUNUM) ? 3 : 0) - (hasAny(t, IC_MEKAN) ? 4 : 0) +
    (m.w >= m.h ? 2 : 0) + (m.w >= 1000 ? 2 : 0);
}
/** Konusu bilinen aday listesinden (P18 / kategori) en güçlüsü; yoksa undefined. */
export function enIyiGuclu(metas: Meta[], name: string, haric: string[] = []): Meta | undefined {
  const vs = variants(name).length ? variants(name) : [norm(name)];
  const h = new Set(haric.map((x) => x.replaceAll("_", " ")));
  return metas.filter((m) => !h.has(m.title.replaceAll("_", " ")) && guclu(m))
    .sort((a, b) => puan(b, vs, name) - puan(a, vs, name) || b.w - a.w)[0];
}
/** Karar (coğrafi arama): {sonuc, secilen?} */
export function decide(name: string, metas: Meta[]): { sonuc: string; pick?: Meta } {
  if (!metas.length) return { sonuc: "commons-dosya-yok" };
  const vs = variants(name);
  if (!vs.length) return { sonuc: "genel-ad" };
  const hits = metas.filter((m) => { const t = textOf(m); return vs.some((v) => t.includes(" " + v + " ")); });
  if (!hits.length) return { sonuc: "ad-eslesmedi" };
  // Zayıf (nesne/detay) elenir; adı dosya adında geçen, genel görünüm, yatay, >=1000 px öne alınır.
  const good = hits.filter((m) => verdict(m) === null && zayif(m) === null).sort((a, b) => puan(b, vs, name) - puan(a, vs, name) || b.w - a.w);
  if (!good.length) return { sonuc: "uygun-degil:" + (verdict(hits[0]) ?? (zayif(hits[0]) ? "zayif" : "")).split(":")[0] };
  return { sonuc: "OK", pick: good[0] };
}
