import json,sys,torch,urllib.request
from PIL import Image
from transformers import CLIPModel,CLIPProcessor,AutoModel,AutoProcessor
P=json.load(open('prompts.json'))
man=json.load(open('manifest.json'))
MODELS=[("openai/clip-vit-base-patch32","clip"),("google/siglip-base-patch16-224","siglip")]
out={"lisans":{},"skor":{}}
for mid,kind in MODELS:
    try:
        card=json.load(urllib.request.urlopen(f"https://huggingface.co/api/models/{mid}"))
        out["lisans"][mid]=(card.get("cardData") or {}).get("license") or [t for t in card.get("tags",[]) if t.startswith("license:")]
    except Exception as e: out["lisans"][mid]=f"okunamadi {e}"
    model=AutoModel.from_pretrained(mid).eval(); proc=AutoProcessor.from_pretrained(mid)
    texts=[t for _,t in P]
    sk={}
    for m in man:
        im=Image.open(f"img/{m['h']}.jpg").convert("RGB")
        kw=dict(padding="max_length",max_length=64) if kind=="siglip" else dict(padding=True)
        inp=proc(text=texts,images=im,return_tensors="pt",**kw)
        with torch.no_grad(): lg=model(**inp).logits_per_image[0]
        sk[m['h']]=lg.tolist()
    out["skor"][mid]=sk
    print(mid,"tamam",flush=True)
json.dump(out,open("skor.json","w"))
