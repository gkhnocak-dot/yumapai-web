// geo-foto konu denetimi (20.11.2026): yazılacak Commons fotoğrafının konusu gerçekten bu yer mi?
// Canlı ölçüm (19-20.11, 198 örnek): GENIS %35, DENETIM %11, GEO %6,7 yanlış. Kök nedenler:
//  (1) ad eşleşmesi tek ortak/bölge sözcüğüyle yetiniyordu ("Gold Beach" <- altın mozaik, "Say Sanat" <- Fazıl Say konseri,
//      "Alanya Beach" <- Gazipaşa-Alanya havalimanında Boeing, "Şanlıurfa Şelale" <- Yazarlar Birliği Şanlıurfa Şubesi);
//  (2) yerin tür sözcüğü (plaj, şelale, hamam...) fotoğrafta aranmıyordu ("Patara Beach" <- Patara antik kenti, "Eski Hamam" <- Eski Hamam Çeşmesi);
//  (3) ad yalnız açıklamada geçen dosya kabul ediliyordu ("Erymna" <- çeşme duvarındaki yazıt);
//  (4) kişi/etkinlik/uçak/sikke/müze eseri/mozaik/tabela kategorileri elenmiyordu.
// Kural: ayırt edici sözcükler başlıkta ya da bir Commons kategorisinde ARDIŞIK geçmeli; adın tür sözcüğü (eş anlamlısı) aynı yerde
// bulunmalı; addan hemen sonra başka bir tür sözcüğü geliyorsa konu başka yapıdır; konu dışı kategoriler elenir.
// Wikidata P18 (öğenin resmi görseli) yalnız konu dışı denetiminden geçer. Test: konu_test.ts.
import { norm, type Meta } from "./kural.ts";
import { GAZETTEER } from "../yumy/veri/gazetteer.ts";

/** Tür sınıfları: yer adındaki tür sözcüğü fotoğrafta aynı sınıftan bir sözcükle karşılanmalı. */
export const SINIF: Record<string, string[]> = {
  plaj: "beach beaches plaj plaji plajlari kumsal kumsali sahil sahili sahilleri coast shore seaside kiyi kiyisi strand".split(" "),
  park: "park parki parks parklari bahce bahcesi bahceleri garden gardens mesire piknik picnic".split(" "),
  dogal: "milli tabiat national nature".split(" "),
  cami: "cami camii camisi mosque mosques mescit mescidi masjid".split(" "),
  kale: "kale kalesi castle fortress hisar hisari citadel fort".split(" "),
  muze: "muze muzesi museum museums muzeler muzeleri".split(" "),
  turbe: "turbe turbesi tomb mausoleum kumbet kumbeti".split(" "),
  kilise: "kilise kilisesi church chapel sapel manastir manastiri monastery bazilika bazilikasi basilica".split(" "),
  sinagog: "sinagog sinagogu synagogue".split(" "),
  han: "han hani kervansaray kervansarayi caravanserai inn".split(" "),
  hamam: "hamam hamami hamamlari bath baths hammam bathhouse".split(" "),
  kopru: "kopru koprusu bridge".split(" "),
  meydan: "meydan meydani square plaza".split(" "),
  cesme: "cesme cesmesi fountain sebil sebili sadirvan sadirvani".split(" "),
  gol: "gol golu golet goleti lake lac see baraj baraji reservoir dam".split(" "),
  selale: "selale selalesi selaleleri waterfall waterfalls falls cascade".split(" "),
  magara: "magara magarasi magaralari cave caves cavern".split(" "),
  tepe: "tepe tepesi hill seyir terasi viewpoint lookout".split(" "),
  ada: "ada adasi adalar adalari island islands isle".split(" "),
  koy: "koy koyu bay cove".split(" "),
  burun: "burun burnu cape".split(" "),
  dag: "dag dagi daglari mountain mountains mount".split(" "),
  vadi: "vadi vadisi valley".split(" "),
  kanyon: "kanyon kanyonu canyon gorge".split(" "),
  sanat: "sanat art arts galeri galerisi gallery sergi exhibition".split(" "),
  kultur: "kultur culture cultural".split(" "),
  merkez: "merkez merkezi center centre central city town sehir kent".split(" "),
  tiyatro: "tiyatro tiyatrosu theatre theater sahne sahnesi stage opera".split(" "),
  sinema: "sinema sinemasi cinema".split(" "),
  spor: "spor sports".split(" "),
  salon: "salon salonu hall".split(" "),
  havuz: "havuz havuzu pool".split(" "),
  bar: "bar".split(" "),
  studio: "studio studyo".split(" "),
  karaoke: "karaoke".split(" "),
};
/** Yalnız "addan sonra gelen başka tür" denetiminde kullanılan ek türler (yerin adında tür olarak sayılmaz). */
const EK_TUR: Record<string, string[]> = {
  cadde: "cadde caddesi street sokak sokagi bulvar bulvari avenue".split(" "),
  hazire: "hazire haziresi cemetery graveyard mezarlik mezarligi".split(" "),
  okul: "okul okulu school lise lisesi".split(" "),
  istasyon: "istasyon istasyonu station gar gari".split(" "),
  otel: "otel oteli hotel".split(" "),
  antikkent: "kenti ruins harabe harabeleri nekropol nekropolu necropolis".split(" "),
};
/** "Addan sonra başka tür" denetiminde ayrı yapı sayılan sınıflar (doğa/parça sözcükleri değil). */
const YAPI = new Set("antikkent cami kale muze turbe kilise sinagog han hamam kopru meydan cesme cadde hazire okul istasyon otel".split(" "));
/** Anlamı olmayan dolgu sözcükleri (adın parçası sayılmaz). */
// "antik/tarihi" niteleyicidir: "Tarihi Çeşme" genel addır, "Didyma Antik Tiyatrosu" = "Didyma Theatre".
const DOLGU = new Set("the of and ve de da no alani yeri yolu club kulubu beachclub antik ancient tarihi historic historical".split(" "));
const SOZ2SINIF = new Map<string, string>();
for (const [k, l] of Object.entries(SINIF)) for (const w of l) SOZ2SINIF.set(w, k);
const TUR2SINIF = new Map<string, string>(SOZ2SINIF);
for (const [k, l] of Object.entries(EK_TUR)) for (const w of l) if (!TUR2SINIF.has(w)) TUR2SINIF.set(w, k);

/** Tek başına konu kanıtı sayılmayan sözcükler: il/ilçe adları ve ortak sözcükler (gold, say, gül, bird...). */
const ORTAK = new Set(("gold golden say gul bird birds blue green red white black yellow sun sunset sunrise star royal grand new old " +
  "millet eski yeni buyuk kucuk ulu first last orange tropical paradise sea deniz palm daire zafer ana " +
  "aga pasa bey efendi sultan hatun hanim baba seyh gazi hoca turk turkish").split(" "));
const BOLGE = new Set(GAZETTEER.flatMap(([il, l]) => [il, ...l]).map(norm).filter((x) => x && !x.includes(" ")));
export const zayifSoz = (w: string) => ORTAK.has(w) || BOLGE.has(w) || w.length <= 2;

/** Normalleştirip harf/rakam sınırından da böler ("Türbesi03" -> turbesi 03). */
export function tokens(s: string): string[] {
  return norm(s).replace(/([a-z])([0-9])/g, "$1 $2").replace(/([0-9])([a-z])/g, "$1 $2").split(" ").filter(Boolean);
}
export type AdParca = { ayirt: string[]; siniflar: string[] };
/** Yer adı -> ayırt edici sözcükler + tür sınıfları. Parantez/virgül/eğik çizgi sonrası niteleyicidir (adın parçası değil). */
export function adParca(name: string): AdParca {
  const t = tokens(name.replace(/\([^)]*\)/g, " ").split(/[,/]/)[0]);
  const ayirt: string[] = [], siniflar: string[] = [];
  for (const w of t) {
    if (DOLGU.has(w) || /^\d+$/.test(w) || w.length < 2) continue;
    const s = SOZ2SINIF.get(w);
    if (s) { if (!siniflar.includes(s)) siniflar.push(s); } else ayirt.push(w);
  }
  return { ayirt, siniflar };
}
/** Bir harf farkı (ekleme/silme/değiştirme), yalnız uzun sözcüklerde: "Acharaka" = "Acharaca". */
function birFark(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, f = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++f > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return f + (a.length - i) + (b.length - j) <= 1;
}
const es = (w: string, x: string) => w === x || (w.length >= 6 && (x.startsWith(w) || birFark(w, x)));
/** aw dizisinin t içinde ardışık geçtiği ilk konum (bitiş indeksi) ya da -1. Aradaki tür sözcükleri atlanabilir ("Kıble Sokağı Hanı"). */
function ardisikBitis(t: string[], aw: string[]): number { return ardisikAralik(t, aw)?.[1] ?? -1; }
function ardisikAralik(t: string[], aw: string[]): [number, number] | null {
  if (!aw.length) return null;
  for (let i = 0; i < t.length; i++) {
    let j = 0, k = i;
    while (k < t.length && j < aw.length) {
      if (es(aw[j], t[k])) { j++; k++; continue; }
      if (j > 0 && DOLGU.has(t[k])) { k++; continue; } // "Dara Ören Yeri Nekropolü"
      if (j > 0 && TUR2SINIF.has(t[k]) && k + 1 < t.length && es(aw[j], t[k + 1])) { k++; continue; } // "Ali Paşa Camii Şerifi" gibi araya giren tür
      break;
    }
    if (j === aw.length) return [i, k];
  }
  return null;
}
const sinifVar = (t: string[], s: string) => t.some((w) => SOZ2SINIF.get(w) === s);

// Konu dışı kategoriler/başlıklar. sert: her zaman red (istisna: yerin adı/türü o konuyu içeriyorsa); yumusak: başlıkta tam ad yoksa red.
const KONU: { ad: string; re: RegExp; sert: boolean; istisna?: RegExp }[] = [
  { ad: "kisi", sert: true, re: /\b(people|persons|portraits?|politicians|presidents of|prime ministers of|ministers of|musicians|singers|pianists|actors|actresses|footballers|celebrities|businesspeople|selfies?)\b/i },
  { ad: "etkinlik", sert: true, re: /\b(concerts?|performances?|festivals?|ceremon(y|ies)|meetings?|conferences?|summits?|protests?|demonstrations|state visits?|official visits?|parades?|elections?|receptions?)\b/i,
    istisna: /\b(tiyatro|sahne|opera|konser|salon|iksv|festival|kultur merkezi|gosteri merkezi|arena)\b/ },
  { ad: "ucak-arac", sert: true, re: /\b(aircraft|airplanes|aeroplanes|airliners|boeing|airbus|helicopters|automobiles|cars|buses|trucks|supercars|ferrari|locomotives|rolling stock)\b/i,
    istisna: /\b(havalimani|havaalani|airport|havacilik|aviation|ucak|tren|gar|istasyon|station|railway|demiryolu|otobus|otogar|otomobil|araba|muze|museum)\b/ },
  { ad: "sikke-eser", sert: true, re: /\b(coins?|numismatics?|staters?|drachms?|tetradrachms?|banknotes|museum objects|artefacts|artifacts|exhibits|pottery|ceramics|vases|jewel(le)?ry|sculptures in the|statues in the|stelae|sarcophagi in|manuscripts|inscriptions|stuffed animals|skeletons|replicas?)\b/i },
  { ad: "mozaik-fresk", sert: true, re: /\b(mosaics?|frescoe?s)\b.*\b(museum|museums|muzesi)\b|\bmosaics in the\b/i, istisna: /\b(mozaik|mosaic)\b/ },
  { ad: "belge-tabela", sert: true, re: /\b(logos|posters|documents|newspapers|maps of|stamps|paintings|drawings|engravings|illustrations|book covers|signs in|signs of|notices|plaques|information boards|notebooks|guestbooks|signatures|pool tables|real estate)\b/i },
  // Sahne uyumsuzluğu (20.11.2026 görsel denetimi): ad/başlık uyuşsa da fotoğraf yeri değil uydu görüntüsü, trafik/taksi sokağı, kalabalık, dalgıç gibi başka bir sahneyi gösteriyor.
  { ad: "sahne-uyumsuz", sert: true, re: /\b(satellite (images?|views?|photographs?|photos?)|landsat|sentinel-2|traffic|taxis?|taxicabs?|crowds?|audiences?|scuba|divers?|diving|rush hour|traffic jams?)\b/i,
    istisna: /\b(otoyol|trafik|caddesi|bulvari|kavsagi|meydani|dalis|dalgic|uydu|taksi|durak|stadyum|stadium|arena|salon|sahne)\b/ },
  { ad: "yiyecek", sert: true, re: /\b(food|dishes|cuisine|desserts)\b/i },
  // 21.11.2026 (GENIS ilk saat ölçümü, kesinlik ~%75): işletme/otel, bitki-hayvan, eski görsel ve fresk/mozaik ayrıntısı yer fotoğrafı sayılmaz.
  { ad: "isletme", sert: true, re: /\b(hotels?|motels?|hostels?|resorts? hotels?|tattoo studios?|restaurants?|shops?|supermarkets?|banks?|bank branches|offices|apartments?|real estate|gyms?|pool tables)\b/i,
    istisna: /\b(otel|oteli|hotel|resort|kamp|tatil koyu|pansiyon|konak|han|hani|bedesten|carsi|carsisi|bazaar|bazar|pazar)\b/ },
  { ad: "eski-gorsel", sert: true, re: /\b(artworks?|paintings?|engravings?|etchings?|lithographs?|drawings?|illustrations?|postcards?|miniatures?|PD-old[a-z0-9-]*|PD-Art[a-z0-9 ()-]*|Author died more than \d+ years ago|expired)\b/i,
    istisna: /\b(sanat|galeri|galerisi|gallery|muze|museum|resim|tablo)\b/ },
  { ad: "bitki-hayvan", sert: true, re: /\b(flowers|plants|angiosperms?|taxidermy|stuffed animals|storks?|ciconia|insects|butterflies|birds)\b/i,
    istisna: /\b(hayvanat|zoo|kus cenneti|bird park|botanik|botanical|cicek)\b/ },
  { ad: "gemi", sert: false, re: /\b(ships|boats|ferries|yachts|caiques|vessels)\b|\((ship|boat)[,)]/i, istisna: /\b(liman|limani|marina|iskele|iskelesi|port|harbou?r|tersane|tersanesi|naval|deniz muzesi|feribot)\b/ },
  { ad: "hayvan-bitki", sert: false, re: /\b(animals|birds|mammals|insects|reptiles|butterflies|flowers|plants|flora of|fauna of|panthera|ursus|ciconia|dogs|cats of)\b/i, istisna: /\b(hayvanat|zoo|kus cenneti|bird park|botanik|botanical|cicek)\b/ },
];
// Başlıkta geçince konu başka olan sözcükler -> konu türü (yerin adında geçiyorsa ya da türün istisnası yere uyuyorsa yok sayılır).
const BASLIK_SERT = new Map<string, string>();
for (const [ad, l] of Object.entries({
  "etkinlik": "concert konser konseri meeting ontmoeting gorusme", "sikke-eser": "stater drachm tetradrachm coin coins sikke stelae stela replica replika inschrift inscription lekane",
  "mozaik-fresk": "mosaic mosaics mozaik fresco", "kisi": "portrait portre selfie", "belge-tabela": "levhasi tabelasi tabela kitabesi afisi plaketi notebook defteri bilardo",
})) for (const w of l.split(" ")) BASLIK_SERT.set(w, ad);

export type KonuYer = { name: string; art_key?: string | null };
export type KonuSonuc = { ok: true } | { ok: false; neden: string; guven: "yuksek" | "orta" };
const red = (neden: string, guven: "yuksek" | "orta"): KonuSonuc => ({ ok: false, neden, guven });

const MUZE_ESER = /\b(sarcophag\w*|minbar\w*|stones?|finds?|exhibits?|exhibitions?|collections?|memorabilia|statues?|sculptures?|gravestones?|tombstones?|pottery|vases?|objects?|artefacts?|artifacts?|displays?|showcases?|interiors?|halls?)\b/i;
/** Ek kapılar (21.11.2026, GENIS ilk saat ölçümü): eski/çizim görsel, müze içi eser, fresk-mozaik ayrıntısı, hiyerarşik ad (il/ilçe/yer) ve yalnız panoramio başlığı. */
function ekDenetim(m: Meta, y: KonuYer, ap: AdParca, baslik: string[], kats: string[], faz: "icerik" | "kanit"): string | null {
  const adN = " " + norm(y.name) + " ";
  const tamMetin = " " + norm(m.title + " " + m.obj + " " + kats.join(" ")) + " ";
  // (a) 1500-1939 yılı başlıkta/nesne adında (başlıkta daha yeni bir yıl yoksa; "in 2010 1940" gibi dosya numaraları sayılmaz): tarihî fotoğraf, gravür
  const yeniYil = baslik.some((w) => /^(19[7-9][0-9]|20[0-9]{2})$/.test(w));
  const yil = yeniYil ? undefined : baslik.find((w) => /^(1[5-9][0-9]{2})$/.test(w) && Number(w) <= 1939);
  if (yil) return "eski-gorsel:yil:" + yil;
  // (b) Müze/eser: yer müze değilse başlık/kategoride müze geçmemeli; yer müzeyse eser/sergi/salon sözcükleri geçmemeli
  const muzeYer = ap.siniflar.includes("muze");
  const muzeGecer = baslik.some((w) => SOZ2SINIF.get(w) === "muze") || kats.some((c) => tokens(c).some((w) => SOZ2SINIF.get(w) === "muze"));
  if (!muzeYer && muzeGecer && !/\b(muze|museum)\b/.test(adN) && !/\b(sergi|kultur|sanat|galeri)\b/.test(adN)) return "muze-icinden";
  if (muzeYer && (MUZE_ESER.test(m.title.replace(/[._]/g, " ")) || kats.some((c) => /\b(finds|exhibits?|collections?|objects?|artefacts?|artifacts?|interiors?)\b/i.test(c)))) return "muze-eser";
  // (b2) Müze/kültür merkezi fotoğrafı yapının dışını göstermeli: iç mekân, sergi, eser fotoğrafı kapak olmaz (21.11.2026 ölçümü: Muğla/Nevşehir müzesi manken sergisi, Konya müzesi sarkofag kabartması).
  //      Dış görünüş kanıtı: başlık/kategori/açıklamada dış cephe, bina, giriş, avlu, bahçe, genel görünüm sözcüğü.
  if (muzeYer || ap.siniflar.includes("kultur")) {
    const kanit = " " + norm(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj + " " + kats.join(" ") + " " + m.desc) + " ";
    if (!/ (exterior|exteriors|outside|facade|cephe|cephesi|building|buildings|bina|binasi|entrance|giris|girisi|courtyard|avlu|avlusu|garden|bahce|bahcesi|general view|genel gorunum|aerial|havadan|ana bina|front view|on cephe) /.test(kanit)) return "muze-dis-kanit-yok";
  }
  // (c) Fresk/mozaik/kitabe ayrıntısı (başlık tek sözcük bitişik olsa da: "YilanliFresco")
  if (/fresco|fresk|mosaic|mozaik|kitabe|inscription/i.test(m.title) && !/fresk|mozaik|mosaic/.test(adN)) return "ayrinti:fresk-mozaik";
  if (faz === "icerik") return null; // ad kanıtı denetimleri (aşağısı) yalnız tam denetimde ve mevcut ad/tür denetimlerinden sonra çalışır; P18'de hiç çalışmaz
  // (d) Hiyerarşik ad "Konya/Beyşehir/Gölyaka": yer son parçadır; son parçanın ayırt edici sözcüğü başlıkta ya da kategoride geçmeli
  if (y.name.includes("/")) {
    const son = y.name.split("/").pop()!.trim(); const sp = adParca(son);
    if (sp.ayirt.length && !(ardisikBitis(baslik, sp.ayirt) >= 0 || kats.some((c) => ardisikBitis(tokens(c), sp.ayirt) >= 0))) return "hiyerarsik-ad:son-parca-yok";
  }
  // (e00) Başlıkta "by <yazar>" imzası var ve yerin türü belli değil ("Oludeniz- by A shamlou (2)": kalabalık/yürüyüş karesi): başlık konuyu söylemez
  if (!ap.siniflar.length && baslik.includes("by") && baslik.indexOf("by") >= 1 && baslik.length - baslik.indexOf("by") >= 2) return "imzali-baslik";
  // (e0) Adda 2+ basamaklı sayı varsa (100. Yıl Müzesi) başlıkta/kategoride aynı sayı geçmeli
  for (const n of tokens(y.name.split(/[,/]/)[0]).filter((w) => /^[0-9]{2,}$/.test(w))) {
    if (!baslik.includes(n) && !kats.some((c) => tokens(c).includes(n))) return "sayi-uyusmuyor:" + n;
  }
  // (e1) panoramio dosyaları: ayırt edici sözcük başlığın ilk bölümünde (virgül / " - " öncesi) olmalı; "Şehir, Ülke - panoramio" doğrulanamaz
  if (/panoramio/i.test(m.title) && ap.ayirt.length) {
    const ilk = tokens(m.title.split(/,| - /)[0]);
    if (!ap.ayirt.some((w) => ilk.some((x) => es(w, x)))) return "panoramio-ilk-bolum";
  }
  // (e) Ad yalnız kategoride geçiyor, başlıkta ayırt edici hiçbir sözcük yok ve başlık anonim (panoramio/numara): doğrulanamaz
  if (ap.ayirt.length) {
    const baslikta = ap.ayirt.some((w) => baslik.some((x) => es(w, x)));
    const anonim = /panoramio|\bimg\b|dsc[fn]?\b|\b\d{4,}\b/i.test(m.title) || baslik.filter((w) => !/^\d+$/.test(w)).length <= 2;
    if (!baslikta && anonim && !tamMetin.includes(" " + ap.ayirt.join(" ") + " ")) return "baslik-anonim";
  }
  return null;
}

/** Fotoğrafın konusu bu yer mi. p18: dosya yerin Wikidata P18 görseli (yalnız konu dışı denetimi). */
export function konuDenetle(m: Meta, y: KonuYer, opt: { p18?: boolean } = {}): KonuSonuc {
  const adN = " " + norm(y.name + " " + (y.art_key ?? "").replaceAll("_", " ")) + " ";
  const adT = new Set(tokens(y.name));
  const baslik = tokens(m.title.replace(/\.[a-zA-Z0-9]+$/, "") + " " + m.obj);
  const kats = m.cats.split("|").map((c) => c.trim()).filter(Boolean);
  // 1) Konu dışı: sert kategori/başlık
  const sertBas = baslik.find((w) => {
    const k = BASLIK_SERT.get(w); if (!k || adT.has(w)) return false;
    const ist = KONU.find((x) => x.ad === k)?.istisna; return !(ist && ist.test(adN));
  });
  if (sertBas) return red("konu-disi:baslik:" + sertBas, "yuksek");
  const ap = adParca(y.name);
  const tamBaslik = ap.ayirt.length > 0 && ardisikBitis(baslik, ap.ayirt) >= 0 && ap.siniflar.every((s) => sinifVar(baslik, s));
  for (const k of KONU) {
    const hit = kats.find((c) => k.re.test(c)) ?? (k.re.test(m.title) ? m.title : undefined);
    if (!hit || (k.istisna && k.istisna.test(adN))) continue;
    if (k.sert || !tamBaslik) return red("konu-disi:" + k.ad + ":" + hit.slice(0, 60), "yuksek");
  }
  const ek = ekDenetim(m, y, ap, baslik, kats, "icerik");
  if (ek) return red(ek, "yuksek");
  if (opt.p18) return { ok: true };
  // 2) Ad: ayırt edici sözcükler başlıkta ya da bir kategoride ardışık. İl/ilçe adı, başka güçlü sözcük varsa zorunlu değil
  //    ("Güdül Sorgun Gölü" = "Sorgun Lake"), yalnız il/ilçe/ortak sözcükten oluşan ad ise türüyle BİTİŞİK geçmeli ("Alanya Beach").
  if (!ap.ayirt.length) return red("genel-ad", "orta");
  const zayifAd = ap.ayirt.every(zayifSoz);
  const bolgesiz = ap.ayirt.filter((w) => !BOLGE.has(w));
  const gerekli = bolgesiz.length && !bolgesiz.every(zayifSoz) ? bolgesiz : ap.ayirt;
  const bul = (t: string[]) => { const e = ardisikBitis(t, ap.ayirt); return e >= 0 ? e : ardisikBitis(t, gerekli); };
  const parcalar = [baslik, ...kats.map(tokens)];
  const bi = bul(baslik);
  const kat = bi >= 0 ? -1 : parcalar.slice(1).findIndex((t) => bul(t) >= 0);
  const adTur = new Set([...adT].map((w) => TUR2SINIF.get(w)).filter((x): x is string => !!x)); // "Mezarlığı", "Lisesi" de dahil
  const baslikCatisma = baslik.some((w) => YAPI.has(TUR2SINIF.get(w) ?? "-") && !adTur.has(TUR2SINIF.get(w)!));
  if (bi < 0 && kat < 0) {
    const tum = [...new Set(parcalar.flat())];
    const kismi = ap.ayirt.some((w) => !ORTAK.has(w) && w.length >= 3 && tum.some((x) => es(w, x)));
    // Çeviri/yazım farkı olabilir ("Aziz Pavlus Kilisesi" = "Saint Paul's Church"): başlıkta başka bir yapı türü yoksa "orta".
    return red(kismi ? "ad-parcali" : "ad-yok", baslikCatisma ? "yuksek" : "orta");
  }
  if (zayifAd && ap.ayirt.every((w) => ORTAK.has(w) || w.length <= 2) && !ap.siniflar.length) return red("ortak-sozcuk-ad", "orta");
  // 3) Tür: başlık başka bir yapıyı gösterip adın türünü göstermiyorsa konu o yapıdır ("Alanya Beach" <- "Castle Alanya", kategori "Coast of Alanya")
  if (ap.siniflar.length && baslikCatisma && !ap.siniflar.some((s) => sinifVar(baslik, s))) return red("baska-yapi-baslikta", "yuksek");
  //    Adın tür sözcükleri başlıkta ya da ad geçen bir kategoride; zayıf adda adın hemen ardında
  if (zayifAd && ap.siniflar.length) {
    const atla = (w: string) => DOLGU.has(w) || ORTAK.has(w) || BOLGE.has(w) || SOZ2SINIF.get(w) === "merkez"; // "Umraniye central mosque"
    const bitisik = parcalar.some((t) => {
      const r = ardisikAralik(t, ap.ayirt); if (!r) return false;
      let e = r[1]; while (e < t.length && atla(t[e]) && !ap.siniflar.includes(SOZ2SINIF.get(t[e]) ?? "-")) e++;
      let b = r[0] - 1; while (b >= 0 && DOLGU.has(t[b])) b--; // "City of Alanya"
      return (e < t.length && ap.siniflar.includes(SOZ2SINIF.get(t[e]) ?? "-")) || (b >= 0 && ap.siniflar.includes(SOZ2SINIF.get(t[b]) ?? "-"));
    });
    if (!bitisik) return red("zayif-ad-tur-bitisik-degil", "yuksek");
  }
  const adliKat = kats.map(tokens).filter((t) => gerekli.some((w) => t.some((x) => es(w, x))));
  for (const s of ap.siniflar) {
    if (sinifVar(baslik, s) || adliKat.some((t) => sinifVar(t, s))) continue;
    return red("tur-yok:" + s, baslikCatisma ? "yuksek" : "orta");
  }
  // 4) Ad kendi türünü söylüyorsa, başlıkta addan hemen sonra BAŞKA bir yapı türü gelmemeli ("Eski Hamam Çeşmesi", "Haraççı Camii Haziresi")
  if (bi >= 0 && ap.siniflar.length) {
    let k = bi; while (k < baslik.length && (/^\d+$/.test(baslik[k]) || ap.siniflar.includes(SOZ2SINIF.get(baslik[k]) ?? "-"))) k++;
    const sonraki = baslik[k]; const s = sonraki ? TUR2SINIF.get(sonraki) : undefined;
    if (s && YAPI.has(s) && !adTur.has(s)) return red("baska-konu:" + sonraki, "yuksek");
  }
  const kanit = ekDenetim(m, y, ap, baslik, kats, "kanit");
  if (kanit) return red(kanit, "orta");
  return { ok: true };
}
