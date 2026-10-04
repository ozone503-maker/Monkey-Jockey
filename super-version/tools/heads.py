from PIL import Image
import numpy as np
P={'ipo':.47,'erv':.42,'fonk':.50,'monkey_jockey':.46,'mystery_drone_pilot':.60,'nonna':.47,'dinny':.40,'shockbot':.36}
tiles=[]
for n,sz in P.items():
    src='/workspace/monkey-jockey/art/shockbot_gate1_preview_v2.png' if n=='shockbot' else f'k_{n}.png'
    im=Image.open(src).convert('RGBA'); a=np.asarray(im)[...,3]
    ys,xs=np.where(a>20); y0,y1=ys.min(),ys.max(); H=y1-y0
    band=a[y0:y0+int(H*0.2)]>20; bx=np.where(band.any(0))[0]; cx=(bx.min()+bx.max())/2
    S=int(H*sz); L=int(cx-S/2); T=int(y0-0.01*H)
    c=Image.new('RGBA',(S,S)); c.alpha_composite(im.crop((max(0,L),max(0,T),L+S,T+S)),(max(0,-L),max(0,-T)))
    c=c.resize((128,128),Image.LANCZOS); c.save(f'head_{n.replace("_","-")}.png')
    bg=Image.new('RGBA',(128,128),(40,120,60,255)); bg.alpha_composite(c); tiles.append(bg)
sheet=Image.new('RGB',(128*8,128))
for i,t in enumerate(tiles): sheet.paste(t.convert('RGB'),(i*128,0))
sheet.save('heads_sheet_b.jpg')
