/* ============================================================
   FRONT CAMERA — player-selectable (SIDE / FRONT toggle).
   ------------------------------------------------------------
   Perspective port of the recovered Claude prototype
   (monkey-jockey/recovered/claude-front-camera-2026-09-08).
   Tuning = that prototype's README defaults:
     depth squash 6.0 · lead 50 m · camera height 1.1 · lane spread 1.5

   The camera rides `lead` metres ahead of the front of the field,
   looking back. Every racer is drawn from the engine's own r.pos,
   so what you see is the real race state. Render only: nothing
   here writes to sim.

   Port notes (differences from the prototype, on purpose):
   - project(distance) keeps the prototype's depth-scale formula
       k = 1 / (1 + max(0, distance - lead) * squash / 100)
     with distance = metres from the camera. The prototype's screen-y
     term, fed real camera distances, put the nearest dog highest on
     screen (depth order inverted), so y is derived from the same k
     on a ground plane: y = horizon + (nearGround - horizon) * k.
   - The prototype sized its canvas from CSS (a 150 px strip) and
     re-applied a DPR scale on every resize. Here the canvas height
     is responsive (see draw() in render.js) and the transform is
     reset with setTransform each resize, never accumulated.
   ============================================================ */
const FRONT_CAM = {squash:6.0, lead:50, camHeight:1.1, lanes:1.5};

function frontProject(distance, H){
  const drel = distance - FRONT_CAM.lead;
  const k = 1 / (1 + Math.max(0, drel) * FRONT_CAM.squash / 100);
  const horizon = H * (0.5 - 0.5 * (FRONT_CAM.camHeight - 1)) - H * 0.14;   // 1.1 → looking slightly down
  const near = H * 0.95;
  return {k, y: horizon + (near - horizon) * k, horizon};
}

/* Rider FRONT art: Gate 1 KEEPER files (checkerboard keyed), ShockBot = locked Phase 2 art. */
const RIDER_FRONT_SRC = {
  "shockbot":      "assets/riders/shockbot-front.webp",
  "nonna":         "assets/riders/nonna-front.webp",
  "ipo":           "assets/riders/ipo-front.webp",
  "erv":           "assets/riders/erv-front.webp",
  "monkey-jockey": "assets/riders/monkey-jockey-front.webp",
  "dinny":         "assets/riders/dinny-front.webp",
  "fonk":          "assets/riders/fonk-front.webp",
  "mystery-drone-pilot": "assets/riders/mystery-drone-pilot-front.webp"   // Gate 1 KEEPER (locked Sep 18), checkerboard keyed
};
const RIDER_FRONT = Object.fromEntries(Object.entries(RIDER_FRONT_SRC).map(([id,src])=>{
  const im = new Image(); im.src = src; return [id, im];
}));
/* Portrait images (faces.js SVG or ART.faces override) reused as heads for drawn fallbacks. */
const FACE_IMG = {};
function faceImg(kind, id){
  const key = kind + ':' + id;
  // FRONT dog heads are cut from the drawn SVG portraits (transparent, fixed 72-unit layout);
  // the real dog portraits have a square light-blue backdrop and stay in the picker/results.
  const src = kind === 'dogs' ? (DOG_FACES[id] || PLACEHOLDER_FACE) : faceFor(kind, id);
  if(!FACE_IMG[key]){ const im = new Image(); im.src = src; FACE_IMG[key] = im; }
  return FACE_IMG[key];
}
const imgOK = im => im && im.complete && im.naturalWidth > 0;

/* Coat palette for the drawn FRONT dog (no front-view dog art exists yet). */
const DOG_FRONT_LOOK = {
  meatball:    {coat:'#3d2a1d', chest:'#3d2a1d', leg:'#33231a'},
  beaux:       {coat:'#6f6258', chest:'#f2efe6', leg:'#5a4e45', mottle:'#4a3f38'},
  kira:        {coat:'#4a2f22', chest:'#8e948f', leg:'#3d2619'},
  penny:       {coat:'#d8a45c', chest:'#f6f1e4', leg:'#c89450', collar:'#4a90d9'},
  mike:        {coat:'#1c1b1e', chest:'#f2efe6', leg:'#1c1b1e'},
  diva:        {coat:'#4a2f22', chest:'#4a2f22', leg:'#3d2619', collar:'#e8853a', speck:'#f2efe6'},
  noodle:      {coat:'#f4f2ec', chest:'#f4f2ec', leg:'#e6e2d8', collar:'#e0517d'},
  ghostbuster: {coat:'#f2efe6', chest:'#f2efe6', leg:'#e4e0d6', spot:'#1c1b1e'}
};

function frontRacer(r, x, y, s, phase){
  const L = DOG_FRONT_LOOK[r.dog.id] || {coat:colorFor(r.i), chest:colorFor(r.i), leg:'#222'};
  const ds = s * (DOG_SCALE[r.dog.id] || 1);
  const T = Math.PI * 2;
  const bob = Math.abs(Math.sin(phase * T)) * ds * 0.035;
  ctx.save(); ctx.translate(x, y);
  // shadow
  ctx.globalAlpha = .30; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 0, ds*.26, ds*.045, 0, 0, T); ctx.fill(); ctx.globalAlpha = 1;
  ctx.translate(0, -bob);
  ctx.lineWidth = Math.max(1, ds*.012); ctx.strokeStyle = '#0b0e0c';
  // front legs: alternate reach (the gallop lead leg lifts)
  const lift = Math.sin(phase * T);
  [[-1, lift], [1, -lift]].forEach(([side, l])=>{
    const up = Math.max(0, l) * ds * .07;
    ctx.fillStyle = L.leg;
    ctx.beginPath(); ctx.roundRect(side*ds*.07 - ds*.042, -ds*.25, ds*.084, ds*.25 - up, ds*.035); ctx.fill(); ctx.stroke();
  });
  // chest / body
  ctx.fillStyle = L.coat;
  ctx.beginPath(); ctx.ellipse(0, -ds*.29, ds*.165, ds*.125, 0, 0, T); ctx.fill(); ctx.stroke();
  ctx.fillStyle = L.chest;
  ctx.beginPath(); ctx.ellipse(0, -ds*.26, ds*.075, ds*.085, 0, 0, T); ctx.fill();
  if(L.speck){ ctx.fillStyle = L.speck; ctx.beginPath(); ctx.arc(0, -ds*.25, ds*.018, 0, T); ctx.fill(); }
  if(L.spot){ ctx.fillStyle = L.spot; ctx.beginPath(); ctx.ellipse(ds*.105, -ds*.32, ds*.038, ds*.032, 0, 0, T); ctx.fill(); }
  // rider sits behind the dog's head, feet at the dog's back line
  const im = RIDER_FRONT[r.rider.id];
  const rw = ds * .54;
  if(imgOK(im)){
    const rh = rw * im.naturalHeight / im.naturalWidth;
    ctx.drawImage(im, -rw/2, -ds*.34 - rh*.93, rw, rh);
  } else {
    // drawn fallback rider: crouched body in team colour + portrait head
    ctx.fillStyle = colorFor(r.i);
    ctx.beginPath(); ctx.roundRect(-rw*.28, -ds*.70, rw*.56, ds*.34, ds*.06); ctx.fill(); ctx.stroke();
    const fh = faceImg('riders', r.rider.id), fs = rw * .62;
    if(imgOK(fh)) ctx.drawImage(fh, -fs/2, -ds*.70 - fs*.80, fs, fs);
  }
  // dog head: the picker portrait, cropped to the head (drops its bust/shoulders)
  const dh = faceImg('dogs', r.dog.id), hs = ds * .30;
  if(imgOK(dh)){
    const nw = dh.naturalWidth || 72, sc = nw / 72;
    ctx.drawImage(dh, 8*sc, 0, 56*sc, 52*sc, -hs/2, -ds*.60, hs, hs * 52/56);
  }
  if(L.collar){ ctx.fillStyle = L.collar; ctx.fillRect(-ds*.075, -ds*.34, ds*.15, ds*.028); }
  ctx.restore();
}

function drawFront(w, h){
  // sky + forest band + road in perspective
  const P0 = frontProject(1e6, h);
  const horizon = P0.horizon;
  let g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, '#6d8f8a'); g.addColorStop(1, '#2a4534');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, horizon + 1);
  ctx.fillStyle = '#1e3a2a';
  for(let i = 0; i < 26; i++){
    const x = (i * 97) % (w + 40) - 20, r0 = 10 + (i % 5) * 5;
    ctx.beginPath(); ctx.arc(x, horizon - r0 * .4, r0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#2d5533'; ctx.fillRect(0, horizon, w, h - horizon);
  const halfRoad = k => w * (0.06 + 0.46 * k);            // road edges converge to the horizon
  ctx.fillStyle = '#1d2321';
  ctx.beginPath(); ctx.moveTo(w/2 - halfRoad(0), horizon); ctx.lineTo(w/2 + halfRoad(0), horizon);
  ctx.lineTo(w/2 + halfRoad(1.08), h); ctx.lineTo(w/2 - halfRoad(1.08), h); ctx.closePath(); ctx.fill();
  if(!sim) return;
  const dist = sim.track.distance;
  const ref = Math.max(...sim.racers.map(r => r.pos));     // front of the field (clamps at the line)
  const cam = ref + FRONT_CAM.lead;
  // lane dashes scroll with the field
  ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 2;
  for(let m = Math.ceil((ref - 90) / 10) * 10; m <= ref + 8; m += 10){
    const p = frontProject(cam - m, h), hw = halfRoad(p.k);
    ctx.beginPath(); ctx.moveTo(w/2 - hw*.5, p.y); ctx.lineTo(w/2 - hw*.5, p.y - 3 - 6*p.k);
    ctx.moveTo(w/2 + hw*.5, p.y); ctx.lineTo(w/2 + hw*.5, p.y - 3 - 6*p.k); ctx.stroke();
  }
  // finish line + banner once it is inside the camera's view
  const gapF = ref - dist;                                  // <0: line still ahead of the leader
  // behind the leader: the prototype's squash curve; ahead of the leader (between
  // leader and camera) that curve diverges, so use plain 1/z against the camera
  const kF = gapF >= 0 ? 1 / (1 + gapF * FRONT_CAM.squash / 100)
                       : FRONT_CAM.lead / Math.max(1, FRONT_CAM.lead + gapF);
  if(gapF > -FRONT_CAM.lead * 0.9 && kF > 0 && kF < 2.6){
    const yF = frontProject(1e6, h).horizon + (h * 0.95 - horizon) * kF;
    const hw = halfRoad(kF), sq = Math.max(3, 9 * kF);
    for(let x = w/2 - hw, n = 0; x < w/2 + hw; x += sq, n++){
      ctx.fillStyle = n % 2 ? '#f2f4f1' : '#14181a'; ctx.fillRect(x, yF - sq, sq, sq);
      ctx.fillStyle = n % 2 ? '#14181a' : '#f2f4f1'; ctx.fillRect(x, yF, sq, sq);
    }
    if(yF < h){
      const bh = Math.max(10, 26 * kF), top = yF - h * .55 * Math.min(1.4, kF);
      ctx.fillStyle = '#e8ecea';
      ctx.fillRect(w/2 - hw - 3, top, 5, yF - top); ctx.fillRect(w/2 + hw - 2, top, 5, yF - top);
      ctx.fillStyle = '#c0392b'; ctx.fillRect(w/2 - hw, top, hw * 2, bh);
      ctx.fillStyle = '#fff'; ctx.font = `900 ${Math.round(bh * .7)}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FINISH', w/2, top + bh/2);
      ctx.textBaseline = 'alphabetic';
    }
  }
  // racers, far → near
  const base = Math.min(h * 0.62, w * (w < 700 ? 0.44 : 0.36));
  const list = sim.racers.map(r => ({r, d: cam - r.pos})).sort((a, b) => b.d - a.d || b.r.i - a.r.i);
  list.forEach(({r, d})=>{
    const p = frontProject(d, h);
    const s = p.k * base;
    if(s < 6) return;
    const lane = (r.i - 3.5) * 0.6 * FRONT_CAM.lanes;       // prototype lane layout
    const x = w/2 + lane * p.k * w * 0.093;
    frontRacer(r, x, p.y, s, gaitPhase(r));
  });
  // compact place tags for the two nearest-to-camera racers only (no label pile-up)
  frontTags(list.slice(-2), cam, h, base, w);
}

function frontTags(items, cam, h, base, w){
  ctx.font = '800 11px system-ui'; ctx.textAlign = 'center';
  const boxes = [];
  items.forEach(({r, d})=>{
    const p = frontProject(d, h), s = p.k * base;
    const lane = (r.i - 3.5) * 0.6 * FRONT_CAM.lanes;
    const x = w/2 + lane * p.k * w * 0.093, y = p.y + 13;
    const label = r.dog.name + (r.entrantId === PLAYER_ID ? ' ★' : '');
    const tw = ctx.measureText(label).width + 10;
    let bx = Math.max(2, Math.min(w - tw - 2, x - tw/2)), by = Math.min(h - 16, y - 10);
    for(const b of boxes){ if(bx < b.x + b.w + 4 && bx + tw + 4 > b.x && by < b.y + 14 && by + 14 > b.y) by = b.y - 17; }
    boxes.push({x:bx, y:by, w:tw});
    ctx.fillStyle = '#0d1711cc'; ctx.fillRect(bx, by, tw, 14);
    ctx.fillStyle = r.entrantId === PLAYER_ID ? '#b8f07a' : '#fff'; ctx.fillText(label, bx + tw/2, by + 11);
  });
}
// gaitPhase()/gaitState() live in js/gait.js (shared with SIDE).
