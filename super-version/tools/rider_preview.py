"""super-v6 rider previews at phone 390x844: per rider a SIDE race zoom (on DOG), the YOUR TEAM card; one podium; tiles.
usage: rider_preview.py URL OUTDIR rider:dog [rider:dog ...]"""
import sys, json
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1:3]; PAIRS = [p.split(':') for p in sys.argv[3:]]
errs = []; info = {}
NEAR = "() => { const me=sim.racers.find(r=>r.entrantId==='e1'); return {seat:null, place: sim.finishOrder.indexOf(me)+1} }"
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type=='error' and errs.append(m.text))
    pg.goto(URL); pg.wait_for_timeout(2500); pg.click('#enterBtn'); pg.wait_for_timeout(800)
    pg.locator('#riderGrid').screenshot(path=f'{OUT}/tiles-riders.png')
    for i, (rid, dog) in enumerate(PAIRS):
        pg.click(f'#dogGrid .chartile[data-id="{dog}"]'); pg.click(f'#riderGrid .chartile[data-id="{rid}"]'); pg.wait_for_timeout(500)
        pg.locator('#showcase').screenshot(path=f'{OUT}/card-{rid}.png')
        pg.fill('#seed', '4242'); pg.dispatch_event('#seed', 'input'); pg.click('#goBtn'); pg.wait_for_timeout(400)
        pg.evaluate("() => { while(sim.time < 24) step(1/30); }"); pg.wait_for_timeout(900)
        # crop the race canvas around the player's racer (camera follows the player)
        box = pg.locator('#race').bounding_box()
        pg.screenshot(path=f'{OUT}/race-{rid}-on-{dog}-phone.png')
        pg.screenshot(path=f'{OUT}/race-{rid}-on-{dog}-zoom.png', clip={'x':box['x']+box['width']*0.38,'y':box['y']+box['height']*0.16,'width':box['width']*0.42,'height':box['height']*0.30})
        pg.evaluate("() => { while(!sim.done) step(1/30); }"); pg.wait_for_timeout(1500)
        info[rid] = pg.evaluate(NEAR)['place']
        if i == len(PAIRS) - 1: pg.locator('.podium').screenshot(path=f'{OUT}/podium.png')
        pg.click('#teamBtn'); pg.wait_for_timeout(500)
    b.close()
print(json.dumps({'places': info, 'jsErrors': errs}))
