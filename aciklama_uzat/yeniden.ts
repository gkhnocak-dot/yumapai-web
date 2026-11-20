// Ağsız yeniden hesap: kuru.ts'nin ham.jsonl(.gz) önbelleğine güncel kural modülünü uygular; çıktı biçimi kuru.ts ile aynı.
// Kullanım: deno run -A yeniden.ts <ham.jsonl.gz> <kural.ts yolu> <cikti_dizini>   (satırdaki k: o = örneklem, t = tüm küme)
const [hamYol, kuralYol, out] = Deno.args; await Deno.mkdir(out, { recursive: true });
const K = await import(new URL(kuralYol, "file://" + Deno.cwd() + "/").href);
const temizIlce = (s: unknown) => (s ? String(s).replace(/\s*\((ilçe|İlçesi)\)|\s+İlçesi$/i, "").trim() : null);
const gz = (await Deno.open(hamYol)).readable.pipeThrough(new DecompressionStream("gzip")).pipeThrough(new TextDecoderStream());
let buf = "", i = 0; const o1: string[] = [], o2: string[] = [], gor = new Set<string>();
const isle = (sat: string) => {
  if (!sat.trim()) return; const { k: km, y, e, L, oz } = JSON.parse(sat); const ilk = km === "o"; i++; if (!ilk && gor.has(y.qid)) return; if (!ilk) gor.add(y.qid);
  const r: any = { qid: y.qid, ad: y.name, il: y.il, ilce: y.ilce, onceTr: y.onceTr, onceEn: y.onceEn };
  for (const l of ["tr", "en"]) {
    if (!e) { r[l] = { yok: "wikidata-varlik-yok" }; continue; }
    const k = K.kur(l, { ...y, ilce: temizIlce(y.ilce) }, e, L, oz[l]);
    r[l] = "text" in k ? { n: k.text.length, nWiki: k.nWiki, facts: k.facts, wikiRed: k.wikiRed ?? null, text: k.text, wiki: k.wiki ?? null } : { yok: k.yok };
    if (ilk && oz[l]) r[l].ham = oz[l].extract.slice(0, 2500);
  }
  (ilk ? o1 : o2).push(JSON.stringify(r));
};
for await (const p of gz) { buf += p; const s = buf.split("\n"); buf = s.pop()!; s.forEach(isle); } isle(buf);
await Deno.writeTextFile(`${out}/orneklem500.jsonl`, o1.join("\n") + "\n");
const t = new Blob([o2.join("\n") + "\n"]).stream().pipeThrough(new CompressionStream("gzip"));
await Deno.writeFile(`${out}/tum.jsonl.gz`, t); console.log("örneklem", o1.length, "tüm", o2.length);
