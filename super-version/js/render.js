/* ============================================================
   RENDER — player cameras over one race state (SIDE default).
   Switching camera never restarts or alters the race.
   ============================================================ */

function forest(w,h,horizon,scroll=0){
  // ʻōhiʻa-forward rainforest base. Distant volcano silhouettes only in menus.
  let g=ctx.createLinearGradient(0,0,0,horizon);
  g.addColorStop(0,'#6d8f8a'); g.addColorStop(.5,'#4a6b5c'); g.addColorStop(1,'#2a4534');
  ctx.fillStyle=g; ctx.fillRect(0,0,w,horizon);
  ctx.fillStyle='#1e3a2a'; ctx.fillRect(0,horizon*.38,w,horizon*.62);
  for(let i=0;i<48;i++){
    const x=(((i*139-scroll)%w)+w)%w, th=32+(i%8)*11, y=horizon-th*.48;
    ctx.fillStyle=i%5===0?'#153528':i%3===0?'#244a35':'#1c3d2c';
    ctx.beginPath();
    ctx.arc(x,y,th*.28,0,Math.PI*2);
    ctx.arc(x+th*.16,y+th*.05,th*.24,0,Math.PI*2);
    ctx.arc(x-th*.15,y+th*.07,th*.22,0,Math.PI*2);
    ctx.fill();
    ctx.fillRect(x-2.5,y+th*.14,5,th*.55);
  }
}

/* ShockBot SIDE placeholder (no side-view ShockBot art exists yet).
   Identity lock: clean silver robot, turquoise bead necklace, hat and
   sunglasses always on. Drawn, facing right, centred on (cx,cy). */
function shockbotHeadSide(cx,cy,rad){
  ctx.save(); ctx.translate(cx,cy);
  const u=rad/10;
  ctx.lineWidth=Math.max(1.2,1.6*u); ctx.strokeStyle='#0b0e0c';
  // turquoise bead necklace
  ctx.fillStyle='#2bb5a8';
  for(let k=-2;k<=2;k++){ctx.beginPath();ctx.arc(k*3.6*u,9.5*u+Math.abs(k)*-.8*u,2.1*u,0,Math.PI*2);ctx.fill();ctx.stroke();}
  // silver head
  const g=ctx.createLinearGradient(0,-9*u,0,9*u); g.addColorStop(0,'#e6eaee'); g.addColorStop(1,'#9aa2aa');
  ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(-8*u,-8*u,17*u,16*u,3.5*u); ctx.fill(); ctx.stroke();
  // sunglasses (always on)
  ctx.fillStyle='#101316'; ctx.beginPath(); ctx.roundRect(-1*u,-3*u,11*u,5*u,2*u); ctx.fill();
  ctx.fillStyle='#8fb8c8'; ctx.fillRect(3*u,-2.2*u,3*u,1*u);
  // leopard hat (always on): brim + crown + band
  ctx.fillStyle='#c99a58'; ctx.beginPath(); ctx.ellipse(1*u,-8.5*u,13*u,2.6*u,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-6.5*u,-17*u,14*u,9*u,[4*u,4*u,0,0]); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#2a1d12'; ctx.fillRect(-6.5*u,-10.5*u,14*u,2*u);
  ctx.fillStyle='#6b4a26';
  [[-3,-14],[1.5,-15.5],[4.5,-12.8],[-1,-12],[8,-8.8],[-9,-8.6]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a*u,b*u,1.1*u,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}

/* SIDE racer. Every dog gallops on the render-side gait clock (js/gait.js):
   Penny = the prototype's cut-out rig; dogs with single-pose running art =
   sprite gallop; dogs with no art = vector gallop placeholder. y is the
   racer's lane line (ground = y + 24*s). */
const SIDE_LOOK = {
  meatball:{coat:'#3d2a1d',leg:'#3d2a1d',far:'#2a1c13',ear:'#2a1c13'},
  beaux:{coat:'#6f6258',leg:'#6f6258',far:'#4a3f38',ear:'#4a3f38'},
  kira:{coat:'#4a2f22',leg:'#4a2f22',far:'#33201a',ear:'#33201a'},
  penny:{coat:'#d8a45c',leg:'#d8a45c',far:'#b0833f',ear:'#8a5a30'},
  mike:{coat:'#1c1b1e',leg:'#1c1b1e',far:'#0e0d10',ear:'#0e0d10'},
  diva:{coat:'#4a2f22',leg:'#4a2f22',far:'#33201a',ear:'#33201a'},
  noodle:{coat:'#f4f2ec',leg:'#f4f2ec',far:'#cfcac0',ear:'#c9a06a'},
  ghostbuster:{coat:'#f2efe6',leg:'#f2efe6',far:'#cfcac0',ear:'#1c1b1e',spot:'#1c1b1e'}
};
function racer(r,x,y,s){
  const k = scaleFor(r.dog.id);
  const g = gaitState(r), P = gaitPose(g);
  const ground = y + 24*s, dogW = 185*s*k, dogH = 104*s*k;   // height-normalised: feet on one road line
  ctx.save();
  ctx.globalAlpha=.28; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(x,ground,dogW*.34,7*s,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
  let topY;
  const rig = RIGS[r.dog.id];
  const frames = DOG_FRAMES[r.dog.id], frame = frames && frames[0];
  if(rig){
    const S = dogH * 1.55 / (rig.front - rig.rig.back);        // match the sprite dogs' body length
    drawRigDog(rig, x, ground, S, P, r.rider);
    topY = ground - dogH - 44*s;
  } else if(frame && frame.complete && frame.naturalWidth && !frame.isPlaceholder){
    const h = dogH, w = h * frame.naturalWidth / frame.naturalHeight;
    drawSpriteGallop(frame, x, ground, w, h, P);
    const seat = [x - w*0.04, ground - h*0.78 + P.bob*(h/300)*1.6];
    drawSideRider(r.rider, seat[0], seat[1], h/555*0.667, P);
    topY = ground - h - 44*s;
  } else {
    const sc = dogW*0.9/100;
    const seat = drawVectorGallopDog(x, ground - 24*sc, sc, P, SIDE_LOOK[r.dog.id] || SIDE_LOOK.penny);
    drawSideRider(r.rider, seat[0], seat[1], dogH/555*0.667, P);
    topY = seat[1] - 50*s;
  }
  return {x, topY, ground};
}

/* Name tags without the pile-up: every racer gets a small numbered disc in
   its colour; full tags only for YOUR racer (★) and the leader, nudged apart
   if they would overlap. The rankings list below carries every name. */
function sideLabels(placed, leaderId){
  placed.forEach(({r,x,ground})=>{
    ctx.fillStyle=colorFor(r.i); ctx.strokeStyle='#0b0e0c'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(x-4, ground+9, 7, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='900 9px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(String(r.i+1), x-4, ground+9.5); ctx.textBaseline='alphabetic';
  });
  const tags = placed.filter(p=>p.r.entrantId===PLAYER_ID || p.r.entrantId===leaderId)
    .sort((a,b)=>(a.r.entrantId===PLAYER_ID)-(b.r.entrantId===PLAYER_ID));
  const boxes=[];
  tags.forEach(p=>{
    const you = p.r.entrantId===PLAYER_ID;
    const txt = (you?'★ ':'') + p.r.dog.name + ' · ' + (p.r.rider.short || p.r.rider.name.split(' ')[0]) + (p.r.entrantId===leaderId?' · 1st':'');
    ctx.font='800 11px system-ui';
    const tw=ctx.measureText(txt).width+12, th=17;
    let bx=p.x-tw/2, by=Math.max(4,p.topY-th);
    for(const b of boxes){ if(bx<b.x+b.w && bx+tw>b.x && by<b.y+b.h && by+th>b.y) by=b.y-th-3; }
    by=Math.max(2,by);
    boxes.push({x:bx,y:by,w:tw,h:th});
    ctx.fillStyle= you ? '#1d3626ee' : '#0d1711dd'; ctx.strokeStyle= you ? '#8abd39' : '#ffffff40'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(bx,by,tw,th,6); ctx.fill(); ctx.stroke();
    ctx.fillStyle= you ? '#d8f5a8' : '#fff'; ctx.textAlign='center'; ctx.fillText(txt,p.x,by+12.5);
  });
}

function topRacer(r,x,y){
  const top = DOG_TOPS[r.dog.id];
  if(top && top.complete && top.naturalWidth && !top.isPlaceholder){
    const k = scaleFor(r.dog.id);
    const tw = 34*k, th = tw*(top.naturalHeight/top.naturalWidth);
    ctx.save(); ctx.translate(x,y);
    ctx.globalAlpha=.30; ctx.fillStyle='#000';
    ctx.beginPath(); ctx.ellipse(0,th*.28,tw*.42,th*.15,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    ctx.drawImage(top,-tw/2,-th*.52,tw,th);
    ctx.restore(); return;
  }
  const k = scaleFor(r.dog.id);
  ctx.save(); ctx.translate(x,y); ctx.scale(.86*k,.86*k);
  ctx.fillStyle=colorFor(r.i); ctx.strokeStyle='#090b0a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(0,0,13,20,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#f0e3c8';
  ctx.beginPath(); ctx.arc(0,-3,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* SIDE camera: the leader sits ~80% across; the view widens as the field
   spreads so the whole pack stays readable, dog size stays fixed. 8 lanes
   stacked in depth and drawn back → front. Road dashes + forest parallax
   scroll with the camera so motion reads as running, not sliding. */
const SIDECAM = {view:null, sim:null};
function drawSide(w,h){
  const horizon=h*.30, roadTop=h*.38;
  const sS = clamp(w/1150, .42, 1.05);
  let camLeft = 0, view = 60;
  if(sim){
    const lead=Math.max(...sim.racers.map(r=>r.pos));
    const unfinished=sim.racers.filter(r=>!r.finished);
    const tail=Math.min(...(unfinished.length?unfinished:sim.racers).map(r=>r.pos));
    const vMin=Math.max(24, w/15), vMax=240;
    const target=clamp((lead-tail)*1.3+w/40, vMin, vMax);
    if(SIDECAM.sim!==sim || SIDECAM.view===null){ SIDECAM.sim=sim; SIDECAM.view=target; }
    SIDECAM.view += (target-SIDECAM.view)*0.06;
    view=SIDECAM.view;
    camLeft=lead-view*0.80;
  }
  const marginL=90*sS, marginR=150*sS;
  const pxPerM=(w-marginL-marginR)/view;
  const X = m => marginL+(m-camLeft)*pxPerM;
  forest(w,h,horizon,camLeft*pxPerM*0.25);
  let grass=ctx.createLinearGradient(0,horizon,0,roadTop+28);
  grass.addColorStop(0,'#2d5533'); grass.addColorStop(1,'#4d6b3e');
  ctx.fillStyle=grass; ctx.fillRect(0,horizon,w,roadTop-horizon+34);
  let rg=ctx.createLinearGradient(0,roadTop,0,h);
  rg.addColorStop(0,'#222826'); rg.addColorStop(.5,'#1a1f1e'); rg.addColorStop(1,'#121615');
  ctx.fillStyle=rg; ctx.fillRect(0,roadTop,w,h-roadTop);
  ctx.strokeStyle='#3a4a40'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(0,roadTop); ctx.lineTo(w,roadTop); ctx.stroke();
  if(!sim)return;
  // scrolling road dashes every 10 m (two rows) + distance boards every 100 m
  ctx.strokeStyle='#ffffff1c'; ctx.lineWidth=2;
  const m0=Math.floor((camLeft-marginL/pxPerM)/10)*10, m1=camLeft+(w/pxPerM);
  for(let m=m0;m<=m1;m+=10){
    const x=X(m); if(x<-20||x>w+20) continue;
    [roadTop+(h-roadTop)*.08, h-48].forEach(yy=>{ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+Math.min(40,pxPerM*5),yy);ctx.stroke();});
  }
  ctx.fillStyle='#f4ead4'; ctx.font='800 10px system-ui'; ctx.textAlign='center';
  for(let m=Math.ceil(m0/100)*100;m<=m1;m+=100){
    if(m<=0||m>=sim.track.distance) continue;
    const x=X(m); ctx.fillStyle='#3a2a1c'; ctx.fillRect(x-1.5,horizon+4,3,roadTop-horizon-4);
    ctx.fillStyle='#f4ead4'; ctx.fillRect(x-14,horizon+2,28,13); ctx.fillStyle='#1a1f1e'; ctx.fillText(m+'m',x,horizon+12);
  }
  // finish line
  const fx=X(sim.track.distance);
  if(fx>-20 && fx<w+20){
    const sq=7;
    for(let yy=roadTop, n=0; yy<h-40; yy+=sq, n++){
      ctx.fillStyle=n%2?'#f2f4f1':'#14181a'; ctx.fillRect(fx-sq,yy,sq,sq);
      ctx.fillStyle=n%2?'#14181a':'#f2f4f1'; ctx.fillRect(fx,yy,sq,sq);
    }
    ctx.fillStyle='#c0392b'; ctx.fillRect(fx-30,horizon-22,60,16);
    ctx.fillStyle='#fff'; ctx.font='900 11px system-ui'; ctx.fillText('FINISH',fx,horizon-10);
  }
  const lead=Math.max(...sim.racers.map(r=>r.pos));
  // lanes spread over the whole road (back lane at the road's top edge) so the
  // back rows are not buried under the front rows
  const y0=roadTop+(h-roadTop)*.05, y1=h-50;
  const placed=[];
  [...sim.racers].sort((a,b)=>a.i-b.i).forEach(r=>{
    const lane=r.i, y=y0+(y1-y0)*lane/7;
    const s=1.05*sS*(.86+.14*lane/7);
    placed.push(racer(r,X(r.pos),y,s));
    placed[placed.length-1].r=r;
  });
  const leaderR=[...sim.racers].sort((a,b)=>
    (a.finished&&b.finished)?(a.finish-b.finish):a.finished?-1:b.finished?1:(b.pos-a.pos||a.i-b.i))[0];
  sideLabels(placed, leaderR && leaderR.entrantId);
  // progress strip
  ctx.fillStyle='rgba(4,10,7,.75)'; ctx.fillRect(12,h-30,w-24,20);
  sim.racers.forEach((r,i)=>{
    const x=20+(r.pos/sim.track.distance)*(w-40);
    ctx.fillStyle=colorFor(i);
    ctx.beginPath(); ctx.arc(x,h-20,r.entrantId===PLAYER_ID?6:4.5,0,Math.PI*2); ctx.fill();
    if(r.entrantId===PLAYER_ID){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
  });
}

/* DEAD CODE — top-down/OVERHEAD camera. Players must never see it.
   Only reachable if a developer flips this flag in source. */
const DEBUG_TOP_CAMERA = false;

function drawTop(w,h){
  ctx.fillStyle='#163325'; ctx.fillRect(0,0,w,h);
  for(let i=0;i<140;i++){
    const x=(i*83)%w, y=(i*149)%h, rad=6+(i%6)*4;
    ctx.fillStyle=i%5===0?'#2a4f35':i%3===0?'#1e3f2c':'#183628';
    ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2); ctx.fill();
  }
  const rw=Math.max(150,w*.60), x0=w-rw-14;
  ctx.fillStyle='#1e2422'; ctx.fillRect(x0,0,rw,h);
  ctx.fillStyle='#3d5a40'; ctx.fillRect(x0-7,0,7,h); ctx.fillRect(x0+rw,0,7,h);
  ctx.strokeStyle='#ffffff10'; ctx.lineWidth=1;
  for(let l=1;l<8;l++){
    const lx=x0+rw*(l/8);
    ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,h); ctx.stroke();
  }
  if(!sim)return;
  const lane=rw/8;
  sim.racers.forEach((r,i)=>{
    const p=r.pos/sim.track.distance;
    const y=h-34-p*(h-68);
    const x=x0+lane*(i+.5);
    topRacer(r,x,y);
  });
}

function rankings(){
  if(!sim)return;
  /* Finished racers first, in official finish order (exact crossing time,
     same key as sim.finishOrder), then everyone still running by distance.
     The old sort used pos only, so once racers were clamped to the line it
     fell back to entry order and disagreed with the Official Finish. */
  const order=[...sim.racers].sort((a,b)=>
    (a.finished&&b.finished) ? (a.finish-b.finish||a.i-b.i) :
    a.finished ? -1 : b.finished ? 1 :
    (b.pos-a.pos||a.i-b.i));
  $('rankings').innerHTML=order.map((r,i)=>{
    const p=Math.round(r.pos/sim.track.distance*100);
    const mood=sim.moods[r.entrantId]?.current||"";
    const you = r.entrantId===PLAYER_ID ? ' you' : '';
    return `<div class="rank${you}"><div class="pos">${i+1}</div>
      <div class="names"><strong>${r.dog.name}</strong><span>${r.rider.name} · ${mood}</span></div>
      <div class="meter"><i style="width:${p}%"></i></div></div>`;
  }).join('');
  $('status').textContent=sim.done?'FINISHED':`Punahēle · ${Math.round(Math.max(...sim.racers.map(r=>r.pos)))} / ${sim.track.distance} m`;
}

/* Responsive canvas height: 16:9 on wide screens; on narrow/phone screens
   it grows toward ~46% of the viewport so the FRONT view is never a thin
   strip. Backing store = CSS size x DPR (cap 2); transform is reset, never
   accumulated. */
function stageHeight(w){
  let h = w*9/16;
  if(w < 700) h = Math.min(Math.max(h, innerHeight*0.44), w*1.15);
  else h = Math.min(h, Math.max(320, innerHeight*0.64));    // desktop: whole race view fits on screen
  return Math.round(h);
}

function draw(){
  const w=canvas.clientWidth, h=stageHeight(w), ratio=Math.min(devicePixelRatio||1,2);
  if(canvas.style.height!==h+'px') canvas.style.height=h+'px';
  if(canvas.width!==Math.round(w*ratio) || canvas.height!==Math.round(h*ratio)){
    canvas.width=Math.round(w*ratio); canvas.height=Math.round(h*ratio);
  }
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.clearRect(0,0,w,h);
  if(camera==='top' && !DEBUG_TOP_CAMERA) camera='side';   // never show top-down to players
  if(camera==='top') drawTop(w,h);
  else if(camera==='front') drawFront(w,h);
  else drawSide(w,h);
  rankings();
}
