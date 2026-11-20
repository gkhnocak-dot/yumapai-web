// Geo-foto kuru ölçüm (YALNIZ OKUMA: Commons/Wikidata; veritabanına yazmaz). Kullanım: deno run -A kuru.ts <kök: yeni|eski> <çıktı.jsonl> <önbellek.json>
const KOK = Deno.args[0];
const { genisAra, Durdur } = await import(`./${KOK}/functions/geo-foto/genis.ts`);
const { clean } = await import(`./${KOK}/functions/geo-foto/kural.ts`);
type Meta = any; type Api = any; type WdAday = any; type Yer = any;
const CACHE = Deno.args[2];
const cache: Record<string, any> = (() => { try { return JSON.parse(Deno.readTextFileSync(CACHE)); } catch { return {}; } })();
const UA = "YuMapAI-photo-import/1.0 (https://yumapai.com)";
const API = "https://commons.wikimedia.org/w/api.php?";
const IIF = "LicenseShortName|LicenseUrl|Artist|Categories|ImageDescription|ObjectName";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Res = { ok: true; metas: Meta[] } | { ok: false; wait: number; code: string };

let last = 0;
type Raw = { ok: true; d: any } | { ok: false; wait: number; code: string };
async function raw(base: string, params: Record<string, string>): Promise<Raw> {
  const w = last + 1500 - Date.now(); if (w > 0) await sleep(w); last = Date.now();
  const key = base + new URLSearchParams(params);
  if (cache[key]) return { ok: true, d: cache[key] };
  let r: Response; for (let i = 0; ; i++) { r = await fetch(key, { headers: { "User-Agent": UA } }); if (r.status !== 429 && r.status !== 503) break; await r.body?.cancel(); if (i > 8) return { ok: false, wait: 30, code: "HTTP_429" }; await sleep(15000 * (i + 1)); }
  if (r.status === 429 || r.status === 503) {
    const ra = Number(r.headers.get("retry-after") ?? "30"); await r.body?.cancel();
    return { ok: false, wait: Math.min(60, ra > 0 ? ra : 30), code: "HTTP_" + r.status };
  }
  if (!r.ok) { await r.body?.cancel(); return { ok: false, wait: 30, code: "HTTP_" + r.status }; }
  const d = await r.json();
  if (d?.error) return { ok: false, wait: 30, code: String(d.error.code ?? "API_ERROR") };
  cache[key] = d;
  return { ok: true, d };
}
async function call(params: Record<string, string>): Promise<Res> {
  const q: Record<string, string> = { action: "query", format: "json", formatversion: "2", prop: "imageinfo", iiprop: "extmetadata|size",
    iiextmetadatafilter: IIF, ...params };
  const x = await raw(API, q); if (!x.ok) return x;
  const metas: Meta[] = (x.d?.query?.pages ?? []).filter((p: any) => p.imageinfo).map((p: any) => {
    const ii = p.imageinfo?.[0] ?? {}; const m = ii.extmetadata ?? {}; const c = p.coordinates?.[0];
    return { title: String(p.title ?? "").replace(/^File:/, ""), lic: clean(m.LicenseShortName?.value), licurl: clean(m.LicenseUrl?.value),
      author: clean(m.Artist?.value).slice(0, 300), cats: clean(m.Categories?.value), desc: clean(m.ImageDescription?.value),
      obj: clean(m.ObjectName?.value), w: Number(ii.width ?? 0), h: Number(ii.height ?? 0),
      ...(c && typeof c.lat === "number" ? { lat: c.lat, lon: c.lon } : {}) };
  });
  return { ok: true, metas };
}
const geo = (lat: number, lon: number, radius = 300) => call({ generator: "geosearch", ggscoord: `${lat.toFixed(6)}|${lon.toFixed(6)}`, ggsradius: String(radius), ggsnamespace: "6", ggslimit: "50" });
const files = (titles: string[]) => titles.length ? call({ titles: titles.slice(0, 50).map((t) => "File:" + t.replaceAll("_", " ")).join("|") }) : Promise.resolve({ ok: true, metas: [] } as Res);
const category = (cat: string) => call({ generator: "categorymembers", gcmtitle: "Category:" + cat.replace(/^Category:/, ""), gcmtype: "file", gcmlimit: "100" });

const must = (r: Res) => { if (!r.ok) throw new Durdur(r); return r.metas; };
const WD = "https://www.wikidata.org/w/api.php?";
const genisApi: Api = {
  geo: async (lat, lon, r) => must(await geo(lat, lon, r)),
  files: async (t) => must(await files(t)),
  category: async (c) => must(await category(c)),
  search: async (q) => must(await call({ generator: "search", gsrsearch: q, gsrnamespace: "6", gsrlimit: "30", prop: "imageinfo|coordinates", colimit: "max" })),
  wdSearch: async (name) => {
    const x = await raw(WD, { action: "wbsearchentities", search: name, language: "tr", uselang: "tr", type: "item", limit: "7", format: "json" });
    if (!x.ok) throw new Durdur(x); return (x.d?.search ?? []).map((e: any) => ({ id: String(e.id), label: String(e.label ?? "") }));
  },
  wdEntities: async (ids) => {
    const x = await raw(WD, { action: "wbgetentities", ids: ids.join("|"), props: "claims|labels|descriptions", languages: "tr|en", format: "json" });
    if (!x.ok) throw new Durdur(x);
    return Object.values(x.d?.entities ?? {}).filter((e: any) => !e.missing).map((e: any): WdAday => {
      const cl = e.claims ?? {}; const val = (k: string) => (cl[k] ?? []).map((c: any) => c?.mainsnak?.datavalue?.value).filter((v: any) => v != null);
      const c = val("P625")[0];
      return { id: String(e.id), label: String(e.labels?.tr?.value ?? e.labels?.en?.value ?? ""), desc: String((e.descriptions?.tr?.value ?? "") + " " + (e.descriptions?.en?.value ?? "")),
        lat: c?.latitude, lon: c?.longitude, p18: val("P18").map(String), kategori: val("P373")[0] ? String(val("P373")[0]) : undefined,
        p31: val("P31").map((v: any) => String(v?.id ?? "")) };
    });
  },
};
const yerler = JSON.parse(Deno.readTextFileSync("yerler.json"));
const out: string[] = [];
for (const y of yerler) {
  try { const k = await genisAra(y as Yer, genisApi); out.push(JSON.stringify({ ad: y.name, il: y.il, ilce: y.ilce, art_key: y.art_key, sonuc: k.sonuc, yol: k.yol, dosya: k.pick?.title, kat: k.pick?.cats, acik: k.pick?.desc?.slice(0, 300), lisans: k.pick?.lic, w: k.pick?.w, h: k.pick?.h })); }
  catch (e) { out.push(JSON.stringify({ ad: y.name, sonuc: "HATA:" + String(e).slice(0, 80) })); }
  Deno.writeTextFileSync(CACHE, JSON.stringify(cache));
}
Deno.writeTextFileSync(Deno.args[1], out.join("\n") + "\n");

