"""super-v6: build Jessie's official rider art (Oct 3 2026) into game assets. No image generation.
Sources in art-src/<id>/ (mattes are cached BiRefNet cut-outs of the white-background originals).
  SIDE  : fonk = the transparent side crouch as-is; monkey-jockey = matte of the cream side crouch with the far
          forearm + far boot erased; nonna = cut off the robot greyhound (tools/nonna_side_poly.py), far arm left
          out, keyed-out highlight holes and the white cap refilled.
  card  : full body on white -> matte, edge colours decontaminated  -> assets/riders/<id>-full.webp
  tile  : bust on light blue -> square head crop, 256 px            -> assets/faces/riders/<id>.webp
Prints the RIDER_SIDE entries (seat in output px; k makes every rider's seat-to-head-top = Erv's 503 rig units).
usage: build_rider_art_v6.py REPO   (needs /workspace/.venv-pw: pillow numpy scipy)"""
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
R = sys.argv[1]; S = R + '/art-src/'
RISE = 381.0 * 1.32
def disk(r): y, x = np.ogrid[-r:r+1, -r:r+1]; return x*x + y*y <= r*r
def biggest(a):
    lab, n = ndimage.label(a[..., 3] > 16)
    if n > 1:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sz))
        a[..., 3] = a[..., 3] * ndimage.binary_dilation(lab == keep, iterations=2)
    return a
def decontam(im):
    a = np.asarray(im.convert('RGBA')).astype(float); al = a[..., 3]; solid = al > 250
    idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    edge = (al > 0) & ~solid; a[..., :3][edge] = a[..., :3][idx[0], idx[1]][edge]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')
def crop(im): return im.crop(im.getbbox())
def erase(a, polys):
    m = Image.new('L', (a.shape[1], a.shape[0]), 0); d = ImageDraw.Draw(m)
    for p in polys: d.polygon(p, fill=255)
    a[..., 3] = a[..., 3] * (1 - np.asarray(m.filter(ImageFilter.GaussianBlur(0.8))) / 255.)
    return a
def save_side(id, im, seat_src, H=600):
    k = H / im.height if im.height > H else 1.0
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(f'{R}/assets/riders/{id}-side.webp', quality=90, method=6)
    seat = [round(seat_src[0] * k, 1), round(seat_src[1] * k, 1)]
    return {'src': f'assets/riders/{id}-side.webp', 'w': im.width, 'h': im.height, 'seat': seat, 'k': round(RISE / seat[1], 3)}
out = {}
# --- Fonk SIDE: transparent original, binary alpha -> soften 1 px
f = Image.open(S + 'fonk/fonk-side-transparent.png').convert('RGBA'); bb = f.getbbox(); f = f.crop(bb)
fa = np.asarray(f).astype(float); fa[..., 3] = np.asarray(Image.fromarray(fa[..., 3].astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)))
out['fonk'] = save_side('fonk', decontam(Image.fromarray(fa.astype(np.uint8))), (480 - bb[0], 900 - bb[1]))
# --- Monkey Jockey SIDE: matte of the cream original, far forearm + far boot erased
m = np.asarray(Image.open(S + 'monkey-jockey/mj-side-matte.png').convert('RGBA')).astype(float)
m = erase(m, [[(720,575),(760,580),(850,590),(856,622),(803,621),(767,616),(739,590)], [(718,562),(792,560),(805,588),(722,580)],
              [(478,857),(612,838),(612,1030),(468,1030),(474,950)], [(582,807),(600,801),(650,796),(668,801),(668,862),(575,862)]])
mi = Image.fromarray(biggest(m).astype(np.uint8)); bb = mi.getbbox(); mi = decontam(mi.crop(bb))
out['monkey-jockey'] = save_side('monkey-jockey', mi, (290 * 1.0 + 0, 680))
# --- Nonna SIDE: cut off the robot dog
sys.path.insert(0, R + '/tools'); from nonna_side_poly import POLY
n = Image.open(S + 'nonna/nonna-side-on-robot-dog.png').convert('RGBA'); a = np.asarray(n).astype(float)
pm = Image.new('L', n.size, 0); ImageDraw.Draw(pm).polygon(POLY, fill=255); pm = np.asarray(pm) > 0
al = (a[..., 3] > 0) & pm; head = np.zeros_like(pm); head[:265] = True
body = ndimage.binary_closing(al, structure=disk(5))
cap = ndimage.binary_fill_holes(ndimage.binary_closing(al & head, structure=disk(18))) & head
full = (body | cap) & pm; full = ndimage.binary_fill_holes(full) & pm
fp = full & ~al; a[fp & head, :3] = [240, 238, 234]; a[fp & ~head, :3] = [226, 229, 234]; a[fp, 3] = 255; a[~full, 3] = 0
sm = np.asarray(Image.fromarray((full * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))); a[..., 3] = np.minimum(a[..., 3], sm)
ni = Image.fromarray(a.astype(np.uint8)); bb = ni.getbbox(); ni = ni.crop(bb)
out['nonna'] = save_side('nonna', ni, (150, 685))
# --- cards + tiles
for id, pre in [('fonk', 'fonk'), ('nonna', 'nonna'), ('monkey-jockey', 'mj')]:
    c = np.asarray(Image.open(f'{S}{id}/{pre}-full-matte.png').convert('RGBA')).copy()
    ci = decontam(crop(Image.fromarray(biggest(c))))
    k = 720 / ci.height; ci = ci.resize((round(ci.width * k), 720), Image.LANCZOS); ci.save(f'{R}/assets/riders/{id}-full.webp', quality=90, method=6)
    b = Image.open(f'{S}{id}/{pre}-bust-blue.jpg').convert('RGB'); W = b.width
    b.crop((0, 0, W, W)).resize((256, 256), Image.LANCZOS).save(f'{R}/assets/faces/riders/{id}.webp', quality=92)
print(json.dumps(out))
