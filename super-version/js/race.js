/* ============================================================
   RACE — the one authoritative simulation.
   Renderers read this state. They never simulate.
   ============================================================ */

/* ---------- RACE BALANCE v2 (Oct 2 2026, Jessie: "races need to be fair, and not predictable") ----------
   v1 (Sep 2) let stats decide almost everything: a 1–5% raw speed edge from the stat sheet,
   ±1.5% per-tick noise that averages out, a +1.5% mood bonus for whoever led and a traffic
   penalty for anyone running behind. Result: the fastest sheet (Monkey Jockey's rider stats)
   won ~50% of all races and whoever led early usually won.
   v2: stats only shape HOW a team runs (tiny ±0.05% class edge); WHO wins comes from a
   seeded race plan per entrant — running style (front-runner / stalker / closer) with a pace
   tilt that is speed-neutral over the race, 1–2 mid-race moves with a payback, a seeded
   late kick, day form — plus drafting for whoever sits just behind another dog.
   All of it comes from rng32 off the race seed, so same seed + teams + weather = same race.
   The plan uses its OWN sub-generator (seed ^ PACE_SALT) so the main rng sequence — weather
   plan, track events, surges, noise — is drawn exactly as before. ---------- */
const PACE_SALT = 0x5EEDFA11;
const STYLES = ['front','stalker','closer'];
const zOf = (v, list) => { const lo=Math.min(...list), hi=Math.max(...list); return hi>lo ? ((v-lo)/(hi-lo))*2-1 : 0; };
const dogClass   = d => d.speed*.35 + d.burst*.15 + d.stamina*.3 + d.focus*.2;   // sprinters and stayers rate about the same
const riderClass = r => r.balance + r.timing + r.nerve + r.luck;       // equal weights: no single stat is king

function makePacePlan(prng, d, r){
  const w = {front:1+(d.burst-6.5)*.12+(r.timing-7.5)*.04, stalker:1, closer:1+(d.stamina-6.5)*.12+(r.nerve-8.5)*.04};
  let roll = prng()*(w.front+w.stalker+w.closer), style='stalker';
  if((roll-=w.front)<0) style='front'; else if((roll-=w.stalker)>=0) style='closer';
  const moves=[]; const nMoves = 1 + (prng()<.55 ? 1 : 0);
  for(let k=0;k<nMoves;k++){
    const at=.22+prng()*.6, len=.035+prng()*.045;                      // fraction of the course
    moves.push({at, len, str:.035+prng()*.045});
  }
  return {style, tilt:.008+prng()*.017, form:(prng()-.5)*.034,
          kick:(.012+prng()*.035)*(style==='closer'?1.0:style==='front'?.9:1)*(1+(r.nerve+d.burst-16)*.004),
          kickAt:.80+prng()*.08, moves};
}

/* speed-neutral pace shape: mean ≈ 1 over the course for every style */
function paceShape(plan, p){
  const a=plan.tilt;
  if(plan.style==='front')  return 1.004 + a*(1-2*p);                  // fast early, fades (+0.4%: running in front gets no slipstream)
  if(plan.style==='closer') return 1 - a*(1-2*p);                      // patient, finishes strong
  return 1.002 + a*.6*Math.cos(2*Math.PI*(p-.6));                      // stalker: moves mid-race
}

function makeRace(s, tid, weatherOverride, entries){
  const track = TRACKS.find(t=>t.id===tid && !t.locked) || TRACKS[0];
  const list = (entries && entries.length ? entries : DEFAULT_ENTRIES);
  const rng = rng32(seed(s));
  const prng = rng32(seed(s)^PACE_SALT);
  const dc = DOGS.map(dogClass), rc = RIDERS.map(riderClass);
  const racers = list.map((e,i)=>{
    const d=dogBy[e.dogId]||DOGS[0], r=riderBy[e.riderId]||RIDERS[0];
    const edge = 1 + zOf(dogClass(d),dc)*.0005 + zOf(riderClass(r),rc)*.0004;
    const plan = makePacePlan(prng, d, r);
    return {i,entrantId:e.entrantId,dog:d,rider:r,pos:0,speed:0,energy:1,lane:i,finish:null,finished:false,
      baseSpeed:15.75*edge*(1+plan.form), plan, paceMult:1, draftMult:1, eventTimer:1.4+rng()*2.6,
      trackEventMult:1, raceVarianceMult:1, eventLeft:0,
      launch:.95+(d.burst-6.5)*.004+(r.timing-7.5)*.002+(rng()-.5)*.035};
  });
  const weatherPlan = createWeatherPlan(rng, track);
  if(weatherOverride && WEATHER[weatherOverride]) weatherPlan.start = weatherOverride;
  return {
    seed:s, track, rng, racers, entries:list.map(e=>({...e})), time:0, done:false, finishOrder:[], acc:0,
    weatherPlan,
    weather:{current:weatherPlan.start, transitioning:false, next:null, transitionStart:0, transitionDuration:0},
    events:generateTrackEvents(rng,track),
    activeEvents:[],
    moods:initMoods(list),
    highlights:[],
    logs:[`[0.00s] RACE START seed=${s} track=${track.id} weather=${weatherPlan.start}`],
    prevLeader:undefined, prevOrder:undefined, nearPhotoLogged:false,
    rankHistory:[], lastOvertake:{}
  };
}

function step(dt){
  if(!sim||sim.done)return;
  const {track,rng}=sim;
  sim.time+=dt;
  updateWeather(sim,dt); updateEvents(sim,dt); updateMoods(sim,dt); detectHighlights(sim);
  const weatherMod=WEATHER[sim.weather.current]||WEATHER["sunny-day"];
  const active=sim.racers.filter(r=>!r.finished);
  active.forEach(r=>{
    const p=r.pos/track.distance;
    /* fade: everyone tires toward the line; stamina softens it a little */
    r.energy=1-.24*Math.pow(p,1.25)*(1+(6.5-r.dog.stamina)*.003);
    /* individual seeded surge / hesitation — owns raceVarianceMult
       only, so updateEvents can no longer wipe it mid-duration */
    r.eventTimer-=dt;
    if(r.eventTimer<=0){
      r.eventTimer=(2+rng()*4.5)/track.eventRate;
      const roll=rng()+(r.rider.luck-6)*.002+(r.dog.focus-7.4)*.002;
      if(roll>.82){r.raceVarianceMult=1.045+rng()*.055;r.eventLeft=.8+rng()*1.5}
      else if(roll<.13){r.raceVarianceMult=.91+rng()*.045;r.eventLeft=.5+rng()*1.1}
    }
    if(r.eventLeft>0)r.eventLeft-=dt; else r.raceVarianceMult=1;
    /* seeded race plan: pace style + mid-race moves (each paid back right after) + late kick */
    let pace=paceShape(r.plan,p);
    r.plan.moves.forEach(m=>{
      if(p>=m.at && p<m.at+m.len) pace*=1+m.str;
      else if(p>=m.at+m.len && p<m.at+m.len*2.2) pace*=1-m.str*.42;
    });
    /* the late kick is saved up, not free: a little held back before kickAt pays for it */
    if(p>=r.plan.kickAt) pace*=1+r.plan.kick*Math.min(1,(p-r.plan.kickAt)/.04);
    else pace*=1-r.plan.kick*(1-r.plan.kickAt)/r.plan.kickAt;
    r.paceMult=pace;
    /* drafting: tucked in 1–12 m behind the nearest dog ahead = slipstream; nose-to-tail
       (<1 m) is boxed in. Only the nearest dog counts, so a pack never compounds. */
    let gapAhead=Infinity;
    active.forEach(o=>{if(o!==r){const gap=o.pos-r.pos;if(gap>0&&gap<gapAhead)gapAhead=gap}});
    r.draftMult = gapAhead<1 ? 1-.006*(1-(r.rider.timing-7.75)*.05)
                : gapAhead<12 ? 1+.0055*(1-(gapAhead-1)/11) : 1;
    const noise=.985+rng()*.03;
    const launch=sim.time<2.4?r.launch:1;
    const moodMult=sim.moods[r.entrantId]?.modifier||1.0;
    const target=r.baseSpeed*r.energy*r.paceMult*r.draftMult*r.trackEventMult*r.raceVarianceMult*noise*launch*moodMult*weatherMod.traction;
    const accel=8.2+(r.dog.burst-6.5)*.15+(r.rider.balance-7.5)*.05;   // v2: v1 (4.5+burst*.55+balance*.2) handed high-burst dogs ~6 m at the start
    r.speed+=clamp(target-r.speed,-accel*dt,accel*dt);
    const prevPos=r.pos;
    r.pos+=r.speed*dt;
    if(r.pos>=track.distance){
      /* exact crossing time resolved inside the step */
      const travelled=r.pos-prevPos;
      const frac=travelled>0 ? clamp((track.distance-prevPos)/travelled,0,1) : 1;
      r.finish=sim.time-dt*(1-frac);
      r.pos=track.distance; r.finished=true;
      sim.finishOrder.push(r);
      if(sim.finishOrder.length===sim.racers.length){
        sim.finishOrder.sort((a,b)=>a.finish-b.finish);
        sim.done=true;running=false;showResults();dumpSystemLog();
      }
    }
  });
}
