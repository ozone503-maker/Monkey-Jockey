"""Animated GIFs of a dog's SIDE gallop cycle with a rider, drawn by the game's own functions on an offscreen canvas
(fixed camera, no race clutter). usage: dog_cycle_gif.py URL OUTDIR dog rider [rider ...]
Writes cycle-<dog>-<rider>.gif (real speed), cycle-<dog>-<rider>-slow.gif (~1/4 speed) and cycle-<dog>-<rider>-frames.png."""
import sys, json, base64, io
from playwright.sync_api import sync_playwright
from PIL import Image
URL, OUT, DOG = sys.argv[1:4]; RIDERS = sys.argv[4:]; errs = []
JS = """([dog, rid, n, cycles]) => {
  const cv = document.createElement('canvas'); cv.width = 720; cv.height = 400; const prev = ctx; ctx = cv.getContext('2d');
  const rider = RIDERS.find(r => r.id === rid), out = [];
  const g = {phase: 0, tA: 0, tV: 0, lag: 0, dt: 1/30, rate: STRIDE_HZ * (STEP_RATE[dog] || 1)};
  const dogH = 200, ground = 345, x = 330;
  for(let f = 0; f < n * cycles; f++){
    g.phase = f / n; const P = gaitPose(g);
    ctx.fillStyle = '#2b3a2e'; ctx.fillRect(0, 0, 720, 400); ctx.fillStyle = '#26282a'; ctx.fillRect(0, ground - 30, 720, 90);
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, ground, dogH*0.6, 14, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
    const seat = drawDogCycle(dog, x, ground, dogH, g.phase, P);
    drawSideRider(rider, seat[0], seat[1], spriteFit(dog, {naturalWidth: 2, naturalHeight: 1}, dogH).rs, P);
    out.push(cv.toDataURL('image/png'));
  }
  ctx = prev; return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(URL); pg.wait_for_timeout(3000)
    for rid in RIDERS:
        N = 8   # frames per stride at ~30 fps (Penny ≈ 3.7 strides/s)
        urls = pg.evaluate(JS, [DOG, rid, N, 3])
        fr = [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in urls]
        rate = pg.evaluate("d => STRIDE_HZ * (STEP_RATE[d] || 1)", DOG); ms = int(round(1000 / rate / N / 10) * 10)
        fr[0].save(f'{OUT}/cycle-{DOG}-{rid}.gif', save_all=True, append_images=fr[1:], duration=max(ms, 30), loop=0)
        fr[0].save(f'{OUT}/cycle-{DOG}-{rid}-slow.gif', save_all=True, append_images=fr[1:], duration=130, loop=0)
        s = [f.resize((360, 200), Image.LANCZOS) for f in fr[:N]]
        sheet = Image.new('RGB', (4*360 + 18, 2*200 + 6), 'white')
        for i, f in enumerate(s): sheet.paste(f, ((i % 4) * 366, (i // 4) * 206))
        sheet.save(f'{OUT}/cycle-{DOG}-{rid}-frames.png')
    b.close()
print(json.dumps({'jsErrors': errs, 'frameMs': ms}))
