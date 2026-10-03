"""Phone/desktop screenshots of title, picker and podium (race fast-forwarded via the engine's own step()).
usage: shots.py URL OUTDIR [phone|desktop]"""
import sys, json
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]; mode = sys.argv[3] if len(sys.argv) > 3 else 'phone'
vp = {"width":390,"height":844} if mode=='phone' else {"width":1366,"height":900}
with sync_playwright() as p:
    b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    pg = b.new_page(viewport=vp, is_mobile=(mode=='phone'), has_touch=(mode=='phone'), device_scale_factor=2 if mode=='phone' else 1)
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console: "+m.text) if m.type=="error" else None)
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.screenshot(path=f"{OUT}/{mode}-1-title.png")
    pg.click('#enterBtn'); pg.wait_for_timeout(1200)
    pg.screenshot(path=f"{OUT}/{mode}-2-picker.png")
    pg.click('#goBtn'); pg.wait_for_timeout(800)
    pg.evaluate("() => { while(!sim.done) step(1/30); }")
    pg.wait_for_timeout(1500)
    pg.evaluate("() => document.getElementById('results').scrollIntoView({block:'start'})"); pg.wait_for_timeout(600)
    pg.screenshot(path=f"{OUT}/{mode}-3-podium.png")
    b.close()
print(json.dumps({"mode":mode,"jsErrors":errs}))
