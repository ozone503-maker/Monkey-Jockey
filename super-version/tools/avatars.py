from PIL import Image, ImageFilter
import numpy as np, json, sys
# per rider: (size as fraction of figure height, top offset as fraction of figure height, x-centre shift fraction of size)
P = {
 'ipo':                 (0.50, -0.02, 0.0),
 'erv':                 (0.52, -0.02, 0.0),
 'fonk':                (0.62, -0.02, 0.0),
 'monkey_jockey':       (0.52, -0.02, 0.0),
 'mystery_drone_pilot': (0.66, -0.02, 0.0),
 'nonna':               (0.52, -0.03, 0.0),
 'dinny':               (0.50, -0.02, 0.0),
 'shockbot':            (0.45, -0.02, 0.0),
}
if len(sys.argv)>1: P.update(json.loads(sys.argv[1]))
# backdrop sampled from the canonical dog portraits (light-blue school picture)
dog=np.asarray(Image.open('dogs/penny.png').convert('RGB')).astype(float)
c_top=dog[5:40,5:60].reshape(-1,3).mean(0); c_mid=dog[200:260,5:40].reshape(-1,3).mean(0)
def backdrop(S):
    y,x=np.mgrid[0:S,0:S]/S
    r=np.sqrt((x-.5)**2+(y-.42)**2)
    t=np.clip(r/0.75,0,1)[...,None]
    col=c_top*(1-t)*0+ (np.array([225,240,252])*(1-t)+c_mid*t)
    return Image.fromarray(col.astype(np.uint8),'RGB').convert('RGBA')
out={}
tiles=[]
for n,(sz,top,sh) in P.items():
    src='/workspace/monkey-jockey/art/shockbot_gate1_preview_v2.png' if n=='shockbot' else f'k_{n}.png'
    im=Image.open(src).convert('RGBA'); a=np.asarray(im)[...,3]
    ys,xs=np.where(a>20); y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max(); H=y1-y0
    band=a[y0:y0+int(H*0.22)]>20; bx=np.where(band.any(0))[0]; cx=(bx.min()+bx.max())/2
    S=int(H*sz); L=int(cx-S/2+sh*S); T=int(y0+top*H)
    crop=Image.new('RGBA',(S,S),(0,0,0,0)); crop.alpha_composite(im.crop((L,T,L+S,T+S)).convert('RGBA'),(0,0)) if L>=0 and T>=0 else crop.paste(im.crop((L,T,L+S,T+S)),(0,0))
    crop=crop.resize((256,256),Image.LANCZOS)
    bg=backdrop(256)
    # soft shadow for depth
    sh_a=crop.getchannel('A').filter(ImageFilter.GaussianBlur(6)).point(lambda v:int(v*.35))
    shadow=Image.new('RGBA',(256,256),(16,42,92,0)); shadow.putalpha(sh_a)
    bg.alpha_composite(shadow,(0,4)); bg.alpha_composite(crop)
    name=n.replace('_','-')
    bg.convert('RGB').save(f'av_{name}.png'); tiles.append(bg.convert('RGB'))
sheet=Image.new('RGB',(256*4,256*2))
for i,t in enumerate(tiles): sheet.paste(t,((i%4)*256,(i//4)*256))
sheet.save('avatars_sheet.jpg',quality=85)
