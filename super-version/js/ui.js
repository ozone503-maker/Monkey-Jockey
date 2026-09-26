/* ============================================================
   UI — entry picker, results, system log, controls, boot
   ============================================================ */

/* Victory screen (bible §13.4, master spec §21-25): 1st/2nd/3rd podium with the
   real dog portrait + rider avatar, celebratory header, photo-finish call when
   the margin is tiny, the official order underneath, and RUN IT BACK = the same
   seed + teams + weather again (REPLAY). Reads sim.finishOrder only. */
const ORD = n => n + ({1:'st',2:'nd',3:'rd'}[n] || 'th');      // places 1-8
function podiumCard(r, place){
  const you = r.entrantId === PLAYER_ID ? ' you' : '';
  return `<div class="pod p${place}${you}">
    <div class="pod-art"><img class="pod-dog" src="${faceFor('dogs', r.dog.id)}" alt="${r.dog.name}">
      <img class="pod-rider" src="${faceFor('riders', r.rider.id)}" alt="${r.rider.name}"></div>
    <div class="pod-name"><strong>${r.dog.name}</strong><span>${r.rider.name}${you ? ' ★' : ''}</span></div>
    <div class="pod-time">${r.finish.toFixed(3)}s</div>
    <div class="pod-step">${ORD(place).toUpperCase()}</div></div>`;
}
function showResults(){
  Sound.victory();
  const F = sim.finishOrder, [a, b, c] = F;
  const margin = b ? b.finish - a.finish : 0;
  const mine = F.findIndex(r => r.entrantId === PLAYER_ID) + 1;
  const photo = margin < 0.05 ? `<div class="photo">📸 PHOTO FINISH · won by ${margin.toFixed(3)}s</div>` : '';
  $('results').style.display='block';
  $('results').innerHTML =
    `<div class="confetti" aria-hidden="true">${'<i></i>'.repeat(18)}</div>
    <div class="vic-head"><div class="vic-k">🏆 WINNER</div>
      <h2>${a.dog.name} + ${a.rider.name}</h2>${photo}
      <div class="vic-you${mine === 1 ? ' won' : ''}">${mine === 1 ? 'YOU WON!' : `You finished ${ORD(mine)}`}</div></div>
    <div class="podium">${b ? podiumCard(b, 2) : ''}${podiumCard(a, 1)}${c ? podiumCard(c, 3) : ''}</div>
    <div class="res-actions"><button type="button" class="primary" data-act="replay">RUN IT BACK</button>
      <button type="button" class="secondary" data-act="team">CHANGE TEAM</button></div>
    <h3 class="off-h">Official Finish</h3><ol>` +
    F.map(r => `<li class="${r.entrantId === PLAYER_ID ? 'you' : ''}"><img src="${faceFor('riders', r.rider.id)}" alt=""><strong>${r.dog.name}</strong> + ${r.rider.name} — ${r.finish.toFixed(3)}s</li>`).join('') + '</ol>';
  setTimeout(()=>{ try{ $('results').scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){} }, 400);
}

function dumpSystemLog(){
  const a=sim.finishOrder[0], b=sim.finishOrder[1];
  const margin=(a&&b)?(b.finish-a.finish):null;
  const lines=["=== DETERMINISTIC SYSTEM LOG ===",`Seed: ${sim.seed} | Track: ${sim.track.id}`,`Weather start: ${sim.weatherPlan.start} | Weather end: ${sim.weather.current}`,`Highlights: ${sim.highlights.length}`];
  lines.push("--- Entries ---");
  sim.entries.forEach(e=>lines.push(`${e.entrantId}: ${riderBy[e.riderId]?.name} on ${dogBy[e.dogId]?.name}`));
  if(margin!==null) lines.push(`Margin 1st→2nd: ${margin.toFixed(4)}s`);
  lines.push("--- Timeline ---");
  sim.logs.forEach(l=>lines.push(l));
  lines.push("--- Highlights ---");
  sim.highlights.forEach(h=>lines.push(JSON.stringify(h)));
  $('sysLog').textContent=lines.join("\n");
}

/* ---------------- team select ----------------
   The player picks one dog and one rider. The remaining seven of
   each are paired deterministically from the seed, so a given
   seed + player pick always produces the same field. -------- */
const PLAYER_ID = 'e1';
let playerPick = {dogId:'penny', riderId:'monkey-jockey'};

function statLine(kind, x){
  return kind === 'dogs'
    ? `SPD ${x.speed} · BRS ${x.burst} · STA ${x.stamina} · FOC ${x.focus}`
    : `BAL ${x.balance} · TIM ${x.timing} · NRV ${x.nerve} · LCK ${x.luck}`;
}

function charTile(kind, x, selected){
  const hasArt = ART.faces && ART.faces[kind] && ART.faces[kind][x.id];
  const todo = kind === 'dogs' && NO_IDENTITY_CANON.has(x.id) && !hasArt ? ' face-todo' : '';
  return `<button class="chartile${selected?' selected':''}" type="button" data-id="${x.id}">
      <img class="face${todo}" src="${faceFor(kind,x.id)}" alt="" title="${statLine(kind,x)}">
      <b>${x.name}</b>
    </button>`;
}

function renderTeamSelect(){
  $('dogGrid').innerHTML   = DOGS.map(d=>charTile('dogs',d,d.id===playerPick.dogId)).join('');
  $('riderGrid').innerHTML = RIDERS.map(r=>charTile('riders',r,r.id===playerPick.riderId)).join('');
  $('yourTeam').textContent =
    `${riderBy[playerPick.riderId].name} on ${dogBy[playerPick.dogId].name}`;
}

/* Fisher-Yates against a seeded generator. No Math.random anywhere. */
function shuffled(list, r){
  const a = list.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function buildField(s){
  const r = rng32(s ^ 0x9E3779B9);
  const dogs   = shuffled(DOGS.filter(d=>d.id!==playerPick.dogId), r);
  const riders = shuffled(RIDERS.filter(x=>x.id!==playerPick.riderId), r);
  const field  = [{entrantId:PLAYER_ID, dogId:playerPick.dogId, riderId:playerPick.riderId}];
  for(let i=0;i<dogs.length;i++)
    field.push({entrantId:'e'+(i+2), dogId:dogs[i].id, riderId:riders[i].id});
  return field;
}

function bindTeamSelect(){
  $('dogGrid').addEventListener('click', ev=>{
    const t = ev.target.closest && ev.target.closest('.chartile');
    if(!t) return;
    playerPick.dogId = t.dataset.id;
    renderTeamSelect(); refreshPreview();
  });
  $('riderGrid').addEventListener('click', ev=>{
    const t = ev.target.closest && ev.target.closest('.chartile');
    if(!t) return;
    playerPick.riderId = t.dataset.id;
    renderTeamSelect(); refreshPreview();
  });
}

function refreshPreview(){
  if(running) return;                       // never disturb a race in progress
  raceEntries = buildField(seed($('seed').value));
  sim = makeRace(lastSeed,'punahele',$('weather').value,raceEntries);
  draw();
}

function showTeamSelect(){
  running = false;
  Sound.stopCues(); Sound.playMusic('menu');
  if(typeof setCamera === 'function' && camera !== 'side') setCamera('side');   // new team → default SIDE view
  cancelAnimationFrame(raf);
  document.body.classList.remove('racing');
  reelStart();
  $('results').style.display='none';
  renderTeamSelect();
  refreshPreview();
}

/* ---------------- menu reel ----------------
   Two short loops cross-fading behind the team screen. Paused for the
   whole race so nothing competes with the track or burns battery. */
const REELS = ['reelA','reelB'];
let reelIdx = 0, reelTimer = null;

function reelShow(i){
  REELS.forEach((id,k)=>{
    const v = $(id); if(!v) return;
    v.classList.toggle('on', k===i);
    if(k===i){ const p=v.play(); if(p&&p.catch) p.catch(()=>{}); }
  });
}
function reelStart(){
  if(!$('reelA')) return;
  reelShow(reelIdx);
  clearInterval(reelTimer);
  reelTimer = setInterval(()=>{ reelIdx=(reelIdx+1)%REELS.length; reelShow(reelIdx); }, 7000);
}
function reelStop(){
  clearInterval(reelTimer); reelTimer=null;
  REELS.forEach(id=>{ const v=$(id); if(v){ v.pause(); v.classList.remove('on'); } });
}

/* ---------------- title screen ---------------- */
function enterGame(){
  const el = $('intro'); if(!el || el.dataset.done) return;
  el.dataset.done = '1';
  el.classList.add('gone');
  document.body.classList.remove('intro-open');
  setTimeout(()=>{
    el.hidden = true;
    const v = $('introVid'); if(v) v.pause();
  }, 600);
  reelStart();
  Sound.playMusic('theme');                     // keeps playing if the title already started it
  draw();
}

/* ---------------- controls ---------------- */
function start(replay=false){
  cancelAnimationFrame(raf);
  $('results').style.display='none';
  const s=replay?lastSeed:seed($('seed').value);
  if(replay){
    // reproduce the exact race: restore the entries AND the weather it ran with
    raceEntries=lastEntries.map(e=>({...e}));
    $('weather').value=lastWeather;
  } else {
    raceEntries=buildField(s);
    lastEntries=raceEntries.map(e=>({...e}));
    lastWeather=$('weather').value;
  }
  document.body.classList.add('racing');
  reelStop();
  Sound.raceStart();
  window.scrollTo(0,0);                         // the race view starts at the top on every screen size
  lastSeed=s; lastTrack='punahele';
  $('seed').value=s;
  $('seedView').textContent='SEED '+s;
  sim=makeRace(s,'punahele',lastWeather,lastEntries);
  $('weatherView').textContent=WEATHER[sim.weather.current].label;
  $('eventView').textContent="NO ACTIVE EVENTS";
  $('sysLog').textContent="Racing…";
  running=true; lastT=performance.now();
  function loop(t){
    const dt=Math.min(.05,(t-lastT)/1000); lastT=t;
    if(running){sim.acc+=dt; while(sim.acc>=1/30){step(1/30);sim.acc-=1/30}}
    draw();
    if(running)raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);
}

$('enterBtn').addEventListener('click',enterGame);
$('goBtn').addEventListener('click',()=>start(false));
$('teamBtn').addEventListener('click',showTeamSelect);
$('replayBtn').addEventListener('click',()=>start(true));
$('results').addEventListener('click',ev=>{
  const b=ev.target.closest && ev.target.closest('button[data-act]'); if(!b) return;
  if(b.dataset.act==='replay') start(true); else showTeamSelect();
});
$('weather').addEventListener('change',refreshPreview);
/* The OVERHEAD/top-down camera is retired: no button, key or auto-switch
   reaches it. drawTop() stays in render.js behind DEBUG_TOP_CAMERA=false. */
function setCamera(c){
  camera = c;                                   // render-only; the race is never touched
  $('sideBtn').classList.toggle('active', c==='side');
  $('frontBtn').classList.toggle('active', c==='front');
  $('sideBtn').setAttribute('aria-pressed', c==='side');
  $('frontBtn').setAttribute('aria-pressed', c==='front');
  draw();
}
$('sideBtn').addEventListener('click',()=>setCamera('side'));
$('frontBtn').addEventListener('click',()=>setCamera('front'));
window.addEventListener('resize',draw);

// Prevent selecting locked tracks
document.querySelectorAll('.track-card.locked').forEach(card=>{
  card.addEventListener('click',()=>alert(`${card.querySelector('h3').textContent} unlocks ${card.dataset.id==='rainforest'?'January 1, 2027':'February 14, 2027'}`));
});

/* ---------------- sound ---------------- */
Sound.init();
$('muteBtn').addEventListener('click', ev=>{ ev.stopPropagation(); Sound.setMuted(!Sound.muted); });
// a tap anywhere on the title (not only ENTER) starts the theme under the intro video
$('intro').addEventListener('click', ()=>{ if(!$('intro').dataset.done) Sound.playMusic('theme'); });

/* ---------------- boot ---------------- */
lastWeather = $('weather').value;
document.body.classList.add('intro-open');
bindTeamSelect();
renderTeamSelect();
raceEntries = buildField(seed($('seed').value));
sim=makeRace(lastSeed,'punahele',lastWeather,raceEntries);
draw();
