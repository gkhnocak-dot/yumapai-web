# Tek seferlik: Overture Places'ten Türkiye etkinlik türleri (18.11.2026, Reis onayı). Çıktı: etkinlik_tr.csv + etkinlik_kodlar.csv
import duckdb, re, subprocess, csv, sys
rel = sorted([l.split()[-1].strip('/') for l in subprocess.run(['aws','s3','ls','--no-sign-request','s3://overturemaps-us-west-2/release/'],capture_output=True,text=True).stdout.splitlines() if l.strip().startswith('PRE')])[-1]
print('release', rel)
con = duckdb.connect(); con.execute("install httpfs; load httpfs; set s3_region='us-west-2';")
src = f"read_parquet('s3://overturemaps-us-west-2/release/{rel}/theme=places/type=place/*', hive_partitioning=1)"
cols = [r[0] for r in con.execute(f"describe select * from {src} limit 0").fetchall()]
print('cols', cols)
pri = "taxonomy.primary" if 'taxonomy' in cols else "categories.primary"
hier = "array_to_string(taxonomy.hierarchy,'>')" if 'taxonomy' in cols else "''"
rx = r'(bowl|escape|laser_tag|virtual_reality|mini_?golf|miniature_golf|karaoke|paintball|go_?kart|karting|climbing|bouldering|trampoline|skating|ice_rink|horse|equestrian|riding|shooting|archery|cinema|movie_theat|theat|concert|music_venue|performing_arts|opera|comedy|pottery|ceramic|art_class|art_school|cooking_class|cooking_school|workshop|paraglid|hang_glid|skydiv|scuba|diving|snorkel|raft|kayak|canoe|ski_|skiing|ski$|boat_tour|boat_rental|sailing|yacht_charter|balloon|hammam|turkish_bath|public_bath|hot_spring|thermal|spa$|day_spa|aquarium|zoo|wildlife|safari|water_park|amusement|theme_park|billiard|pool_hall|snooker|arcade|planetarium|zip_?line|adventure|surf|jet_ski|cable_car|tour_operator|escape_room|game_room|axe_throw|dance_hall|farm_stay|petting)'
q = f"""select id, names.primary nm, {pri} oc, {hier} th, confidence conf,
  st_y(st_centroid(geometry)) lat, st_x(st_centroid(geometry)) lon,
  addresses[1].freeform addr, addresses[1].country ctry,
  array_to_string(list_transform(sources, x -> x.dataset), '|') ds, list_transform(sources, x -> x.license) lic
 from {src}
 where bbox.xmin between 25.5 and 45.0 and bbox.ymin between 35.7 and 42.3
   and coalesce(addresses[1].country,'TR') = 'TR' and names.primary is not null and confidence >= 0.5
   and regexp_matches({pri}, '{rx}')"""
con.execute("install spatial; load spatial;")
rows = con.execute(q).fetchall()
print('satir', len(rows))
def lic(l):
    l = [x for x in (l or []) if x]
    if any('Apache' in x for x in l): return 'Apache-2.0|CDLA-Permissive-2.0' if any('CDLA' in x for x in l) else 'Apache-2.0'
    if l and all('CC0' in x for x in l): return 'CC0-1.0'
    return 'CDLA-Permissive-2.0'
kod = {}
with open('etkinlik_tr.csv','w',newline='') as f:
    w = csv.writer(f, lineterminator='\n')
    w.writerow(['sourceRecordId','name','category','lat','lon','address','district','licence','overtureDatasets','originalCategory','taxonomyHierarchy','confidence'])
    for r in rows:
        w.writerow([r[0], r[1], 'ACTIVITY', round(r[5],6), round(r[6],6), r[7] or '', '', lic(r[10]), 'Overture|'+(r[9] or ''), r[2], r[3] or '', round(r[4],3)])
        kod[r[2]] = kod.get(r[2],0)+1
with open('etkinlik_kodlar.csv','w',newline='') as f:
    w = csv.writer(f, lineterminator='\n'); w.writerow(['kod','sayi'])
    for k,n in sorted(kod.items(), key=lambda x:-x[1]): w.writerow([k,n])
open('etkinlik_surum.txt','w').write(rel+'\n')
