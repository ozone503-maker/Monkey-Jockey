"""Preview: (1) a strip of gallop frames for Ghostbuster (rig) next to Penny (rig) and Mike (sprite),
(2) a phone 390x844 SIDE race frame with Ghostbuster as the player's dog beside another dog.
usage: gallop_preview.py URL OUTDIR"""
import sys, json, base64
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]
STRIP = """() => { const W=1400, H=640, c=document.createElement('canvas'); c.width=W; c.height=H;
  const prev=ctx; ctx=c.getContext('2d'); ctx.fillStyle='#4a5a50'; ctx.fillRect(0,0,W,H);
  const dogs=['ghostbuster','penny']; const N=4;
  dogs.forEach((id,row)=>{ const ground=290+row*320; ctx.fillStyle='#2b2f31'; ctx.fillRect(0,ground,W,6);
    for(let k=0;k<N;k++){ const g={phase:k/N, rate:3.8, dt:1/30, tA:0, tV:0, lag:0}; const P=gaitPose(g);
      const x=180+k*345, s=2.1, kk=scaleFor(id), dogH=104*s*kk, rider=riderBy['monkey-jockey'];
      const rig=RIGS[id], fr=(DOG_FRAMES[id]||[])[0];
      if(rig) drawRigDog(rig, x, ground, dogH*1.55/(rig.front-rig.rig.back), P, rider);
      else { const h=dogH, w=h*fr.naturalWidth/fr.naturalHeight; drawSpriteGallop(fr,x,ground,w,h,P);
             drawSideRider(rider, x-w*0.04, ground-h*0.78+P.bob*(h/300)*1.6, h/555*0.667, P); }
      ctx.fillStyle='#fff'; ctx.font='12px sans-serif'; ctx.fillText(id+' '+(k/N).toFixed(3), x-50, ground+20); } });
  ctx=prev; return c.toDataURL('image/png'); }"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console: "+m.text) if m.type=="error" else None)
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.screenshot(path=f"{OUT}/title-parade-phone.png")
    d = pg.evaluate(STRIP); open(f"{OUT}/ghostbuster-gallop-strip.png","wb").write(base64.b64decode(d.split(',')[1]))
    pg.click('#enterBtn'); pg.wait_for_timeout(600)
    pg.click('#dogGrid .chartile[data-id="ghostbuster"]'); pg.click('#riderGrid .chartile[data-id="ipo"]')
    pg.fill('#seed', '4242'); pg.dispatch_event('#seed', 'input')
    pg.click('#goBtn'); pg.wait_for_timeout(300)
    # fast-forward the real engine to mid-race, then let it run live for a moment
    pg.evaluate("() => { while(sim.time < 30) step(1/30); }"); pg.wait_for_timeout(1200)
    pg.screenshot(path=f"{OUT}/race-side-phone.png")
    near = pg.evaluate("() => { const me=sim.racers.find(r=>r.entrantId==='e1'); return sim.racers.filter(r=>r!==me).map(r=>[r.dog.name, +(r.pos-me.pos).toFixed(1)]).sort((a,b)=>Math.abs(a[1])-Math.abs(b[1])).slice(0,3) }")
    pg.click('#frontBtn'); pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/race-front-phone.png"); pg.click('#sideBtn')
    pg.evaluate("() => { while(!sim.done) step(1/30); }"); pg.wait_for_timeout(800)
    b.close()
print(json.dumps({"nearestToGhostbuster_m": near, "jsErrors": errs}))
