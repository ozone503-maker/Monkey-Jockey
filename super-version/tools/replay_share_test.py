"""Replay + Share test at phone size (390x844) in headless Chromium.
Plays race SEED with Penny + Fonk, checks WATCH REPLAY (0.5x, SKIP) reproduces the exact finish and
changes no seed/team/weather, records SHARE CLIP (MediaRecorder) and saves the video, renders the share
sheet, the end card, a compositor frame and the ?race= challenge flow. Prints JSON; exit 1 on JS errors.
usage: replay_share_test.py BASE_URL OUTDIR [SEED] [recfmt: webm|auto]"""
import sys, json, base64, os
from playwright.sync_api import sync_playwright
BASE=sys.argv[1].rstrip('/')+'/'; OUT=sys.argv[2]; SEED=int(sys.argv[3]) if len(sys.argv)>3 else 4242
FMT=sys.argv[4] if len(sys.argv)>4 else 'webm'
os.makedirs(OUT, exist_ok=True)
FIN="() => sim.finishOrder.map(r=>[r.entrantId,r.dog.id,r.rider.id,+r.finish.toFixed(5)])"
DONE="() => sim && sim.done && document.getElementById('results').style.display==='block'"
STATE="() => ({lastSeed, lastWeather, seedBox: document.getElementById('seed').value, entries: JSON.stringify(lastEntries), replayOn: REPLAY.on})"
res={"seed":SEED,"recfmt":FMT}
def save_png(pg, js, path):
    d=pg.evaluate(js); open(path,'wb').write(base64.b64decode(d.split(',',1)[1]))
with sync_playwright() as p:
    b=p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    ctx=b.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    pg=ctx.new_page(); errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console: "+m.text) if m.type=="error" else None)
    pg.goto(BASE+('?recfmt=webm' if FMT=='webm' else '')); pg.wait_for_timeout(1200)
    pg.click('#enterBtn'); pg.wait_for_timeout(800)
    pg.click('#dogGrid .chartile[data-id="penny"]'); pg.click('#riderGrid .chartile[data-id="fonk"]')
    pg.evaluate(f"() => {{ const s=document.getElementById('seed'); s.value='{SEED}'; s.dispatchEvent(new Event('input')); }}")
    pg.click('#goBtn'); pg.wait_for_timeout(300)
    pg.wait_for_function(DONE, timeout=150000); pg.wait_for_timeout(900)
    fin=pg.evaluate(FIN); before=pg.evaluate(STATE)
    res["winner"]=pg.evaluate("() => LAST_RACE.winDog+' & '+LAST_RACE.winRider")
    res["winT"]=pg.evaluate("() => +LAST_RACE.winT.toFixed(2)"); res["margin"]=pg.evaluate("() => +LAST_RACE.margin.toFixed(3)")
    res["myPlace"]=pg.evaluate("() => LAST_RACE.mine")
    res["resultsButtons"]=pg.evaluate("() => [...document.querySelectorAll('#results .res-actions button')].map(b=>b.textContent.trim())")
    pg.screenshot(path=f"{OUT}/1-results.png")
    # ---- WATCH REPLAY (0.5x, then SKIP) ----
    pg.click('#results button[data-act="watch"]'); pg.wait_for_timeout(300)
    res["replayBarVisible"]=pg.evaluate("() => !document.getElementById('replayBar').hidden && REPLAY.on")
    pg.wait_for_function("() => sim.time > 24", timeout=60000)
    pg.click('#replayBar [data-sp="0.5"]')
    t0=pg.evaluate("() => [sim.time, performance.now()]"); pg.wait_for_timeout(2000); t1=pg.evaluate("() => [sim.time, performance.now()]")
    res["slowmoRate"]=round((t1[0]-t0[0])/((t1[1]-t0[1])/1000),2)
    pg.screenshot(path=f"{OUT}/2-replay-midrace.png")
    pg.click('#replayBar [data-sp="1"]'); pg.wait_for_timeout(400)
    pg.click('#replaySkip'); pg.wait_for_function(DONE, timeout=20000); pg.wait_for_timeout(900)
    res["replayFinishIdentical"]=pg.evaluate(FIN)==fin; after=pg.evaluate(STATE)
    res["replayChangedNothing"]= before==after
    res["replayResultsTag"]=pg.evaluate("() => !!document.querySelector('#results .vic-replay')")
    res["replayBarHiddenAfter"]=pg.evaluate("() => document.getElementById('replayBar').hidden")
    pg.screenshot(path=f"{OUT}/3-results-after-replay.png")
    # ---- SHARE CLIP: record ----
    pg.click('#results button[data-act="share"]'); pg.wait_for_timeout(300)
    res["recording"]=pg.evaluate("() => document.body.classList.contains('recording')")
    res["mimeChosen"]=pg.evaluate("() => REC.mime")
    pg.wait_for_function("() => REPLAY.clip && REPLAY.clip.phase==='stretch'", timeout=20000); pg.wait_for_timeout(1500)
    pg.screenshot(path=f"{OUT}/4-recording.png")
    save_png(pg, "() => REC.cv.toDataURL('image/png')", f"{OUT}/5-clip-frame-stretch.png")
    pg.wait_for_function("() => REPLAY.clip && REPLAY.clip.phase==='slow'", timeout=20000); pg.wait_for_timeout(1200)
    save_png(pg, "() => REC.cv.toDataURL('image/png')", f"{OUT}/6-clip-frame-photofinish.png")
    pg.wait_for_function("() => window.MJ_LAST_CLIP", timeout=60000); pg.wait_for_timeout(1500)
    res["clip"]=pg.evaluate("() => window.MJ_LAST_CLIP")
    res["recordAfterChangedNothing"]= pg.evaluate(STATE)==before and pg.evaluate(FIN)==fin
    b64=pg.evaluate("""async () => { const buf = await (await fetch(REC.url)).arrayBuffer(); let s=''; const u=new Uint8Array(buf);
       for(let i=0;i<u.length;i+=32768) s+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return btoa(s); }""")
    ext=pg.evaluate("() => REC.ext"); vid=f"{OUT}/sample-clip-race-{SEED}.{ext}"; open(vid,'wb').write(base64.b64decode(b64)); res["video"]=vid
    res["sheetButtons"]=pg.evaluate("() => [...document.querySelectorAll('#shareSheet .sh-card button, #shareSheet .sh-card a')].map(e=>e.textContent.trim())")
    res["intentLinks"]=pg.evaluate("() => [...document.querySelectorAll('#shareSheet .sh-row a')].map(a=>a.href)")
    res["challengeLink"]=pg.evaluate("() => document.getElementById('shLink').value")
    res["canShareFiles"]=pg.evaluate("() => !!(navigator.canShare && (()=>{try{return navigator.canShare({files:[REC.file]})}catch(e){return false}})())")
    pg.evaluate("() => { const v=document.querySelector('#shareSheet video'); if(v){ v.pause(); v.currentTime=6; } }"); pg.wait_for_timeout(700)
    pg.screenshot(path=f"{OUT}/7-share-sheet.png")
    pg.click('#shareSheet [data-sh="copy"]'); pg.wait_for_timeout(300)
    res["copyLabel"]=pg.evaluate("() => document.querySelector('#shareSheet [data-sh=\"copy\"]').textContent")
    pg.evaluate("() => { endCard(REC.cx, 720, 1280, LAST_RACE, 1); }")
    save_png(pg, "() => REC.cv.toDataURL('image/png')", f"{OUT}/8-end-card.png")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    res["sheetClosedByEsc"]=pg.evaluate("() => document.getElementById('shareSheet').hidden")
    # second tap on SHARE reuses the recorded clip (no re-record)
    pg.click('#results button[data-act="share"]'); pg.wait_for_timeout(400)
    res["shareReusesClip"]=pg.evaluate("() => !REPLAY.on && !document.getElementById('shareSheet').hidden")
    pg.keyboard.press('Escape')
    # ---- challenge link ----
    q=f"?race={SEED}&dog=penny&rider=fonk&w={before['lastWeather']}"+('&recfmt=webm' if FMT=='webm' else '')
    pg2=ctx.new_page(); pg2.on("pageerror", lambda e: errs.append("challenge: "+str(e)))
    pg2.on("console", lambda m: errs.append("challenge console: "+m.text) if m.type=="error" else None)
    pg2.goto(BASE+q); pg2.wait_for_timeout(1200); pg2.click('#enterBtn'); pg2.wait_for_timeout(1100)
    res["challengeShown"]=pg2.evaluate("() => !document.getElementById('challenge').hidden")
    pg2.screenshot(path=f"{OUT}/9-challenge-card.png")
    pg2.click('#challenge [data-ch="watch"]'); pg2.wait_for_timeout(2500)
    pg2.screenshot(path=f"{OUT}/10-challenge-replay.png")
    pg2.click('#replaySkip'); pg2.wait_for_function(DONE, timeout=20000)
    res["challengeFinishIdentical"]=pg2.evaluate(FIN)==fin
    res["challengeThenGO"]=pg2.evaluate("() => { document.getElementById('goBtn').click(); return [REPLAY.on, sim.seed]; }")
    b.close()
res["jsErrors"]=errs
print(json.dumps(res, indent=1)); sys.exit(1 if errs else 0)
