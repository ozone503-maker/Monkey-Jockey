"""Cut Ghostbuster's Sep 3 standing-pack art (stand.png, 1400x720, faces right) into a SIDE
cut-out rig in exactly Penny's format (js/rigs.js RIG_PENNY, from the recovered Claude
gallop prototype): body, head, tail and hip/knee/paw bands for the rear and front leg pairs,
each a rectangle crop in source pixel space with its pivot. No generation, crops only.
usage: rig_ghostbuster.py STAND_PNG   (needs a local http server on :8821 serving the repo root)"""
import sys, json, base64, shutil, os
from playwright.sync_api import sync_playwright
SRC = sys.argv[1]; ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(f'{ROOT}/_pv', exist_ok=True); shutil.copy(SRC, f'{ROOT}/_pv/gb.png')
# geometry measured from the alpha profile of stand.png (see CHANGELOG super-v4)
J = {"hip": 472, "knee": 553, "ankle": 622}
RX, FX = 488, 806                       # rear / front hip-joint x (centre of each leg pair at the belly line)
PARTS = {   # name: (x0, y0, x1, y1, pivot_x, pivot_y)
  "rear_hip":   (382, J["hip"]-11,   604, J["hip"]+88,   RX, J["hip"]),
  "rear_knee":  (374, J["knee"]-20,  572, J["knee"]+79,  RX, J["knee"]),
  "rear_paw":   (374, J["ankle"]-15, 576, 692,           RX, J["ankle"]),
  "front_hip":  (700, J["hip"]-11,   878, J["hip"]+88,   FX, J["hip"]),
  "front_knee": (740, J["knee"]-20,  880, J["knee"]+79,  FX, J["knee"]),
  "front_paw":  (748, J["ankle"]-15, 898, 692,           FX, J["ankle"]),
  "tail":       (352, 188, 462, 470, 440, 336),
  "head":       (770, 128, 1046, 402, 836, 345),
}
BODY = (420, 128, 922, 518)
# erase the face/ear from the body copy so the head (drawn on top, tilted low) has no ghost twin
BODY_ERASE = [(842, 128, 922, 300)]
JS = """async ([B, P, E]) => {
  const im = new Image(); im.src = '/_pv/gb.png'; await im.decode();
  const cut = (x0,y0,x1,y1,erase=[]) => { const c=document.createElement('canvas'); c.width=x1-x0; c.height=y1-y0;
    const g=c.getContext('2d'); g.drawImage(im, -x0, -y0); erase.forEach(([a,b,cc,d])=>g.clearRect(a-x0,b-y0,cc-a,d-b));
    return c.toDataURL('image/webp', 0.92); };
  const out = {body: cut(...B, E)}; for(const k in P) out[k] = cut(...P[k].slice(0,4)); return out; }"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto('http://127.0.0.1:8821/index.html')
    data = pg.evaluate(JS, [list(BODY), {k: list(v) for k, v in PARTS.items()}, BODY_ERASE]); b.close()
os.makedirs(f'{ROOT}/assets/rigs/ghostbuster', exist_ok=True)
for k, d in data.items():
    open(f'{ROOT}/assets/rigs/ghostbuster/{k}.webp', 'wb').write(base64.b64decode(d.split(',')[1]))
rig = {"body": {"src": "assets/rigs/ghostbuster/body.webp", "w": BODY[2]-BODY[0], "h": BODY[3]-BODY[1], "ox": BODY[0], "oy": BODY[1]},
       "parts": {k: {"src": f"assets/rigs/ghostbuster/{k}.webp", "w": x1-x0, "h": y1-y0, "px": px-x0, "py": py-y0, "ax": px, "ay": py}
                 for k, (x0, y0, x1, y1, px, py) in PARTS.items()},
       "ground": 683, "back": 359, "seat": [652, 252], "joints": J}
print(json.dumps(rig))
