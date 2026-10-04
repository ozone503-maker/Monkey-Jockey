"""Gallop filmstrip of the player's dog in SIDE view: N consecutive frames (1/30 s apart) cropped around the player.
usage: dog_strip.py URL OUT.png rider:dog [T=14] [N=8]"""
import sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
URL, OUT, PAIR = sys.argv[1:4]; T = float(sys.argv[4]) if len(sys.argv) > 4 else 14; N = int(sys.argv[5]) if len(sys.argv) > 5 else 8
rid, dog = PAIR.split(':'); errs = []; frames = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500); pg.click('#enterBtn'); pg.wait_for_timeout(800)
    pg.click(f'#dogGrid .chartile[data-id="{dog}"]'); pg.click(f'#riderGrid .chartile[data-id="{rid}"]'); pg.wait_for_timeout(500)
    pg.fill('#seed', '4242'); pg.dispatch_event('#seed', 'input'); pg.click('#goBtn'); pg.wait_for_timeout(400)
    pg.evaluate(f"() => {{ while(sim.time < {T}) step(1/30); }}"); pg.wait_for_timeout(600)
    for i in range(N):
        pg.screenshot(path='/tmp/strip.png', clip={'x':200,'y':255,'width':150,'height':85})
        frames.append(Image.open('/tmp/strip.png').convert('RGB')); __import__('shutil').copy('/tmp/strip.png', f'/tmp/strip{i}.png')
        pg.evaluate("() => { step(1/30); }"); pg.wait_for_timeout(250)
    b.close()
w, h = frames[0].size; cols = 4; rows = (N + cols - 1)//cols
sheet = Image.new('RGB', (cols*w + (cols-1)*6, rows*h + (rows-1)*6), 'white')
for i, f in enumerate(frames): sheet.paste(f, ((i%cols)*(w+6), (i//cols)*(h+6)))
sheet.save(OUT); print(json.dumps({'size': sheet.size, 'jsErrors': errs}))
