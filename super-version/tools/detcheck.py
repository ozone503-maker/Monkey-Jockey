"""Seeded-determinism check: runs the game's own engine (buildField/makeRace/step) in-page
for N seeds x picks x weather, on two URLs, and compares every finish (entrant, dog, rider SLOT
index, exact finish time). Rider slot index is compared rather than name, because slot 0
(Buff Bro Bot -> ShockBot) and slot 4 (Ruch -> Mystery Drone Pilot) were renamed with identical stats.
usage: detcheck.py BASE_URL NEW_URL [N]"""
import sys, json
from playwright.sync_api import sync_playwright
A, B = sys.argv[1], sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 36
JS = """(N) => { const out=[]; const seeds=[83479126,1,42,777,20260925,31337,5150,900,123456789,2024,8675309,11];
  const keep=[running]; 
  for(let k=0;k<N;k++){ const s=seed(seeds[k%seeds.length]+Math.floor(k/seeds.length)*17);
    playerPick={dogId:DOGS[(k*3)%8].id, riderId:RIDERS[(k*5+1)%8].id};
    const entries=buildField(s); const weather=k%2?'rainy-day':'sunny-day';
    sim=makeRace(s,'punahele',weather,entries); running=true; let g=0;
    while(!sim.done && g++<30*400) step(1/30);
    out.push({k,s,weather,finish:sim.finishOrder.map(r=>[r.entrantId,r.dog.id,RIDERS.indexOf(r.rider),r.finish]),
      moods:Object.values(sim.moods).map(m=>m.current), logs:sim.logs.length, hl:sim.highlights.length}); }
  running=false; return out; }"""
def run(url):
    with sync_playwright() as p:
        b=p.chromium.launch(); pg=b.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(url); pg.wait_for_timeout(1500)
        # stop any UI-driven loop so only our direct stepping runs
        pg.evaluate("() => { try{ if(typeof cdCancel==='function') cdCancel(); running=false; cancelAnimationFrame(raf);}catch(e){} }")
        r=pg.evaluate(JS, N); b.close(); return r, errs
ra, ea = run(A); rb, eb = run(B)
diff=[(x['k'],x['s']) for x,y in zip(ra,rb) if x['finish']!=y['finish'] or x['logs']!=y['logs'] or x['hl']!=y['hl']]
print(json.dumps({"races":len(ra),"identical":len(ra)-len(diff),"differ":diff,"errors_base":ea,"errors_new":eb,
  "sample":{"seed":ra[0]['s'],"base_top3":ra[0]['finish'][:3],"new_top3":rb[0]['finish'][:3]}},indent=1))
sys.exit(1 if diff else 0)
