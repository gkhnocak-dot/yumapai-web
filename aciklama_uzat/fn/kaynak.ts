// aciklama/kaynak.ts: Wikipedia + Wikidata okuma (yalnız resmi API; kazıma yok). Ağ dışında bağımlılık yok: edge function ve
// GitHub Actions kuru çalıştırması (yumapai-web veri-aciklama) aynı dosyayı kullanır, böylece önizleme ile canlı yazım aynı metni üretir.
//   Wikipedia: Action API (prop=extracts&exintro&explaintext): giriş bölümünün tamamı, 20 başlık/istek. Lisans CC BY-SA 4.0; atıf = başlık + URL + revizyon.
//   Wikidata: wbgetentities (CC0).
import { DILLER, type Etiketler, type Lang, type Ozet, type Wd, WIKI_SITE } from "./kural.ts";

export const UA = "YuMapAI-aciklama/1.1 (https://yumapai.com; open-reference descriptions)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export class Durdur extends Error { constructor(public code: string, public wait: number) { super(code); } }

let son = 0;
export async function get(url: string, aralik: number): Promise<any | null> {
  const w = son + aralik - Date.now(); if (w > 0) await sleep(w); son = Date.now();
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json", "Api-User-Agent": UA } });
  if (r.status === 404) { await r.body?.cancel(); return null; }
  if (r.status === 429 || r.status === 503) { const ra = Number(r.headers.get("retry-after") ?? "30"); await r.body?.cancel(); throw new Durdur("HTTP_" + r.status, Math.min(120, ra > 0 ? ra : 30)); }
  if (!r.ok) { await r.body?.cancel(); throw new Durdur("HTTP_" + r.status, 30); }
  const t = await r.text(); try { return JSON.parse(t); } catch { throw new Durdur("JSON", 30); }
}

const WD = "https://www.wikidata.org/w/api.php?format=json&action=wbgetentities&";
const yilOf = (cl: any[] | undefined) => {
  const v = cl?.[0]?.mainsnak?.datavalue?.value; if (!v?.time || (v.precision ?? 0) < 9) return undefined;
  const m = /^([+-])0*(\d+)-/.exec(v.time); return m ? (m[1] === "-" ? -1 : 1) * Number(m[2]) : undefined;
};
// Wikidata etiketleri: yalnız istenen dildeki etiket (Wikidata'nın "mul"/dil geri düşmesi kullanılmaz; languagefallback istenmez).
const etiket = (e: any) => Object.fromEntries(DILLER.map((l) => [l, e.labels?.[l]?.language === l || e.labels?.[l]?.language == null ? e.labels?.[l]?.value : undefined]).filter(([, v]) => v)) as Record<Lang, string>;
export async function wikidata(qids: string[], aralik = 1200): Promise<{ ents: Record<string, Wd>; L: Etiketler }> {
  const ents: Record<string, Wd> = {};
  for (let i = 0; i < qids.length; i += 25) {
    const d = await get(WD + new URLSearchParams({ ids: qids.slice(i, i + 25).join("|"), props: "sitelinks|claims|labels", languages: DILLER.join("|"), sitefilter: DILLER.map((l) => WIKI_SITE[l]).join("|") }), aralik);
    for (const [k, e] of Object.entries<any>(d?.entities ?? {})) if (!("missing" in e)) ents[k] = { id: k, labels: etiket(e), sitelinks: e.sitelinks, claims: e.claims };
  }
  const refs = new Set<string>();
  for (const e of Object.values(ents)) for (const p of ["P31", "P1435", "P5816", "P84", "P149", "P361", "P527", "P138"])
    for (const c of e.claims?.[p] ?? []) { const id = c?.mainsnak?.datavalue?.value?.id; if (id) refs.add(id); }
  const L: Etiketler = {}; const rl = [...refs];
  for (let i = 0; i < rl.length; i += 50) {
    const d = await get(WD + new URLSearchParams({ ids: rl.slice(i, i + 50).join("|"), props: "labels", languages: DILLER.join("|") }), aralik);
    for (const [k, v] of Object.entries<any>(d?.entities ?? {})) L[k] = etiket(v);
  }
  // Mimar ömrü (yapım yılıyla çelişen mimar gösterilmez).
  const arch = new Set<string>();
  for (const e of Object.values(ents)) for (const c of e.claims?.P84 ?? []) { const id = c?.mainsnak?.datavalue?.value?.id; if (id) arch.add(id); }
  const al = [...arch];
  for (let i = 0; i < al.length; i += 25) {
    const d = await get(WD + new URLSearchParams({ ids: al.slice(i, i + 25).join("|"), props: "claims" }), aralik);
    for (const [k, v] of Object.entries<any>(d?.entities ?? {})) L[k] = { ...(L[k] ?? {}), dogum: yilOf(v.claims?.P569), olum: yilOf(v.claims?.P570) };
  }
  return { ents, L };
}

// Action API yanıtını (formatversion=2) istenen başlık -> Ozet eşlemine çevirir (saf; test edilir).
export function ozetCoz(lang: Lang, istenen: string[], q: any): Map<string, Ozet | null> {
  const ad = new Map<string, string>(); for (const t of istenen) ad.set(t, t);
  const zincir = (arr: any[] | undefined) => { for (const x of arr ?? []) for (const [k, v] of ad) if (v === x.from) ad.set(k, x.to); };
  zincir(q?.normalized); zincir(q?.redirects);
  const sayfa = new Map<string, any>(); for (const p of q?.pages ?? []) sayfa.set(p.title, p);
  const out = new Map<string, Ozet | null>();
  for (const t of istenen) {
    const p = sayfa.get(ad.get(t)!);
    if (!p || p.missing || p.invalid || typeof p.extract !== "string") { out.set(t, null); continue; }
    const k = p.coordinates?.[0];
    out.set(t, { lang, title: String(p.title), type: p.pageprops && "disambiguation" in p.pageprops ? "disambiguation" : "standard",
      extract: p.extract, rev: p.revisions?.[0]?.revid != null ? String(p.revisions[0].revid) : undefined, url: p.fullurl,
      lat: typeof k?.lat === "number" ? k.lat : undefined, lon: typeof k?.lon === "number" ? k.lon : undefined });
  }
  return out;
}
// Giriş bölümünün tamamı (REST /page/summary yalnız ilk paragrafı verir; açıklama 300–600 harfe bu yüzden uzar).
export async function ozetler(lang: Lang, basliklar: string[], aralik = 250): Promise<Map<string, Ozet | null>> {
  const out = new Map<string, Ozet | null>(); const tek = [...new Set(basliklar)];
  for (let i = 0; i < tek.length; i += 20) {
    const parca = tek.slice(i, i + 20); const birlesik: any = { normalized: [], redirects: [], pages: [] };
    let devam: Record<string, string> = {};
    for (let tur = 0; tur < 10; tur++) { // exlimit/sonuç boyutu aşılırsa 'continue' ile kalan sayfalar gelir
      const d = await get(`https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
        action: "query", format: "json", formatversion: "2", redirects: "1", titles: parca.join("|"),
        prop: "extracts|info|pageprops|coordinates|revisions", exintro: "1", explaintext: "1", exlimit: "20",
        inprop: "url", ppprop: "disambiguation", rvprop: "ids", ...devam }), aralik);
      const q = d?.query ?? {};
      birlesik.normalized.push(...(q.normalized ?? [])); birlesik.redirects.push(...(q.redirects ?? []));
      for (const p of q.pages ?? []) { const v = birlesik.pages.find((x: any) => x.title === p.title); if (v) Object.assign(v, Object.fromEntries(Object.entries(p).filter(([, x]) => x != null))); else birlesik.pages.push(p); }
      if (!d?.continue) break; devam = Object.fromEntries(Object.entries<string>(d.continue).filter(([k]) => k !== "continue")); devam.continue = d.continue.continue;
    }
    for (const [k, v] of ozetCoz(lang, parca, birlesik)) out.set(k, v);
  }
  return out;
}
