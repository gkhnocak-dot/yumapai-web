// Açıklama uzatma KURU ÇALIŞTIRMA (veritabanına yazmaz). Reis onayı 20.11.2026 23:02.
// Kaynak/kural kodu YuMapAI deposundaki supabase/functions/aciklama/{kural,kaynak}.ts'nin birebir kopyasıdır (fn/MD5 ile denetlenir),
// böylece canlı edge function aynı metni üretir. Yalnız resmi API: Wikipedia Action API (CC BY-SA 4.0), Wikidata wbgetentities (CC0).
// Kullanım: deno run -A kuru.ts orneklem500.tsv <cikti_dizini> [--tum ../wikidata_*.csv]
import { DILLER, kur, type Lang, WIKI_SITE, type Wd, type Yer } from "./fn/kural.ts";
import { Durdur, ozetler, wikidata } from "./fn/kaynak.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function dene<T>(f: () => Promise<T>, ad: string): Promise<T> {
  for (let i = 0; ; i++) {
    try { return await f(); } catch (e) {
      if (i >= 8) throw e; const w = e instanceof Durdur ? e.wait : 20;
      console.error(`${ad}: ${e instanceof Durdur ? e.code : String(e).slice(0, 80)} -> ${w} sn bekle`); await sleep(w * 1000);
    }
  }
}
const temizIlce = (s: unknown) => (s ? String(s).replace(/\s*\((ilçe|İlçesi)\)|\s+İlçesi$/i, "").trim() : null); // index.ts ile aynı

type Girdi = Yer & { qid: string; onceTr: number | null; onceEn: number | null };
async function isle(g: Girdi[], tamMetin: boolean, ham: boolean, yaz: (s: string) => void) {
  for (let i = 0; i < g.length; i += 50) {
    const parca = g.slice(i, i + 50);
    const { ents, L } = await dene(() => wikidata(parca.map((y) => y.qid)), "wikidata");
    const O = {} as Record<Lang, Map<string, any>>;
    for (const l of DILLER) O[l] = await dene(() => ozetler(l, Object.values(ents).map((e: Wd) => e.sitelinks?.[WIKI_SITE[l]]?.title).filter(Boolean) as string[]), "wikipedia-" + l);
    for (const y of parca) {
      const e = ents[y.qid]; const satir: any = { qid: y.qid, ad: y.name, il: y.il, ilce: y.ilce, onceTr: y.onceTr, onceEn: y.onceEn };
      for (const l of DILLER) {
        if (!e) { satir[l] = { yok: "wikidata-varlik-yok" }; continue; }
        const t = e.sitelinks?.[WIKI_SITE[l]]?.title; const oz = t ? O[l].get(t) ?? null : null;
        const r: any = kur(l, { ...y, ilce: temizIlce(y.ilce) }, e, L, oz);
        satir[l] = "text" in r
          ? { n: r.text.length, nWiki: r.nWiki, facts: r.facts, wikiRed: r.wikiRed ?? null, ...(tamMetin ? { text: r.text, wiki: r.wiki ?? null } : {}) }
          : { yok: r.yok };
        if (ham && oz) satir[l].ham = oz.extract.slice(0, 2500);
      }
      yaz(JSON.stringify(satir));
    }
    console.error(`${Math.min(i + 50, g.length)}/${g.length}`);
  }
}

const [orn, out, ...rest] = Deno.args; await Deno.mkdir(out, { recursive: true });
const sayi = (s: string) => (s === "-" || s === "" ? null : Number(s));
const g1: Girdi[] = (await Deno.readTextFile(orn)).trim().split("\n").map((l) => l.split("\t")).map((c) => ({
  qid: c[0], name: c[1], lat: Number(c[2]), lon: Number(c[3]), il: c[4] || null, ilce: c[5] || null, onceTr: sayi(c[6]), onceEn: sayi(c[7]) }));
const f1 = await Deno.open(`${out}/orneklem500.jsonl`, { write: true, create: true, truncate: true }); const enc = new TextEncoder();
await isle(g1, true, true, (s) => f1.writeSync(enc.encode(s + "\n"))); f1.close();

const ti = rest.indexOf("--tum");
if (ti >= 0) { // Tüm Wikidata yüklemesi (CSV: sourceRecordId,name,category,lat,lon,...). il/ilçe yok: yalnız sayım ve uzunluk içindir.
  const gor = new Set<string>(); const g2: Girdi[] = [];
  for (const f of rest.slice(ti + 1)) {
    const [bas, ...satirlar] = (await Deno.readTextFile(f)).trim().split("\n"); const k = bas.split(",");
    const iq = k.indexOf("sourceRecordId"), ia = k.indexOf("name"), ila = k.indexOf("lat"), ilo = k.indexOf("lon");
    for (const s of satirlar) { // basit CSV (tırnaklı alanlar için)
      const c = [...s.matchAll(/("([^"]|"")*"|[^,]*)(,|$)/g)].map((m) => m[1].replace(/^"|"$/g, "").replace(/""/g, '"'));
      const qid = c[iq]; if (!/^Q\d+$/.test(qid) || gor.has(qid)) continue; gor.add(qid);
      g2.push({ qid, name: c[ia], lat: Number(c[ila]), lon: Number(c[ilo]), il: null, ilce: null, onceTr: null, onceEn: null });
    }
  }
  const f2 = await Deno.open(`${out}/tum.jsonl`, { write: true, create: true, truncate: true });
  await isle(g2, true, false, (s) => f2.writeSync(enc.encode(s + "\n"))); f2.close();
}
