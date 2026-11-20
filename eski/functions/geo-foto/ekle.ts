// Commons fotoğrafı yazma kapısı (20.11.2026): aynı yerde aynı dosya daha önce gizlendiyse/kaldırıldıysa yazılmaz.
// Karar sunucuda: private.wikimedia_onceden_red (normalize dosya adı: source_page / origin_ref / storage_ref);
// private.wikimedia_media_ekle de aynı kontrolü yapar (null döner). Burada sorulması kuyruğa 'onceden-red' yazdırır (OK sayılmaz).
import type { Meta } from "./kural.ts";

export const ONCEDEN_RED = "onceden-red";

/** geo-foto'nun yazdığı adresler (Special:FilePath + File: sayfası). */
export function commonsRef(title: string): { ref: string; page: string } {
  const enc = encodeURIComponent(title.replaceAll(" ", "_"));
  return { ref: "https://commons.wikimedia.org/wiki/Special:FilePath/" + enc + "?width=800", page: "https://commons.wikimedia.org/wiki/File:" + enc };
}

export type EkleDb = {
  oncedenRed(placeId: string, ref: string, page: string): Promise<boolean>;
  ekle(placeId: string, ref: string, page: string, m: Meta): Promise<string | null>;
};

/** Önceden reddedilmiş dosya yazılmaz: sonuc 'onceden-red' (+ yol eki, ör. ':ov-commons'), yeni null. */
export async function ekleKontrollu(db: EkleDb, placeId: string, m: Meta, okSonuc = "OK", redEk = ""): Promise<{ sonuc: string; yeni: string | null }> {
  const { ref, page } = commonsRef(m.title);
  if (await db.oncedenRed(placeId, ref, page)) return { sonuc: ONCEDEN_RED + redEk, yeni: null };
  return { sonuc: okSonuc, yeni: await db.ekle(placeId, ref, page, m) };
}
