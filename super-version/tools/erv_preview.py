"""Erv sample previews at phone 390x844: race SIDE frames (Erv on Penny / Ghostbuster), YOUR TEAM card,
podium with Erv on a stand.  usage: erv_preview.py URL OUTDIR TAG"""
import sys, json
from playwright.sync_api import sync_playwright
URL, OUT, TAG = sys.argv[1:4]
errs = []; info = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type=='error' and errs.append(m.text))
    pg.goto(URL); pg.wait_for_timeout(2500); pg.click('#enterBtn'); pg.wait_for_timeout(800)
    for dog in ['penny', 'ghostbuster']:
        pg.click(f'#dogGrid .chartile[data-id="{dog}"]'); pg.click('#riderGrid .chartile[data-id="erv"]'); pg.wait_for_timeout(400)
        if dog == 'penny': pg.locator('#showcase').screenshot(path=f'{OUT}/{TAG}-card.png')
        pg.fill('#seed', '4242'); pg.dispatch_event('#seed', 'input'); pg.click('#goBtn'); pg.wait_for_timeout(400)
        pg.evaluate("() => { while(sim.time < 24) step(1/30); }"); pg.wait_for_timeout(1000)
        pg.screenshot(path=f'{OUT}/{TAG}-race-{dog}-phone.png')
        pg.locator('#race').screenshot(path=f'{OUT}/{TAG}-race-{dog}-canvas.png')
        info[dog] = pg.evaluate("() => { const me=sim.racers.find(r=>r.entrantId==='e1'); return sim.racers.filter(r=>r!==me).map(r=>[r.dog.name, +(r.pos-me.pos).toFixed(1)]).sort((a,b)=>Math.abs(a[1])-Math.abs(b[1])).slice(0,2) }")
        pg.click('#frontBtn'); pg.wait_for_timeout(600); pg.click('#sideBtn')
        pg.evaluate("() => { while(!sim.done) step(1/30); }"); pg.wait_for_timeout(900)
        if dog == 'penny':
            # find a seed where Erv's team makes the podium
            for sd in [4242, 7, 11, 23, 99, 123, 512, 777, 1001, 2024, 31337]:
                place = pg.evaluate("() => { const me=sim.racers.find(r=>r.entrantId==='e1'); return sim.finishOrder.indexOf(me)+1 }")
                if place <= 3: break
                pg.click('#teamBtn') if pg.locator('#teamBtn').count() else None
                pg.wait_for_timeout(300); pg.click(f'#dogGrid .chartile[data-id="{dog}"]'); pg.click('#riderGrid .chartile[data-id="erv"]')
                pg.fill('#seed', str(sd)); pg.dispatch_event('#seed', 'input'); pg.click('#goBtn'); pg.wait_for_timeout(300)
                pg.evaluate("() => { while(!sim.done) step(1/30); }"); pg.wait_for_timeout(900)
            info['podiumPlace'] = place
            pg.wait_for_timeout(1200); pg.locator('.podium').screenshot(path=f'{OUT}/{TAG}-podium.png')
        if pg.locator('#teamBtn').count(): pg.click('#teamBtn')
        pg.wait_for_timeout(500)
    b.close()
print(json.dumps({'near': info, 'jsErrors': errs}))
