"""Builds assets/share/og-card.jpg (1200x630 link-preview image) from EXISTING game art only (no image
generation): a real SIDE-camera race frame (Penny + Fonk, seed 4242) rendered by the game itself, the
MONKEY JOCKEY wordmark in the game's own CSS colours, and the 8 dog picker portraits.
usage: build_og_card.py BASE_URL   (e.g. http://127.0.0.1:8821/)"""
import sys, os, base64, pathlib
from playwright.sync_api import sync_playwright
BASE = sys.argv[1].rstrip('/') + '/'; ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/share/og-card.jpg'
DOGS = ['penny', 'meatball', 'beaux', 'kira', 'mike', 'diva', 'noodle', 'ghostbuster']
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=1)
    pg.goto(BASE); pg.wait_for_timeout(2000); pg.click('#enterBtn'); pg.wait_for_timeout(800)
    pg.click('#dogGrid .chartile[data-id="penny"]'); pg.click('#riderGrid .chartile[data-id="fonk"]')
    pg.evaluate("() => { const s=document.getElementById('seed'); s.value='4242'; s.dispatchEvent(new Event('input')); }")
    pg.click('#goBtn'); pg.wait_for_timeout(400)
    pg.evaluate("() => { running=false; while(sim.time < 30.4) step(1/30); draw(); }"); pg.wait_for_timeout(700)
    pg.evaluate("() => { running=false; draw(); }"); pg.wait_for_timeout(200)
    race = pg.evaluate("() => document.getElementById('race').toDataURL('image/png')")
    b64 = lambda f: 'data:image/webp;base64,' + base64.b64encode((ROOT / f).read_bytes()).decode()
    faces = ''.join(f'<img src="{b64(f"assets/faces/dogs/{d}.webp")}">' for d in DOGS)
    html = f"""<html><body style="margin:0;width:1200px;height:630px;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0d1f15">
    <div style="position:absolute;inset:0;background:url({race}) 92% 8%/165% auto no-repeat"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0b1a12ee 0%,#0b1a1288 30%,#0b1a1200 52%,#0b1a1200 66%,#0b1a12f2 84%)"></div>
    <div style="position:absolute;top:26px;left:0;right:0;text-align:center;font-weight:900;font-size:104px;letter-spacing:1px;
      -webkit-text-stroke:9px #25170f;paint-order:stroke fill;line-height:1"><span style="color:#e0517d">MONKEY</span> <span style="color:#8abd39">JOCKEY</span></div>
    <div style="position:absolute;top:140px;left:0;right:0;text-align:center;color:#f4d891;font-weight:800;font-size:30px;text-shadow:0 2px 6px #000">
      Rescue-dog racing · Can you beat my race?</div>
    <div style="position:absolute;bottom:22px;left:0;right:0;display:flex;justify-content:center;gap:14px">{faces}</div>
    <div style="position:absolute;bottom:140px;right:30px;color:#fff;font-weight:900;font-size:26px;background:#e0517d;border-radius:30px;padding:9px 22px;box-shadow:0 3px 10px #0008">
      monkey-jockey-test.vercel.app</div>
    <style>img{{width:112px;height:112px;border-radius:18px;border:4px solid #fff;box-shadow:0 4px 12px #000a;object-fit:cover}}</style></body></html>"""
    pg2 = b.new_page(viewport={'width': 1200, 'height': 630}); pg2.set_content(html); pg2.wait_for_timeout(600)
    pg2.screenshot(path=str(OUT), type='jpeg', quality=86)
    b.close()
print(OUT, os.path.getsize(OUT))
