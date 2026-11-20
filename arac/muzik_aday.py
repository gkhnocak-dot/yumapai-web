#!/usr/bin/env python3
"""FMA/Musopen aday listesi: Openverse RESMİ API'si (anahtarsız, düşük hız). İndirme YOK, kazıma YOK.
Önce /v1/audio/stats/ ile gerçekten bulunan ses kaynakları listelenir (kaynak adı tahmin edilmez); yalnız FMA/Musopen benzeri
istenen kaynaklar sorgulanır. Lisansı by / cc0 / pdm (sürüm 4.0 / 1.0) olanlar alınır. Çıktı aday.json + kaynak_durumu.json (hata kodu/gövdesi dahil).
Seçim ve 'bagimsiz_sanatci_dogrulandi' kararı insanındır (MESAM/MSG üyeliği belirsizse alınmaz); katalog buradan otomatik dolmaz."""
import json, sys, time, urllib.error, urllib.parse, urllib.request
UA = "YuMapAI-muzik-aday/1.0 (tek seferlik)"
ISTENEN = ("freemusicarchive", "free_music_archive", "fma", "musopen")
SORGU = ["ambient", "acoustic", "piano", "guitar", "travel", "calm", "happy", "cinematic", "folk", "jazz", "night", "nature"]
cikti = sys.argv[1] if len(sys.argv) > 1 else "aday.json"
durum = {"hatalar": [], "kaynaklar_stats": None}


def al(url, deneme=3):
    for i in range(deneme):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"}), timeout=60))
        except urllib.error.HTTPError as e:
            govde = e.read(300).decode("utf-8", "replace")
            durum["hatalar"].append({"url": url, "kod": e.code, "govde": govde})
            if e.code == 429 and i < deneme - 1:
                time.sleep(20 * (i + 1)); continue
            return None
        except Exception as e:
            durum["hatalar"].append({"url": url, "tur": type(e).__name__})
            return None


stats = al("https://api.openverse.org/v1/audio/stats/")
mevcut = [x.get("source_name") for x in (stats or [])]
durum["kaynaklar_stats"] = mevcut
print("Openverse ses kaynakları:", mevcut)
kaynaklar = [k for k in mevcut if k and k.lower() in ISTENEN]
out, gor = [], set()
for k in kaynaklar:
    for q in SORGU:
        r = al("https://api.openverse.org/v1/audio/?" + urllib.parse.urlencode({"source": k, "license": "by,cc0,pdm", "q": q, "page_size": 20}))
        time.sleep(3)
        for x in (r or {}).get("results", []):
            if x["id"] in gor or x.get("license") not in ("by", "cc0", "pdm") or x.get("license_version") not in ("4.0", "1.0"): continue
            gor.add(x["id"])
            out.append({"kaynak": k, "baslik": x.get("title"), "sanatci": x.get("creator"), "lisans": x.get("license"), "surum": x.get("license_version"),
                        "lisans_url": x.get("license_url"), "kaynak_sayfa_url": x.get("foreign_landing_url"), "indirme_url": x.get("url"),
                        "sure_sn": (x.get("duration") or 0) // 1000, "turler": x.get("genres"), "openverse_id": x["id"]})
json.dump(out, open(cikti, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(durum, open(cikti.replace(".json", "_durum.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("aday:", len(out), "hata:", len(durum["hatalar"]), "istenen kaynak bulundu:", kaynaklar)
