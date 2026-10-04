"""Plays real races in Chromium at phone size (390x844) and checks: 0 JS errors, race finishes,
lead changes happened (sim.highlights lead_change after 5% of the course), podium shows,
RUN IT BACK replays the identical finish, FRONT camera toggles, seed rolls between races.
usage: browser_races.py URL [N_RACES] [SCREENSHOT_PATH]"""
import sys, json, time
from playwright.sync_api import sync_playwright
URL=sys.argv[1]; N=int(sys.argv[2]) if len(sys.argv)>2 else 2; SHOT=sys.argv[3] if len(sys.argv)>3 else None
PICKS=[('mike','erv'),('noodle','monkey-jockey'),('meatball','shockbot'),('kira','mystery-drone-pilot')]
FIN="""() => sim.finishOrder.map(r=>[r.entrantId,r.dog.id,r.rider.id,+r.finish.toFixed(4)])"""
def wait_done(pg, t=120):
    pg.wait_for_function("() => sim && sim.done && document.getElementById('results').style.display==='block'", timeout=t*1000)
out=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console: "+m.text) if m.type=="error" else None)
    pg.goto(URL); pg.wait_for_timeout(1500)
    pg.click('#enterBtn'); pg.wait_for_timeout(800)
    seeds=[]
    for k in range(N):
        d,r=PICKS[k%len(PICKS)]
        if k>0: pg.click('#results button[data-act="team"]'); pg.wait_for_timeout(500)
        pg.click(f'#dogGrid .chartile[data-id="{d}"]'); pg.click(f'#riderGrid .chartile[data-id="{r}"]')
        pg.click('#goBtn'); pg.wait_for_timeout(500)
        seeds.append(pg.evaluate("() => sim.seed"))
        pg.wait_for_function("() => sim && sim.racers.some(r=>r.pos>sim.track.distance*.55)", timeout=90000)
        if k==0:
            pg.click('#frontBtn'); pg.wait_for_timeout(600); front=pg.evaluate("() => camera"); pg.click('#sideBtn')
            pg.wait_for_timeout(300)
            if SHOT: pg.screenshot(path=SHOT)
        wait_done(pg)
        res=pg.evaluate("""() => { const D=sim.track.distance; const lc=sim.highlights.filter(h=>h.type==='lead_change');
          return {seed:sim.seed, leadChangeHighlights:lc.length, winner:sim.finishOrder[0].dog.name+' + '+sim.finishOrder[0].rider.name,
            margin:+(sim.finishOrder[1].finish-sim.finishOrder[0].finish).toFixed(3), time:+sim.finishOrder[0].finish.toFixed(2),
            leaders:[...new Set(lc.map(h=>h.entrants[0]))].length,
            podium:document.querySelectorAll('#results .pod').length, nextSeed:document.getElementById('seed').value}; }""")
        fin=pg.evaluate(FIN)
        if k==0:
            pg.click('#results button[data-act="watch"]'); pg.wait_for_timeout(500); wait_done(pg)
            res['runItBackIdentical']= pg.evaluate(FIN)==fin and pg.evaluate("() => sim.seed")==res['seed']
            res['frontCamera']=front
        out.append(res)
    b.close()
print(json.dumps({"url":URL,"races":out,"seedsDistinct":len(set(seeds))==len(seeds),"jsErrors":errs},indent=1))
sys.exit(1 if errs else 0)
