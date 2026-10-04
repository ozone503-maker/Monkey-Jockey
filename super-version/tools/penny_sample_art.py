"""Penny realistic SIDE sample (Oct 3 2026): one Canva generation (art-src/penny/penny-gallop-canva-gen1.jpg, from
art-src/penny/penny-ref-sheet.png = her current side sprite + portrait + Fonk for style), BiRefNet matte cached in
art-src/penny/penny-gallop-matte.png -> assets/dogs/penny/side-real.webp (360 px tall)."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
R = sys.argv[1] if len(sys.argv) > 1 else '.'
a = np.asarray(Image.open(R + '/art-src/penny/penny-gallop-matte.png').convert('RGBA')).astype(float)
lab, n = ndimage.label(a[..., 3] > 16)
if n > 1:
    sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); a[..., 3] *= ndimage.binary_dilation(lab == 1 + int(np.argmax(sz)), iterations=2)
al = a[..., 3]; solid = al > 250
idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
edge = (al > 0) & ~solid; a[..., :3][edge] = a[..., :3][idx[0], idx[1]][edge]
im = Image.fromarray(a.astype(np.uint8), 'RGBA'); im = im.crop(im.getbbox())
im = im.resize((round(im.width * 360 / im.height), 360), Image.LANCZOS)
im.save(R + '/assets/dogs/penny/side-real.webp', quality=90, method=6); print(im.size)
