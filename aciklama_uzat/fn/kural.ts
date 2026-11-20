// aciklama: yer açıklaması = Wikipedia özeti (CC BY-SA 4.0) + Wikidata gerçekleri (CC0). Saf kural modülü (ağ/DB yok; test edilebilir).
// Veri kuralı: yapay zekâ ile metin uydurma YOK, makine çevirisi YOK; her dil kendi kaynağından. Uygulama dili yalnız tr/en (kYuExtraLocalesEnabled=false).
export type Lang = "tr" | "en";
export const DILLER: Lang[] = ["tr", "en"];
export const WIKI_SITE: Record<Lang, string> = { tr: "trwiki", en: "enwiki" };
// Diğer dillerin sitelink anahtarları (kalıplar hazır olunca açılır; bkz. KALIP): şimdilik yazılmaz.
export const DIGER_SITELINK = ["dewiki", "ruwiki", "arwiki", "jawiki", "eswiki"];
export const LISANS = { wikipedia: "CC BY-SA 4.0", wikipediaUrl: "https://creativecommons.org/licenses/by-sa/4.0/", wikidata: "CC0" };

export type Etiket = { tr?: string; en?: string; dogum?: number; olum?: number };
export type Wd = { id: string; labels?: Etiket; sitelinks?: Record<string, { title: string }>; claims?: Record<string, any[]> };
export type Ozet = { lang: Lang; title: string; type: string; extract: string; rev?: string; url?: string; lat?: number; lon?: number };
export type Yer = { name: string; lat?: number | null; lon?: number | null; il?: string | null; ilce?: string | null };
export type Sonuc = {
  text: string; wiki?: { lang: Lang; title: string; url: string; rev: string | null };
  nWiki: number; nFact: number; facts: string[]; wikiRed?: string;
};

const norm = (s: string) => s.replace(/İ/g, "i").replace(/I/g, "i").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
  .replace(/ı/g, "i").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, " ").trim();
const lowerTr = (s: string) => s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();

// ---- Cümle bölme ----
const KISALTMA = new Set(["örn", "yy", "vb", "vs", "bkz", "dr", "prof", "doç", "yrd", "st", "no", "sy", "cad", "sok", "mah", "mt", "mr", "mrs", "ca", "approx", "fig", "ör", "yak", "bk", "krş", "age", "ave", "blv", "bul", "c", "e.g", "i.e"]);
export function cumleler(metin: string): string[] {
  const t = metin.replace(/\s+/g, " ").trim(); const out: string[] = []; let bas = 0;
  const re = /[.!?]+["'”’)\]»]*\s+(?=["'“‘(«]?[A-ZÇĞİÖŞÜÂÎÛ0-9])/g; let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const onceki = t.slice(bas, m.index + 1); const w = /([\p{L}.]+)\.$/u.exec(onceki.replace(/["'”’)\]»]+$/, ""))?.[1] ?? "";
    const w0 = w.replace(/\./g, "");
    if (/^\p{Lu}$/u.test(w0) || /^[IVXL]{1,4}$/.test(w0) && !/\./.test(w) || /\./.test(w) && w0.length <= 3 || KISALTMA.has(w.toLowerCase())) continue; // M.Ö., A.D., St., Dr.
    if (/\d$/.test(onceki.replace(/["'”’)\]»]+$/, "").slice(0, -1)) && /^\.\s/.test(m[0]) && /^\p{Ll}/u.test(t.slice(m.index + m[0].length))) continue;
    out.push(t.slice(bas, m.index + m[0].trimEnd().length).trim()); bas = m.index + m[0].length;
  }
  const son = t.slice(bas).trim(); if (son) out.push(son);
  return out;
}

// Telaffuz / alfabe ayrıntısı veren parantezleri at; öteki parantezler kalır.
const GURULTU = /[;ˈˌ]|\b(lit\.|pronounced|IPA|Turkish:|Greek:|Latin:|Arabic:|Armenian:|Kurdish:|Osmanlıca|Yunanca|Latince|Arapça|Ermenice|Kürtçe|Farsça|telaffuz|okunuşu)\b|[\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Greek}\p{Script=Armenian}\p{Script=Georgian}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
export function temizle(ham: string): string {
  let s = ham.replace(/\[\d+\]|\[[a-z]\]/g, "").replace(/\s+/g, " ");
  for (let i = 0; i < 3; i++) s = s.replace(/\s*\(([^()]*)\)/g, (m, ic) => GURULTU.test(ic) || ic.trim() === "" ? "" : m);
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
function adTokenleri(adlar: string[]): { tam: string[]; tok: string[][] } {
  const tam = [...new Set(adlar.map((a) => norm(a.replace(/\s*\([^)]*\)/g, "").replace(/,.*$/, ""))).filter((a) => a.length >= 3))];
  return { tam, tok: tam.map((a) => a.split(" ").filter((x) => x.length >= 3)) };
}
export function adTasiyor(metin: string, adlar: string[]): boolean {
  const n = " " + norm(metin) + " "; const { tam, tok } = adTokenleri(adlar);
  if (tam.some((a) => n.includes(" " + a))) return true; // sonek (Pergamon'un) için sağ sınır aranmaz
  // Gövde eşleşmesi (Höyüğü~Höyük, Çeşmesi~Çeşme): her ad belirteci uzunluğunun >= %60'ı kadar önekle aranır; belirteçlerin >= %60'ı bulunmalı.
  return tok.some((ts) => ts.length > 1 && ts.filter((x) => n.includes(" " + x.slice(0, Math.max(4, Math.ceil(x.length * 0.6))))).length / ts.length >= 0.6);
}

export type Red = { red: string };
export function ozetGecerli(oz: Ozet, e: Wd, yer: Yer, ad: string[]): Red | null {
  if (oz.type !== "standard") return { red: "anlam-ayrimi/standart-degil" };
  if (!yerMi(e)) return { red: "yer-disi-p31" };
  if (!oz.extract || oz.extract.length < 40) return { red: "ozet-kisa" };
  const cum = cumleler(temizle(oz.extract)); const ilk = cum.slice(0, 2).join(" ");
  if (KISI_EVENT.test(cum[0] ?? "")) return { red: "kisi-olay-kalibi" }; // yalnız ilk cümle: "(1842–1847)" gibi yapı yılları ikinci cümlede kişi sayılmaz
  if (!adTasiyor(ilk + " " + oz.title, [yer.name, ...ad])) return { red: "ad-yok" };
  if (!adTasiyor(ilk, [yer.name, oz.title, ...ad])) return { red: "ilk-cumlede-ad-yok" };
  const k: [number, number] | null = oz.lat != null && oz.lon != null ? [oz.lat, oz.lon] : wdKonum(e);
  if (k && yer.lat != null && yer.lon != null && km(k, [yer.lat, yer.lon]) > 30) return { red: "uzak-konum" };
  return null;
}

// ---- Wikipedia bölümü: ilk cümleler, en çok `butce` karakter ----
// Giriş bölümü birden çok paragraf olabilir: liste girişi (":" ile biten) ya da noktalamasız satır (liste öğesi/başlık) görülünce orada kesilir,
// böylece "şunlardır: A B C" gibi listeler cümleye karışmaz.
export function girisParagraflari(ham: string): string {
  const out: string[] = [];
  for (const p of ham.split(/\n+/).map((x) => x.trim()).filter(Boolean)) {
    if (/:\s*$/.test(p) || !/[.!?]["'”’)»]?$/.test(p)) { if (out.length) break; else continue; }
    out.push(p);
  }
  return out.join(" ");
}
const dengeli = (c: string) => (c.match(/\(/g)?.length ?? 0) === (c.match(/\)/g)?.length ?? 0) && !/[\[\]]/.test(c);
// Uzatma (Reis onayı 20.11.2026 23:02): giriş bölümünden 2–4 cümle, en çok WIKI_BUTCE harf; cümle ortasında kesme yok.
export const WIKI_BUTCE = 600, WIKI_CUMLE = 4;
export function wikiCumleleri(oz: Ozet, butce = WIKI_BUTCE, enCok = WIKI_CUMLE): string[] {
  const hepsi = cumleler(temizle(girisParagraflari(oz.extract))); if (hepsi.length && !dengeli(hepsi[0])) return []; // bozuk ilk cümle: Wikipedia kullanılmaz
  const all = hepsi.filter(dengeli).filter((c) => /[.!?]["'”’)»]?$/.test(c) && c.length >= 15 && !/^\p{Ll}/u.test(c));
  const out: string[] = []; let n = 0;
  for (const c of all) {
    if (out.length >= enCok) break;
    if (n + c.length + (out.length ? 1 : 0) > butce && out.length) break;
    if (!out.length && c.length > 560) return []; // tek cümle bile sığmıyor: kesilmez, Wikipedia kullanılmaz
    if (out.some((x) => norm(x) === norm(c))) continue;
    out.push(c); n += c.length + 1;
  }
  return out;
}

// ---- Wikidata gerçekleri ----
export type Etiketler = Record<string, Etiket>;
const lab = (L: Etiketler, id: string, l: Lang, ortak = false) => L[id]?.[l] ?? (ortak ? L[id]?.[l === "tr" ? "en" : "tr"] : undefined);
const ids = (e: Wd, p: string) => (e.claims?.[p] ?? []).map((c) => c?.mainsnak?.datavalue?.value?.id).filter(Boolean) as string[];
const sayi = (n: number, l: Lang) => (Number.isInteger(n) ? String(n) : n.toFixed(1)).replace(".", l === "tr" ? "," : ".");
const BIRIM: Record<string, Record<Lang, string>> = {
  Q11573: { tr: "m", en: "m" }, Q828224: { tr: "km", en: "km" }, Q712226: { tr: "km²", en: "km²" }, Q25343: { tr: "m²", en: "m²" }, Q35852: { tr: "hektar", en: "hectares" },
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
  if (!b || !(a > 0)) return null; return `${sayi(Math.round(a * 10) / 10, l)} ${b[l]}`;
};
export type Gercek = { key: string; cumle: Record<Lang, string | null>; yoklama: string[] };
// Her dil için kalıp tablosu. Diğer diller (de, es, ru, ar, ja) için kalıplar buraya aynı anahtarlarla eklenir; uygulama dili açılana dek kullanılmaz.
export const KALIP: Record<Lang, Record<string, (v: string) => string>> = {
  tr: { miras: (v) => `Miras statüsü: ${v}.`, koruma: (v) => `Korunma durumu: ${v}.`, yapim: (v) => `${v} yılına tarihlenir.`, yapimMO: (v) => `MÖ ${v} yılına tarihlenir.`,
    mimar: (v) => `Mimar: ${v}.`, tarz: (v) => `Mimari tarz: ${v}.`, parca: (v) => `Bağlı olduğu bütün: ${v}.`, icerir: (v) => `İçerdiği yapılar: ${v}.`, ad: (v) => `Adını aldığı: ${v}.`,
    alan: (v) => `Alan: ${v}.`, yukseklik: (v) => `Yükseklik: ${v}.` },
  en: { miras: (v) => `Heritage status: ${v}.`, koruma: (v) => `Preservation status: ${v}.`, yapim: (v) => `Dates to ${v}.`, yapimMO: (v) => `Dates to ${v} BCE.`,
    mimar: (v) => `Architect: ${v}.`, tarz: (v) => `Architectural style: ${v}.`, parca: (v) => `Part of: ${v}.`, icerir: (v) => `Includes: ${v}.`, ad: (v) => `Named after: ${v}.`,
    alan: (v) => `Area: ${v}.`, yukseklik: (v) => `Height: ${v}.` },
};
const buyuk = (s: string, l: Lang) => (l === "tr" ? s.replace(/^i/, "İ").replace(/^ı/, "I") : s).replace(/^\p{Ll}/u, (c) => c.toLocaleUpperCase(l === "tr" ? "tr" : "en"));
export function gercekler(e: Wd, L: Etiketler): Gercek[] {
  const out: Gercek[] = []; const liste = (qs: string[], l: Lang, ortak: boolean, en = 3) => {
    const x = [...new Set(qs.map((q) => lab(L, q, l, ortak)).filter(Boolean) as string[])].slice(0, en); return x.length ? x : null;
  };
  const ek = (key: string, f: (l: Lang) => string | null, yoklama: (l: Lang) => string[]) => {
    const c = { tr: f("tr"), en: f("en") }; if (c.tr || c.en) out.push({ key, cumle: c, yoklama: [...yoklama("tr"), ...yoklama("en")] });
  };
  const lbls = (qs: string[], l: Lang, ortak: boolean) => liste(qs, l, ortak) ?? [];
  ek("miras", (l) => { const x = liste(ids(e, "P1435"), l, false, 2); return x ? KALIP[l].miras(x.map((s) => buyuk(s, l)).join("; ")) : null; }, (l) => lbls(ids(e, "P1435"), l, false));
  ek("koruma", (l) => { const x = liste(ids(e, "P5816"), l, false, 1); return x ? KALIP[l].koruma(buyuk(x[0], l)) : null; }, (l) => lbls(ids(e, "P5816"), l, false));
  const y = yil(e, "P571");
  if (y != null && y !== 0) ek("yapim", (l) => (y < 0 ? KALIP[l].yapimMO(String(-y)) : KALIP[l].yapim(String(y))), () => [String(Math.abs(y))]);
  const mimarlar = (l: Lang) => { // yapım yılıyla çelişen ömür (Wikidata hatası) görünürde olmaz
    const ok = ids(e, "P84").filter((q) => { const k = L[q]; return !(y != null && k && ((k.dogum != null && y < k.dogum + 15) || (k.olum != null && y > k.olum + 15))); });
    return liste(ok, l, true, 2);
  };
  ek("mimar", (l) => { const x = mimarlar(l); return x ? KALIP[l].mimar(x.join(", ")) : null; }, (l) => mimarlar(l) ?? []);
  ek("tarz", (l) => { const x = liste(ids(e, "P149"), l, false, 2); return x ? KALIP[l].tarz(x.map((s) => buyuk(s, l)).join(", ")) : null; }, (l) => lbls(ids(e, "P149"), l, false));
  ek("parca", (l) => { const x = liste(ids(e, "P361"), l, true, 1); return x ? KALIP[l].parca(x[0]) : null; }, (l) => lbls(ids(e, "P361"), l, true));
  const ozel = (x: string[] | null) => (x ? x.filter((v) => /^\p{Lu}/u.test(v)) : []); // "şehir" gibi cins adı Wikidata verisinden "adını aldığı" olmaz
  ek("ad", (l) => { const x = ozel(liste(ids(e, "P138"), l, true, 2)); return x.length ? KALIP[l].ad(x[0]) : null; }, (l) => ozel(lbls(ids(e, "P138"), l, true)));
  ek("icerir", (l) => { const x = liste(ids(e, "P527"), l, true, 3); return x && x.length >= 1 ? KALIP[l].icerir(x.join(", ")) : null; }, (l) => lbls(ids(e, "P527"), l, true));
  ek("alan", (l) => { const a = miktar(e, "P2046", l); return a ? KALIP[l].alan(a) : null; }, () => []);
  ek("yukseklik", (l) => { const a = miktar(e, "P2048", l); return a ? KALIP[l].yukseklik(a) : null; }, () => []);
  return out;
}
const ONCELIK = ["miras", "koruma", "yapim", "mimar", "tarz", "parca", "ad", "icerir", "yukseklik", "alan"];

// ---- Wikidata-only açılış cümlesi (yalnız >= 2 somut gerçek varken kullanılır) ----
function tur(e: Wd, L: Etiketler, l: Lang): string | null {
  for (const q of p31(e)) { const s = L[q]?.[l]; if (s && s.length <= 40) return l === "tr" ? lowerTr(s) : s.toLowerCase(); }
  return null;
}
const ADTEMIZ = (a: string) => a.replace(/\s*\([^)]*\)/g, "").replace(/,\s*[\p{L}]+$/u, "").trim();
// Türkçe -DIR eki: son ünlüye göre ı/i/u/ü, sert ünsüzden sonra t.
export function tr_dir(kelime: string): string {
  const k = lowerTr(kelime.trim().split(/\s+/).pop() ?? ""); const unluler = "aıoueiöü"; let son = "";
  for (const c of k) if (unluler.includes(c)) son = c;
  const harf = son === "a" || son === "ı" ? "ı" : son === "e" || son === "i" ? "i" : son === "o" || son === "u" ? "u" : "ü";
  const sert = "çfhkpsşt".includes(k.slice(-1)); return (sert ? "t" : "d") + harf + "r";
}
export function acilis(yer: Yer, e: Wd, L: Etiketler, l: Lang): string | null {
  const t = tur(e, L, l); if (!t) return null;
  const ad = ADTEMIZ(l === "en" ? (e.labels?.en ?? yer.name) : yer.name); if (!ad) return null;
  const merkez = yer.il && yer.ilce && norm(yer.il) === norm(yer.ilce);
  if (l === "tr") {
    const konum = merkez ? `${yer.il} il merkezinde` : yer.il && yer.ilce ? `${yer.il} ilinin ${yer.ilce} ilçesinde` : yer.il ? `${yer.il} ilinde` : yer.ilce ? `${yer.ilce} ilçesinde` : "";
    return konum ? `${ad}, ${konum} bulunan bir ${t}${tr_dir(t)}.` : `${ad} bir ${t}${tr_dir(t)}.`;
  }
  const konum = merkez ? ` in the city of ${yer.il}` : yer.il && yer.ilce ? ` in the ${yer.ilce} district of ${yer.il} Province` : yer.il ? ` in ${yer.il} Province` : yer.ilce ? ` in ${yer.ilce}` : "";
  return `${ad} is ${/^[aeiou]/i.test(t) ? "an" : "a"} ${t}${konum}.`;
}

export const MAX_KAR = 800, MAX_CUMLE = 6; // Wikipedia bölümü <= 600 + Wikidata gerçekleri
export function kur(l: Lang, yer: Yer, e: Wd, L: Etiketler, oz: Ozet | null): Sonuc | { yok: string } {
  const ad = [e.labels?.tr, e.labels?.en].filter(Boolean) as string[];
  let wiki: string[] = []; let red: string | null = null;
  if (oz) { red = ozetGecerli(oz, e, yer, ad)?.red ?? null; if (!red) { wiki = wikiCumleleri(oz); if (!wiki.length) red = "cumle-yok"; } }
  const hepsi = gercekler(e, L).filter((g) => g.cumle[l]).sort((a, b) => ONCELIK.indexOf(a.key) - ONCELIK.indexOf(b.key));
  const metin = " " + norm(wiki.join(" ")) + " ";
  // Özette zaten geçen bilgi tekrarlanmaz.
  // Wikipedia metni varken Wikidata yapım yılı eklenmez (metindeki tarihle çelişme riski: Teşvikiye Camii 1854 / 1794).
  const yeni = hepsi.filter((g) => !(wiki.length && g.key === "yapim")).filter((g) => !g.yoklama.some((p) => p && norm(p).length >= 2 && metin.includes(" " + norm(p) + " ")));
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
  let n = basi.join(" ").length;
  for (const g of yeni) {
    const c = g.cumle[l]!; if (basi.length + sec.length >= MAX_CUMLE || sec.length >= 3 || n + c.length + 1 > MAX_KAR) continue;
    sec.push(c); anahtar.push(g.key); n += c.length + 1;
  }
  if (!wiki.length && sec.length < 2) return { yok: "wikidata-gercek<2(sigmadi)" };
  const text = [...basi, ...sec].join(" ");
  return { text, wiki: wiki.length ? { lang: oz!.lang, title: oz!.title, url: oz!.url ?? "", rev: oz!.rev ?? null } : undefined, nWiki: wiki.length, nFact: sec.length, facts: anahtar, wikiRed: red ?? undefined };
}
