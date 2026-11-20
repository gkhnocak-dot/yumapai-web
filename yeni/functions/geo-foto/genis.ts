// geo-foto "GENIS" turu (19.11.2026, Reis onayı): fotosuz tarihi/görülecek yerler için geniş Commons/Wikidata araması.
// Yalnız resmi API (Commons + Wikidata). Sıra: (a) Wikidata eşleşmesi -> P18 + P373, (b) Commons dosya araması, (c) 1 km coğrafi arama.
// DB'ye dokunmaz; kuralları kural.ts'ten alır. Test: genis_test.ts.
import { ayirt, decide, GENEL, enIyiGuclu, type Meta, norm, puan, variants, verdict, zayif } from "./kural.ts";
import { GAZETTEER } from "../yumy/veri/gazetteer.ts";
import { konuDenetle } from "./konu.ts";

export type WdAday = { id: string; label: string; desc: string; lat?: number; lon?: number; p18: string[]; kategori?: string; p31: string[]; };
export interface Api {
  geo(lat: number, lon: number, radius: number): Promise<Meta[]>;
  files(titles: string[]): Promise<Meta[]>;
  category(cat: string): Promise<Meta[]>;
  search(q: string): Promise<Meta[]>;
  wdSearch(name: string): Promise<{ id: string; label: string }[]>;
  wdEntities(ids: string[]): Promise<WdAday[]>;
}
export type Yer = { name: string; lat: number | null; lon: number | null; il?: string | null; ilce?: string | null; art_key?: string | null; qid?: string | null };
export type Sonuc = { sonuc: string; pick?: Meta; yol?: string; qid?: string; iz?: string[] };

export class Durdur extends Error { constructor(public r: { ok: false; wait: number; code: string }) { super(r.code); } }

export function mesafeKm(a: number, b: number, c: number, d: number): number {
  const R = 6371, rad = Math.PI / 180, dl = (c - a) * rad, dn = (d - b) * rad;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
// Genişletilmiş zayıf görsel işaretleri (çizim, plan, tarama...). Yalnız GENIS turunda uygulanır; mevcut zayif() aynen kalır.
const EKSTRA = new Set(("drawing drawings sketch illustration illustrations cizim cizimi resim engraving lithograph painting " +
  "plan plans floorplan scan scanned tarama manuscript stamp coin icon pictogram schematic diagram chart graph").split(" "));
const toks = (s: string) => new Set(norm(s).split(" "));
export function uygun(m: Meta): boolean {
  if (verdict(m) !== null || zayif(m) !== null) return false;
  const t = toks(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj);
  return ![...t].some((w) => EKSTRA.has(w)) && !/\b(drawings?|sketch(es)?|maps?|plans?|diagrams?)\b/i.test(m.cats);
}
const sirala = (metas: Meta[], name: string) => {
  const vs = variants(name).length ? variants(name) : [norm(name)];
  return metas.filter(uygun).sort((a, b) => puan(b, vs, name) - puan(a, vs, name) || b.w - a.w);
};
/** Ayırt edici kelimeler dosya adı/nesne adı/açıklama/kategoride (hepsi) geçiyor mu; ek olarak (en az 6 harfli) önek eşleşmesi. */
export function adCok(m: Meta, name: string, kategoriDahil = true, words?: string[]): boolean {
  const aw = words ?? ayirt(name); if (!aw.length) return false;
  const t = toks(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj + " " + m.desc + (kategoriDahil ? " " + m.cats : ""));
  return aw.every((w) => t.has(w) || (w.length >= 6 && [...t].some((x) => x.startsWith(w))));
}
/** Yerin ayırt edici kelimeleri: genel kelimeler ve il/ilçe adının kendisi hariç (aksi hâlde "Kızılcahamam Park" gibi bölge fotoğrafı eşleşir). */
export function ozel(name: string, il?: string | null, ilce?: string | null): string[] {
  const b = new Set([il, ilce].filter((x): x is string => !!x).flatMap((x) => norm(x).split(" ")));
  return norm(name.split(/[(,/]/)[0]).split(" ").filter((w) => w.length >= 3 && !GENEL.has(w) && !b.has(w) && !/^\d+$/.test(w));
}
/** Adın il/ilçe adını da içeren tam ayırt edici dizisi (GENEL hariç, il/ilçe DAHİL): "Divriği Ulu Camii" -> divrigi ulu. */
export function tamAd(name: string): string[] {
  return norm(name.split(/[(,/]/)[0]).split(" ").filter((w) => w.length >= 3 && !GENEL.has(w) && !/^\d+$/.test(w));
}
// Ortak sözcük ya da kişi adı olan il/ilçe adları başlıkta bölge işareti sayılmaz (Of, Han, Kale, Saray, Çeşme, Fatih, Yıldırım, Selçuklu...).
const BOLGE_DEGIL = new Set(("of han hani kale saray pazar konak kosk cesme bahce can cay cat bor mut sur orta olur kure maden selim kemer " +
  "kavak kiraz cinar guney aksu belen dicle defne susuz kumlu kinik bucak hamur evren bayat bala tut arac ula ayas kula kulu " +
  "fatih osmangazi orhangazi yildirim selcuklu hacibektas seyitgazi mihalgazi merkez yenimahalle yenisehir golbasi ortakoy pinarbasi marmara karadeniz " +
  // canlı tarama 20.11: ad/başlıkta ortak sözcük olarak geçenler (Aralık, Çelebi, Perşembe, Menderes nehri, İnönü, Adalar, Termal, Ulus...)
  "aralik celebi persembe menderes inonu adalar akdeniz termal derbent kumru yenice kabatas ciftlik dikmen korkut bozkurt ovacik yesilyurt " +
  "akpinar akyaka karasu karapinar kemalpasa ulus").split(" "));
/** 81 il + ilçe adları (normalize, yumy sözlüğü), ortak sözcükler hariç. */
export const BOLGELER: string[] = [...new Set(GAZETTEER.flatMap(([il, l]) => [il, ...l]).map(norm))].filter((x) => x.length >= 3 && !BOLGE_DEGIL.has(x));
/** İlçe -> bağlı olduğu il(ler) (normalize); canlıda place_addresses.admin_area çoğunlukla boş, il ilçeden bulunur. */
const ILCE_IL = new Map<string, Set<string>>();
for (const [il, l] of GAZETTEER) for (const x of [il, ...l]) { const k = norm(x); if (!ILCE_IL.has(k)) ILCE_IL.set(k, new Set()); ILCE_IL.get(k)!.add(norm(il)); }
/** Metinde (dosya adı) tam kelime olarak geçen il/ilçe adları. */
export function bolgeleri(metin: string): string[] {
  const t = " " + norm(metin.replace(/\.[a-zA-Z0-9]+$/, "")) + " ";
  return BOLGELER.filter((r) => t.includes(" " + r + " "));
}
/** Dosya adında yerin ili/ilçesi ve adındakiler dışında BAŞKA bir il/ilçe adı geçiyorsa onu döner ("Kangal Ulu Camii" Divriği'deki yer için). */
export function yabanciBolge(baslik: string, p: { name: string; il?: string | null; ilce?: string | null }): string | null {
  const izin = new Set([p.il, p.ilce].filter((x): x is string => !!x).map(norm));
  for (const x of [...izin]) for (const il of ILCE_IL.get(x) ?? []) izin.add(il); // ilçenin kendi ili başlıkta geçebilir
  const ad = " " + norm(p.name) + " ";
  return bolgeleri(baslik).find((r) => !izin.has(r) && !ad.includes(" " + r + " ")) ?? null;
}
// Mezarlık fotoğrafı, adı mezarlık olmayan yerin fotoğrafı değildir (staging 20.11: "Smyrna" <- "St.john.smyrna.cemetery.1922.jpg").
const MEZAR = /\b(cemetery|cemeteries|graveyard|graves|gravestone|gravestones|tombstone|tombstones|mezarlik|mezarligi|mezar|mezari|kabristan|friedhof|cimetiere)\b/;
export function mezarUyar(m: Meta, name: string): boolean {
  return MEZAR.test(norm(name)) || !MEZAR.test(norm(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj));
}
/** Yayındaki kayıt denetimi: yer adında il/ilçe adı var, dosya adında o yok ve başka bir il/ilçe adı var ("Divriği Ulu Camii" <- "Sivas Ulu Cami.jpg"). */
export function ilceSupheli(name: string, baslik: string): { adda: string[]; baslikta: string[] } | null {
  const adda = bolgeleri(name.split(/[(,/]/)[0]); if (!adda.length) return null;
  const b = bolgeleri(baslik); if (adda.some((r) => b.includes(r))) return null;
  const ad = " " + norm(name) + " ";
  const baslikta = b.filter((r) => !ad.includes(" " + r + " "));
  return baslikta.length ? { adda, baslikta } : null;
}
// Yer türü (art_key) -> dosya adında/nesne adında geçmesi gereken tür kökleri (TR/EN). Tanımsız art_key'de kural uygulanmaz.
const TUR: Record<string, string[]> = {
  cami: ["cami", "mosque", "mescit", "minare", "minaret"], kilise: ["kilise", "church", "manastir", "monastery", "chapel", "katedral", "cathedral"],
  kale: ["kale", "castle", "fortress", "hisar", "citadel", "fort", "burc", "surlar"], turbe: ["turbe", "tomb", "mausoleum", "kumbet", "turbesi"],
  cesme: ["cesme", "fountain", "sebil"], han_carsi: ["han", "hani", "kervansaray", "caravanserai", "carsi", "bazaar", "bedesten", "inn"],
  tarihi_hamam: ["hamam", "bath", "baths", "hammam"], kopru: ["kopru", "bridge"], muze: ["muze", "museum"],
  hoyuk: ["hoyuk", "tumulus", "mound", "hoyugu", "tumulusu"],
  antik_kent: ["antik", "ancient", "ruin", "ruins", "archaeological", "theatre", "theater", "tiyatro", "necropolis", "nekropol", "temple", "tapinak", "agora", "acropolis", "harabe", "arkeolojik", "sehir", "city"],
  konak_saray: ["konak", "saray", "palace", "mansion", "kosk", "kiosk", "yali", "medrese", "madrasa", "house", "ev"],
  anit: ["anit", "monument", "kule", "tower", "saat", "clock", "memorial", "heykel", "statue", "obelisk", "column", "sutun"],
};
// Konusu yer değil çevre/meydan/pazar olan dosya adları.
const CEVRE = new Set("meydan meydani square street sokak sokagi cadde caddesi pazar pazari market mahalle mahallesi".split(" "));
export function turUyar(m: Meta, artKey?: string | null): boolean {
  const t = [...toks(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj)];
  if (t.some((w) => CEVRE.has(w))) return false;
  const syn = artKey ? TUR[artKey] : undefined; if (!syn) return true;
  return t.some((w) => syn.some((x) => w === x || (x.length >= 4 && w.startsWith(x))));
}
// Ad aramasıyla bulunan Wikidata öğesi için en çok uzaklık (km). İstanbul gibi yoğun yerlerde 1 km komşu yapıyı karıştırdı (Yeni Cami), 0,6 km seçildi.
export const WD_KM = 0.6;
/** Ayırt edici kelimeler bir metin parçasında ARDIŞIK ve sırayla geçiyor mu (en az 6 harfli kelimede önek toleransı). "Galata köprüsünden Topkapı sarayı" != "Galata Sarayı". */
export function ardisik(parca: string, aw: string[]): boolean {
  const t = norm(parca).split(" "); if (!aw.length) return false;
  for (let i = 0; i + aw.length <= t.length; i++) {
    if (aw.every((w, j) => t[i + j] === w || (w.length >= 6 && t[i + j].startsWith(w)))) return true;
  }
  return false;
}
export function adArdisik(m: Meta, aw: string[], kapsam: "baslik" | "hepsi"): boolean {
  const baslik = m.title.replace(/\.[a-zA-Z0-9]+$/, "");
  const p = [baslik, m.obj]; if (kapsam === "hepsi") p.push(m.desc, ...m.cats.split("|"));
  return p.some((x) => x && ardisik(x, aw));
}
/** Adın parantez içi niteleyicisi ("Yeni Cami (Beyoğlu)") varsa dosyanın metninde/kategorisinde de geçmeli; geçmiyorsa başka yerin aynı adlı yapısı sayılır. */
export function parantezUyar(m: Meta, name: string): boolean {
  const mm = name.match(/\(([^)]{3,40})\)/); if (!mm) return true;
  const q = norm(mm[1]); if (!q) return true;
  return (" " + norm(m.title + " " + m.obj + " " + m.desc + " " + m.cats.replaceAll("|", " ")) + " ").includes(" " + q + " ");
}
const YASAK_WD = /disambiguation|family name|given name|surname|\bperson\b|politician|footballer|\bfilm\b|album|\bsong\b|company|business|şirket|soyad|kişi|anlam ayrımı|taxon|organization|organisation/i;
const YASAK_P31 = new Set(["Q5", "Q4167410", "Q101352", "Q202444", "Q4167836", "Q11266439", "Q4830453", "Q43229"]);

/** (a) Wikidata: qid biliniyorsa onu kullan; yoksa ad aramasıyla koordinat <= 1 km ve sınıf uyumlu aday bul. */
export async function wdBul(p: Yer, api: Api): Promise<WdAday | undefined> {
  if (p.qid) { const [e] = await api.wdEntities([p.qid]); return e; }
  if (p.lat == null || p.lon == null || !variants(p.name).length) return undefined;
  const s = await api.wdSearch(p.name.split(/[(,/]/)[0].trim());
  const vs = new Set(variants(p.name)); const aw = ayirt(p.name);
  const adaylar = s.filter((x) => { const n = norm(x.label); return vs.has(n) || (aw.length > 0 && aw.every((w) => n.split(" ").includes(w))); }).slice(0, 5);
  if (!adaylar.length) return undefined;
  const ents = await api.wdEntities(adaylar.map((x) => x.id));
  return ents.filter((e) => e.lat != null && e.lon != null && mesafeKm(p.lat!, p.lon!, e.lat!, e.lon!) <= WD_KM &&
      !YASAK_WD.test(e.desc) && !e.p31.some((c) => YASAK_P31.has(c)))
    .sort((a, b) => mesafeKm(p.lat!, p.lon!, a.lat!, a.lon!) - mesafeKm(p.lat!, p.lon!, b.lat!, b.lon!))[0];
}

export async function genisAra(p: Yer, api: Api): Promise<Sonuc> {
  const iz: string[] = [];
  const r = await genisAra2(p, api, iz); return { ...r, iz };
}
async function genisAra2(p: Yer, api: Api, iz: string[]): Promise<Sonuc> {
  if (!variants(p.name).length && !ayirt(p.name).length) return { sonuc: "genel-ad" };
  let qid: string | undefined = p.qid ?? undefined;
  let neden = "genis-bulunamadi";
  // (a) Wikidata
  const wd = await wdBul(p, api);
  iz.push("wd:" + (wd ? wd.id : "yok"));
  if (wd) {
    qid = wd.id;
    const f = await api.files(wd.p18); iz.push(`p18:${wd.p18.length}/${f.length}/${f.filter(uygun).length}`);
    // P18/P373: qid kaydı (kendi eşleştirmemiz) varsa yalnız konu dışı denetimi; qid ad aramasıyla bulunduysa (yanlış öğe riski: "Garanti Kültür Merkezi" <- Garanti Bank şubesi) tam konu denetimi (21.11.2026)
    const resmi = (m: Meta) => konuDenetle(m, { name: p.name, art_key: p.art_key }, { p18: !!p.qid }).ok;
    const p18 = sirala(f.filter(resmi), p.name)[0];
    if (p18) return { sonuc: "OK", pick: p18, yol: "wd-p18", qid };
    if (wd.kategori) {
      const kat = await api.category(wd.kategori); iz.push(`kat:${kat.length}/${kat.filter(uygun).length}`);
      const k = enIyiGuclu(kat.filter(resmi), p.name) ?? undefined;
      if (k) return { sonuc: "OK", pick: k, yol: "wd-kat", qid };
    }
    neden = "wd-var-foto-yok";
  }
  // (b) Commons dosya araması (yalnız Dosya ad alanı)
  const aw = ozel(p.name, p.il, p.ilce);
  if (aw.length) {
    const q = [aw.join(" "), p.il ?? p.ilce ?? ""].join(" ").trim();
    const hits = await api.search(q); iz.push(`ara:${hits.length}/${hits.filter((x) => adCok(x, p.name, true, aw)).length}/${hits.filter((x) => adCok(x, p.name, true, aw) && uygun(x)).length}`);
    iz.push("adli:" + hits.filter((x) => adCok(x, p.name, true, aw)).slice(0, 3).map((x) => x.title.slice(0, 50) + (x.lat != null ? `@${p.lat != null ? mesafeKm(p.lat, p.lon!, x.lat, x.lon!).toFixed(1) : "?"}km` : "") + (uygun(x) ? "" : "!u")).join(" | "));
    const bolge = [p.il, p.ilce].filter((x): x is string => !!x).map(norm).filter((x) => x.length >= 3);
    const tam = tamAd(p.name);
    const iyi = hits.filter((m) => {
      if (m.lat != null && m.lon != null) {
        if (p.lat == null || p.lon == null) return false;
        return mesafeKm(p.lat, p.lon, m.lat, m.lon) <= 1.5 && adArdisik(m, aw, "hepsi");
      }
      // koordinatsız: ayırt edici kelimelerin hepsi + il/ilçe adı metinde (il/ilçe bilinmiyorsa reddedilir).
      // Yer adındaki il/ilçe kelimesi de başlıkta sırayla geçmeli ve başlıkta başka il/ilçe adı olmamalı ("Divriği Ulu Camii" != "Sivas Ulu Cami"; 20.11).
      if (!adArdisik(m, aw, "baslik") || !adArdisik(m, tam, "baslik") || yabanciBolge(m.title, p) || !mezarUyar(m, p.name)) return false;
      const t = " " + norm(m.title + " " + m.obj + " " + m.desc + " " + m.cats) + " ";
      return bolge.length > 0 && bolge.some((b) => t.includes(" " + b + " ")); // il/ilçe bilinmiyorsa koordinatsız dosya doğrulanamaz: kullanılmaz
    });
    const sec = sirala(iyi.filter((m) => turUyar(m, p.art_key) && parantezUyar(m, p.name) && konuDenetle(m, { name: p.name, art_key: p.art_key }).ok), p.name)[0];
    if (sec) return { sonuc: "OK", pick: sec, yol: "ara", qid };
    if (hits.length) neden = hits.some((m) => adCok(m, p.name, true, aw)) ? "ara-uygun-degil" : "ara-ad-eslesmedi";
  }
  // (c) 1 km coğrafi arama, dosya adı/açıklaması yer adıyla eşleşmeli
  if (p.lat != null && p.lon != null) {
    const metas = await api.geo(p.lat, p.lon, 1000); iz.push(`geo:${metas.length}/${metas.filter(uygun).length}`);
    const adli = metas.filter((m) => decide(p.name, [m]).sonuc === "OK" && turUyar(m, p.art_key) && parantezUyar(m, p.name) &&
      konuDenetle(m, { name: p.name, art_key: p.art_key }).ok);
    const sec = sirala(adli, p.name)[0];
    if (sec) return { sonuc: "OK", pick: sec, yol: "geo1km", qid };
    neden = metas.length ? (adli.length ? "geo1km-uygun-degil" : "geo1km-ad-eslesmedi") : "geo1km-dosya-yok";
  }
  return { sonuc: neden, qid };
}

// Harita/şema/çizim tespiti (yayındaki foto denetimi): biçim (svg), kategori/başlıkta harita-plan-çizim işaretleri. "Relief" tek başına kaya kabartması olabilir, yalnız "relief map" sayılır.
const HARITA = /\b(location maps?|locator|topographic|topographical|relief maps?|karte|karten|mapa|carte|schematic|diagram|sketch|drawings?|illustrations?|floor ?plans?|ground ?plans?|maps? of|maps?|harita|haritasi|plan of|site plan|reconstruction drawing|engravings?)\b/i;
export function haritaMi(m: Meta): "baslik" | null {
  if (/\.svg$/i.test(m.title)) return "baslik";
  if (verdict(m) === "fotograf-degil") return "baslik";
  const t = norm(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj);
  if (HARITA.test(t) || HARITA.test(m.cats.replaceAll("|", " "))) return "baslik";
  return null;
}
/** Açıklamada harita/şema geçen ve biçimi jpg olmayan (png/gif/tif) dosya: harita sayılır (ör. "Kultorte.png"). */
export function haritaAciklama(m: Meta): boolean {
  return !/\.jpe?g$/i.test(m.title) && /\b(maps?|harita|karte|plan|diagram|schematic|sketch)\b/i.test(m.desc);
}
