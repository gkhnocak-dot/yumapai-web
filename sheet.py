import sys,os,time,urllib.parse,urllib.request,hashlib
from PIL import Image,ImageDraw
rows=[l.rstrip('\n').split('|') for l in open('c.txt',encoding='utf8') if l.strip()]
os.makedirs('out/kucuk',exist_ok=True)
def get(d):
    u="https://commons.wikimedia.org/wiki/Special:FilePath/"+urllib.parse.quote(d.replace(' ','_'))+"?width=480"
    p='out/kucuk/'+hashlib.md5(d.encode()).hexdigest()[:12]+'.jpg'
    if os.path.exists(p): return p
    for i in range(6):
        try:
            req=urllib.request.Request(u,headers={"User-Agent":"YuMapAI-photo-import/1.0 (https://yumapai.com)"})
            open(p,'wb').write(urllib.request.urlopen(req,timeout=60).read()); return p
        except Exception as e: time.sleep(8*(i+1))
    return None
W,H=330,250;N=16
paths=[]
for i,(aid,yer,d) in enumerate(rows,1):
    paths.append(get(d)); time.sleep(1.2)
for s in range(0,len(rows),N):
    im=Image.new('RGB',(W*4,H*4),'white');dr=ImageDraw.Draw(im)
    for j in range(s,min(s+N,len(rows))):
        k=j-s;cx,cy=(k%4)*W,(k//4)*H
        if paths[j]:
            try:
                t=Image.open(paths[j]).convert('RGB');t.thumbnail((W-4,H-24));im.paste(t,(cx+2,cy+22))
            except Exception: pass
        dr.text((cx+3,cy+3),f"{j+1} {rows[j][1][:44]}",fill='black')
    im.save(f'out/sheet{s//N+1}.png')
open('out/indeks.tsv','w',encoding='utf8').write('\n'.join(f"{i}\t{r[0]}\t{r[1]}\t{'ok' if paths[i-1] else 'INMEDI'}" for i,r in enumerate(rows,1)))
