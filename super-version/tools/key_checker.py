#!/usr/bin/env python3
"""Remove a baked-in light checkerboard ("fake transparency") from existing art.
Flood-fills from the image border across low-saturation, bright pixels, then
trims a 1-2 px halo and feathers the edge. Does not repaint the character.
usage: key_checker.py in.png out.png [max_dim] [--strict]
--strict: the flood fill may only travel through pixels that sit in checker
texture (two flat tones in ~10 px squares). Without it, white/pale-grey parts
of a character that touch the background (e.g. Nonna's chef hat) are keyed away."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

def key(path, out, max_dim=640, strict=False):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(np.int16)
    rgb = a[..., :3]
    mx, mn = rgb.max(-1), rgb.min(-1)
    cand = ((mx - mn) < 22) & (mn > 178)            # light neutral grey/white
    if im.mode == 'RGBA':
        cand |= a[..., 3] < 10
    if strict:
        neutral0 = (mx - mn) < 16
        lo0 = neutral0 & (np.abs(mx - 212) <= 11); hi0 = neutral0 & (mx >= 243)
        f_lo = ndimage.uniform_filter(lo0.astype(np.float32), 15)
        f_hi = ndimage.uniform_filter(hi0.astype(np.float32), 15)
        tex = (f_lo > 0.15) & (f_hi > 0.15)
        cand = cand & ndimage.binary_dilation(tex, np.ones((3, 3)))
    lab, n = ndimage.label(cand, structure=np.ones((3, 3)))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # enclosed holes (between arms/legs): detect the checker texture itself.
    # A baked checkerboard is two flat neutral tones (~205-218 and ~250) in
    # ~10px squares; a 21px window over it is ~all those two tones, ~half each.
    neutral = (mx - mn) < 16
    lo = neutral & (np.abs(mx - 212) <= 11)
    hi = neutral & (mx >= 243)
    flo = ndimage.uniform_filter(lo.astype(np.float32), 21)
    fhi = ndimage.uniform_filter(hi.astype(np.float32), 21)
    checker = (flo > 0.22) & (fhi > 0.22) & (flo + fhi > 0.82)
    checker = ndimage.binary_opening(checker, np.ones((5, 5)))
    near = ndimage.binary_dilation(checker, np.ones((13, 13)))
    bg |= near & cand
    # halo: neutral light-ish pixels touching background
    halo = ((mx - mn) < 30) & (mn > 150)
    if strict:   # only eat halo pixels that still look like checker tones
        halo = halo & ((np.abs(mx - 212) <= 14) | (mx >= 246))
    for _ in range(1 if strict else 2):
        bg |= halo & ndimage.binary_dilation(bg)
    # drop small speckle islands left in the background area
    fg = ~bg
    lab2, n2 = ndimage.label(fg)
    if n2 > 1:
        sizes = ndimage.sum(fg, lab2, range(1, n2 + 1))
        keep = np.isin(lab2, [i + 1 for i, s in enumerate(sizes) if s >= max(400, sizes.max() * 0.002)])
        fg = keep
    alpha = ndimage.gaussian_filter(fg.astype(np.float32), 0.7)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    if im.mode == 'RGBA':
        alpha = np.minimum(alpha, a[..., 3] / 255.0)
    outa = np.dstack([rgb, (alpha * 255).astype(np.int16)]).astype(np.uint8)
    res = Image.fromarray(outa, 'RGBA')
    bb = res.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    res = res.crop(bb)
    res.thumbnail((max_dim, max_dim), Image.LANCZOS)
    res.save(out)
    return res.size

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    print(key(args[0], args[1], int(args[2]) if len(args) > 2 else 640, strict='--strict' in sys.argv))
