// Açıklama uzatma KURU ÇALIŞTIRMA (veritabanına yazmaz). Reis onayı 20.11.2026 23:02.
// Kaynak/kural kodu YuMapAI deposundaki supabase/functions/aciklama/{kural,kaynak}.ts'nin birebir kopyasıdır (fn/MD5 ile denetlenir),
// böylece canlı edge function aynı metni üretir. Yalnız resmi API: Wikipedia Action API (CC BY-SA 4.0), Wikidata wbgetentities (CC0).
// Kullanım: deno run -A kuru.ts orneklem500.tsv <cikti_dizini> [--tum ../wikidata_*.csv]
// Çok dilli (21.11.2026): DILLER kural.ts'ten gelir (tr, en, de, ru, ar, ja, es); her dil kendi Wikipedia'sından okunur, ham önbellek tüm dilleri taşır.
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
// Ham önbellek: kural değişince ağ olmadan yerelde yeniden hesap (yeniden.ts). Wikipedia metni CC BY-SA 4.0 (başlık+URL+revizyon içinde), Wikidata CC0.
const P = ["P31", "P1435", "P5816", "P571", "P84", "P149", "P361", "P527", "P138", "P2046", "P2048", "P625"];
let hamYaz: ((s: string) => void) | null = null; let kume = "o"; // o = örneklem, t = tüm küme
async function isle(g: Girdi[], tamMetin: boolean, ham: boolean, yaz: (s: string) => void) {
  for (let i = 0; i < g.length; i += 50) {
    const parca = g.slice(i, i + 50);
    const { ents, L } = await dene(() => wikidata(parca.map((y) => y.qid)), "wikidata");
    const O = {} as Record<Lang, Map<string, any>>;
    for (const l of DILLER) O[l] = await dene(() => ozetler(l, Object.values(ents).map((e: Wd) => e.sitelinks?.[WIKI_SITE[l]]?.title).filter(Boolean) as string[]), "wikipedia-" + l);
    for (const y of parca) {
      const e = ents[y.qid];
      if (hamYaz) {
        const ek = e ? { id: e.id, labels: e.labels, sitelinks: e.sitelinks, claims: Object.fromEntries(P.filter((p) => e.claims?.[p]).map((p) => [p, e.claims![p]])) } : null;
        const refs = new Set<string>(); for (const p of P) for (const c of e?.claims?.[p] ?? []) { const id = c?.mainsnak?.datavalue?.value?.id; if (id) refs.add(id); }
        const oz = Object.fromEntries(DILLER.map((l) => { const t = e?.sitelinks?.[WIKI_SITE[l]]?.title; return [l, t ? O[l].get(t) ?? null : null]; }));
        hamYaz(JSON.stringify({ k: kume, y, e: ek, L: Object.fromEntries([...refs].filter((q) => L[q]).map((q) => [q, L[q]])), oz }));
      } const satir: any = { qid: y.qid, ad: y.name, il: y.il, ilce: y.ilce, onceTr: y.onceTr, onceEn: y.onceEn };
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
const fh = await Deno.open(`${out}/ham.jsonl`, { write: true, create: true, truncate: true });
hamYaz = (s) => fh.writeSync(new TextEncoder().encode(s + "\n"));
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
  kume = "t";
  const f2 = await Deno.open(`${out}/tum.jsonl`, { write: true, create: true, truncate: true });
  await isle(g2, true, false, (s) => f2.writeSync(enc.encode(s + "\n"))); f2.close();
}
fh.close();
