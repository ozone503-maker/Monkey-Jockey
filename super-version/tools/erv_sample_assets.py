"""Build the Erv sample art (Oct 2 2026 reference from Jessie) — no face regeneration.
  full body  : BiRefNet matte of the reference itself            -> assets/riders/erv-full.webp
  portrait   : head crop of the same matte on the tile backdrop   -> assets/faces/riders/erv.webp
  SIDE rider : Canva generation (1 try) of the riding pose from the reference, mirrored to face right,
               BiRefNet matte, then the EXACT reference face pasted over the generated face
               (eye-aligned, feathered ellipse, clipped to the generated silhouette) -> assets/riders/erv-side.webp
Mattes are cached in art-src/erv/*-matte.png. Needs /workspace/.venv-pw with pillow numpy scipy rembg.  usage: erv_sample_assets.py REPO"""
import sys, numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFilter
from scipy import ndimage
from rembg import remove, new_session
R = sys.argv[1]; SRC = R + '/art-src/erv/'
import os
def matte(img, cache):
    if os.path.exists(SRC + cache): return Image.open(SRC + cache).convert('RGBA')
    out = remove(img, session=new_session('birefnet-general')); out.save(SRC + cache); return out
def biggest(im):
    a = np.asarray(im).copy(); lab, n = ndimage.label(a[..., 3] > 16)
    if n > 1:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sz))
        a[..., 3] = np.where(ndimage.binary_dilation(lab == keep, iterations=2), a[..., 3], 0)
    out = Image.fromarray(a); return out.crop(out.getbbox()), out.getbbox()
def decontam(im):
    """pull edge colours from the solid interior so no background tint survives on soft edges"""
    a = np.asarray(im).astype(float); al = a[..., 3]
    solid = al > 250; idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb = a[..., :3][idx[0], idx[1]]; edge = (al > 0) & ~solid
    a[..., :3][edge] = rgb[edge]; return Image.fromarray(a.astype(np.uint8), 'RGBA')
# 1. full body
ref = Image.open(SRC + 'erv-ref-jessie-oct2.jpg').convert('RGB')
full, fbb = biggest(matte(ref, 'erv-ref-matte.png')); full = decontam(full)
full.save(R + '/assets/riders/erv-full.webp', quality=90, method=6); print('full', full.size, fbb)
# 2. tile portrait (256 square, light-blue backdrop like the other rider tiles)
bg = Image.new('RGB', (256, 256)); d = ImageDraw.Draw(bg)
for y in range(256): d.line([(0, y), (255, y)], fill=(int(177 - 25 * y / 255), int(214 - 14 * y / 255), int(242 - 8 * y / 255)))
hc = full.crop((10, 0, 500, 490)).resize((256, 256), Image.LANCZOS); bg.paste(hc, (0, 6), hc)
bg.save(R + '/assets/faces/riders/erv.webp', quality=92)
# 3. SIDE rider
gen = ImageOps.mirror(Image.open(SRC + 'erv-side-canva-gen1.jpg').convert('RGB'))
g = matte(gen, 'erv-side-gen1-mirrored-matte.png')
s = 115 / 152.0                                # eye distance generated / reference
fa = Image.new('RGBA', ref.size, (0, 0, 0, 0)); fa.paste(full, (fbb[0], fbb[1]))
m = Image.new('L', ref.size, 0); ImageDraw.Draw(m).ellipse([66, 40, 366, 283], fill=255); m = m.filter(ImageFilter.GaussianBlur(10))
fa_ = np.asarray(fa).copy(); fa_[..., 3] = (ndimage.grey_erosion(fa_[..., 3], size=(7, 7)) * (np.asarray(m) / 255.)).astype(np.uint8)
head = Image.fromarray(fa_).crop((40, 35, 400, 335)); head = head.resize((round(head.width * s), round(head.height * s)), Image.LANCZOS)
ox, oy = round(337.5 - (216 - 40) * s), round(227 - (102 - 35) * s)   # ref eye-mid (216,102) -> gen (337.5,227)
lay = Image.new('RGBA', g.size, (0, 0, 0, 0)); lay.paste(head, (ox, oy))
G = np.asarray(g).astype(float); L = np.asarray(lay).astype(float); A = L[..., 3:4] / 255
side = Image.fromarray(np.dstack([G[..., :3] * (1 - A) + L[..., :3] * A, G[..., 3]]).astype(np.uint8), 'RGBA')
side, sbb = biggest(side); side = decontam(side)
k = 0.75; side = side.resize((round(side.width * k), round(side.height * k)), Image.LANCZOS)
# Jessie Oct 3: only his right (near) leg shows; erase the far leg + its shorts opening, clear wisps
a = np.asarray(side).copy()
m = Image.new('L', side.size, 0); dm = ImageDraw.Draw(m)
dm.polygon([(220,330),(300,330),(300,545),(215,545),(205,532),(185,508),(165,485),(150,467),(160,450),(190,421),(220,396),(225,365)], fill=255)
dm.polygon([(223,337),(223,318),(233,300),(282,296),(282,337)], fill=255)
m = np.asarray(m.filter(ImageFilter.GaussianBlur(0.8))) / 255.; a[..., 3] = (a[..., 3] * (1 - m)).astype(np.uint8)
r = a[445:530, 140:205, 3]; lab, n = ndimage.label(r > 0); keep = np.zeros(r.shape, bool)
for i in range(1, n + 1):
    if ((lab == i) & (r > 200)).sum() > 80: keep |= lab == i
r[~(keep & ndimage.binary_dilation(r > 200, iterations=1))] = 0
# Jessie Oct 3 (2): hide the far (left) arm too; keep the near fist; tuck the far-thigh nub into the crotch shadow
m = Image.new('L', side.size, 0); ImageDraw.Draw(m).polygon([(249,152),(262,139),(276,131),(298,118),(394,110),(394,280),(336,280),(334,240),(282,239),(262,233),(250,226)], fill=255)
k = Image.new('L', side.size, 0); ImageDraw.Draw(k).ellipse([262,222,342,292], fill=255); k = np.asarray(k).copy(); k[:241] = 0
m = np.asarray(m).copy(); m[k > 0] = 0
m = np.asarray(Image.fromarray(m).filter(ImageFilter.GaussianBlur(0.8))) / 255.; a[..., 3] = (a[..., 3] * (1 - m)).astype(np.uint8)
af = a.astype(float)
def pm(poly, blur=0.8):
    mm = Image.new('L', side.size, 0); ImageDraw.Draw(mm).polygon(poly, fill=255); return np.asarray(mm.filter(ImageFilter.GaussianBlur(blur))) / 255.
af[..., 3] *= 1 - pm([(217,295),(250,288),(250,340),(224,338)])
sh = pm([(198,297),(218,294),(225,338),(200,338)], 2.0)[..., None] * 0.85; af[..., :3] = af[..., :3] * (1 - sh) + np.array([20,11,2]) * sh
a = af.astype(np.uint8); r = a[228:246, 262:285, 3]
op = ndimage.binary_opening(r > 100, structure=np.ones((4, 4))); r[(r > 0) & ~ndimage.binary_dilation(op, iterations=1)] = 0
side = Image.fromarray(a)
side.save(R + '/assets/riders/erv-side.webp', quality=90, method=6)
seat = ((190 - sbb[0]) * k, (680 - sbb[1]) * k)
print('side', side.size, 'seat', [round(v, 1) for v in seat])
