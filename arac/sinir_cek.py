# Tek seferlik: Overture divisions/division_area'dan Türkiye il (region) + ilçe (county) sınırları (20.11.2026, Reis onayı).
# Lisans: ODbL 1.0 (© OpenStreetMap katkıcıları, Overture Maps Foundation). Yalnız KANIT katmanı; kanonik veri değildir.
# Çıktı: sinir/ozet.txt, sinir/sinir_NN.tsv (overture_id, tur, subtype, admin_level, ad, ad_tr, il_id, il_ad, sinif, kaynaklar, wkt)
import duckdb, subprocess, csv, os, json
rel = sorted([l.split()[-1].strip('/') for l in subprocess.run(['aws','s3','ls','--no-sign-request','s3://overturemaps-us-west-2/release/'],capture_output=True,text=True).stdout.splitlines() if l.strip().startswith('PRE')])[-1]
print('release', rel)
con = duckdb.connect(); con.execute("install httpfs; load httpfs; install spatial; load spatial; set s3_region='us-west-2';")
base = f"s3://overturemaps-us-west-2/release/{rel}/theme=divisions"
A = f"read_parquet('{base}/type=division_area/*', hive_partitioning=1)"
D = f"read_parquet('{base}/type=division/*', hive_partitioning=1)"
acols = [r[0] for r in con.execute(f"describe select * from {A} limit 0").fetchall()]
dcols = [r[0] for r in con.execute(f"describe select * from {D} limit 0").fetchall()]
print('area cols', acols); print('div cols', dcols)
con.execute(f"create table a as select * from {A} where country='TR'")
con.execute(f"create table d as select * from {D} where country='TR'")
ozet = [f'release {rel}']
for r in con.execute("select subtype, " + ("class" if 'class' in acols else "'?'") + ", count(*) from a group by all order by all").fetchall():
    ozet.append(f'division_area {r}')
for r in con.execute("select subtype, " + ("admin_level" if 'admin_level' in dcols else "null") + ", count(*) from d group by all order by all").fetchall():
    ozet.append(f'division {r}')
land = "a.class = 'land'" if 'class' in acols else "coalesce(a.is_land, true)"
trn = "coalesce(d.names.common['tr'], null)"
try:
    con.execute(f"select {trn} from d limit 1").fetchall()
except Exception as e:
    print('names.common tr yok', e); trn = "null"
# il kimliği: hiyerarşide region; yoksa ebeveyn
hier = "list_filter(d.hierarchies[1], x -> x.subtype = 'region')[1]" if 'hierarchies' in dcols else "null"
q = f"""
select a.id, a.subtype, {('a.admin_level' if 'admin_level' in acols else 'null')} admin_level,
  coalesce(a.names.primary, d.names.primary) ad, {trn} ad_tr,
  case when a.subtype='region' then a.division_id else coalesce({hier}.division_id, d.parent_division_id) end il_id,
  {('a.class' if 'class' in acols else "'land'")} sinif,
  array_to_string(list_transform(a.sources, x -> coalesce(x.dataset,'') || ':' || coalesce(x.license,'')), '|') kaynaklar,
  st_astext(st_reduceprecision(st_simplifypreservetopology(a.geometry, 0.0005), 0.00001)) wkt,
  a.division_id
from a join d on d.id = a.division_id
where a.subtype in ('region','county') and {land}
order by a.subtype desc, ad"""
rows = con.execute(q).fetchall()
ilad = {r[9]: r[3] for r in rows if r[1] == 'region'}
ozet.append(f'satir {len(rows)} region={sum(1 for r in rows if r[1]=="region")} county={sum(1 for r in rows if r[1]=="county")}')
ozet.append('kaynak lisans dagilimi ' + json.dumps({k: sum(1 for r in rows if r[7]==k) for k in set(r[7] for r in rows)}, ensure_ascii=False))
os.makedirs('sinir', exist_ok=True)
for f in os.listdir('sinir'): os.remove(os.path.join('sinir', f))
parca, boy, w, fh = 0, 10**9, None, None
for r in rows:
    tur = 'il' if r[1] == 'region' else 'ilce'
    satir = [r[0], tur, r[1], r[2] if r[2] is not None else '', r[3] or '', r[4] or '', r[5] or '', ilad.get(r[5], ''), r[6] or '', r[7] or '', r[8]]
    s = '\t'.join(str(x).replace('\t',' ').replace('\n',' ') for x in satir) + '\n'
    if boy + len(s) > 2_500_000:
        if fh: fh.close()
        parca += 1; fh = open(f'sinir/sinir_{parca:02d}.tsv', 'w'); boy = 0
    fh.write(s); boy += len(s)
fh.close()
ozet.append(f'parca {parca}')
open('sinir/ozet.txt', 'w').write('\n'.join(ozet) + '\n')
print('\n'.join(ozet))
