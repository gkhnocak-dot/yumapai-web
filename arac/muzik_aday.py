#!/usr/bin/env python3
"""FMA/Musopen aday listesi: Openverse RESMİ API'si (anahtarsız, düşük hız). İndirme YOK, kazıma YOK.
Yalnız lisansı by / cc0 / pdm olan sesleri listeler; çıktı aday.json (parça başına kaynak sayfa, lisans adresi, sanatçı, süre).
Seçim ve 'bagimsiz_sanatci_dogrulandi' kararı insanındır (MESAM/MSG üyeliği belirsizse alınmaz); katalog buradan otomatik dolmaz."""
import json, sys, time, urllib.parse, urllib.request
UA = "YuMapAI-muzik-aday/1.0 (tek seferlik)"
KAYNAK = ["freemusicarchive", "musopen"]
SORGU = ["ambient", "acoustic", "piano", "guitar", "travel", "calm", "happy", "cinematic", "folk", "jazz", "night", "nature"]
cikti = sys.argv[1] if len(sys.argv) > 1 else "aday.json"
gor, out = set(), []
for k in KAYNAK:
    for q in SORGU:
        u = "https://api.openverse.org/v1/audio/?" + urllib.parse.urlencode({"source": k, "license": "by,cc0,pdm", "q": q, "page_size": 20, "category": "music"})
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=60))
        except Exception as e:
            print("HATA", k, q, type(e).__name__); time.sleep(5); continue
        for x in r.get("results", []):
            if x["id"] in gor or x.get("license") not in ("by", "cc0", "pdm") or x.get("license_version") not in ("4.0", "1.0"): continue
            gor.add(x["id"])
            out.append({"kaynak": k, "baslik": x.get("title"), "sanatci": x.get("creator"), "lisans": x.get("license"), "surum": x.get("license_version"),
                        "lisans_url": x.get("license_url"), "kaynak_sayfa_url": x.get("foreign_landing_url"), "indirme_url": x.get("url"),
                        "sure_sn": (x.get("duration") or 0) // 1000, "turler": x.get("genres"), "openverse_id": x["id"]})
        time.sleep(3)
json.dump(out, open(cikti, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("aday:", len(out))
