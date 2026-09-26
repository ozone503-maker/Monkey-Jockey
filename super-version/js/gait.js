/* ============================================================
   GAIT — SIDE gallop cycle (render only; never writes to sim).
   ------------------------------------------------------------
   Ported from recovered/claude-side-gallop-timing-2026-09-21/
   gallop-timing.html (legAngles, pitch/bob from footfalls, spine
   flex, tail spring, rider torso lag + head level) with the
   prototype's gait values: hip 34°, knee 80°, ankle 11°,
   stance (duty) 34%, front delay 38%.

   Physics locks (recovered/side-stride-physics-notes-2026-09-21):
   1. head low and thrust forward (HEAD_LOW), spine long and flat;
   2. stance comes from the footfall bars (DUTY), not eyeballed;
   3. step frequency scales with leg length, per dog (STEP_RATE,
      the measured table: Beaux ×0.89 … Ghostbuster ×1.06).
   Animation speed follows each racer's engine speed r.speed, and
   the clock advances on sim.time, so it pauses with the race and a
   REPLAY animates identically.
   ============================================================ */
const GAIT_A = [34*Math.PI/180, 80*Math.PI/180, 11*Math.PI/180];
const DUTY = 0.34;            // stance fraction per leg (footfall bars)
const FRONT_DELAY = 0.38;     // front pair lags the rear pair by 38% of a cycle
const HEAD_LOW = 0.26;        // rad, nose down/forward at the gallop
const STEP_RATE = {beaux:0.89, meatball:0.96, kira:1.00, mike:1.00, diva:1.03, penny:1.04, noodle:1.05, ghostbuster:1.06};
const STRIDE_HZ = 3.6;        // strides/s at REF_SPEED for a ×1.00 dog
const REF_SPEED = 13.8;       // m/s ≈ Punahēle average race pace (900 m / ~65 s)

const frac = x => x - Math.floor(x);
function legAngles(p, duty, A){
  p = frac(p);
  if(p < duty){
    const t = p / duty;
    return [A[0]*(1-2*t), A[1]*0.10*Math.sin(Math.PI*t), A[2]*0.25*Math.sin(Math.PI*t), true];
  }
  const t = (p - duty) / (1 - duty);
  const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  const fold = Math.pow(Math.sin(Math.PI*Math.min(1, t*1.08)), 0.75);
  return [-A[0] + 2*A[0]*ease, A[1]*fold, A[2]*Math.sin(Math.PI*t)*0.8, false];
}

/* Per-racer render state, keyed by entrantId, reset when a new race starts. */
const GAIT = {sim:null, st:{}};
function gaitState(r){
  if(GAIT.sim !== sim){ GAIT.sim = sim; GAIT.st = {}; }
  let g = GAIT.st[r.entrantId];
  const t = sim ? sim.time : 0;
  if(!g){ g = GAIT.st[r.entrantId] = {phase: r.i*0.137, t, tA:0, tV:0, lag:0, dt:0}; }
  const dt = Math.max(0, Math.min(0.1, t - g.t)); g.t = t; g.dt = dt;
  let rate = STRIDE_HZ * (STEP_RATE[r.dog.id] || 1) * (r.speed / REF_SPEED);
  if(r.finished && r.finish != null) rate *= Math.max(0, 1 - (t - r.finish) / 2.5);   // pull up after the line
  g.rate = rate;
  g.phase += dt * rate;
  return g;
}
function gaitPhase(r){ return gaitState(r).phase; }

/* Pose derived from the phase, as in the prototype. */
function gaitPose(g){
  const moving = g.rate > 0.3;
  /* Port correction: in the prototype the stance sweep ran +hip → -hip, which
     with canvas rotation moves the planted paw back→front, against the
     scrolling ground (a moonwalk). The hip sign is flipped so a planted paw
     travels backward under the body; knee/ankle folds are unchanged. */
  const L = p => { const a = legAngles(p, DUTY, GAIT_A); return [-a[0], a[1], a[2], a[3]]; };
  const RE = moving ? L(g.phase) : [0,0,0,true];
  const FR = moving ? L(g.phase + FRONT_DELAY) : [0,0,0,true];
  const RE2 = moving ? L(g.phase + 0.07) : RE;          // far-side legs: rotary gallop offset
  const FR2 = moving ? L(g.phase + FRONT_DELAY + 0.07) : FR;
  const air = (!RE[3] && !FR[3]) ? 1 : 0;
  const bob = moving ? (-air*13 + (RE[3]?4:0) + (FR[3]?4:0)) : 8;
  const pitch = moving ? ((FR[3]?-0.045:0) + (RE[3]?0.045:0)) : 0;
  const spine = moving ? (air ? -0.055 : 0.045) : 0;
  const dt = g.dt;
  g.lag += (pitch - g.lag) * Math.min(1, dt*7);
  const tT = -pitch*2.2 - air*0.12;
  g.tV += ((tT - g.tA)*46 - g.tV*7) * dt; g.tA += g.tV * dt;
  return {RE, FR, RE2, FR2, air, bob, pitch, spine, lag:g.lag, tail:g.tA};
}

/* ---------- rig loader ---------- */
function loadRig(rig){
  const I = {};
  const ld = src => { const im = new Image(); im.src = src; return im; };
  I.body = ld(rig.body.src);
  for(const k in rig.parts) I[k] = ld(rig.parts[k].src);
  let front = rig.body.ox + rig.body.w;
  for(const k in rig.parts){ const p = rig.parts[k]; front = Math.max(front, p.ax - p.px + p.w); }
  return {rig, I, front};
}
const RIGS = { penny: loadRig(RIG_PENNY) };
const MJ_SIDE = { R: RIG_MJ_SIDE, torso: Object.assign(new Image(), {src: RIG_MJ_SIDE.torso.src}),
                  head: Object.assign(new Image(), {src: RIG_MJ_SIDE.head.src}) };

function turn(p, pv, a){ const dx=p[0]-pv[0], dy=p[1]-pv[1], ca=Math.cos(a), sa=Math.sin(a);
  return [pv[0]+dx*ca-dy*sa, pv[1]+dx*sa+dy*ca]; }

/* Draw a rigged dog (prototype renderer) with its ground line at y and its
   length centred on x. S = rig px → screen px. Returns the seat point. */
function drawRigDog(R, x, y, S, P, rider, riderScaleMul){
  const D = R.rig, I = R.I, J = D.joints, ok = im => im && im.complete && im.naturalWidth;
  const cx = (D.back + R.front) / 2;
  const bobK = S / 0.6;
  const px = v => x + (v - cx) * S;
  const gy = y + P.bob * bobK * 0.6, py = v => gy + (v - D.ground) * S;
  function put(k, pos, ang){ const Pp = D.parts[k], im = I[k]; if(!ok(im)) return;
    ctx.save(); ctx.translate(px(pos[0]), py(pos[1])); ctx.rotate(ang);
    ctx.drawImage(im, -Pp.px*S, -Pp.py*S, Pp.w*S, Pp.h*S); ctx.restore(); }
  function leg(side, a){
    const a1=a[0], a2=a[0]+a[1], a3=a[0]+a[1]+a[2];
    const Pp=D.parts, h0=[Pp[side+'_hip'].ax, J.hip], kn=[Pp[side+'_knee'].ax, J.knee], an=[Pp[side+'_paw'].ax, J.ankle];
    const kn2=turn(kn,h0,a1), an2=turn(turn(an,h0,a1),kn2,a2-a1);
    put(side+'_hip',h0,a1); put(side+'_knee',kn2,a2); put(side+'_paw',an2,a3);
  }
  ctx.save();
  const pvx = px(D.back+330), pvy = py(D.ground-230);
  ctx.translate(pvx, pvy); ctx.rotate(P.pitch); ctx.translate(-pvx, -pvy);
  put('tail', [D.parts.tail.ax, D.parts.tail.ay], P.tail);
  leg('rear', P.RE); leg('front', P.FR);
  ctx.save();
  const svx = px(D.back+330), svy = py(D.ground-260);
  ctx.translate(svx, svy); ctx.rotate(P.spine); ctx.translate(-svx, -svy);
  if(ok(I.body)) ctx.drawImage(I.body, px(D.body.ox), py(D.body.oy), D.body.w*S, D.body.h*S);
  ctx.restore();
  // head low + thrust forward (physics lock 1), plus the prototype's level-holding counter-rotation
  const H = D.parts.head;
  put('head', [H.ax + 14, H.ay + 22], HEAD_LOW - P.pitch*0.9 - P.spine*0.6);
  // The prototype's seat left the rider hovering above the back (visible in the
  // prototype too); drop it onto the withers so the rider is actually mounted.
  const seat = [px(D.seat[0] + 20), py(D.seat[1] + 70)];
  drawSideRider(rider, seat[0], seat[1], S * (riderScaleMul || 0.667), P);
  ctx.restore();
  return seat;
}

/* SIDE rider at a seat point. Monkey Jockey uses the prototype's side rig
   (torso + head, lag + head level). Every other rider has no SIDE art:
   drawn crouched jockey + head (ShockBot drawn head, else picker portrait). */
function drawSideRider(rider, sx, sy, RS, P){
  const ok = im => im && im.complete && im.naturalWidth;
  if(!rider) return;
  if(rider.id === 'monkey-jockey' && ok(MJ_SIDE.torso)){
    const R = MJ_SIDE.R;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(P.lag*1.6 + 0.36);
    ctx.drawImage(MJ_SIDE.torso, -(R.hip[0]-R.torso.ox)*RS, -(R.hip[1]-R.torso.oy)*RS, R.torso.w*RS, R.torso.h*RS);
    if(ok(MJ_SIDE.head)){
      const hx=(R.head.ax-R.hip[0])*RS, hy=(R.head.ay-R.hip[1])*RS;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(-(P.lag*1.6+0.36)*0.9);
      ctx.drawImage(MJ_SIDE.head, -R.head.px*RS, -R.head.py*RS, R.head.w*RS, R.head.h*RS); ctx.restore();
    }
    ctx.restore(); return;
  }
  // drawn placeholder jockey, sized to the same seat scale (torso ≈ 190 rig px)
  const u = RS * 11.2;             // torso ≈ 35% of dog height, head ≈ 24%
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(0.55 + P.lag*1.6);
  ctx.lineWidth = Math.max(1, 1.6*u/2); ctx.strokeStyle = '#0b0e0c';
  ctx.fillStyle = riderColor(rider.id);
  ctx.beginPath(); ctx.roundRect(-6*u, -26*u, 12*u, 26*u, 5*u); ctx.fill(); ctx.stroke();          // torso
  ctx.beginPath(); ctx.moveTo(4*u, -20*u); ctx.lineTo(13*u, -10*u); ctx.stroke();                   // arm to the neck
  ctx.restore();
  const hx = sx + Math.sin(0.55)*26*u, hy = sy - Math.cos(0.55)*26*u - 6*u;
  const hc = riderHead(rider.id);
  if(ok(hc)){ const hs = 22*u; ctx.drawImage(hc, hx - hs/2, hy - hs*0.58, hs, hs); return; }   // real head cut from the locked art
  if(rider.id === 'shockbot'){ shockbotHeadSide(hx, hy, 9*u); return; }
  const f = sideFace(rider.id), fs = 18*u;
  if(ok(f)){
    ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, fs/2, 0, Math.PI*2); ctx.clip();
    ctx.drawImage(f, hx - fs/2, hy - fs/2, fs, fs); ctx.restore();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#0b0e0c'; ctx.beginPath(); ctx.arc(hx, hy, fs/2, 0, Math.PI*2); ctx.stroke();
  }
}
const RIDER_COLORS = {nonna:'#7d858c', ipo:'#4a90d9', erv:'#5c7a3f', 'mystery-drone-pilot':'#2f6fd6', dinny:'#e0517d', fonk:'#8f2420', shockbot:'#4a4f55', 'monkey-jockey':'#3a7bd5'};
const riderColor = id => RIDER_COLORS[id] || '#777';
const SIDE_FACE = {};
/* transparent head cut-outs from the locked FRONT art (assets/faces/riders/<id>-head.webp) */
const RIDER_HEAD = {};
function riderHead(id){
  if(id === 'monkey-jockey') return null;            // MJ has the real side rig
  if(!(id in RIDER_HEAD)){ const im = new Image(); im.src = `assets/faces/riders/${id}-head.webp`; RIDER_HEAD[id] = im; }
  return RIDER_HEAD[id];
}
function sideFace(id){ if(!SIDE_FACE[id]){ const im = new Image(); im.src = faceFor('riders', id); SIDE_FACE[id] = im; } return SIDE_FACE[id]; }

/* Vector placeholder dog with a real gallop cycle (for dogs with no art):
   four two-segment legs driven by legAngles, bob/pitch from footfalls, head low. */
function drawVectorGallopDog(x, y, sc, P, look){
  ctx.save(); ctx.translate(x, y + P.bob*sc*0.35); ctx.scale(sc, sc); ctx.rotate(P.pitch);
  ctx.lineCap = 'round'; ctx.strokeStyle = '#0b0e0c';
  const legs = [[-20, P.RE2, true], [16, P.FR2, true], [-20, P.RE, false], [16, P.FR, false]];
  legs.forEach(([hx, a, far])=>{
    const t1 = a[0], t2 = a[0] + a[1];
    const k = [hx - 13*Math.sin(t1), 4 + 13*Math.cos(t1)];
    const f = [k[0] - 13*Math.sin(t2), k[1] + 13*Math.cos(t2)];
    ctx.strokeStyle = '#0b0e0c'; ctx.lineWidth = 7.5;
    ctx.beginPath(); ctx.moveTo(hx, 4); ctx.lineTo(k[0], k[1]); ctx.lineTo(f[0], f[1]); ctx.stroke();
    ctx.strokeStyle = far ? look.far : look.leg; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(hx, 4); ctx.lineTo(k[0], k[1]); ctx.lineTo(f[0], f[1]); ctx.stroke();
  });
  ctx.lineWidth = 2.1; ctx.strokeStyle = '#0b0e0c';
  // tail
  ctx.strokeStyle = look.coat; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-30, -4); ctx.quadraticCurveTo(-42, -10 + P.tail*20, -48, -4 + P.tail*30); ctx.stroke();
  ctx.lineWidth = 2.1; ctx.strokeStyle = '#0b0e0c';
  // long flat body
  ctx.fillStyle = look.coat;
  ctx.beginPath(); ctx.ellipse(0, -2, 33, 14, P.spine, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  if(look.spot){ ctx.fillStyle = look.spot; ctx.beginPath(); ctx.ellipse(-8, -8, 7, 5, 0, 0, Math.PI*2); ctx.fill(); }
  // head low and forward
  ctx.save(); ctx.translate(30, -6); ctx.rotate(HEAD_LOW - P.pitch*0.9);
  ctx.fillStyle = look.coat;
  ctx.beginPath(); ctx.ellipse(8, 2, 11, 8, 0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(18, 5, 7, 5, 0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = look.ear; ctx.beginPath(); ctx.ellipse(2, -2, 4, 7, -0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#14100e'; ctx.beginPath(); ctx.arc(24, 3.5, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, -1, 1.6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.restore();
  // seat point in world coords (mid-back)
  return [x - 2*sc, y + P.bob*sc*0.35 - 16*sc];
}

/* Sprite gallop for single-pose running art: the body rides the footfall
   bob/pitch, and the leg band (below LEG_TOP of the sprite) is drawn in thin
   strips sheared by the rear/front hip angle, so the baked legs swing
   through the cycle instead of sliding. Rear half = left, front = right. */
const LEG_TOP = 0.56;
function drawSpriteGallop(img, x, y, w, h, P){
  const iw = img.naturalWidth, ih = img.naturalHeight;
  ctx.save(); ctx.translate(x, y + P.bob*(h/300)*1.6);
  ctx.rotate(P.pitch*0.8);
  const top = -h, legY = -h + h*LEG_TOP, sTop = ih*LEG_TOP;
  ctx.drawImage(img, 0, 0, iw, sTop + 1, -w/2, top, w, h*LEG_TOP + 1);          // body + head
  const N = 10, band = h*(1-LEG_TOP), sBand = ih - sTop;
  const halves = [[0, 0.5, P.RE], [0.5, 1.0, P.FR]];
  halves.forEach(([u0, u1, a])=>{
    const sh = Math.tan(Math.max(-0.5, Math.min(0.5, a[0]*0.75)));          // swing
    const fold = a[1] * 0.10;                                                 // knee fold lifts the paw
    for(let j = 0; j < N; j++){
      const t0 = j/N, t1 = (j+1)/N, tm = (t0+t1)/2;
      const dx = -sh * band * tm * (1 + fold*tm);
      const dyLift = -fold * band * tm * tm * 0.6;
      ctx.drawImage(img, iw*u0, sTop + sBand*t0, iw*(u1-u0), sBand*(t1-t0) + 1,
                    -w/2 + w*u0 + dx, legY + band*t0 + dyLift, w*(u1-u0), band*(t1-t0) + 1);
    }
  });
  ctx.restore();
}
