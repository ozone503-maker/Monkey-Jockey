/* ============================================================
   RACE — the one authoritative simulation.
   Renderers read this state. They never simulate.
   ============================================================ */

function makeRace(s, tid, weatherOverride, entries){
  const track = TRACKS.find(t=>t.id===tid && !t.locked) || TRACKS[0];
  const list = (entries && entries.length ? entries : DEFAULT_ENTRIES);
  const rng = rng32(seed(s));
  const racers = list.map((e,i)=>{
    const d=dogBy[e.dogId]||DOGS[0], r=riderBy[e.riderId]||RIDERS[0];
    const base=d.speed*track.speedWeight*.55 + d.burst*track.burstWeight*.13 + d.stamina*track.staminaWeight*.20 + d.focus*track.focusWeight*.12;
    const rmod=.86+(r.balance*.006+r.timing*.004+r.nerve*.003+r.luck*.002);
    return {i,entrantId:e.entrantId,dog:d,rider:r,pos:0,speed:0,energy:1,lane:i,finish:null,finished:false,
      baseSpeed:(14.3+base*.72)*rmod, eventTimer:1.4+rng()*2.6,
      trackEventMult:1, raceVarianceMult:1, eventLeft:0,
      launch:.90+(d.burst/10)*.12+(r.timing/10)*.04+(rng()-.5)*.035};
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
    r.energy=clamp(r.energy-dt*(.012+(1-r.dog.stamina/10)*.017)*(.75+p*.65),.66,1);
    /* individual seeded surge / hesitation — owns raceVarianceMult
       only, so updateEvents can no longer wipe it mid-duration */
    r.eventTimer-=dt;
    if(r.eventTimer<=0){
      r.eventTimer=(2+rng()*4.5)/track.eventRate;
      const roll=rng()+(r.rider.luck-5)*.006+(r.dog.focus-5)*.004;
      if(roll>.82){r.raceVarianceMult=1.045+rng()*.055;r.eventLeft=.8+rng()*1.5}
      else if(roll<.13){r.raceVarianceMult=.91+rng()*.045;r.eventLeft=.5+rng()*1.1}
    }
    if(r.eventLeft>0)r.eventLeft-=dt; else r.raceVarianceMult=1;
    let traffic=1;
    active.forEach(o=>{if(o!==r){const gap=o.pos-r.pos;if(gap>0&&gap<11){const ps=(r.rider.timing+r.dog.burst)/20;traffic*=.985+ps*.022}}});
    const noise=.985+rng()*.03;
    const late=p>.86?1+((r.rider.nerve+r.dog.burst)-10)*.0025:1;
    const launch=sim.time<2.4?r.launch:1;
    const moodMult=sim.moods[r.entrantId]?.modifier||1.0;
    const target=r.baseSpeed*r.energy*r.trackEventMult*r.raceVarianceMult*traffic*noise*late*launch*moodMult*weatherMod.traction;
    const accel=4.5+r.dog.burst*.55+r.rider.balance*.20;
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
