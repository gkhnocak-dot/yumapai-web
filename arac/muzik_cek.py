#!/usr/bin/env python3
"""YuMapAI hikâye müziği: tek seferlik, katalogdan (supabase/veri/muzik_katalog.json) çekim + lisans doğrulama.

Kurallar (DERSLER / ozet.md): yalnız ücretsiz + ticari lisans (CC BY 4.0, CC0, PDM); kazıma yok — yalnız katalogdaki
resmi indirme bağlantıları, parça başına bir istek, aralıklı. Lisansı doğrulanamayan parça ATLANIR (raporda nedeni yazılır).
Çıktı (--cikti): dosyalar/<id>.mp3 (128 kbps), muzik_kayit.json, muzik_seed.sql, rapor.md.
Ortamda SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY varsa dosyalar 'music' kovasına da yüklenir (anahtar hiçbir yere yazılmaz);
yoksa ya da kova yoksa yalnız çıktı klasörü (iş akışında artefakt) bırakılır.
Yalnız standart kütüphane + ffmpeg/ffprobe.
"""
import argparse, hashlib, json, os, re, shutil, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
from urllib.parse import urlparse

UA = "YuMapAI-muzik-cek/1.0 (tek seferlik; resmi indirme baglantilari)"
IZINLI_HOST = {"incompetech.com", "freemusicarchive.org", "musopen.org"}
YASAK_CC = re.compile(r"creativecommons\.org/licenses/(by-nc|by-sa|by-nd|nc|sa|nd)[^\"'\s<>]*", re.I)
CC_ADRES = re.compile(r"creativecommons\.org/(?:licenses|publicdomain)/[a-z0-9\-]+/[0-9.]+", re.I)
EN_BUYUK_BAYT = 100 * 1024 * 1024  # süre süzgeci (≤ 8 dk) asıl sınırdır; bu yalnız kaçak büyük dosyaya karşı
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
    cm = kat.get("commons") or {}
    for p in cm.get("parcalar", []):
        i = p.get("id", "?")
        if i in goruldu: hata.append(f"{i}: yinelenen kimlik")
        goruldu.add(i)
        if not str(p.get("dosya", "")).startswith("File:"): hata.append(f"{i}: dosya 'File:' ile başlamalı")
        if p.get("tema") not in cm.get("tema_ruh", {}): hata.append(f"{i}: bilinmeyen tema")
        if not p.get("baslik"): hata.append(f"{i}: başlık eksik")
    for tema, r in cm.get("tema_ruh", {}).items():
        if not set(r) <= ruhlar: hata.append(f"tema {tema}: bilinmeyen ruh hali")
    if set(cm.get("izinli", {})) - {"CC0", "Public domain", "CC BY 4.0"}: hata.append("commons: izinli lisans listesi genişletilemez")
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


INC_BASE = "https://incompetech.com/music/royalty-free/"
LISANS_BY4 = re.compile(r"Attribution\s*4\.0|licenses/by/4\.0|CC[ -]BY[ -]4\.0", re.I)
ISRC_RE = re.compile(r"\b[A-Z]{2}[A-Z0-9]{3}\d{7}\b")
KAYNAK_YOLU_RE = re.compile(r"""["'(=\s]((?:https?://incompetech\.com)?/?[A-Za-z0-9_./\-]*\.(?:json|php|js)(?:\?[^"'\s)<>]*)?)["')\s>]""")


def inc_kaynak_adaylari(html, taban=INC_BASE, ek=()):
    """Resmi müzik sayfasının kendi yüklediği betik/veri adresleri (yalnız incompetech.com; en çok 25). Yeni adres UYDURULMAZ."""
    from urllib.parse import urljoin
    sonuc = []
    sabit = [taban + "isrc_to_name.php", taban + "full_list.php"] if taban == INC_BASE else []
    for u in list(ek) + [m.group(1) for m in KAYNAK_YOLU_RE.finditer(html)] + sabit:
        tam = urljoin(taban, u)
        if urlparse(tam).hostname == "incompetech.com" and tam not in sonuc and "jquery" not in tam.lower():
            sonuc.append(tam)
    return sonuc[:25]


def _kayit_penceresi(metin, i):
    """Başlığın içinde olduğu en yakın {...} nesnesi (komşu parçaların lisansı karışmasın); yoksa dar çevre."""
    s, e = metin.rfind("{", 0, i), metin.find("}", i)
    if s != -1 and e != -1 and e - s < 2000:
        return metin[s:e + 1]
    return metin[max(0, i - 200): i + 400]


def inc_resmi_kanit(baslik, kaynaklar):
    """Resmi sayfa/liste metinlerinde parçanın kaydını arar. kaynaklar: [(url, metin)]. Döner (kanit|None, neden).
    Kayıt = başlığın tam (tırnaklı ya da etiket arası) geçtiği yerin çevresi; çevrede CC BY 4.0 işareti olmalı, NC/SA/ND olmamalı."""
    bulundu_ama_lisanssiz = False
    for url, metin in kaynaklar:
        for kalip in (json.dumps(baslik, ensure_ascii=False), '"' + baslik + '"', ">" + baslik + "<", "'" + baslik + "'"):
            i = metin.find(kalip)
            while i != -1:
                pencere = _kayit_penceresi(metin, i)
                if YASAK_CC.search(pencere) or re.search(r"\bBY-(NC|SA|ND)\b", pencere, re.I):
                    return None, "resmi_kayit_yasak_lisans"
                if LISANS_BY4.search(pencere):
                    m = ISRC_RE.search(pencere)
                    return {"url": url, "alinti": re.sub(r"\s+", " ", pencere)[:500], "isrc": m.group(0) if m else None}, ""
                bulundu_ama_lisanssiz = True
                i = metin.find(kalip, i + 1)
    return None, "resmi_kayitta_lisans_yok" if bulundu_ama_lisanssiz else "resmi_kayit_bulunamadi"


def inc_kaynaklari_yukle(ek=(), al=None, kesif=None):
    """music.html + sayfanın yüklediği veri/betik dosyaları (bir kademe daha) → [(url, metin)]. Keşif günlüğü kesif listesine yazılır."""
    al = al or sayfa_buyuk
    kesif = kesif if kesif is not None else []
    cikti, gorulen = [], set()
    try:
        html = al(INC_BASE + "music.html")
    except Exception as e:
        kesif.append({"url": INC_BASE + "music.html", "hata": type(e).__name__}); return cikti
    kesif.append({"url": INC_BASE + "music.html", "bayt": len(html)})
    cikti.append((INC_BASE + "music.html", html))
    sira = inc_kaynak_adaylari(html, ek=ek)
    while sira and len(gorulen) < 40:
        u = sira.pop(0)
        if u in gorulen: continue
        gorulen.add(u)
        try:
            metin = al(u)
        except Exception as e:
            kesif.append({"url": u, "hata": getattr(e, "code", type(e).__name__)}); continue
        kesif.append({"url": u, "bayt": len(metin), "by4_isareti": len(LISANS_BY4.findall(metin)), "ornek": re.sub(r"\s+", " ", metin[:200])})
        cikti.append((u, metin))
        if len(gorulen) < 20:
            sira += [x for x in inc_kaynak_adaylari(metin, taban=u) if x not in gorulen and x not in sira][:10]
    return cikti


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", str(s).casefold())


YASAK_ISARET = re.compile(r"\bby[ _-]?(nc|nd|sa)\b|non[- ]?commercial|no[- ]?derivs?|all rights reserved", re.I)


def inc_kayitlari(kaynaklar):
    """Resmi listeden (JSON) parça kayıtları: [{'title','filename',...}]. Dönüş [(url, [kayit])]."""
    out = []
    for url, metin in kaynaklar:
        try:
            v = json.loads(metin)
        except ValueError:
            continue
        if isinstance(v, dict):
            v = next((x for x in v.values() if isinstance(x, list)), [])
        k = [x for x in v if isinstance(x, dict) and "title" in x]
        if k: out.append((url, k))
    return out


def inc_kayit_bul(baslik, kayitlar):
    """Başlık ya da dosya adı (normalize, tam eşleşme) → (liste_url, kayit, None); yoksa (None, None, yakın başlıklar)."""
    import difflib
    hedef, tum = norm(baslik), []
    for url, liste in kayitlar:
        for k in liste:
            ad = str(k.get("title", ""))
            tum.append(ad)
            if norm(ad) == hedef or norm(re.sub(r"\.mp3$", "", str(k.get("filename", "")), flags=re.I)) == hedef:
                return url, k, None
    return None, None, difflib.get_close_matches(baslik, tum, n=3, cutoff=0.6)


def inc_lisans_sayfasi_adresi(music_html):
    """Resmi lisans sayfası adresi: music.html'in kendi bağlantısından (…/licenses/); bulunamazsa None (adres uydurulmaz)."""
    from urllib.parse import urljoin
    for m in re.finditer(r"""href=["']([^"']*licenses/?)["']""", music_html, re.I):
        tam = urljoin(INC_BASE, m.group(1))
        if urlparse(tam).hostname == "incompetech.com":
            return tam
    return None


def inc_site_lisansi(music_html, al=None, simdi=None):
    """Site düzeyi lisans kanıtı: resmi lisans sayfası indirilir, 'Creative Commons: By Attribution 4.0' doğrulanır.
    Dönüş ({url, sha256, cekildi, alinti}, '') ya da (None, neden)."""
    al = al or sayfa_buyuk
    url = inc_lisans_sayfasi_adresi(music_html)
    if not url: return None, "lisans_sayfasi_adresi_yok"
    try:
        metin = al(url)
    except Exception as e:
        return None, f"lisans_sayfasi_alinamadi_{getattr(e, 'code', type(e).__name__)}"
    m = re.search(r"Creative Commons:?\s*By Attribution 4\.0[^<]{0,80}", metin, re.I)
    if not m: return None, "lisans_sayfasinda_by4_yok"
    return {"url": url, "sha256": hashlib.sha256(metin.encode("utf-8")).hexdigest(),
            "cekildi": simdi or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "alinti": re.sub(r"\s+", " ", m.group(0)).strip()}, ""


RUH_SIRASI = ["sakin", "neseli", "romantik", "enerjik", "nostaljik", "doga", "sehir", "gece"]


def ruh_turet(kayit, kural, varsayilan):
    """Resmi kayıttaki feel/instruments/bpm → ruh halleri (eşleme tablosu katalogdaki 'etiket_kurallari'). Eşik üstü en çok N ruh;
    hiçbiri eşiği geçmezse en yüksek puanlı tek ruh; hiç puan yoksa varsayılan (ön etiket) kalır."""
    puan = {}
    for alan, tablo in (("feel", kural["feel"]), ("instruments", kural["instruments"])):
        for w in str(kayit.get(alan) or "").split(","):
            for r, v in tablo.get(w.strip(), {}).items():
                puan[r] = puan.get(r, 0) + v
    try:
        bpm = int(float(kayit.get("bpm")))
        if bpm <= kural["yavas_bpm"]: puan["sakin"] = puan.get("sakin", 0) + kural["bpm_puan"]
        elif bpm >= kural["hizli_bpm"]: puan["enerjik"] = puan.get("enerjik", 0) + kural["bpm_puan"]
    except (TypeError, ValueError):
        pass
    sirali = sorted(puan.items(), key=lambda kv: (-kv[1], RUH_SIRASI.index(kv[0])))
    sec = [r for r, v in sirali if v >= kural["esik"]][:kural["en_cok"]]
    if not sec and sirali and sirali[0][1] > 0: sec = [sirali[0][0]]
    return sec or list(varsayilan)


def kategoriler_icin(ruh, kategori_ruh):
    """Ruh hallerine uyan mekân kategorileri: kategorinin ilk ruhu seçilenlerde, ya da birincil ruh kategorinin ilk ikisinden biri."""
    return sorted(c for c, r in kategori_ruh.items() if r[0] in ruh or (ruh and ruh[0] in r[:2]))


# ---- Wikimedia Commons (resmi API) ----
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
UA_COMMONS = "YuMapAI-muzik-cek/1.0 (https://github.com/gkhnocak-dot/yumapai-web; tek seferlik)"
LISANS_URL = {"cc0": "https://creativecommons.org/publicdomain/zero/1.0/", "pdm": "https://creativecommons.org/publicdomain/mark/1.0/",
              "cc_by_4": "https://creativecommons.org/licenses/by/4.0/"}
PD_KAYIT_SABLONU = re.compile(r"\{\{\s*(pd-self|pd-author|pd-usgov[a-z-]*|pd-us[a-z0-9-]*|pd-release|pd-ineligible[a-z-]*|pd-because|pd-1923[a-z-]*|pd-record[a-z-]*|pd-anon-[a-z0-9-]*)\b", re.I)
YASAK_SABLON = re.compile(r"cc-by-sa|cc-by-nc|cc-by-nd|cc-sa|cc-nc|gfdl|\bby-sa\b|\bby-nc\b", re.I)


def commons_api(**p):
    p.update(format="json", formatversion="2")
    url = COMMONS_API + "?" + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA_COMMONS}), timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 3: raise
            time.sleep(15 * (i + 1))


def html_metin(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(s or ""))).strip()


def commons_bilgi(dosya, api=None):
    """Dosya sayfası: (imageinfo, wikitext, sayfa_url) ya da ValueError."""
    r = (api or commons_api)(action="query", titles=dosya, prop="imageinfo|revisions", iiprop="url|size|mime|mediatype|extmetadata", rvprop="content", rvslots="main")
    sayfa = (r.get("query", {}).get("pages") or [{}])[0]
    if sayfa.get("missing") or not sayfa.get("imageinfo"): raise ValueError("commons_dosya_yok")
    ii = sayfa["imageinfo"][0]
    wt = ((sayfa.get("revisions") or [{}])[0].get("slots", {}).get("main", {}).get("content")) or ""
    return ii, wt


def commons_lisans(ii, wikitext, izinli):
    """Dönüş (kayit_alanlari, '') ya da (None, neden). Lisans yalnız CC0 / Public domain / CC BY 4.0; SA/NC/ND/GFDL yok;
    PD'de kaydı kapsayan PD şablonu (pd-old tek başına yetmez); sanatçı/kaydeden boş olamaz; ses dosyası; upload.wikimedia.org adresi."""
    em = ii.get("extmetadata") or {}
    kisa = (em.get("LicenseShortName") or {}).get("value", "")
    if ii.get("mediatype") != "AUDIO": return None, "commons_ses_degil"
    if kisa not in izinli: return None, f"commons_lisans_izinli_degil:{kisa or 'yok'}"
    terms = " ".join((em.get(k) or {}).get("value", "") for k in ("UsageTerms", "LicenseShortName", "License"))
    if YASAK_SABLON.search(wikitext) or re.search(r"\b(SA|NC|ND)\b", terms): return None, "commons_yasak_lisans_sablonu"
    if kisa == "Public domain" and not PD_KAYIT_SABLONU.search(wikitext): return None, "commons_pd_kayit_sablonu_yok"
    sanatci = html_metin((em.get("Artist") or {}).get("value"))
    if not sanatci: return None, "commons_sanatci_yok"
    if urlparse(ii.get("url", "")).hostname != "upload.wikimedia.org": return None, "commons_adres_resmi_degil"
    return {"kisa": kisa, "kod": izinli[kisa], "sanatci": sanatci[:150], "terms": terms[:200], "indirme": ii["url"], "sayfa": ii.get("descriptionurl", ""),
            "bayt": ii.get("size", 0)}, ""


def sayfa_buyuk(url):
    istek = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(istek, timeout=60) as r:
        return r.read(8_000_000).decode("utf-8", "replace")


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
    if not (shutil.which("ffmpeg") and shutil.which("ffprobe")):
        print("HATA: ffmpeg/ffprobe yok (apt-get install -y ffmpeg)"); return 3
    os.makedirs(os.path.join(a.cikti, "dosyalar"), exist_ok=True)
    tmp = os.path.join(a.cikti, "_ham"); os.makedirs(tmp, exist_ok=True)
    adlar, kayit, atlanan, durum = kat["lisans_adlari"], [], [], {}
    inc_liste, kesif, inc_kayit_listesi, site_lisans, site_neden = None, [], [], None, ""
    for n, p in enumerate(kat["parcalar"]):
        if a.sinir and n >= a.sinir: break
        i = p["id"]
        try:
            ham = os.path.join(tmp, i + ".bin")
            kanit, indirme, ruhlar, kategoriler = None, p["indirme_url"], p["ruh"], p.get("kategoriler", [])
            if p["kaynak"] == "incompetech":
                if inc_liste is None:
                    inc_liste = inc_kaynaklari_yukle(ek=kat["kaynaklar"]["incompetech"].get("resmi_liste_urlleri", []), kesif=kesif)
                    inc_kayit_listesi = inc_kayitlari(inc_liste)
                    site_lisans, site_neden = inc_site_lisansi(inc_liste[0][1] if inc_liste else "")
                    kesif.append({"site_lisansi": site_lisans, "neden": site_neden})
                if not site_lisans: raise ValueError(site_neden)
                liste_url, kay, yakin = inc_kayit_bul(p["baslik"], inc_kayit_listesi)
                if not kay: raise ValueError("resmi_kayit_bulunamadi" + (":yakin=" + "|".join(yakin) if yakin else ""))
                if YASAK_ISARET.search(json.dumps(kay, ensure_ascii=False)) or YASAK_CC.search(json.dumps(kay)): raise ValueError("resmi_kayitta_yasak_isaret")
                if kay.get("filename"): indirme = INC_BASE + "mp3-royaltyfree/" + urllib.parse.quote(str(kay["filename"]))
                ruhlar = ruh_turet(kay, kat["etiket_kurallari"], p["ruh"]) if kat.get("etiket_kurallari") else p["ruh"]
                kategoriler = kategoriler_icin(ruhlar, kat["kategori_ruh"])
                kanit = {"tur": "resmi_liste+site_lisansi", "liste_url": liste_url, "kayit": {k: kay[k] for k in list(kay)[:12]}, "site_lisansi": site_lisans}
            if n: time.sleep(SIRA_BEKLEME)
            son = indir(indirme, ham)
            if urlparse(son).scheme != "https": raise ValueError("https_degil")
            etiket, sure = ffprobe(ham)
            kaynak_sayfa = p["kaynak_sayfa_url"]
            if p["kaynak"] == "incompetech":
                if YASAK_ISARET.search(" ".join(str(v) for v in etiket.values())) or YASAK_CC.search(" ".join(str(v) for v in etiket.values())):
                    raise ValueError("mp3_etiketinde_yasak_isaret")
                isrc = (etiket_lisansi(etiket)[2] or (kay.get("isrc") if re.fullmatch(r"[A-Z]{2}[A-Z0-9]{3}\d{7}", str(kay.get("isrc", ""))) else None))
                if isrc: kaynak_sayfa = f"https://incompetech.com/music/royalty-free/index.html?isrc={isrc}"
            else:
                tamam, neden = sayfa_lisansi(sayfa_al(p["kaynak_sayfa_url"]), p["lisans_url"])
                if not tamam: raise ValueError(neden)
                kanit = {"tur": "kaynak_sayfasi", "url": p["kaynak_sayfa_url"]}
            if not (MIN_SN <= sure <= MAX_SN): raise ValueError(f"sure_uygun_degil_{int(sure)}")
            yol = f"{i}.mp3"; cikis = os.path.join(a.cikti, "dosyalar", yol)
            kodla128(ham, cikis)
            _, sure2 = ffprobe(cikis)
            k = {"id": i, "uuid": uuid_kimlikten(i), "title": p["baslik"], "artist": p["sanatci"], "license_code": p["lisans_kodu"],
                 "license_url": p["lisans_url"], "source_url": kaynak_sayfa, "storage_path": yol, "duration_s": int(round(sure2)),
                 "sha256_ham": sha256(ham), "sha256": sha256(cikis), "bayt": os.path.getsize(cikis), "indirme_url": indirme, "lisans_kanit": kanit,
                 "cekildi": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "moods": ruhlar, "categories": kategoriler,
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
    cm = kat.get("commons") or {}
    for n, p in enumerate(cm.get("parcalar", [])):
        i = p["id"]
        try:
            ii, wt = commons_bilgi(p["dosya"])
            c, neden = commons_lisans(ii, wt, cm["izinli"])
            if not c: raise ValueError(neden)
            if c["bayt"] > 60 * 1024 * 1024: raise ValueError("cok_buyuk")
            ham = os.path.join(tmp, i + ".bin")
            time.sleep(max(SIRA_BEKLEME, 2.0))
            indir(c["indirme"], ham)
            _, sure = ffprobe(ham)
            if not (MIN_SN <= sure <= MAX_SN): raise ValueError(f"sure_uygun_degil_{int(sure)}")
            yol = f"{i}.mp3"; cikis = os.path.join(a.cikti, "dosyalar", yol)
            kodla128(ham, cikis)
            _, sure2 = ffprobe(cikis)
            lurl = LISANS_URL[c["kod"]]
            ruhlar = cm["tema_ruh"][p["tema"]]
            atif = (f"“{p['baslik']}” — {c['sanatci']}; Wikimedia Commons ({c['sayfa']}). Lisans: {adlar[c['kod']]} ({lurl}). "
                    "Değişiklik: 128 kbps MP3'e dönüştürüldü; hikâyede kısaltılmış bölüm çalınır.")
            k = {"id": i, "uuid": uuid_kimlikten(i), "title": p["baslik"][:200], "artist": c["sanatci"], "license_code": c["kod"], "license_url": lurl,
                 "source_url": c["sayfa"], "storage_path": yol, "duration_s": int(round(sure2)), "sha256_ham": sha256(ham), "sha256": sha256(cikis),
                 "bayt": os.path.getsize(cikis), "indirme_url": c["indirme"],
                 "lisans_kanit": {"tur": "commons_api", "sayfa": c["sayfa"], "lisans": c["kisa"], "kosullar": c["terms"]},
                 "cekildi": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "moods": ruhlar, "categories": kategoriler_icin(ruhlar, kat["kategori_ruh"]),
                 "attribution_text": atif}
            k["yukleme"] = yukle_storage(cikis, yol, durum)
            kayit.append(k)
            print(f"TAMAM {i} {k['duration_s']}s {k['bayt']}B {k['yukleme']}", flush=True)
        except Exception as e:
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
    rapor.append("- Incompetech resmi liste keşfi (" + str(len(kesif)) + " adres): " + json.dumps(kesif, ensure_ascii=False)[:3000])
    try:
        ad = json.load(open(a.aday_durum, encoding="utf-8"))
        kay = ad.get("kaynaklar_stats") or []
        rapor.append(f"- Openverse ses kaynakları: {kay}; FMA/Musopen yok: {not any(k in ('freemusicarchive', 'musopen') for k in kay)}; hata sayısı: {len(ad.get('hatalar', []))}")
    except Exception:
        rapor.append("- Openverse durumu okunamadı (muzik_aday_durum.json yok)")
    json.dump(kesif, open(os.path.join(a.cikti, "incompetech_kesif.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(a.cikti, "rapor.md"), "w", encoding="utf-8").write("\n".join(rapor) + "\n")
    print("\n".join(rapor))
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--katalog", default="muzik/muzik_katalog.json")
    ap.add_argument("--cikti", default="muzik_cikti")
    ap.add_argument("--sinir", type=int, default=0)
    ap.add_argument("--aday-durum", dest="aday_durum", default="muzik_aday_durum.json")
    sys.exit(calis(ap.parse_args()))
