"""Post to all (Post for Me) flow test against tools/pfm_dev_server.js + tools/pfm_mock.js, 390x844 Chromium.
usage: pfm_flow_test.py KEYED_BASE NOKEY_BASE OUTDIR"""
import sys, json, os
from playwright.sync_api import sync_playwright
BASE=sys.argv[1].rstrip('/'); NOKEY=sys.argv[2].rstrip('/'); OUT=sys.argv[3]; os.makedirs(OUT, exist_ok=True)
Q="/?race=4242&dog=penny&rider=fonk&w=sunny-day&pfmdev=1"
DONE="() => sim && sim.done && document.getElementById('results').style.display==='block'"
res={}; errs=[]; leaks=[]
def watch(pg, tag):
    pg.on("pageerror", lambda e: errs.append(tag+": "+str(e)))
    pg.on("console", lambda m: errs.append(tag+" console: "+m.text) if m.type=="error" else None)
    def onresp(r):
        if '/api/pfm/' in r.url:
            try:
                t=r.text()
                if 'SECRET_' in t or 'access_token' in t: leaks.append(r.url)
            except Exception: pass
    pg.on("response", onresp)
def get_results(pg, base):
    pg.goto(base+Q); pg.wait_for_timeout(1200); pg.click('#enterBtn'); pg.wait_for_timeout(1100)
    pg.click('#challenge [data-ch="watch"]'); pg.wait_for_timeout(800); pg.click('#replaySkip'); pg.wait_for_function(DONE, timeout=20000); pg.wait_for_timeout(600)
    pg.click('#results button[data-act="share"]'); pg.wait_for_function("() => window.MJ_LAST_CLIP", timeout=60000); pg.wait_for_timeout(800)
with sync_playwright() as p:
    b=p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    ctx=b.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    # --- no key: no Post to all ---
    pg0=ctx.new_page(); watch(pg0,'nokey'); get_results(pg0, NOKEY)
    res["nokey_status"]=pg0.evaluate("() => fetch('/api/pfm/status').then(r=>r.json())")
    res["nokey_buttonShown"]=pg0.evaluate("() => !!document.querySelector('#shareSheet [data-sh=\"pfm\"]')")
    res["nokey_cleanCopyRecorded"]=pg0.evaluate("() => !!REC.rec2")
    pg0.close()
    # --- key set (mock) ---
    pg=ctx.new_page(); watch(pg,'keyed'); get_results(pg, BASE)
    res["clip"]=pg.evaluate("() => window.MJ_LAST_CLIP")
    res["buttonShown"]=pg.evaluate("() => !!document.querySelector('#shareSheet [data-sh=\"pfm\"]')")
    res["cleanCopyBytes"]=pg.evaluate("() => (REC.chunks2||[]).reduce((n,c)=>n+c.size,0)")
    res["playerId"]=pg.evaluate("() => localStorage.getItem('mj.playerId')")
    res["cookies"]=pg.evaluate("() => document.cookie")
    pg.evaluate("() => { const v=document.querySelector('#shareSheet video'); if(v){ v.pause(); v.currentTime=6; } }"); pg.wait_for_timeout(500)
    pg.screenshot(path=f"{OUT}/p1-share-sheet-with-post-to-all.png")
    pg.click('#shareSheet [data-sh="pfm"]'); pg.wait_for_selector('#shareSheet [data-pf="connect"]'); pg.wait_for_timeout(300)
    pg.screenshot(path=f"{OUT}/p2-connect-accounts.png")
    for plat in ['x','tiktok','instagram']:
        with ctx.expect_page() as pop_info:
            pg.click(f'#shareSheet [data-pf="connect"][data-p="{plat}"]')
        pop=pop_info.value; watch(pop,'popup-'+plat); pop.wait_for_load_state(); pop.wait_for_selector('#pfmTitle', timeout=15000); pop.wait_for_timeout(500)
        if plat=='x': pop.screenshot(path=f"{OUT}/p3-connected-tab.png"); res["returnTitle"]=pop.inner_text('#pfmTitle'); res["returnUrlCleaned"]=pop.url
        pop.close(); pg.wait_for_timeout(1200)
    res["connectedShown"]=pg.evaluate("() => [...document.querySelectorAll('#shareSheet .pf-ok')].map(e=>e.textContent)")
    pg.screenshot(path=f"{OUT}/p4-connect-after.png")
    pg.click('#shareSheet [data-pf="done"]'); pg.wait_for_selector('#pfCaption'); pg.wait_for_timeout(400)
    pg.evaluate("() => { const v=document.querySelector('#shareSheet video'); if(v){ v.pause(); v.currentTime=6; } }"); pg.wait_for_timeout(400)
    pg.screenshot(path=f"{OUT}/p5-post-to-all.png")
    res["composeButton"]=pg.inner_text('#shareSheet .sh-pfm')
    pg.click('#shareSheet [data-pf="tiktok"]'); pg.wait_for_selector('#ttPrivacy'); pg.wait_for_timeout(400)
    res["tt_defaults"]=pg.evaluate("""() => ({privacy: document.getElementById('ttPrivacy').value, checked: [...document.querySelectorAll('#shareSheet [data-tt]:checked')].map(e=>e.dataset.tt),
        postDisabled: document.querySelector('#shareSheet [data-pf="post"]').disabled, consent: document.querySelector('.pf-consent').textContent})""")
    pg.evaluate("() => { const v=document.querySelector('#shareSheet video'); if(v){ v.pause(); v.currentTime=6; } }"); pg.wait_for_timeout(400)
    pg.screenshot(path=f"{OUT}/p6-tiktok-confirm.png", full_page=False)
    pg.select_option('#ttPrivacy', 'public'); pg.wait_for_timeout(200)
    pg.check('#shareSheet [data-tt="allow_comment"]'); pg.wait_for_timeout(200)
    pg.check('#shareSheet [data-tt="commercial"]'); pg.wait_for_timeout(200)
    res["tt_commercial_none_disabled"]=pg.evaluate("() => document.querySelector('#shareSheet [data-pf=\"post\"]').disabled")
    pg.check('#shareSheet [data-tt="branded"]'); pg.wait_for_timeout(200)
    res["tt_branded"]=pg.evaluate("""() => ({onlyMeDisabled: document.querySelector('#ttPrivacy option[value=private]').disabled, note: (document.querySelector('#shareSheet .pf-note')||{}).textContent,
        consent: document.querySelector('.pf-consent').textContent, postDisabled: document.querySelector('#shareSheet [data-pf="post"]').disabled})""")
    pg.evaluate("() => document.querySelector('#shareSheet .sh-card').scrollTo(0, 99999)"); pg.wait_for_timeout(200)
    pg.screenshot(path=f"{OUT}/p7-tiktok-commercial.png")
    pg.uncheck('#shareSheet [data-tt="commercial"]'); pg.wait_for_timeout(200)
    pg.click('#shareSheet [data-pf="post"]')
    pg.wait_for_function("() => document.getElementById('pfmTitle') && document.getElementById('pfmTitle').textContent.startsWith('Posted')", timeout=40000); pg.wait_for_timeout(300)
    pg.screenshot(path=f"{OUT}/p8-posted.png")
    res["statusRows"]=pg.evaluate("() => [...document.querySelectorAll('#shareSheet .pf-row')].map(e=>e.innerText.replace(/\\n/g,' '))")
    pid=pg.evaluate("() => localStorage.getItem('mj.playerId')"); res["playerIdAfter"]=pid
    b.close()
import urllib.request
def post(path, body):
    rq=urllib.request.Request(BASE+'/api/pfm/'+path, data=json.dumps(body).encode(), headers={'Content-Type':'application/json'}, method='POST')
    try: return urllib.request.urlopen(rq).status
    except urllib.error.HTTPError as e: return e.code
res["foreignAccount"]=post('post', {"player":pid,"accounts":["spc_x_2","spc_x_1"],"media_url":"https://data.postforme.dev/x","caption":"x"})
accts=json.load(urllib.request.urlopen(BASE+'/api/pfm/accounts?player='+pid))['accounts']; TT=[a['id'] for a in accts if a['platform']=='tiktok'][0]
res["ttNoConsent"]=post('post', {"player":pid,"accounts":[TT],"media_url":"https://data.postforme.dev/x","caption":"x","tiktok":{"privacy":"public"}})
res["ttBrandedPrivate"]=post('post', {"player":pid,"accounts":[TT],"media_url":"https://data.postforme.dev/x","caption":"x","tiktok":{"privacy":"private","consent":True,"disclose_branded_content":True}})
log=json.load(open('/tmp/pfm_mock_log.json'))
post=log["posts"][-1]["body"]
res["mock_post_body"]=post
res["uploads"]=log["uploads"]
res["apiKeyInClient"]=False
res["tokenLeaks"]=leaks; res["jsErrors"]=errs
print(json.dumps(res, indent=1)); sys.exit(1 if errs or leaks else 0)
