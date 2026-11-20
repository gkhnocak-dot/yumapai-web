// aciklama: yer açıklaması = Wikipedia özeti (CC BY-SA 4.0) + Wikidata gerçekleri (CC0). Saf kural modülü (ağ/DB yok; test edilebilir).
// Veri kuralı: yapay zekâ ile metin uydurma YOK, makine çevirisi YOK; her dil kendi Wikipedia'sından + Wikidata'nın o dildeki etiketinden.
// Diller: tr, en (canlı) + de, ru, ar, ja, es (21.11.2026; uygulamada kYuExtraLocalesEnabled açılınca görünür). tr/en yolu bu genişlemede birebir korunur.
export type Lang = "tr" | "en" | "de" | "ru" | "ar" | "ja" | "es";
export const DILLER: Lang[] = ["tr", "en", "de", "ru", "ar", "ja", "es"];
export const YENI_DILLER: Lang[] = ["de", "ru", "ar", "ja", "es"];
export const WIKI_SITE: Record<Lang, string> = { tr: "trwiki", en: "enwiki", de: "dewiki", ru: "ruwiki", ar: "arwiki", ja: "jawiki", es: "eswiki" };
const ESKI = (l: Lang) => l === "tr" || l === "en";
export const LISANS = { wikipedia: "CC BY-SA 4.0", wikipediaUrl: "https://creativecommons.org/licenses/by-sa/4.0/", wikidata: "CC0" };

export type Etiket = Partial<Record<Lang, string>> & { dogum?: number; olum?: number };
export type Wd = { id: string; labels?: Etiket; sitelinks?: Record<string, { title: string }>; claims?: Record<string, any[]> };
export type Ozet = { lang: Lang; title: string; type: string; extract: string; rev?: string; url?: string; lat?: number; lon?: number };
export type Yer = { name: string; lat?: number | null; lon?: number | null; il?: string | null; ilce?: string | null };
export type Sonuc = {
  text: string; wiki?: { lang: Lang; title: string; url: string; rev: string | null };
  nWiki: number; nFact: number; facts: string[]; wikiRed?: string;
};

import { IL_TR, ILCE_TR } from "./yer_adlari.ts";
import { YEREL_IL, YEREL_ILCE } from "./yer_adlari_dil.ts";
const norm = (s: string) => s.replace(/İ/g, "i").replace(/I/g, "i").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
  .replace(/ı/g, "i").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, " ").trim();
// Latin dışı yazılar (ru/ar/ja) norm()'da tümüyle silinir; yeni diller harfleri korur (Arapça hareke/elif biçimleri birleştirilir).
const normU = (s: string) => s.replace(/İ/g, "i").replace(/I/g, "i").toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").replace(/ı/g, "i").replace(/ß/g, "ss")
  .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ـ/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
export const normL = (s: string, l: Lang) => (ESKI(l) ? norm(s) : normU(s));
const BOSLUKSUZ = (l: Lang) => l === "ja"; // Japoncada sözcük arası boşluk yok: ad/sayı alt dize olarak aranır
const lowerTr = (s: string) => s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();

// ---- Cümle bölme ----
const KISALTMA = new Set(["örn", "yy", "vb", "vs", "bkz", "dr", "prof", "doç", "yrd", "st", "no", "sy", "cad", "sok", "mah", "mt", "mr", "mrs", "ca", "approx", "fig", "ör", "yak", "bk", "krş", "age", "ave", "blv", "bul", "c", "e.g", "i.e"]);
// Dil başına ek kısaltmalar (nokta cümle bitirmez). Tek harf + nokta (г., в., s., م.) zaten bölmez.
const KISALTMA_DIL: Partial<Record<Lang, string[]>> = {
  de: ["chr", "jh", "jhd", "jhs", "bzw", "nr", "str", "sog", "geb", "gest", "evtl", "ggf", "inkl", "usw", "ca", "st", "dr", "prof", "hl", "ev", "kath", "röm", "mio", "mrd", "abs", "vgl", "z.b", "u.a", "d.h", "o.ä", "bspw"],
  es: ["sr", "sra", "srta", "dña", "aprox", "núm", "pág", "avda", "av", "sta", "sto", "ca", "etc", "a.c", "d.c", "ej", "cap", "dr", "dra", "ud", "uds"],
  ru: ["гг", "вв", "им", "ул", "св", "пос", "ок", "тыс", "млн", "млрд", "т.е", "т.д", "т.п", "н.э", "до", "р", "пр", "пл", "д", "кв", "м", "км", "га", "чел", "род", "ум", "араб", "греч", "лат", "тур", "англ"],
  ar: ["ق.م", "د", "م", "هـ", "ص", "ج"],
};
const ACIK = /[「『（(]/, KAPA = /[」』）)]/;
// Japonca: 。！？ cümle bitirir (boşluk gerekmez); 「」/（） içindeki işaret bölmez; kapanış tırnağı cümleye dahil.
function cumlelerJa(metin: string): string[] {
  const t = metin.replace(/\s+/g, " ").trim(); const out: string[] = []; let bas = 0, d = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i]; if (ACIK.test(c)) d++; else if (KAPA.test(c)) d = Math.max(0, d - 1);
    else if (d === 0 && /[。！？]/.test(c)) { let j = i + 1; while (j < t.length && /[」』）)"”]/.test(t[j])) j++; out.push(t.slice(bas, j).trim()); bas = j; i = j - 1; }
  }
  const son = t.slice(bas).trim(); if (son) out.push(son);
  return out.filter(Boolean);
}
const CUMLE_RE: Partial<Record<Lang, RegExp>> = {
  de: /[.!?]+["'”’)\]»“]*\s+(?=["'“‘(«„]?[\p{Lu}0-9])/gu, es: /[.!?]+["'”’)\]»]*\s+(?=["'“‘(«¿¡]?[\p{Lu}0-9])/gu,
  ru: /[.!?]+["'”’)\]»]*\s+(?=["'“‘(«„]?[\p{Lu}0-9])/gu, ar: /[.!?؟]+["'”’)\]»]*\s+(?=["'“‘(«]?[\p{L}\p{N}])/gu,
};
export function cumleler(metin: string, l: Lang = "tr"): string[] {
  if (l === "ja") return cumlelerJa(metin);
  const t = metin.replace(/\s+/g, " ").trim(); const out: string[] = []; let bas = 0;
  const re = ESKI(l) ? /[.!?]+["'”’)\]»]*\s+(?=["'“‘(«]?[A-ZÇĞİÖŞÜÂÎÛ0-9])/g : new RegExp(CUMLE_RE[l]!); let m: RegExpExecArray | null;
  const ekK = new Set(KISALTMA_DIL[l] ?? []);
  while ((m = re.exec(t))) {
    const onceki = t.slice(bas, m.index + 1); const w = /([\p{L}.]+)\.$/u.exec(onceki.replace(/["'”’)\]»]+$/, ""))?.[1] ?? "";
    const w0 = w.replace(/\./g, "");
    if (/^\p{L}$/u.test(w0) || /^[IVXL]{1,4}$/.test(w0) && !/\./.test(w) || /\./.test(w) && w0.length <= 3 || KISALTMA.has(w.toLowerCase())) continue; // M.Ö., A.D., St., Dr.
    if (!ESKI(l) && (ekK.has(w.toLowerCase()) || ekK.has(w0.toLowerCase()))) continue;
    if (l === "de" && /(?<![\d.])\d{1,2}$/.test(onceki.replace(/["'”’)\]»]+$/, "").slice(0, -1))) continue; // "im 15. Jahrhundert", "am 3. Mai": sıra sayısı
    if (/\d$/.test(onceki.replace(/["'”’)\]»]+$/, "").slice(0, -1)) && /^\.\s/.test(m[0]) && /^\p{Ll}/u.test(t.slice(m.index + m[0].length))) continue;
    out.push(t.slice(bas, m.index + m[0].trimEnd().length).trim()); bas = m.index + m[0].length;
  }
  const son = t.slice(bas).trim(); if (son) out.push(son);
  return out;
}

// Telaffuz / alfabe ayrıntısı veren parantezleri at; öteki parantezler kalır.
// Dil/okunuş parantezi: "(Turkish: …)", "(Azerice: …)", "(Dağlık Kilikya: …)" — baştaki 1–3 sözcük + ":" (REST özeti bunları kendisi atıyordu; Action API atmaz).
const DIL_ETIKETI = /^\s*[\p{L}.-]+(?:\s+[\p{L}.-]+){0,2}\s*:\s/u;
const UZUN_PARANTEZ = 120; // daha uzun parantez açıklama/ara sözdür; ilk cümleyi şişirip açıklamayı düşürmesin diye atılır
const GURULTU = /[;ˈˌ]|\b(?:lit\.|pronounced|IPA|Osmanlıca|Yunanca|Latince|Arapça|Ermenice|Kürtçe|Farsça|telaffuz|okunuşu)(?![\p{L}])|[\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Greek}\p{Script=Armenian}\p{Script=Georgian}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
// "(Turkish: Atatürk Evi (Büyük Taarruz Karargahı))" gibi iç içe dil parantezini kapanışına kadar siler.
function disParantezSil(s: string, etiket = DIL_ETIKETI, dilBasi?: RegExp): string {
  for (let i = s.indexOf("("); i >= 0; i = s.indexOf("(", i + 1)) {
    if (!etiket.test(s.slice(i + 1, i + 60)) && !/^\s*(?:lit\.|IPA)/.test(s.slice(i + 1, i + 10)) && !(dilBasi && dilBasi.test(s.slice(i + 1, i + 60)))) continue;
    let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === "(") d++; else if (s[j] === ")" && --d === 0) break; }
    if (j >= s.length) continue; // kapanmayan: dengeli() zaten reddeder
    const bas = s.slice(0, i).replace(/\s+$/, ""); s = bas + s.slice(j + 1); i = bas.length - 1;
  }
  return s;
}
// Yeni diller: dil/okunuş parantezi (de "(türkisch Ayasofya)", es "(en turco: …)", ru "(тур. Ayasofya)", ar "(بالتركية: …)", ja "（トルコ語: …）");
// hedef dilin kendi yazısı gürültü sayılmaz (ru metninde Kiril parantez içerik olabilir). ru/ar/ja'da yalnız Latin harfli parantez başka dil glosudur.
const DIL_ETIKETI_U = /^\s*[\p{L}.-]+(?:\s+[\p{L}.-]+){0,2}\s*(?::\s|：)/u;
const YAZI: Record<string, string> = { ru: "Cyrillic", ar: "Arabic", ja: "Han}\\p{Script=Hiragana}\\p{Script=Katakana" };
const DIL_SOZ: Partial<Record<Lang, string>> = {
  de: "(?:alt|neu)?(?:türkisch|griechisch|lateinisch|armenisch|osmanisch|kurdisch|arabisch|persisch|georgisch|aramäisch|syrisch|englisch|französisch|italienisch|lasisch|zazaisch)|wörtlich|auch|veraltet",
  es: "(?:en\\s+)?(?:turco|griego(?:\\s+antiguo)?|lat[ií]n|armenio|otomano|kurdo|[aá]rabe|persa|georgiano|ingl[eé]s|franc[eé]s|italiano|siriaco)|literalmente|tambi[eé]n",
  ru: "(?:тур|турец|греч|др\\.-греч|лат|арм|осман|курд|араб|перс|груз|англ|нем|франц?|итал|букв|также|ранее)\\.?",
  ar: "بالتركية|بالعثمانية|التركية العثمانية|باليونانية|باللاتينية|بالأرمنية|بالكردية|بالفارسية|بالإنجليزية|بالإنكليزية|بالعربية|حرفيا",
  ja: "[\\p{L}]+語",
};
const gurultuRe = new Map<Lang, RegExp>();
function gurultu(l: Lang): RegExp {
  if (ESKI(l)) return GURULTU; let g = gurultuRe.get(l); if (g) return g;
  const yazilar = ["Cyrillic", "Arabic", "Greek", "Armenian", "Georgian", "Han", "Hiragana", "Katakana"].filter((y) => !(YAZI[l] ?? "").includes(y));
  g = new RegExp(`[;；؛ˈˌ]|(?<![\\p{L}])(?:lit\\.|pronounced|IPA|${DIL_SOZ[l]})(?![\\p{L}])|[${yazilar.map((y) => `\\p{Script=${y}}`).join("")}]`, "iu");
  gurultuRe.set(l, g); return g;
}
// İç içe dil parantezi: "(griechisch Ανάζαρβος (f. sg.), … (n. pl.))" baştaki dil sözcüğünden kapanışına kadar silinir (de Anavarza bulgusu).
const dilBas = new Map<Lang, RegExp>();
const DIL_BAS = (l: Lang) => dilBas.get(l) ?? (dilBas.set(l, new RegExp(`^\\s*(?:${DIL_SOZ[l]})(?![\\p{L}])`, "iu")), dilBas.get(l)!);
// Parantez dışı dil glosu: de ", lateinisch Anazarbus,", es ", en turco Yunus Sütunu," / "—del inglés «…», …—", ru ", тур. Canhasan —", ar "بالتركية: Hacı …"/"بالتركيةهو".
const DIS_GLOS: Partial<Record<Lang, [RegExp, string][]>> = {
  de: [[/,\s*(?:alt|neu|mittel)?(?:türkisch|griechisch|lateinisch|armenisch|osmanisch|kurdisch|arabisch|persisch|georgisch|aramäisch|syrisch|englisch|französisch)\s+[^,;()]{1,80}?,\s*/giu, " "]],
  es: [[/\s*—\s*(?:en|del)\s+(?:turco|griego(?:\s+antiguo)?|lat[ií]n|armenio|otomano|kurdo|[aá]rabe|persa|ingl[eé]s)\b[^—]{1,200}—\s*/giu, " "],
    [/,\s*(?:en|del)\s+(?:turco|griego(?:\s+antiguo)?|lat[ií]n|armenio|otomano|kurdo|[aá]rabe|persa|ingl[eé]s)\s+[^,;()]{1,80}?,\s*/giu, " "]],
  ru: [[/,\s*(?:тур|турец|греч|др\.-греч|лат|арм|осман|курд|араб|перс|англ)\.\s+[^,—–;()]{1,80}?(?=\s*[,—–])/gu, ""]],
  ar: [[/\s*(?:بال(?:تركية|يونانية|عثمانية|لاتينية|أرمنية|كردية|فارسية|إنجليزية|إنكليزية)|التركية العثمانية)\s*:?\s*[\p{Script=Latin}\d\s.,'’-]*/gu, " "]],
};
const LATIN_GLOS = (l: Lang, ic: string) => (l === "ru" || l === "ar" || l === "ja") && /\p{Script=Latin}/u.test(ic) && !new RegExp(`[\\p{Script=${YAZI[l]}}]`, "u").test(ic) && !/^[\s\dIVXLCM.,–-]+$/.test(ic);
export function temizleDil(ham: string, l: Lang): string {
  const ja = l === "ja";
  let s = ham.replace(/[\u200b\u200c\u200e\u200f\u2060\ufeff]/g, "").replace(/\[\d+\]|\[[a-z]\]/g, "").replace(/\s+/g, " ");
  if (ja) s = s.replace(/（/g, "(").replace(/）/g, ")");
  // Dil arası bağlantı artığı: "（6都市連合、en:Doric hexapolis）" -> "（6都市連合）", "(en:Foo)" -> "" (ja Knidos, kuru çalıştırma bulgusu).
  s = s.replace(/[、,，]\s*[a-z]{2,3}:[^()、,，]*(?=\))/g, "").replace(/\(\s*[a-z]{2,3}:[^()]*\)/g, "");
  s = disParantezSil(s, DIL_ETIKETI_U, DIL_SOZ[l] ? DIL_BAS(l) : undefined); const G = gurultu(l); const uzun = ja ? 60 : UZUN_PARANTEZ;
  for (let i = 0; i < 3; i++) s = s.replace(/\s*\(([^()]*)\)/g, (m, ic) => G.test(ic) || DIL_ETIKETI_U.test(ic) || LATIN_GLOS(l, ic) || ic.length > uzun || ic.trim() === "" ||
    (ja && /^[\p{Script=Hiragana}\p{Script=Katakana}ー・、\s]+$/u.test(ic) && /\p{Script=Hiragana}/u.test(ic)) ? "" : m); // ja: hiragana içeren kana parantez okunuştur (「…の城壁（…のじょうへき）」)
  for (const [r, y] of DIS_GLOS[l] ?? []) s = s.replace(r, y);
  s = s.replace(/\s+([,.;:!?،؛؟])/g, "$1").replace(/,\s*,/g, ",").replace(/،\s*،/g, "،").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim();
  if (ja) s = s.replace(/\(/g, "（").replace(/\)/g, "）").replace(/\s*（/g, "（").replace(/）\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "）");
  return s;
}
export function temizle(ham: string, l: Lang = "tr"): string {
  if (!ESKI(l)) return temizleDil(ham, l);
  let s = ham.replace(/\[\d+\]|\[[a-z]\]/g, "").replace(/\s+/g, " ");
  s = disParantezSil(s);
  for (let i = 0; i < 3; i++) s = s.replace(/\s*\(([^()]*)\)/g, (m, ic) => GURULTU.test(ic) || DIL_ETIKETI.test(ic) || ic.length > UZUN_PARANTEZ || ic.trim() === "" ? "" : m);
  return s.replace(/\s+([,.;:!?])/g, "$1").replace(/,\s*,/g, ",").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim();
}

// ---- Madde yer mi? ----
const YER_DISI_P31 = new Set(["Q5", "Q4167410", "Q13406463", "Q4167836", "Q11424", "Q7725634", "Q1656682", "Q3024240", "Q48336", "Q1366112", "Q56061", "Q95074", "Q15632617", "Q4830453", "Q43229", "Q24354", "Q327333", "Q783794", "Q4830453"]);
const KISI_EVENT = /\b(doğumlu|doğdu|öldü|vefat|yönetmen[i]? |oyuncu|bestekar|şair|film[i]?dir|albüm|şarkı|soyadı|was born|\(born|is a (film|novel|song|album|surname|given name|politician)|may refer to|can refer to)\b|\(\s*\d{1,2}\s+\p{L}+\s+\d{3,4}\s*[-–]|\bd\.\s*\d{3,4}\b/iu;
export function p31(e: Wd): string[] { return (e.claims?.P31 ?? []).map((c) => c?.mainsnak?.datavalue?.value?.id).filter(Boolean); }
export function yerMi(e: Wd): boolean { return !p31(e).some((q) => YER_DISI_P31.has(q)); }

export function km(a: [number, number], b: [number, number]): number {
  const r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
export function wdKonum(e: Wd): [number, number] | null {
  const v = e.claims?.P625?.[0]?.mainsnak?.datavalue?.value; return v && typeof v.latitude === "number" ? [v.latitude, v.longitude] : null;
}

// Özet, yerin adını/türünü taşıyor mu? Ad adayları: yerin adı, Wikidata etiketleri, madde başlığı (parantezsiz).
function adTokenleri(adlar: string[], l: Lang = "tr"): { tam: string[]; tok: string[][] } {
  const en = l === "ja" ? 2 : 3; // ja: 2 harf (寺, 城 + ad) anlamlıdır
  const tam = [...new Set(adlar.map((a) => normL(a.replace(/\s*[(（][^)）]*[)）]/g, "").replace(/[,،].*$/, ""), l)).filter((a) => a.length >= en))];
  return { tam, tok: tam.map((a) => a.split(" ").filter((x) => x.length >= en)) };
}
export function adTasiyor(metin: string, adlar: string[], l: Lang = "tr"): boolean {
  const n = " " + normL(metin, l) + " "; const { tam, tok } = adTokenleri(adlar, l);
  const on = l === "ja" || l === "ar" ? "" : " "; // ja boşluksuz; ar önekleri (و ب ل ال) bitişik
  if (tam.some((a) => n.includes(on + a))) return true; // sonek (Pergamon'un) için sağ sınır aranmaz
  if (!ESKI(l)) return tok.some((ts) => ts.length > 1 && ts.filter((x) => n.includes(on + x.slice(0, Math.max(4, Math.ceil(x.length * 0.6))))).length / ts.length >= 0.6);
  // Gövde eşleşmesi (Höyüğü~Höyük, Çeşmesi~Çeşme): her ad belirteci uzunluğunun >= %60'ı kadar önekle aranır; belirteçlerin >= %60'ı bulunmalı.
  return tok.some((ts) => ts.length > 1 && ts.filter((x) => n.includes(" " + x.slice(0, Math.max(4, Math.ceil(x.length * 0.6))))).length / ts.length >= 0.6);
}

export type Red = { red: string };
export function ozetGecerli(oz: Ozet, e: Wd, yer: Yer, ad: string[]): Red | null {
  const l = oz.lang;
  if (oz.type !== "standard") return { red: "anlam-ayrimi/standart-degil" };
  if (!yerMi(e)) return { red: "yer-disi-p31" };
  if (!oz.extract || oz.extract.length < (l === "ja" ? 20 : 40)) return { red: "ozet-kisa" };
  // Yeni diller: madde metni yerin Türkçe adını taşımaz (Кадыкёй, カドゥキョイ); Wikidata öğesi ile yerin aynı olduğu tr/en etiketiyle ayrıca kanıtlanır.
  if (!ESKI(l)) { const te = [e.labels?.tr, e.labels?.en].filter(Boolean) as string[]; if (!te.length || (!adTasiyor(te.join(" ; "), [yer.name]) && !adTasiyor(yer.name, te))) return { red: "kimlik-yok(tr/en-etiket)" }; }
  const cum = cumleler(temizle(oz.extract, l), l); const ilk = cum.slice(0, 2).join(" ");
  const ilkHam = cumleler(oz.extract.replace(/\s+/g, " "), l).slice(0, 2).join(" "); // "(Turkish: Sabancı Merkez Camii)" ad kanıtıdır
  if (KISI_EVENT.test(cum[0] ?? "")) return { red: "kisi-olay-kalibi" }; // yalnız ilk cümle: "(1842–1847)" gibi yapı yılları ikinci cümlede kişi sayılmaz
  if (!adTasiyor(ilk + " " + ilkHam + " " + oz.title, [yer.name, ...ad], l)) return { red: "ad-yok" };
  if (!adTasiyor(ilk, [yer.name, oz.title, ...ad], l) && !adTasiyor(ilkHam, [yer.name, oz.title, ...ad], l)) return { red: "ilk-cumlede-ad-yok" };
  const k: [number, number] | null = oz.lat != null && oz.lon != null ? [oz.lat, oz.lon] : wdKonum(e);
  if (k && yer.lat != null && yer.lon != null && km(k, [yer.lat, yer.lon]) > 30) return { red: "uzak-konum" };
  return null;
}

// ---- Wikipedia bölümü: ilk cümleler, en çok `butce` karakter ----
// Giriş bölümü birden çok paragraf olabilir: liste girişi (":" ile biten) ya da noktalamasız satır (liste öğesi/başlık) görülünce orada kesilir,
// böylece "şunlardır: A B C" gibi listeler cümleye karışmaz.
// Cümle sonu: ar "؟", ja "。！？" (+ kapanış tırnağı).
const SON: Partial<Record<Lang, RegExp>> = { ar: /[.!?؟]["'”’)»]?$/, ja: /[。！？!?][」』）)"”]?$/ };
const sonMu = (c: string, l: Lang) => (SON[l] ?? /[.!?]["'”’)»]?$/).test(c);
export function girisParagraflari(ham: string, l: Lang = "tr"): string {
  const out: string[] = [];
  // Yeni diller: kaynak işaretinden artan görünmez karakter (es/ar "… Palestina. \u200b") paragraf sonunu gizlemesin. tr/en yolu değişmez (bayt eşitliği).
  const gor = (x: string) => (ESKI(l) ? x : x.replace(/[\u200b\u200c\u200e\u200f\u2060\ufeff]/g, "")).trim();
  for (const p of ham.split(/\n+/).map(gor).filter(Boolean)) {
    // Yeni diller: ilk paragraf liste girişiyse (":" ile biter) liste öğeleri metin sanılmaz; girişten önceki tam cümleler alınır, orada kesilir (es İssos bulgusu).
    if (!ESKI(l) && /[:：]\s*$/.test(p)) { const c = cumleler(p, l); c.pop(); if (c.length) out.push(c.join(l === "ja" ? "" : " ")); break; }
    if (/[:：]\s*$/.test(p) || !sonMu(p, l)) { if (out.length) break; else continue; }
    out.push(p);
  }
  return out.join(l === "ja" ? "" : " ");
}
const dengeli = (c: string) => { // sayı + sıra: "1808–1839), and … (r." gibi parçalar reddedilir; ja tam genişlik （） ve 「」 de sayılır
  let d = 0, k = 0; for (const ch of c) { if (ch === "(" || ch === "（") d++; else if ((ch === ")" || ch === "）") && --d < 0) return false; else if (ch === "「") k++; else if (ch === "」" && --k < 0) return false; }
  return d === 0 && k === 0 && !/[\[\]]/.test(c);
};
// Uzatma (Reis onayı 20.11.2026 23:02): giriş bölümünden 2–4 cümle, en çok WIKI_BUTCE harf; cümle ortasında kesme yok.
export const WIKI_BUTCE = 600, WIKI_CUMLE = 4;
// Karakter ölçütü: Japonca harf başına bilgi yoğunluğu Latin yazının ~2 katı; aynı okuma uzunluğu için bütçeler 0,45 ile ölçeklenir (karakter = UTF-16 birimi;
// kullanılan kana/kanji BMP içinde, yani karakter sayısıyla aynı). Diğer diller tr/en bütçesini kullanır.
export const BUTCE: Record<Lang, { wiki: number; tek: number; max: number; enKisa: number }> = {
  tr: { wiki: 600, tek: 560, max: 800, enKisa: 15 }, en: { wiki: 600, tek: 560, max: 800, enKisa: 15 }, de: { wiki: 600, tek: 560, max: 800, enKisa: 15 },
  es: { wiki: 600, tek: 560, max: 800, enKisa: 15 }, ru: { wiki: 600, tek: 560, max: 800, enKisa: 15 }, ar: { wiki: 600, tek: 560, max: 800, enKisa: 15 },
  ja: { wiki: 270, tek: 250, max: 360, enKisa: 8 },
};
const ayrac = (l: Lang) => (l === "ja" ? "" : " ");
export function wikiCumleleri(oz: Ozet, butce?: number, enCok = WIKI_CUMLE): string[] {
  const l = oz.lang, B = BUTCE[l]; butce ??= B.wiki; const a = ayrac(l).length;
  const hepsi = cumleler(temizle(girisParagraflari(oz.extract, l), l), l); if (hepsi.length && !dengeli(hepsi[0])) return []; // bozuk ilk cümle: Wikipedia kullanılmaz
  const all = hepsi.filter(dengeli).filter((c) => sonMu(c, l) && c.length >= B.enKisa && !/^\p{Ll}/u.test(c));
  const out: string[] = []; let n = 0;
  for (const c of all) {
    if (out.length >= enCok) break;
    if (n + c.length + (out.length ? a : 0) > butce && out.length) break;
    if (!out.length && c.length > B.tek) return []; // tek cümle bile sığmıyor: kesilmez, Wikipedia kullanılmaz
    if (out.some((x) => normL(x, l) === normL(c, l))) continue;
    out.push(c); n += c.length + a;
  }
  return out;
}

// ---- Wikidata gerçekleri ----
export type Etiketler = Record<string, Etiket>;
// Dil geri düşmesi (tr etiketi yoksa en): özel ad (Aphrodisias, kişi adı) olur, İngilizce ifade ("… Caravanserais on the route from …") Türkçe metne girmez.
const INGILIZCE_IFADE = /(?<![\p{L}])(?:of|the|and|on|at|from|to|in|for|with|Upper|Lower|Old|New|North|South|East|West|Great|Little|Sanctuary|Stadium|Basilica|Waterfalls?|Falls|Caravanserais?|Consulting|Company|Rock-tombs|District|Complex|Kings?|Sultan's)(?![\p{L}])/u;
// Özel ad biçimi: her sözcük büyük harfle (bağlaçlar hariç), parantez yok, rakamla başlamaz; İngilizce ifade/yapı adı değil.
// "Aeolian dodecapolis", "Hittite citadel wall", "Water basin (Ḫattuša)", "7th Battle Squadron" tr metne girmez; "Antiphellus", "John James Burnet" girer.
const BAGLAC = new Set(["de", "da", "di", "del", "della", "van", "von", "der", "den", "ibn", "bin", "al", "el", "la", "le", "du", "y"]);
function ozelAdBicimi(g: string): boolean {
  if (/[()\d]/.test(g) || INGILIZCE_IFADE.test(g) || INGILIZCE_AD.test(g)) return false;
  return g.split(/[\s-]+/).filter(Boolean).every((w) => BAGLAC.has(w) || /^[\p{Lu}'’]/u.test(w));
}
// Yeni diller: etiket yoksa de/es'e yalnız özel ad biçimindeki en/tr etiketi girer; ru/ar/ja'ya Latin yazılı etiket hiç girmez (çeviri/harf çevirisi yok).
// Wikidata'nın ru/ar/ja etiketi Latin harfliyse yalnız özel ad biçimindeyse kullanılır ("модерн" yerine "Art Nouveau" sızmaz).
const LATINSIZ = (l: Lang) => l === "ru" || l === "ar" || l === "ja";
const lab = (L: Etiketler, id: string, l: Lang, ortak = false) => {
  if (!ESKI(l)) {
    const v = L[id]?.[l]; if (v) return LATINSIZ(l) && /\p{Script=Latin}/u.test(v) && !ozelAdBicimi(v) ? undefined : v;
    if (!ortak || LATINSIZ(l)) return undefined;
    const g = L[id]?.en ?? L[id]?.tr; return g && ozelAdBicimi(g) ? g : undefined;
  }
  const v = L[id]?.[l]; if (v || !ortak) return v;
  const g = L[id]?.[l === "tr" ? "en" : "tr"]; return g && l === "tr" && !ozelAdBicimi(g) ? undefined : g;
};
const ids = (e: Wd, p: string) => (e.claims?.[p] ?? []).map((c) => c?.mainsnak?.datavalue?.value?.id).filter(Boolean) as string[];
const YEREL: Record<Lang, string> = { tr: "tr-TR", en: "en-US", de: "de-DE", es: "es-ES", ru: "ru-RU", ar: "ar-u-nu-latn", ja: "ja-JP" }; // ar: Wikipedia'daki gibi Batı rakamı
const sayi = (n: number, l: Lang) => n.toLocaleString(YEREL[l], { maximumFractionDigits: 1 }); // 425.000 m² / 26,4 hektar
const BIRIM: Record<string, Record<Lang, string>> = {
  Q11573: { tr: "m", en: "m", de: "m", es: "m", ru: "м", ar: "م", ja: "m" }, Q828224: { tr: "km", en: "km", de: "km", es: "km", ru: "км", ar: "كم", ja: "km" },
  Q712226: { tr: "km²", en: "km²", de: "km²", es: "km²", ru: "км²", ar: "كم²", ja: "km²" }, Q25343: { tr: "m²", en: "m²", de: "m²", es: "m²", ru: "м²", ar: "م²", ja: "m²" },
  Q35852: { tr: "hektar", en: "hectares", de: "Hektar", es: "hectáreas", ru: "га", ar: "هكتار", ja: "ヘクタール" },
};
const yil = (e: Wd, p: string): number | null => {
  const v = e.claims?.[p]?.[0]?.mainsnak?.datavalue?.value; if (!v?.time || (v.precision ?? 0) < 9) return null;
  const m = /^([+-])0*(\d+)-/.exec(v.time); return m ? (m[1] === "-" ? -1 : 1) * Number(m[2]) : null;
};
const miktar = (e: Wd, p: string, l: Lang): string | null => {
  const c0 = e.claims?.[p]?.[0]; const v = c0?.mainsnak?.datavalue?.value; if (!v?.amount) return null;
  if (Object.keys(c0?.qualifiers ?? {}).length || (e.claims?.[p] ?? []).length > 1) return null; // "parçasının alanı"/çoklu ölçü: belirsiz
  if (ids(e, "P1435").includes("Q9259")) return null; // Dünya Mirası çekirdek bölgesi dağın alanı değildir
  const u = /Q\d+$/.exec(String(v.unit ?? ""))?.[0]; const b = u ? BIRIM[u] : undefined; const a = Number(v.amount);
  if (!b || !(Math.round(a * 10) / 10 > 0)) return null; return `${sayi(Math.round(a * 10) / 10, l)}${l === "ja" && b[l] === "ヘクタール" ? "" : " "}${b[l]}`;
};
// yoklama dil başına: tr/en eski davranışı (yalnız tr+en etiketleri) birebir korunur; yeni dil tr+en+kendi etiketiyle yoklar.
export type Gercek = { key: string; cumle: Partial<Record<Lang, string | null>>; yoklama: string[]; yoklamaDil: Partial<Record<Lang, string[]>> };
// Her dil için kalıp tablosu. Diğer diller (de, es, ru, ar, ja) için kalıplar buraya aynı anahtarlarla eklenir; uygulama dili açılana dek kullanılmaz.
export const KALIP: Record<Lang, Record<string, (v: string) => string>> = {
  tr: { miras: (v) => `Miras statüsü: ${v}.`, koruma: (v) => `Korunma durumu: ${v}.`, yapim: (v) => `${v} yılına tarihlenir.`, yapimMO: (v) => `MÖ ${v} yılına tarihlenir.`,
    mimar: (v) => `Mimar: ${v}.`, tarz: (v) => `Mimari tarz: ${v}.`, parca: (v) => `Bağlı olduğu bütün: ${v}.`, icerir: (v) => `İçerdiği yapılar: ${v}.`, ad: (v) => `Adını aldığı: ${v}.`,
    alan: (v) => `Alan: ${v}.`, yukseklik: (v) => `Yükseklik: ${v}.` },
  en: { miras: (v) => `Heritage status: ${v}.`, koruma: (v) => `Preservation status: ${v}.`, yapim: (v) => `Dates to ${v}.`, yapimMO: (v) => `Dates to ${v} BCE.`,
    mimar: (v) => `Architect: ${v}.`, tarz: (v) => `Architectural style: ${v}.`, parca: (v) => `Part of: ${v}.`, icerir: (v) => `Includes: ${v}.`, ad: (v) => `Named after: ${v}.`,
    alan: (v) => `Area: ${v}.`, yukseklik: (v) => `Height: ${v}.` },
  de: { miras: (v) => `Schutzstatus: ${v}.`, koruma: (v) => `Erhaltungszustand: ${v}.`, yapim: (v) => `Entstehungsjahr: ${v}.`, yapimMO: (v) => `Entstehungsjahr: ${v} v. Chr.`,
    mimar: (v) => `Architekt: ${v}.`, tarz: (v) => `Baustil: ${v}.`, parca: (v) => `Teil von: ${v}.`, icerir: (v) => `Umfasst: ${v}.`, ad: (v) => `Benannt nach: ${v}.`,
    alan: (v) => `Fläche: ${v}.`, yukseklik: (v) => `Höhe: ${v}.` },
  es: { miras: (v) => `Protección patrimonial: ${v}.`, koruma: (v) => `Estado de conservación: ${v}.`, yapim: (v) => `Año de creación: ${v}.`, yapimMO: (v) => `Año de creación: ${v} a. C.`,
    mimar: (v) => `Arquitecto: ${v}.`, tarz: (v) => `Estilo arquitectónico: ${v}.`, parca: (v) => `Forma parte de: ${v}.`, icerir: (v) => `Incluye: ${v}.`, ad: (v) => `Debe su nombre a: ${v}.`,
    alan: (v) => `Superficie: ${v}.`, yukseklik: (v) => `Altura: ${v}.` },
  ru: { miras: (v) => `Охранный статус: ${v}.`, koruma: (v) => `Состояние сохранности: ${v}.`, yapim: (v) => `Год создания: ${v}.`, yapimMO: (v) => `Год создания: ${v} до н. э.`,
    mimar: (v) => `Архитектор: ${v}.`, tarz: (v) => `Архитектурный стиль: ${v}.`, parca: (v) => `Входит в состав: ${v}.`, icerir: (v) => `Включает: ${v}.`, ad: (v) => `Назван в честь: ${v}.`,
    alan: (v) => `Площадь: ${v}.`, yukseklik: (v) => `Высота: ${v}.` },
  // ar: sağdan sola; liste ayracı "، " / "؛ " (ayrac() verir), cümle sonu ".".
  ar: { miras: (v) => `الحماية التراثية: ${v}.`, koruma: (v) => `حالة الحفظ: ${v}.`, yapim: (v) => `سنة الإنشاء: ${v}.`, yapimMO: (v) => `سنة الإنشاء: ${v} ق.م.`,
    mimar: (v) => `المعماري: ${v}.`, tarz: (v) => `الطراز المعماري: ${v}.`, parca: (v) => `جزء من: ${v}.`, icerir: (v) => `يضم: ${v}.`, ad: (v) => `سُمّي نسبةً إلى: ${v}.`,
    alan: (v) => `المساحة: ${v}.`, yukseklik: (v) => `الارتفاع: ${v}.` },
  // ja: cümle sonu "。", iki nokta "：", liste ayracı "、".
  ja: { miras: (v) => `文化財指定：${v}。`, koruma: (v) => `保存状態：${v}。`, yapim: (v) => `建造年：${v}年。`, yapimMO: (v) => `建造年：紀元前${v}年。`,
    mimar: (v) => `建築家：${v}。`, tarz: (v) => `建築様式：${v}。`, parca: (v) => `所属：${v}。`, icerir: (v) => `構成要素：${v}。`, ad: (v) => `名称の由来：${v}。`,
    alan: (v) => `面積：${v}。`, yukseklik: (v) => `高さ：${v}。` },
};
// Liste ayraçları: virgül / noktalı virgül (ar ، ؛  ja 、).
const VIRGUL = (l: Lang) => (l === "ar" ? "، " : l === "ja" ? "、" : ", ");
const NOKTALI = (l: Lang) => (l === "ar" ? "؛ " : l === "ja" ? "、" : "; ");
const buyuk = (s: string, l: Lang) => (l === "tr" ? s.replace(/^i/, "İ").replace(/^ı/, "I") : s).replace(/^\p{Ll}/u, (c) => c.toLocaleUpperCase(l === "tr" ? "tr" : ESKI(l) ? "en" : l));
export function gercekler(e: Wd, L: Etiketler): Gercek[] {
  const out: Gercek[] = []; const liste = (qs: string[], l: Lang, ortak: boolean, en = 3) => {
    const x = [...new Set(qs.map((q) => lab(L, q, l, ortak)).filter(Boolean) as string[])].slice(0, en); return x.length ? x : null;
  };
  const ek = (key: string, f: (l: Lang) => string | null, yoklama: (l: Lang) => string[]) => {
    const den = (x: string | null) => (x && (x.match(/[(（]/g)?.length ?? 0) === (x.match(/[)）]/g)?.length ?? 0) && !/[\[\]]/.test(x) ? x : null); // bozuk etiket ("Art Nouveau (mimarlığı")
    const c: Partial<Record<Lang, string | null>> = {}; for (const l of DILLER) c[l] = den(f(l));
    const yd: Partial<Record<Lang, string[]>> = {}; for (const l of DILLER) yd[l] = yoklama(l);
    if (DILLER.some((l) => c[l])) out.push({ key, cumle: c, yoklama: [...yd.tr!, ...yd.en!], yoklamaDil: yd });
  };
  const lbls = (qs: string[], l: Lang, ortak: boolean) => liste(qs, l, ortak) ?? [];
  ek("miras", (l) => { const x = liste(ids(e, "P1435"), l, false, 2); return x ? KALIP[l].miras(x.map((s) => buyuk(s, l)).join(NOKTALI(l))) : null; }, (l) => lbls(ids(e, "P1435"), l, false));
  ek("koruma", (l) => { const x = liste(ids(e, "P5816"), l, false, 1); return x ? KALIP[l].koruma(buyuk(x[0], l)) : null; }, (l) => lbls(ids(e, "P5816"), l, false));
  const y = yil(e, "P571");
  if (y != null && y !== 0) ek("yapim", (l) => (y < 0 ? KALIP[l].yapimMO(String(-y)) : KALIP[l].yapim(String(y))), () => [String(Math.abs(y))]);
  const mimarlar = (l: Lang) => { // yapım yılıyla çelişen ömür (Wikidata hatası) görünürde olmaz
    const ok = ids(e, "P84").filter((q) => { const k = L[q]; return !(y != null && k && ((k.dogum != null && y < k.dogum + 15) || (k.olum != null && y > k.olum + 15))); });
    return liste(ok, l, true, 2);
  };
  ek("mimar", (l) => { const x = mimarlar(l); return x ? KALIP[l].mimar(x.join(VIRGUL(l))) : null; }, (l) => mimarlar(l) ?? []);
  ek("tarz", (l) => { const x = liste(ids(e, "P149"), l, false, 2); return x ? KALIP[l].tarz(x.map((s) => buyuk(s, l)).join(VIRGUL(l))) : null; }, (l) => lbls(ids(e, "P149"), l, false));
  ek("parca", (l) => { const x = liste(ids(e, "P361"), l, true, 1); return x ? KALIP[l].parca(x[0]) : null; }, (l) => lbls(ids(e, "P361"), l, true));
  // "şehir" gibi cins adı Wikidata verisinden "adını aldığı" olmaz; büyük/küçük harf ayrımı olmayan yazılarda (ar, ja) ad P138 değerinin kendisidir.
  const ozel = (x: string[] | null) => (x ? x.filter((v) => /^\p{Lu}/u.test(v) || /^[\p{Script=Arabic}\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}]/u.test(v)) : []);
  ek("ad", (l) => { const x = ozel(liste(ids(e, "P138"), l, true, 2)); return x.length ? KALIP[l].ad(x[0]) : null; }, (l) => ozel(lbls(ids(e, "P138"), l, true)));
  ek("icerir", (l) => { const x = liste(ids(e, "P527"), l, true, 3); return x && x.length >= 1 ? KALIP[l].icerir(x.join(VIRGUL(l))) : null; }, (l) => lbls(ids(e, "P527"), l, true));
  const sayiYok = (p: string) => (l: Lang) => { const a = miktar(e, p, l); return a ? [a.split(/ |(?=ヘクタール)/)[0]] : []; }; // "65 hektarlık alan" varsa "Alan: 65 hektar" eklenmez
  ek("alan", (l) => { const a = miktar(e, "P2046", l); return a ? KALIP[l].alan(a) : null; }, sayiYok("P2046"));
  ek("yukseklik", (l) => { const a = miktar(e, "P2048", l); return a ? KALIP[l].yukseklik(a) : null; }, sayiYok("P2048"));
  return out;
}
const ONCELIK = ["miras", "koruma", "yapim", "mimar", "tarz", "parca", "ad", "icerir", "yukseklik", "alan"];

// ---- Wikidata-only açılış cümlesi (yalnız >= 2 somut gerçek varken kullanılır) ----
function tur(e: Wd, L: Etiketler, l: Lang): string | null {
  for (const q of p31(e)) { const s = L[q]?.[l]; if (s && s.length <= 40) return l === "tr" ? lowerTr(s) : s.toLowerCase(); }
  return null;
}
const INGILIZCE_AD = /(?<![\p{L}])(?:Fountain|Mosque|Church|Monastery|Bridge|Castle|Tomb|Bath|Baths|Hotel|Museum|Square|Palace|Tower|Gate|Wall|Walls|Cemetery|Lake|Dam|Cave|Monument|Mansion|Inn|Caravanserai|Synagogue|Library|Park|Theatre|Theater|Mausoleum|Kiosk|Pavilion|Hall|Fortress|Citadel|Aqueduct|Cistern|Station|Lighthouse|Harbour|Harbor|Island|Mountain|River|Valley|Canyon|Waterfall|Spring|Tumulus|Necropolis|House|Building|Madrasa|Hammam|Market|Bazaar|Shrine|Temple)(?![\p{L}])/u; // büyük harf duyarlı: "Tabiat Parkı" eşleşmez
const ADTEMIZ = (a: string) => a.replace(/\s*\([^)]*\)/g, "").replace(/,\s*[\p{L}]+$/u, "").trim();
// Türkçe -DIR eki: son ünlüye göre ı/i/u/ü, sert ünsüzden sonra t.
export function tr_dir(kelime: string): string {
  const k = lowerTr(kelime.trim().split(/\s+/).pop() ?? ""); const unluler = "aıoueiöü"; let son = "";
  for (const c of k) if (unluler.includes(c)) son = c;
  const harf = son === "a" || son === "ı" ? "ı" : son === "e" || son === "i" ? "i" : son === "o" || son === "u" ? "u" : "ü";
  const sert = "çfhkpsşt".includes(k.slice(-1)); return (sert ? "t" : "d") + harf + "r";
}
// Yalnız tr/en: yeni dillerde Wikidata-yalnız açılış cümlesi kurulmaz (de/es/ar cinsiyet uyumu, uydurma riski); o dilde Wikipedia maddesi şarttır.
export function acilis(yer: Yer, e: Wd, L: Etiketler, l: Lang): string | null {
  if (!ESKI(l)) return null;
  const t = tur(e, L, l); if (!t) return null;
  if (l === "tr" && !e.labels?.tr && (INGILIZCE_AD.test(yer.name) || INGILIZCE_IFADE.test(yer.name) || /(?<![\p{L}])(?:City|Agora|Pythion|Monuments?|Mount|Heritage|Dynasty|Capital)(?![\p{L}])/u.test(yer.name))) return null; // "Abdülkerim Efendi Fountain … bir çeşmedir" yazılmaz
  const ad = ADTEMIZ(l === "en" ? (e.labels?.en ?? yer.name) : (e.labels?.tr ?? yer.name)); if (!ad) return null;
  const merkez = yer.il && yer.ilce && norm(yer.il) === norm(yer.ilce);
  if (l === "tr") {
    const konum = merkez ? `${yer.il} il merkezinde` : yer.il && yer.ilce ? `${yer.il} ilinin ${yer.ilce} ilçesinde` : yer.il ? `${yer.il} ilinde` : yer.ilce ? `${yer.ilce} ilçesinde` : "";
    return konum ? `${ad}, ${konum} bulunan bir ${t}${tr_dir(t)}.` : `${ad} bir ${t}${tr_dir(t)}.`;
  }
  const konum = merkez ? ` in the city of ${yer.il}` : yer.il && yer.ilce ? ` in the ${yer.ilce} district of ${yer.il} Province` : yer.il ? ` in ${yer.il} Province` : yer.ilce ? ` in ${yer.ilce}` : "";
  return `${ad} is ${/^[aeiou]/i.test(t) ? "an" : "a"} ${t}${konum}.`;
}

// ---- Reis kuralları (kilitli): ülke adı her dilde "Türkiye" (private.turkiye_ad ile aynı); il/ilçe adları Türkçe yazımıyla ----
const katla = (s: string) => s.replace(/[İıŞşĞğÜüÖöÇçÂâÎîÛû]/g, (c) => "IiSsGgUuOoCcAaIiUu"["İıŞşĞğÜüÖöÇçÂâÎîÛû".indexOf(c)]);
const kac = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function adTablosu(ek: string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const a of [...ek, ...IL_TR, ...ILCE_TR]) { const k = katla(a); if (k !== a && !m.has(k)) m.set(k, a); }
  return m;
}
const TABLO = adTablosu([]);
const re = (m: Map<string, string>) => new RegExp(`(?<![\\p{L}\\p{N}])(${[...m.keys()].sort((a, b) => b.length - a.length).map(kac).join("|")})(?![\\p{L}\\p{N}])`, "gu");
const TABLO_RE = re(TABLO);
export function turkceAdlar(metin: string, ek: (string | null | undefined)[] = [], l: Lang = "tr"): string {
  if (!ESKI(l)) return turkceAdlarDil(metin, ek, l);
  let t = metin
    .replace(/\s*\(\s*(?:Turkey|Turkiye|Türkei|Turquía|Turquia|Turquie|Turchia|Turcja|Turkije)\s*\)/g, "")
    .replace(/(?<![\p{L}])(?:Turkey|Turkiye|Türkei|Turquía|Turquia|Turquie|Turchia|Turcja|Turkije)(?![\p{L}])/gu, "Türkiye");
  const ekler = ek.filter((x): x is string => !!x && katla(x) !== x && !TABLO.has(katla(x)));
  if (ekler.length) { const m = adTablosu(ekler); t = t.replace(re(m), (x) => m.get(x) ?? x); }
  return t.replace(TABLO_RE, (x) => TABLO.get(x) ?? x);
}

// Yeni diller (21.11.2026): ülke adı Latin "Türkiye" (private.turkiye_ad ile aynı politika: Türkei/Turquía/Турция/تركيا/トルコ yazılmaz);
// sıfat/dil adı (türkisch, турецкий, التركية, トルコ語/トルコ人) ülke adı değildir, değişmez.
// İl/ilçe: ekrandaki private.area_name ile aynı politika — yerel yazım farklıysa ilk geçişte "Yerel (Türkçe)" (Стамбул (İstanbul), Estambul (İstanbul),
// イスタンブール（İstanbul）); ASCII'ye katlanmış Latin biçim (Istanbul, Izmir) doğrudan Türkçe yazıma döner (en kuralı). Tablo: Wikidata etiketleri (CC0).
const ULKE_DIL: Partial<Record<Lang, [RegExp, string][]>> = {
  de: [[/\s*\(\s*Türkei\s*\)/g, ""], [/(?<![\p{L}])(?:Turkey|Turkiye|Türkei)(?![\p{L}])/gu, "Türkiye"]],
  es: [[/\s*\(\s*Turqu[íi]a\s*\)/g, ""], [/(?<![\p{L}])(?:Turkey|Turkiye|Turqu[íi]a)(?![\p{L}])/gu, "Türkiye"]],
  ru: [[/\s*\(\s*Турци(?:я|и)\s*\)/g, ""], [/(?<![\p{L}])Турецк(?:ая|ой|ую|ою) Республик(?:а|и|е|у|ой)(?![\p{L}])/gu, "Türkiye"],
    [/(?<![\p{L}])(?:Турци(?:я|и|ю|ей|ею)|Turkey)(?![\p{L}])/gu, "Türkiye"]],
  ar: [[/\s*\(\s*تركيا\s*\)/g, ""], [/(?<![\p{L}])بتركيا(?![\p{L}])/gu, "في Türkiye"], [/(?<![\p{L}])وتركيا(?![\p{L}])/gu, "و Türkiye"],
    [/(?<![\p{L}])لتركيا(?![\p{L}])/gu, "لـ Türkiye"], [/(?<![\p{L}])(?:جمهورية )?تركيا(?![\p{L}])/gu, "Türkiye"]],
  ja: [[/[（(]\s*トルコ\s*[）)]/g, ""], [/トルコ共和国/g, "Türkiye"], [/(?<!オスマン・?|オスマン=)トルコ(?![語人系風式族料文民軍帝])/g, "Türkiye"]],
};
// Riskli/hatalı Wikidata etiketleri tabloya girmez: ortak sözcük (ar "العزيز" Elazığ, ar "الفاتح" Fatih — "محمد الفاتح"), ja "アール" (Ağrı = アール・ヌーヴォー),
// yanlış öğe (ar "رأس العين" Ceylanpınar = Suriye'deki kasaba; ja "黄松" Sarıçam'ın sözcük çevirisi).
// ar sıfat/ortak sözcükle aynı il/ilçe adları: "عثمانية" (Osmanlı = Osmaniye), "عشاق" (âşıklar = Uşak), "كلس" (kireç = Kilis), "صور" (resimler/Sur = Savur).
const YEREL_RED = new Set(["ar:العزيز", "ar:الفاتح", "ja:アール", "ar:رأس العين", "ja:黄松", "ar:عثمانية", "ar:عشاق", "ar:كلس", "ar:صور"]);
const RU_EK = (ad: string) => { // ru çekimi: Стамбул/Стамбуле/Стамбула, Анкара/Анкары/Анкаре, Анталья/Антальи
  const k = kac(ad); if (/[ауеиоэюыё]$/i.test(ad) && !/[ая]$/.test(ad)) return k; // Эдирне, Болу: çekimsiz
  if (/а$/.test(ad)) return kac(ad.slice(0, -1)) + "(?:а|ы|и|е|у|ой|ою)";
  if (/я$/.test(ad)) return kac(ad.slice(0, -1)) + "(?:я|и|е|ю|ей|ею)";
  if (/[ьй]$/.test(ad)) return kac(ad.slice(0, -1)) + "(?:ь|й|я|е|ю|ем|ём|и|ей)";
  return k + "(?:а|у|е|ом|ы|и)?";
};
function yerelDesen(ad: string, l: Lang): string {
  if (l === "ru") return `(?<![\\p{L}\\p{N}])${RU_EK(ad)}(?![\\p{L}\\p{N}])`;
  if (l === "ar") return `(?<![\\p{L}\\p{N}])(?:[وبلفك])?${kac(ad)}(?![\\p{L}\\p{N}])`;
  if (l === "ja") return `(?<![\\p{Script=Katakana}ー・=])${kac(ad)}(?![\\p{Script=Katakana}ー・=])`;
  return `(?<![\\p{L}\\p{N}])${kac(ad)}(?![\\p{L}\\p{N}])`;
}
function turkceAdlarDil(metin: string, ek: (string | null | undefined)[], l: Lang): string {
  let t = metin; for (const [r, y] of ULKE_DIL[l] ?? []) t = t.replace(r, y);
  const [il, ilce] = ek; const ciftler: [string, string][] = []; // [yerel, Türkçe]
  for (const [tr, m] of Object.entries(YEREL_IL)) { const v = m[l]; if (v) ciftler.push([v, tr]); }
  const ic = il && ilce ? YEREL_ILCE[`${il}|${ilce}`]?.[l] : undefined; if (ic && ilce) ciftler.push([ic, ilce]);
  const gor = new Set<string>(); const ac = l === "ja" ? "（" : " (", kp = l === "ja" ? "）" : ")";
  for (const [v, tr] of ciftler.filter(([v, tr]) => !YEREL_RED.has(`${l}:${v}`) && katla(v) !== katla(tr)).sort((a, b) => b[0].length - a[0].length)) {
    if (gor.has(tr)) continue; const r = new RegExp(yerelDesen(v, l), "u"); const m = r.exec(t); if (!m) continue;
    // İç içe ad (Afyonkarahisar içinde Karahisar) ya da zaten "(İstanbul)" eklenmiş geçiş atlanır.
    const sonra = t.slice(m.index + m[0].length); if (new RegExp(`^\\s*[(（]${kac(tr)}[)）]`).test(sonra)) { gor.add(tr); continue; }
    t = t.slice(0, m.index + m[0].length) + ac + tr + kp + sonra; gor.add(tr);
  }
  const ekler = ek.filter((x): x is string => !!x && katla(x) !== x && !TABLO.has(katla(x)));
  if (ekler.length) { const m = adTablosu(ekler); t = t.replace(re(m), (x) => m.get(x) ?? x); }
  return t.replace(TABLO_RE, (x) => TABLO.get(x) ?? x);
}
// Hedef dilde başka dil sızıntısı denetimi (kuru çalıştırma özeti + testler): ru/ar/ja metninde özel ad biçiminde olmayan Latin sözcük dizisi;
// de/es metninde Wikidata kalıp cümlesine giren İngilizce ifade. Türkiye, eklenen "(İstanbul)" ve rakam/birim sızıntı sayılmaz.
// Hedef dilde olmaması gereken yazılar (her yeni dil): Yunan/Ermeni/Gürcü her zaman; Kiril/Arap/Çin-Japon yazısı kendi dili dışında.
const YABANCI_YAZI: Record<string, RegExp> = {
  de: /[\p{Script=Greek}\p{Script=Armenian}\p{Script=Georgian}\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hebrew}\p{Script=Syriac}]+/gu,
  ru: /[\p{Script=Greek}\p{Script=Armenian}\p{Script=Georgian}\p{Script=Arabic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hebrew}\p{Script=Syriac}]+/gu,
  ar: /[\p{Script=Greek}\p{Script=Armenian}\p{Script=Georgian}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hebrew}\p{Script=Syriac}]+/gu,
  ja: /[\p{Script=Greek}\p{Script=Armenian}\p{Script=Georgian}\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}]+/gu,
};
YABANCI_YAZI.es = YABANCI_YAZI.de;
// Temizlikten kaçan dil glosu kalıntısı (parantez dışında dil adı + başka dilde ad).
const GLOS_KALINTI: Partial<Record<Lang, RegExp>> = {
  de: /(?<![\p{L}])(?:alt|neu)?(?:türkisch|griechisch|lateinisch|armenisch|osmanisch|kurdisch|arabisch|persisch|georgisch|aramäisch)\s+\p{Lu}/giu,
  es: /(?<![\p{L}])(?:en|del)\s+(?:turco|griego|lat[ií]n|armenio|otomano|kurdo|ingl[eé]s)\s+[«"\p{Lu}]/giu,
  ru: /(?<![\p{L}])(?:тур|греч|лат|арм|осман|курд|англ)\.\s/gu,
  ar: /بال(?:تركية|يونانية|عثمانية|لاتينية|أرمنية|كردية|فارسية|إنجليزية|إنكليزية)/gu,
};
const ULKE_KALINTI: Partial<Record<Lang, RegExp>> = { de: /\p{L}*Türkei\p{L}*/gu, es: /\p{L}*Turqu[íi]a\p{L}*/gu, ru: /\p{L}*Турци\p{L}*/gu };
export function sizinti(metin: string, l: Lang): string[] {
  if (ESKI(l)) return [];
  const yazi = [...metin.matchAll(YABANCI_YAZI[l])].map((m) => m[0]); const glos = GLOS_KALINTI[l] ? [...metin.matchAll(GLOS_KALINTI[l]!)].map((m) => m[0].trim()) : [];
  // Ülke kuralı uygulanamayan bitişik/bozuk biçim (es kaynak "en labTurquía asiática") — cümle yazılmaz.
  const ulke = [...metin.matchAll(ULKE_KALINTI[l] ?? /$^/g)].map((m) => m[0]);
  return [...yazi, ...glos, ...ulke, ...sizintiLatin(metin, l)];
}
function sizintiLatin(metin: string, l: Lang): string[] {
  const t = metin.replace(/Türkiye/g, "").replace(/[(（][^()（）]*[)）]/g, (m) => (/^[(（]\p{Lu}[\p{L}' -]*[)）]$/u.test(m) ? "" : m));
  if (LATINSIZ(l)) return [...t.matchAll(/\p{Script=Latin}[\p{Script=Latin}'’.-]*(?:\s+\p{Script=Latin}[\p{Script=Latin}'’.-]*)*/gu)].map((m) => m[0].replace(/[.'’-]+$/, ""))
    .filter((w) => !/^(?:km²?|m²?|ha|CC|UNESCO|ICOMOS|[IVXLCM]+)$/.test(w) && !ozelAdBicimi(w));
  return [...t.matchAll(INGILIZCE_IFADE_G)].map((m) => m[0]);
}
const INGILIZCE_IFADE_G = /(?<![\p{L}])(?:of the|and the|is a|was a|located in|built in|which is)(?![\p{L}])/gu;

export const MAX_KAR = 800, MAX_CUMLE = 6; // Wikipedia bölümü <= 600 + Wikidata gerçekleri (ja: BUTCE.ja.max)
// Alan birimi metinde geçiyorsa "Alan: …" eklenmez. ja: sayıya bitişik yazıldığı için sol sınır aranmaz.
const ALAN_DIL: Partial<Record<Lang, RegExp>> = {
  de: /(?<![\p{L}\p{N}])(?:Hektar|ha|km²|km2|m²|Quadratkilometer\p{L}*|Quadratmeter\p{L}*|Morgen)(?![\p{L}\p{N}])/iu,
  es: /(?<![\p{L}\p{N}])(?:hect[aá]reas?|ha|km²|km2|m²|kil[oó]metros? cuadrados?|metros? cuadrados?)(?![\p{L}\p{N}])/iu,
  ru: /(?<![\p{L}\p{N}])(?:га|гектар\p{L}*|км²|км2|м²|кв\. ?км|кв\. ?м|km²|m²)(?![\p{L}\p{N}])/iu,
  ar: /(?<![\p{L}\p{N}])(?:هكتار\p{L}*|ها|كم²|كم2|م²|م2|ميل²|ميل2|كيلومتر مربع|كيلومترات مربعة|متر مربع|أمتار مربعة|ميل مربع|km²|m²)(?![\p{L}\p{N}])/iu,
  ja: /(?:ヘクタール|平方キロメートル|平方メートル|km²|km2|m²|㎢|㎡|ha)(?![\p{L}])/u,
};
function metindeVar(metin: string, p: string, l: Lang): boolean {
  if (l === "ja") { const n = normL(p, l); if (n.length < 2) return false; return /^\d/.test(n) ? new RegExp(`(?<![\\p{N}.,])${kac(n)}(?![\\p{N}])`, "u").test(metin) : metin.includes(n); }
  return false;
}
export function kur(l: Lang, yer: Yer, e: Wd, L: Etiketler, oz: Ozet | null): Sonuc | { yok: string } {
  const ad = (ESKI(l) ? [e.labels?.tr, e.labels?.en] : [e.labels?.tr, e.labels?.en, e.labels?.[l]]).filter(Boolean) as string[];
  let wiki: string[] = []; let red: string | null = null;
  if (oz) { red = ozetGecerli(oz, e, yer, ad)?.red ?? null; if (!red) { wiki = wikiCumleleri(oz); if (!wiki.length) red = "cumle-yok"; } }
  if (!ESKI(l) && wiki.length) { // son savunma: sızıntılı Wikipedia cümlesi atılır; ilk cümlede ise metin kurulmaz (ad/kimlik cümlesi olmadan kalan metin yazılmaz)
    const temiz = wiki.map((c) => !sizinti(turkceAdlar(c, [yer.il, yer.ilce], l), l).length);
    if (!temiz[0]) { wiki = []; red = "dil-sizintisi"; } else wiki = wiki.filter((_, i) => temiz.slice(0, i + 1).every(Boolean));
  }
  if (!ESKI(l) && !wiki.length) return { yok: (red ? red + "; " : oz ? "" : "madde-yok; ") + "yeni-dil-wikipedia-sart" }; // Wikidata-yalnız metin yeni dillerde kurulmaz
  const hepsi = gercekler(e, L).filter((g) => g.cumle[l]).sort((a, b) => ONCELIK.indexOf(a.key) - ONCELIK.indexOf(b.key));
  const metin = " " + normL(wiki.join(" "), l) + " ";
  // Özette zaten geçen bilgi tekrarlanmaz.
  // Wikipedia metni varken Wikidata yapım yılı eklenmez (metindeki tarihle çelişme riski: Teşvikiye Camii 1854 / 1794).
  const alanVar = (ESKI(l) ? /(?<![\p{L}\p{N}])(?:hektar\p{L}*|hectares?|ha|km²|km2|m²|dönüm\p{L}*|acres?|dekar\p{L}*)(?![\p{L}\p{N}])/iu : ALAN_DIL[l]!).test(ESKI(l) ? wiki.join(" ") : wiki.join(" ").replace(/ـ/g, "")); // ar: tatweel ("كـم2") birimi gizlemesin
  const yokla = (g: Gercek) => (ESKI(l) ? g.yoklama : [...g.yoklama, ...(g.yoklamaDil[l] ?? [])]);
  const yeni = hepsi.filter((g) => !(wiki.length && g.key === "yapim") && !(alanVar && g.key === "alan"))
    .filter((g) => !yokla(g).some((p) => p && (l === "ja" ? metindeVar(metin, p, l) : normL(p, l).length >= 2 && metin.includes(" " + normL(p, l) + " "))));
  const sec: string[] = []; const anahtar: string[] = [];
  let basi = wiki.slice();
  if (!wiki.length) {
    // Wikipedia yoksa Wikidata öğesinin bu yer olduğu ayrıca doğrulanır (yanlış qid eşleşmesi görünmez olsun).
    const k = wdKonum(e); if (k && yer.lat != null && yer.lon != null && km(k, [yer.lat, yer.lon]) > 30) return { yok: "wikidata-konum-uzak" };
    if (!adTasiyor(ad.join(" ; "), [yer.name]) && !adTasiyor(yer.name, ad)) return { yok: "wikidata-ad-uyusmuyor" };
    if (!yerMi(e)) return { yok: "yer-disi-p31" };
    if (yeni.length < 2) return { yok: (red ? red + "; " : "") + "wikidata-gercek<2" };
    const a = acilis(yer, e, L, l); if (!a) return { yok: "acilis-yok(tur-etiketi)" };
    basi = [a];
  }
  const A = ayrac(l), MAXK = BUTCE[l].max; let n = basi.join(A).length;
  for (const g of yeni) {
    const c = g.cumle[l]!; if (basi.length + sec.length >= MAX_CUMLE || sec.length >= 3 || n + c.length + A.length > MAXK) continue;
    sec.push(c); anahtar.push(g.key); n += c.length + A.length;
  }
  if (!wiki.length && sec.length < 2) return { yok: "wikidata-gercek<2(sigmadi)" };
  const text = turkceAdlar([...basi, ...sec].join(A), [yer.il, yer.ilce], l);
  return { text, wiki: wiki.length ? { lang: oz!.lang, title: oz!.title, url: oz!.url ?? "", rev: oz!.rev ?? null } : undefined, nWiki: wiki.length, nFact: sec.length, facts: anahtar, wikiRed: red ?? undefined };
}
