/* ============================================================
   TITLE — the moving title screen (super-v3).
   Spec: 2021 concept doc "Opening screen": a monkey on a racer going so
   fast it can barely hold on, the track in the background, the logo comes
   up, track music plays. Bible §13.4: intro with audio before ENTER.
   UI-PALETTE.md: monkey face beside MONKEY JOCKEY.
   What moves: the intro video (with a slow Ken Burns drift so the screen
   still moves when a phone refuses autoplay), the logo (CSS), and a parade
   of the eight teams galloping across a scrolling road, drawn with the SAME
   SIDE gait code the race uses (js/gait.js). Render-only: it never touches
   sim, the race rng or the seed.
   ============================================================ */
const TITLE = {raf:0, last:0, t:0, g:{}, on:false};
const TITLE_TEAMS = [   // canonical eight, each rider on one dog
  ['penny','monkey-jockey'], ['ghostbuster','fonk'], ['mike','erv'], ['kira','ipo'],
  ['noodle','dinny'], ['diva','mystery-drone-pilot'], ['beaux','nonna'], ['meatball','shockbot']
];

function titleTeam(k, dogId, riderId, x, ground, s, dt){
  const g = TITLE.g[k] || (TITLE.g[k] = {phase:k*0.137, tA:0, tV:0, lag:0, dt:0, rate:0});
  g.rate = STRIDE_HZ * (STEP_RATE[dogId] || 1) * 1.08; g.dt = dt; g.phase += dt * g.rate;
  const P = gaitPose(g), rider = riderBy[riderId];
  const kk = scaleFor(dogId), dogW = 185*s*kk, dogH = 104*s*kk;
  ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(x, ground, dogW*.34, 7*s, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
  const rig = RIGS[dogId], frame = (DOG_FRAMES[dogId] || [])[0];
  if(rig){
    drawRigDog(rig, x, ground, dogH*1.55/(rig.front - rig.rig.back), P, rider);
  } else if(frame && frame.complete && frame.naturalWidth && !frame.isPlaceholder){
    const h = dogH, w = h*frame.naturalWidth/frame.naturalHeight;
    drawSpriteGallop(frame, x, ground, w, h, P);
    drawSideRider(rider, x - w*0.04, ground - h*0.78 + P.bob*(h/300)*1.6, h/555*0.667, P);
  } else {
    const sc = dogW*0.9/100;
    const seat = drawVectorGallopDog(x, ground - 24*sc, sc, P, SIDE_LOOK[dogId] || SIDE_LOOK.penny);
    drawSideRider(rider, seat[0], seat[1], dogH/555*0.667, P);
  }
}

function drawTitle(dt){
  const cv = $('titleParade'); if(!cv) return;
  const w = cv.clientWidth, h = cv.clientHeight, ratio = Math.min(devicePixelRatio||1, 2);
  if(!w || !h) return;
  if(cv.width !== Math.round(w*ratio) || cv.height !== Math.round(h*ratio)){ cv.width = Math.round(w*ratio); cv.height = Math.round(h*ratio); }
  const prev = ctx; ctx = cv.getContext('2d');
  try{
    ctx.setTransform(ratio,0,0,ratio,0,0); ctx.clearRect(0,0,w,h);
    const roadTop = h*.38;
    let g = ctx.createLinearGradient(0, roadTop - 18, 0, h);
    g.addColorStop(0,'#2f6b3a00'); g.addColorStop(.12,'#2f6b3acc'); g.addColorStop(.2,'#3a3f42ee'); g.addColorStop(1,'#1f2326');
    ctx.fillStyle = g; ctx.fillRect(0, roadTop - 18, w, h - roadTop + 18);
    // lane dashes scroll toward the left: the camera tracks the pack
    ctx.fillStyle = '#ffffff55';
    const off = (TITLE.t*170) % 90;
    [.58,.86].forEach(f=>{ for(let x=-off; x<w; x+=90) ctx.fillRect(x, h*f, 44, 3); });
    const s = Math.max(.55, Math.min(1.1, h/330));
    const span = w + 340*s;
    // back row first (smaller, further up the road), then the front row
    [[1,.62,.82],[0,.97,1]].forEach(([row, yf, sm])=>{
      TITLE_TEAMS.forEach((tm,k)=>{
        if(k%2 !== row) return;
        const v = (34 + ((k*37)%5)*9 + 14*Math.sin(TITLE.t*.35 + k*1.7)) * s;     // teams drift and pass each other
        const x = ((k*span/4 + TITLE.t*v) % span) - 170*s;
        titleTeam(k, tm[0], tm[1], x, h*yf, s*sm, dt);
      });
    });
  } finally { ctx = prev; }
}

function titleLoop(t){
  const dt = TITLE.last ? Math.min(.05, (t - TITLE.last)/1000) : 0; TITLE.last = t; TITLE.t += dt;
  drawTitle(dt);
  if(TITLE.on) TITLE.raf = requestAnimationFrame(titleLoop);
}
function titleStart(){
  if(TITLE.on) return;
  TITLE.on = true; TITLE.last = 0;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ TITLE.on = false; drawTitle(0); return; }
  TITLE.raf = requestAnimationFrame(titleLoop);
}
function titleStop(){ TITLE.on = false; cancelAnimationFrame(TITLE.raf); }
