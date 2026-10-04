"""Penny realistic SIDE gallop cycle (Oct 3 2026). Four frames, all Canva generations in one style:
  H hind-landing (gen4), E extended = the approved sample (gen1), F front-landing (gen3), G gathered (gen2).
Mattes: BiRefNet (art-src/penny/*matte*.png). Registration: scale from the eye-to-nose distance
(normalised to E; all four within 3%), then each frame translated so its SEAT point (back surface 276 src px behind the collar
centre) lands on one common point -> riders sit steady. Ground = the planted paws (F/H).
Writes assets/dogs/penny/gallop-{h,e,f,g}.webp (same canvas) and prints PENNY_CYCLE geometry."""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage
R = sys.argv[1] if len(sys.argv) > 1 else '.'; P = R + '/art-src/penny/'
SRC = [('h', 'matte-hindland.png'), ('e', 'penny-gallop-matte.png'), ('f', 'matte-frontland.png'), ('g', 'matte-gather.png')]
def clean(a):
    lab, n = ndimage.label(a[..., 3] > 16)
    if n > 1:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); a[..., 3] *= ndimage.binary_dilation(lab == 1 + int(np.argmax(sz)), iterations=2)
    al = a[..., 3]; solid = al > 250
    idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    edge = (al > 0) & ~solid; a[..., :3][edge] = a[..., :3][idx[0], idx[1]][edge]
    return a
# manual landmarks (src px): eye centre, nose tip -> head size; the brown eye is too small to detect reliably
LM = {'h': ((1400, 138), (1528, 210)), 'e': ((1429, 163), (1563, 226)), 'f': ((1470, 124), (1604, 182)), 'g': ((1443, 182), (1576, 256))}
def feats(a, k):
    al = a[..., 3] > 128; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    blue = al & (b > r + 40) & (b > g + 5); lab, n = ndimage.label(blue)
    c = lab == 1 + int(np.argmax(ndimage.sum(blue, lab, range(1, n + 1)))); ys, xs = np.nonzero(c); cx = xs.mean()
    (ex, ey), (nx, ny) = LM[k]; size = np.hypot(nx - ex, ny - ey) / np.hypot(1563 - 1429, 226 - 163)
    sx = int(round(cx - 276 * size)); sy = int(np.nonzero(al[:, sx])[0].min())
    feet = int(np.nonzero(al.any(1))[0].max())
    print('  ', k, 'collar x', int(cx), 'size', round(size, 3), 'seat', sx, sy, 'feet', feet, file=sys.stderr)
    return size, (sx, sy), feet
fr = {}
for k, f in SRC:
    a = clean(np.asarray(Image.open(P + f).convert('RGBA')).astype(float)); s, seat, feet = feats(a, k)
    z = 1.0 / s; im = Image.fromarray(a.astype(np.uint8), 'RGBA'); im = im.resize((round(im.width * z), round(im.height * z)), Image.LANCZOS)
    fr[k] = dict(im=im, seat=(seat[0] * z, seat[1] * z), feet=feet * z, size=round(s, 3))
# common canvas: seat at (SX, SY)
boxes = {k: v['im'].getbbox() for k, v in fr.items()}
L = max(v['seat'][0] - boxes[k][0] for k, v in fr.items()); Rt = max(boxes[k][2] - v['seat'][0] for k, v in fr.items())
T = max(v['seat'][1] - boxes[k][1] for k, v in fr.items()); ground = max(v['feet'] - v['seat'][1] for k, v in fr.items() if k in 'fh')
B = max(ground, max(boxes[k][3] - v['seat'][1] for k, v in fr.items()))
W, H = int(np.ceil(L + Rt)) + 4, int(np.ceil(T + B)) + 4; SX, SY = L + 2, T + 2
OUTH = 380; q = OUTH / H
info = {}
for k, v in fr.items():
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.alpha_composite(v['im'], (int(round(SX - v['seat'][0])), int(round(SY - v['seat'][1]))))
    c = c.resize((round(W * q), OUTH), Image.LANCZOS); c.save(f'{R}/assets/dogs/penny/gallop-{k}.webp', quality=90, method=6)
    info[k] = {'size': v['size'], 'feet_below_seat': round((v['feet'] - v['seat'][1]) * q, 1)}
geo = {'w': round(W * q), 'h': OUTH, 'seat': [round(SX * q, 1), round(SY * q, 1)], 'ground': round((SY + ground) * q, 1),
       'srcPerDogH': round(655.2 * q, 2)}
print(json.dumps({'geo': geo, 'frames': info}))
