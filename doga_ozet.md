# Doğal ve ünlü yer eksikleri denetimi (18.11.2026)

Kaynak: yalnız Wikidata (CC0, SPARQL). Canlıya yalnız SELECT yapıldı (yumapai-dev). Google/kazıma yok.

## Sayılar
- Wikidata adayı (Türkiye, koordinatlı, ünlülük süzgecinden geçen, doğa/park sınıfları): **536** (kültür merkezi, hayvanat bahçesi, akvaryum, lunapark vb. sınıflar elenmiş; ham 578).
- Katalogda görünür (ELIGIBLE, aynı QID ya da 1,5 km içinde ad benzerliği): **416**
- Katalogda var ama görünmez (STAGED/SUPPRESSED): **40** (`doga_gorunmeyen.tsv`)
- Katalogda hiç yok: **71** (`wikidata_doga_eksik.csv`); kapsam dışı bırakılan 9 (bölgesel plato/dağ adı, müze, teknoloji vadisi) bunlara dahil değil.

### Eksikler, tür bazında (ilk türe göre)
- park: 34
- yayla: 17
- göl: 10
- tabiat parkı: 9
- mağara: 1

### Eksikler, il bazında (P131 ile; 26 kayıtta P131 yok, en yakın il merkezine göre)
İstanbul 13, Rize 10, İzmir 6, Ankara 5, Kocaeli 4, Antalya 3, Samsun 3, Artvin 3, Kırklareli 2, Konya 2, Adana 2, Sivas 2, Bingöl 1, Mersin 1, Diyarbakır 1, Eskişehir 1, Düzce 1, Gaziantep 1, Hatay 1, Çorum 1, Ordu 1, Osmaniye 1, Trabzon 1, Gümüşhane 1, Bursa 1, Burdur 1, Kütahya 1, Yalova 1

### Görünmeyenler, tür bazında
- göl: 15
- park: 11
- mağara: 7
- şelale: 3
- tabiat parkı: 2
- yayla: 2

### Görünmeyenler, il bazında
Mersin 6, İzmir 6, Antalya 5, İstanbul 4, Kahramanmaraş 2, Aydın 2, Adana 2, Ankara 2, Mardin 1, Bursa 1, Manisa 1, Gümüşhane 1, Kars 1, Adıyaman/Diyarbakır/Şanlıurfa 1, Elazığ/Erzincan/Tunceli 1, Kocaeli 1, Yalova 1, Konya 1, Karaman 1

### Görünmeyenlerin nedeni (private.place_verification_state)
- SOURCE_CATEGORY_UNKNOWN: 18
- OPEN_REVIEW: 9
- SOURCE_CATEGORY_CONFLICT: 7
- NO_STRUCTURED_GEOGRAPHY: 2
- NO_APPROVED_SOURCE: 2
- OPEN_REVIEW;NO_APPROVED_SOURCE: 1
- ELIGIBLE: 1

Baskın neden SOURCE_CATEGORY_UNKNOWN (STAGED/BLOCKED): Atatürk, Keban, Menzelet, Arpaçay baraj gölleri, Akyatan, Beymelek, Haliç, Karagöl (İzmir) gibi ünlü sular kategori kodu tanınmadığı için gizli. DERSLER'deki kural (cpv değişince partili recompute_discovery) bunlara henüz uygulanmamış görünüyor; ayrı, kırmızı hat kararı.

## Çubuk Karagöl'ün durumu
- Wikidata'da yalnız **Q108228185** "Çubuk Karagöl Tabiat Parkı" var: koordinatı (P625) YOK, sitelink 0, trwiki YOK. Bu yüzden ne ünlülük süzgecinden ne de koordinat şartından geçer; süzgeci gevşetmek (sitelinks ≥ 1) çözmez, sorun koordinat eksikliği. Gölün kendi Wikidata öğesi bulunamadı.
- Canlı katalogda: Çubuk ilçesi çevresinde "karagöl" adlı kayıt yok (name_normalized taraması); source_records'ta da yok.
- Depodaki Overture dosyasında (`overture_ankara.csv`, CDLA-Permissive-2.0) iki kayıt var ve ikisi de canlıya yüklenmemiş: `fc65faf9-2398-4b5f-ac90-7144daedbfc4` "Çubuk Karagöl Tabiat Parkı" (40.238125, 33.027733, Çubuk, güven 0,886; doğru konum) ve `546d489e-2581-48f2-ad95-3f8f015a639e` "Çubuk Karagöl" (40.008011, 32.853878, Keçiören olarak işaretli: konum yanlış görünüyor, ~25 km). Çözüm yolu Wikidata değil, ilk kaydın Overture'dan yüklenmesi (neden süzüldüğü ayrıca bakılmalı).
- Not: aynı sebeple Wikidata'sında koordinatı olmayan başka doğa yerleri bu taramaya hiç giremez.

## En ünlü 30 eksik yer (sitelink sayısına göre)
| # | QID | Ad | İl | Tür | Sitelink | trwiki |
|---|---|---|---|---|---|---|
| 1 | Q6048634 | Taksim Gezi Parkı | İstanbul | park | 24 | evet |
| 2 | Q15856901 | Bingöl Dağları | Bingöl | yayla | 11 | evet |
| 3 | Q6067386 | Kültürpark | İzmir | park | 10 | evet |
| 4 | Q4812891 | Atatürk Parkı | Mersin | park | 7 | evet |
| 5 | Q2582947 | Ayder | Rize | yayla | 7 | evet |
| 6 | Q24192239 | Atatürk Arboretumu | İstanbul | park | 6 | evet |
| 7 | Q5626511 | Göksu Parkı | Ankara | park | 5 | evet |
| 8 | Q794826 | Aşıklar Mağarası | Antalya | mağara | 5 | evet |
| 9 | Q6367585 | Karaalioğlu Parkı | Antalya | park | 5 | hayır |
| 10 | Q12277887 | Dervent Tepeleri | Kırklareli | yayla | 4 | hayır |
| 11 | Q20473015 | Kızören Obruğu | Konya | göl | 4 | evet |
| 12 | Q6477616 | Saka Gölü Tabiatı Koruma Alanı | Kırklareli | tabiat parkı | 4 | evet |
| 13 | Q109236619 | Silivri Kalepark | İstanbul | park | 4 | evet |
| 14 | Q6454808 | Aşağıkaraören Göleti | Ankara | göl | 4 | evet |
| 15 | Q108227047 | Haciosman Ormani | Samsun | tabiat parkı | 3 | evet |
| 16 | Q17138662 | Nezahat Gökyiğit Botanik Bahçesi | İstanbul | park | 3 | evet |
| 17 | Q31790695 | Anıt Park | Diyarbakır | park | 3 | evet |
| 18 | Q55594541 | Alfred Heilbronn Botanik Bahçesi | İstanbul | park | 3 | evet |
| 19 | Q6017977 | Sazova Bilim Kültür ve Sanat Parkı | Eskişehir | park | 3 | evet |
| 20 | Q6023921 | Pokut Yaylası | Rize | yayla | 3 | evet |
| 21 | Q6034420 | Ankara Botanik Parkı | Ankara | park | 3 | evet |
| 22 | Q61076266 | Portakal Çiçeği Parkı | Ankara | park | 3 | evet |
| 23 | Q4982337 | Buca Gölet | İzmir | park | 3 | evet |
| 24 | Q105340772 | Ormanya | Kocaeli | park | 2 | evet |
| 25 | Q106889487 | Harikalar Sahili | Kocaeli | park | 2 | evet |
| 26 | Q108228465 | Aydınpınar Şelalesi | Düzce | tabiat parkı | 2 | evet |
| 27 | Q109389737 | 15 Temmuz Millet Bahçesi | İstanbul | park | 2 | evet |
| 28 | Q124978304 | Kamil Ocak Millet Bahçesi | Gaziantep | park | 2 | evet |
| 29 | Q125536856 | Milleyha Sulak Alanı | Hatay | tabiat parkı | 2 | evet |
| 30 | Q135677474 | Atatürk Havalimanı Millet Bahçesi | İstanbul | park | 2 | evet |

Uyarı: Eksik sayısı beklenenden düşük ve liste parklara kayıyor; çünkü doğa sınıflarının çoğu zaten yüklü. Listedeki "Bingöl Dağları" (dağ silsilesi) ve "Ayder" (yayla yerleşimi; katalogda yalnız Ayder Çamlık STAGED ve Ayder Şelalesi var) gibi kayıtlar yüklemeden önce elle bakılmalı.

## Süzgeç ve eşleştirme kararları
- Ünlülük: trwiki makalesi VAR veya sitelinks ≥ 3 (iki ayrı SPARQL, birleştirildi). Gevşetme yapılmadı; Çubuk Karagöl'ün sorunu süzgeç değil veri eksikliği (yukarıda).
- Sınıflar: göl Q23397 (+Q131681, Q3253281, Q187971), şelale Q34038, kanyon Q150784, mağara Q35509, plaj Q40080, yayla Q75520/Q2737336/Q1006733, milli park Q46169, tabiat parkı/koruma Q473972/Q179049/Q759421/Q1329623, park Q22698/Q22746; hepsi wdt:P31/wdt:P279*. Q1329623 (kültür merkezi) ve park altındaki hayvanat bahçesi, akvaryum, lunapark, minyatür park, sanat merkezi, müze gibi tipler elendi.
- Katalogda var sayma: aynı WIKIDATA QID'li source_record, ya da 1,5 km içinde pg_trgm benzerliği ≥ 0,4. Görünür sayma için QID eşleşmesi ya da benzerlik ≥ 0,7 şart; 0,4–0,7 arası eşleşmeler tek tek incelendi (otel, kapı, çeşme, tiyatro, cami gibi farklı nesneler "eksik" sayıldı; Kaputaş Beach, Soğanlı Botanik Parkı, Güvenpark, Maçka Parkı aynı yer sayıldı). Görünmeyen sayılanlardan benzerliği 0,5'in altında ve QID'siz olanlar farklı nesne diye eksik sayıldı.
- İl: Wikidata P131 zinciri (birden çok ise "/" ile); P131 yoksa en yakın il merkezi (geographic_areas merkez noktası, kaba).
- discovery_state değerlerinden yalnız ELIGIBLE görünür sayıldı.

## Açık kalanlar
1. Wikidata'da P17=Türkiye (Q43) etiketi olmayan doğa öğeleri taramaya girmez; P131 üzerinden ikinci bir tarama gerekebilir.
2. Çubuk Karagöl için Overture kaydı yükleme kararı (kırmızı hat).
3. `doga_gorunmeyen.tsv` içindeki 40 kayıt: kategori politikası/recompute kararı (kırmızı hat). Hiçbir yazma yapılmadı.
4. Eksik CSV'sini yüklemeden önce ad çakışması ve park/dağ türü elle gözden geçirilmeli.
