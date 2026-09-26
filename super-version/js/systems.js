/* ============================================================
   SYSTEMS — weather, track events, rider moods, highlights
   All four are deterministic from the race seed and race state.
   ============================================================ */

function createWeatherPlan(rng, track){
  const conditions = ["sunny-day","rainy-day"]; // launch only
  const start = conditions[Math.floor(rng()*conditions.length)];
  const plan = {start, transitions:[]};
  if(rng()<0.38){
    const t = 14 + rng()*(track.distance/16);
    let next; do{next=conditions[Math.floor(rng()*conditions.length)]}while(next===start);
    plan.transitions.push({time:Math.round(t*10)/10, next, duration:2.4+rng()*2.2});
  }
  return plan;
}

function generateTrackEvents(rng, track){
  const events=[];
  const count=Math.floor(2+rng()*3.5*track.eventRate);
  for(let i=0;i<count;i++){
    const def=EVENT_DEFS[Math.floor(rng()*EVENT_DEFS.length)];
    const pos=70+rng()*(track.distance-140);
    const dur=def.duration[0]+rng()*(def.duration[1]-def.duration[0]);
    events.push({
      id:def.id+"-"+i, type:def.type, defId:def.id,
      coursePosition:Math.round(pos), duration:Math.round(dur*10)/10,
      severity:def.severity, affected:def.affected.slice(),
      visualHook:def.visual, commentaryHook:def.commentary,
      triggered:false, activeUntil:0
    });
  }
  events.sort((a,b)=>a.coursePosition-b.coursePosition);
  return events;
}

/* Mood state is keyed by entrantId, NOT rider id, so two entrants
   riding the same rider get independent mood objects. */
function initMoods(entries){
  const moods={};
  entries.forEach(e=>{
    const p=RIDER_PERSONALITIES[e.riderId];
    if(!p) return;
    moods[e.entrantId]={riderId:e.riderId, current:p.base, startTime:0, modifier:1.0,
                        animationHook:p.base, commentaryHook:p.base};
  });
  return moods;
}

/* The gameplay modifier is recomputed from current state on EVERY
   tick. Only the transition (and its log line) is gated on the
   mood actually changing. */
function updateMoods(sim,dt){
  const order=[...sim.racers].sort((a,b)=>b.pos-a.pos);
  sim.racers.forEach(r=>{
    const pers=RIDER_PERSONALITIES[r.rider.id];
    const mood=sim.moods[r.entrantId];
    if(!pers||!mood)return;
    const rank=order.findIndex(x=>x===r)+1;
    let targetMood=pers.base, mod=1.0;
    if(rank===1){targetMood=pers.triggers.lead||pers.base;mod=1.015}
    else if(rank>=6){targetMood=pers.triggers.behind||pers.triggers.passed||"determined";mod=1.01}
    else if(sim.time>sim.track.distance/20){targetMood=pers.triggers.final||pers.base;mod=1.02}
    if(sim.activeEvents.some(e=>e.type==="obstacle"||e.type==="distraction")){
      if(r.rider.nerve<7) targetMood=pers.triggers.scare||pers.triggers.eventScare||"startled";
      else targetMood=pers.triggers.event||targetMood;
    }
    mood.modifier=mod;                     // every tick, never latched
    if(targetMood!==mood.current){
      mood.current=targetMood; mood.startTime=sim.time;
      mood.animationHook=targetMood; mood.commentaryHook=targetMood;
      sim.logs.push(`[${sim.time.toFixed(2)}s] MOOD ${r.rider.name} (${r.dog.name}) → ${targetMood}`);
    }
  });
}

function updateWeather(sim,dt){
  const plan=sim.weatherPlan;
  if(!plan.transitions.length)return;
  const t=plan.transitions[0];
  if(!t.fired && sim.time>=t.time){
    t.fired=true; sim.weather.transitioning=true; sim.weather.transitionStart=sim.time;
    sim.weather.next=t.next; sim.weather.transitionDuration=t.duration;
    sim.logs.push(`[${sim.time.toFixed(2)}s] WEATHER transition → ${t.next}`);
  }
  if(sim.weather.transitioning){
    if(sim.time-sim.weather.transitionStart>=sim.weather.transitionDuration){
      sim.weather.current=sim.weather.next; sim.weather.transitioning=false;
      sim.logs.push(`[${sim.time.toFixed(2)}s] WEATHER now ${sim.weather.current}`);
      $('weatherView').textContent=WEATHER[sim.weather.current].label;
    }
  }
}

/* Writes ONLY trackEventMult. The per-racer surge/hesitation lives
   in raceVarianceMult and is never touched here. */
function updateEvents(sim,dt){
  const leaderPos=Math.max(...sim.racers.map(r=>r.pos));
  sim.events.forEach(e=>{
    if(!e.triggered && leaderPos>=e.coursePosition){
      e.triggered=true; e.activeUntil=sim.time+e.duration;
      sim.activeEvents.push(e);
      sim.logs.push(`[${sim.time.toFixed(2)}s] EVENT ${e.defId} @ ${e.coursePosition}m`);
    }
  });
  sim.activeEvents=sim.activeEvents.filter(e=>sim.time<e.activeUntil);
  sim.racers.forEach(r=>{
    r.trackEventMult=1.0;
    sim.activeEvents.forEach(e=>{
      let resist=0;
      if(e.affected.includes("focus")) resist+=(r.dog.focus-5)*0.008;
      if(e.affected.includes("nerve")) resist+=(r.rider.nerve-5)*0.01;
      if(e.affected.includes("balance")) resist+=(r.rider.balance-5)*0.009;
      if(e.affected.includes("timing")) resist+=(r.rider.timing-5)*0.007;
      const impact=e.severity*(1-clamp(resist,0,0.7));
      if(e.type==="obstacle"||e.type==="surface") r.trackEventMult*=(1-impact*0.04);
      else if(e.type==="opening") r.trackEventMult*=(1+impact*0.03);
      else r.trackEventMult*=(1-impact*0.025);
    });
  });
  $('eventView').textContent=sim.activeEvents.length?sim.activeEvents.map(e=>e.defId).join(", "):"NO ACTIVE EVENTS";
}

/* big_overtake reads a deterministic rolling rank-history window
   (~1s of fixed 1/30 steps) rather than two consecutive frames. */
const RANK_WINDOW = 1.0;

function detectHighlights(sim){
  const order=[...sim.racers].sort((a,b)=>b.pos-a.pos);
  if(order[0] && sim.prevLeader!==undefined && order[0].entrantId!==sim.prevLeader){
    sim.highlights.push({time:Math.round(sim.time*100)/100,type:"lead_change",racers:[order[0].dog.id],entrants:[order[0].entrantId],severity:0.85,suggestedCamera:"side-close"});
    sim.logs.push(`[${sim.time.toFixed(2)}s] HIGHLIGHT lead_change → ${order[0].dog.name}`);
  }
  sim.prevLeader=order[0]?.entrantId;

  const ranks=new Array(sim.racers.length);
  order.forEach((r,idx)=>{ranks[r.i]=idx});
  sim.rankHistory.push({time:sim.time, ranks});
  while(sim.rankHistory.length && sim.time-sim.rankHistory[0].time>RANK_WINDOW) sim.rankHistory.shift();

  const oldest=sim.rankHistory[0];
  if(oldest && sim.time-oldest.time>=RANK_WINDOW*0.9){
    sim.racers.forEach(r=>{
      const gain=oldest.ranks[r.i]-ranks[r.i];
      const last=sim.lastOvertake[r.entrantId];
      if(gain>=2 && (last===undefined || sim.time-last>=RANK_WINDOW)){
        sim.lastOvertake[r.entrantId]=sim.time;
        sim.highlights.push({time:Math.round(sim.time*100)/100,type:"big_overtake",racers:[r.dog.id],entrants:[r.entrantId],severity:clamp(0.5+gain*0.12,0,1),suggestedCamera:"side",positionsGained:gain});
        sim.logs.push(`[${sim.time.toFixed(2)}s] HIGHLIGHT big_overtake ${r.dog.name} +${gain}`);
      }
    });
  }

  if(!sim.done && order[0] && order[1]){
    const gap=order[0].pos-order[1].pos;
    if(gap<8 && order[0].pos>sim.track.distance*0.92 && !sim.nearPhotoLogged){
      sim.highlights.push({time:Math.round(sim.time*100)/100,type:"photo_finish_threat",racers:[order[0].dog.id,order[1].dog.id],entrants:[order[0].entrantId,order[1].entrantId],severity:0.95,suggestedCamera:"finish-line"});
      sim.nearPhotoLogged=true;
      sim.logs.push(`[${sim.time.toFixed(2)}s] HIGHLIGHT photo_finish_threat`);
    }
  }
  sim.prevOrder=order.map(r=>r.i);
}
