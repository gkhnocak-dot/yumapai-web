#!/usr/bin/env python3
"""YuMapAI hikâye müziği: tek seferlik, katalogdan (supabase/veri/muzik_katalog.json) çekim + lisans doğrulama.

Kurallar (DERSLER / ozet.md): yalnız ücretsiz + ticari lisans (CC BY 4.0, CC0, PDM); kazıma yok — yalnız katalogdaki
resmi indirme bağlantıları, parça başına bir istek, aralıklı. Lisansı doğrulanamayan parça ATLANIR (raporda nedeni yazılır).
Çıktı (--cikti): dosyalar/<id>.mp3 (128 kbps), muzik_kayit.json, muzik_seed.sql, rapor.md.
Ortamda SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY varsa dosyalar 'music' kovasına da yüklenir (anahtar hiçbir yere yazılmaz);
yoksa ya da kova yoksa yalnız çıktı klasörü (iş akışında artefakt) bırakılır.
Yalnız standart kütüphane + ffmpeg/ffprobe.
"""
import argparse, hashlib, json, os, re, subprocess, sys, time, urllib.error, urllib.request
from urllib.parse import urlparse

UA = "YuMapAI-muzik-cek/1.0 (tek seferlik; resmi indirme baglantilari)"
IZINLI_HOST = {"incompetech.com", "freemusicarchive.org", "musopen.org"}
YASAK_CC = re.compile(r"creativecommons\.org/licenses/(by-nc|by-sa|by-nd|nc|sa|nd)[^\"'\s<>]*", re.I)
CC_ADRES = re.compile(r"creativecommons\.org/(?:licenses|publicdomain)/[a-z0-9\-]+/[0-9.]+", re.I)
EN_BUYUK_BAYT = 40 * 1024 * 1024
MIN_SN, MAX_SN = 20, 480
SIRA_BEKLEME = 3.0


def norm_cc(u):
    """'http://creativecommons.org/licenses/by/4.0/legalcode' → 'creativecommons.org/licenses/by/4.0'."""
    m = CC_ADRES.search(u or "")
    return m.group(0).lower() if m else ""


def katalog_dogrula(kat):
    """Katalog biçimi ve izinli lisans denetimi (ağ yok). Hata listesi döner."""
    hata, goruldu = [], set()
    izinli = {norm_cc(v) for v in kat["izinli_lisanslar"].values()}
    ruhlar = set(kat["ruh_halleri"])
    for p in kat["parcalar"]:
        i = p.get("id", "?")
        if i in goruldu: hata.append(f"{i}: yinelenen kimlik")
        goruldu.add(i)
        for a in ("baslik", "sanatci", "indirme_url", "kaynak_sayfa_url", "lisans_kodu", "lisans_url", "ruh"):
            if not p.get(a): hata.append(f"{i}: {a} eksik")
        if p.get("lisans_kodu") not in kat["izinli_lisanslar"]: hata.append(f"{i}: lisans kodu izinli değil")
        elif norm_cc(p["lisans_url"]) not in izinli or norm_cc(p["lisans_url"]) != norm_cc(kat["izinli_lisanslar"][p["lisans_kodu"]]):
            hata.append(f"{i}: lisans adresi koda uymuyor")
        if urlparse(p.get("indirme_url", "")).scheme != "https" or urlparse(p["indirme_url"]).hostname not in IZINLI_HOST:
            hata.append(f"{i}: indirme adresi izinli kaynak değil")
        if not set(p.get("ruh", [])) <= ruhlar: hata.append(f"{i}: bilinmeyen ruh hali")
        if p.get("kaynak") != "incompetech" and p.get("bagimsiz_sanatci_dogrulandi") is not True:
            hata.append(f"{i}: birlik (MESAM/MSG) üyeliği belirsiz — alınmaz")
    return hata


def etiket_lisansi(etiketler):
    """Incompetech mp3 etiketleri: (tamam, neden, isrc). Telif/yorum/URL alanlarında CC BY 4.0 aranır; SA/NC/ND varsa ret."""
    metin = " ".join(str(v) for v in etiketler.values())
    if YASAK_CC.search(metin): return False, "etiket_yasak_lisans", None
    if norm_cc(metin) != "creativecommons.org/licenses/by/4.0" and not re.search(r"by attribution 4\.0", metin, re.I):
        return False, "etiket_lisansi_bulunamadi", None
    ad = " ".join(str(etiketler.get(k, "")) for k in ("artist", "album_artist", "composer"))
    if "macleod" not in ad.lower(): return False, "etiket_sanatci_uyusmuyor", None
    isrc = etiketler.get("TSRC") or etiketler.get("isrc") or ""
    isrc = isrc if re.fullmatch(r"[A-Z]{2}[A-Z0-9]{3}\d{7}", str(isrc).strip()) else None
    return True, "", isrc


def sayfa_lisansi(html, beklenen_url):
    """FMA/Musopen parça sayfası: beklenen lisans adresi geçmeli, hiçbir yasak (NC/SA/ND) lisans adresi geçmemeli."""
    if YASAK_CC.search(html): return False, "sayfada_yasak_lisans"
    bulunan = {m.group(0).lower() for m in CC_ADRES.finditer(html)}
    if norm_cc(beklenen_url) not in bulunan: return False, "sayfada_beklenen_lisans_yok"
    return True, ""


def indir(url, hedef, sinir=EN_BUYUK_BAYT):
    istek = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(istek, timeout=60) as r, open(hedef, "wb") as f:
        toplam = 0
        while True:
            parca = r.read(1 << 16)
            if not parca: break
            toplam += len(parca)
            if toplam > sinir: raise ValueError("cok_buyuk")
            f.write(parca)
        return r.geturl()


def sayfa_al(url):
    istek = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(istek, timeout=60) as r:
        return r.read(2_000_000).decode("utf-8", "replace")


def sha256(yol):
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()


def ffprobe(yol):
    c = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-of", "json", yol], capture_output=True, text=True)
    if c.returncode: raise ValueError("ffprobe_hata")
    f = json.loads(c.stdout)["format"]
    return {k.lower() if k.lower() != "tsrc" else "TSRC": v for k, v in (f.get("tags") or {}).items()}, float(f.get("duration") or 0)


def kodla128(giris, cikis):
    c = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", giris, "-vn", "-map_metadata", "-1", "-ac", "2", "-ar", "44100",
                        "-codec:a", "libmp3lame", "-b:a", "128k", cikis], capture_output=True, text=True)
    if c.returncode: raise ValueError("kodlama_hata")


def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"


def sql_dizi(a):
    return "array[" + ",".join(sql_str(x) for x in a) + "]::text[]" if a else "'{}'::text[]"


def atif_metni(p, kaynak_sayfa, lisans_ad):
    return (f"“{p['baslik']}” — {p['sanatci']} ({kaynak_sayfa}). Lisans: {lisans_ad} ({p['lisans_url']}). "
            "Değişiklik: 128 kbps MP3'e dönüştürüldü; hikâyede kısaltılmış bölüm çalınır.")


def seed_sql(kayitlar):
    s = ["-- muzik_cek.py çıktısı: doğrulanan parçalar. Uygulama kararı Reis'in (kırmızı hat); 20261120230000_hikaye_muzik.sql'den SONRA.",
         "insert into public.music_tracks (id, title, artist, license_code, license_url, source_url, attribution_text, storage_path, duration_s, sha256, moods, categories, active)", "values"]
    s.append(",\n".join(
        f"  ({sql_str(k['uuid'])}, {sql_str(k['title'])}, {sql_str(k['artist'])}, {sql_str(k['license_code'])}, {sql_str(k['license_url'])}, "
        f"{sql_str(k['source_url'])}, {sql_str(k['attribution_text'])}, {sql_str(k['storage_path'])}, {k['duration_s']}, {sql_str(k['sha256'])}, "
        f"{sql_dizi(k['moods'])}, {sql_dizi(k['categories'])}, true)" for k in kayitlar))
    s.append("on conflict (storage_path) do update set title = excluded.title, artist = excluded.artist, license_code = excluded.license_code,\n"
             "  license_url = excluded.license_url, source_url = excluded.source_url, attribution_text = excluded.attribution_text,\n"
             "  duration_s = excluded.duration_s, sha256 = excluded.sha256, moods = excluded.moods, categories = excluded.categories;")
    return "\n".join(s) + "\n"


def uuid_kimlikten(kimlik):
    """Kararlı UUID (yeniden çalıştırınca aynı parça aynı kimliği alır)."""
    h = hashlib.sha256(("yumapai-muzik:" + kimlik).encode()).hexdigest()
    return f"{h[:8]}-{h[8:12]}-4{h[13:16]}-8{h[17:20]}-{h[20:32]}"


def yukle_storage(dosya, yol, durum):
    url, anahtar = os.environ.get("SUPABASE_URL", "").rstrip("/"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not anahtar or durum.get("kapali"): return "atlandi"
    with open(dosya, "rb") as f: veri = f.read()
    istek = urllib.request.Request(f"{url}/storage/v1/object/music/{yol}", data=veri, method="POST",
        headers={"Authorization": "Bearer " + anahtar, "apikey": anahtar, "Content-Type": "audio/mpeg", "x-upsert": "true", "User-Agent": UA})
    try:
        urllib.request.urlopen(istek, timeout=120).read()
        return "yuklendi"
    except urllib.error.HTTPError as e:
        durum["kapali"] = True  # kova yok / yetki yok: tekrar denenmez, çıktı artefakt olarak kalır
        return f"yukleme_hata_{e.code}"


def calis(a):
    kat = json.load(open(a.katalog, encoding="utf-8"))
    hata = katalog_dogrula(kat)
    if hata:
        print("KATALOG_HATASI\n" + "\n".join(hata)); return 2
    os.makedirs(os.path.join(a.cikti, "dosyalar"), exist_ok=True)
    tmp = os.path.join(a.cikti, "_ham"); os.makedirs(tmp, exist_ok=True)
    adlar, kayit, atlanan, durum = kat["lisans_adlari"], [], [], {}
    for n, p in enumerate(kat["parcalar"]):
        if a.sinir and n >= a.sinir: break
        i = p["id"]
        try:
            ham = os.path.join(tmp, i + ".bin")
            if n: time.sleep(SIRA_BEKLEME)
            son = indir(p["indirme_url"], ham)
            if urlparse(son).scheme != "https": raise ValueError("https_degil")
            etiket, sure = ffprobe(ham)
            kaynak_sayfa = p["kaynak_sayfa_url"]
            if p["kaynak"] == "incompetech":
                tamam, neden, isrc = etiket_lisansi(etiket)
                if not tamam: raise ValueError(neden)
                if isrc: kaynak_sayfa = f"https://incompetech.com/music/royalty-free/index.html?isrc={isrc}"
            else:
                tamam, neden = sayfa_lisansi(sayfa_al(p["kaynak_sayfa_url"]), p["lisans_url"])
                if not tamam: raise ValueError(neden)
            if not (MIN_SN <= sure <= MAX_SN): raise ValueError(f"sure_uygun_degil_{int(sure)}")
            yol = f"{i}.mp3"; cikis = os.path.join(a.cikti, "dosyalar", yol)
            kodla128(ham, cikis)
            _, sure2 = ffprobe(cikis)
            k = {"id": i, "uuid": uuid_kimlikten(i), "title": p["baslik"], "artist": p["sanatci"], "license_code": p["lisans_kodu"],
                 "license_url": p["lisans_url"], "source_url": kaynak_sayfa, "storage_path": yol, "duration_s": int(round(sure2)),
                 "sha256_ham": sha256(ham), "sha256": sha256(cikis), "bayt": os.path.getsize(cikis), "indirme_url": p["indirme_url"],
                 "cekildi": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "moods": p["ruh"], "categories": p.get("kategoriler", []),
                 "attribution_text": atif_metni(p, kaynak_sayfa, adlar[p["lisans_kodu"]])}
            k["yukleme"] = yukle_storage(cikis, yol, durum)
            kayit.append(k)
            print(f"TAMAM {i} {k['duration_s']}s {k['bayt']}B {k['yukleme']}", flush=True)
        except Exception as e:  # ağ, 404, lisans… hepsi atlama sebebidir; sessiz geçilmez, rapora yazılır
            neden = str(e) if isinstance(e, ValueError) else (f"http_{e.code}" if isinstance(e, urllib.error.HTTPError) else type(e).__name__)
            atlanan.append({"id": i, "baslik": p["baslik"], "neden": neden})
            print(f"ATLANDI {i}: {neden}", flush=True)
        finally:
            try: os.remove(os.path.join(tmp, i + ".bin"))
            except OSError: pass
    json.dump(kayit, open(os.path.join(a.cikti, "muzik_kayit.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if kayit: open(os.path.join(a.cikti, "muzik_seed.sql"), "w", encoding="utf-8").write(seed_sql(kayit))
    toplam = sum(k["bayt"] for k in kayit)
    rapor = [f"# Müzik çekimi raporu", f"- Alınan: {len(kayit)}  Atlanan: {len(atlanan)}  Toplam: {toplam / 1048576:.1f} MiB",
             f"- Storage yükleme: {sorted({k['yukleme'] for k in kayit})}"] + [f"- ATLANDI {x['id']} ({x['baslik']}): {x['neden']}" for x in atlanan]
    open(os.path.join(a.cikti, "rapor.md"), "w", encoding="utf-8").write("\n".join(rapor) + "\n")
    print("\n".join(rapor))
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--katalog", default="muzik/muzik_katalog.json")
    ap.add_argument("--cikti", default="muzik_cikti")
    ap.add_argument("--sinir", type=int, default=0)
    sys.exit(calis(ap.parse_args()))
