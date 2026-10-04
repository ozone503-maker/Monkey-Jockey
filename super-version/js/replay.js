/* ============================================================
   REPLAY + SHARE (Oct 3 2026). Jessie: "We need a replay. Then the user should be able to share
   his/her replay on their social media sites to get other people to play."
   - WATCH REPLAY re-runs the finished race from lastSeed + lastEntries + lastWeather (the race is
     deterministic). Speed 1× / 0.5×, SKIP, auto slow-mo on a photo finish. A replay never rolls a
     new seed and never changes lastSeed/lastEntries/lastWeather. (This build has no Kudoken
     wallet, payouts or bets, so there is nothing else a replay could touch.)
   - SHARE CLIP records a ≤20 s vertical clip of the replay: the race canvas is copied every frame
     onto a 720x1280 compositor canvas (header + race + live standings + footer, then an end card),
     captureStream(30) + MediaRecorder: MP4 where supported (Safari/iOS, newer Chromium), else WebM.
     Clip = the start (3 s) → cut to the final stretch → slow-mo finish → 3.5 s end card.
   - Share sheet: navigator.share with the video file + text + challenge URL; fallback = save video,
     X / Facebook / WhatsApp intent links, copy link. No analytics, pixels or cookies.
   - Challenge link: ?race=SEED&dog=ID&rider=ID&w=WEATHER (the race needs the team + weather too).
     Render/UI only: the race engine (js/race.js, js/systems.js) is untouched.
   ============================================================ */
const SHARE_BASE = 'https://monkey-jockey-test.vercel.app/';
const SHARE_HOST = 'monkey-jockey-test.vercel.app';
const REPLAY = { on:false, rec:false, speed:1, clip:null, photoT:null, shared:false, keepSeed:null };
let LAST_RACE = null;          // snapshot of the last finished race (set by showResults)

function raceKey(R){ return R ? `${R.seed}|${R.dog}|${R.rider}|${R.weather}` : ''; }
function challengeURL(R){
  return `${SHARE_BASE}?race=${R.seed}&dog=${encodeURIComponent(R.dog)}&rider=${encodeURIComponent(R.rider)}&w=${encodeURIComponent(R.weather)}`;
}
function shareText(R){
  const me = R.mine === 1 ? 'My team won!' : `My team (${R.myDog} & ${R.myRider}) finished ${ORD(R.mine)}.`;
  return `${R.winDog} & ${R.winRider} won race #${R.seed} on Monkey Jockey! ${me} Can you beat it?`;
}
/* called by showResults() for every finished race (live or replay) */
function noteFinishedRace(){
  const F = sim.finishOrder, a = F[0], b = F[1], me = F.find(r => r.entrantId === PLAYER_ID);
  const pick = lastEntries.find(e => e.entrantId === PLAYER_ID) || {};
  LAST_RACE = { seed: lastSeed, weather: lastWeather, dog: pick.dogId, rider: pick.riderId,
    winDog: a.dog.name, winRider: a.rider.name, winT: a.finish, margin: b ? b.finish - a.finish : 1,
    mine: F.indexOf(me) + 1, myDog: me.dog.name, myRider: me.rider.name,
    podium: F.slice(0, 3).map(r => ({dog: r.dog.id, rider: r.rider.id, dn: r.dog.name, rn: r.rider.name, t: r.finish})) };
}

/* ---------------- replay mode ---------------- */
function currentRaceRef(){
  const p = lastEntries.find(e => e.entrantId === PLAYER_ID) || {};
  return {seed:lastSeed, dog:p.dogId, rider:p.riderId, weather:lastWeather};
}
function startReplay(opts = {}){
  if(!lastEntries || !lastEntries.length) return;
  closeSheet();
  REPLAY.on = true; REPLAY.rec = !!opts.record; REPLAY.speed = 1; REPLAY.shared = !!opts.shared;
  const R = LAST_RACE && raceKey(LAST_RACE) === raceKey(currentRaceRef()) ? LAST_RACE : null;
  REPLAY.photoT = R && R.margin < 0.05 ? R.winT : null;
  REPLAY.clip = REPLAY.rec && R ? { phase:'start', startEnd: 3.0, jumpTo: Math.max(3.2, R.winT - 9.5),
    slowAt: R.winT - 1.2, slowEnd: R.winT + 0.8, cutAt: R.winT + 1.4, flashUntil: 0 } : null;
  document.body.classList.add('replaying');
  document.body.classList.toggle('recording', REPLAY.rec);
  $('replayBar').hidden = false;
  $('replayInfo').textContent = REPLAY.rec ? 'Recording your clip…' : `Race #${lastSeed}${REPLAY.shared ? ' · shared' : ''}`;
  setReplaySpeed(1);
  if(REPLAY.keepSeed === null) REPLAY.keepSeed = $('seed').value;   // start(true) writes the replayed seed into the box
  start(true);
}
function restoreSeedBox(){       // a replay leaves the next race's seed exactly as it was
  if(REPLAY.keepSeed !== null){ $('seed').value = REPLAY.keepSeed; REPLAY.keepSeed = null; }
}
function setReplaySpeed(v){
  REPLAY.speed = v;
  document.querySelectorAll('#replayBar [data-sp]').forEach(b => {
    const on = Number(b.dataset.sp) === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
  });
}
/* sim-time rate for the game loop (ui.js start()); may fast-forward the sim for the clip cut */
function replayRate(){
  const C = REPLAY.clip;
  if(!C){
    if(REPLAY.speed === 1 && REPLAY.photoT !== null && sim.time >= REPLAY.photoT - 1.2 && sim.time <= REPLAY.photoT + 0.6){
      $('replayInfo').textContent = 'PHOTO FINISH · slow-mo'; return 0.5;
    }
    return REPLAY.speed;
  }
  if(C.phase === 'start' && sim.time >= C.startEnd){
    while(!sim.done && sim.time < C.jumpTo) step(1/30);
    sim.acc = 0; C.phase = 'stretch'; C.flashUntil = performance.now() + 1300;
  }
  if(C.phase === 'stretch' && sim.time >= C.slowAt) C.phase = 'slow';
  if(C.phase === 'slow' && sim.time >= C.slowEnd) C.phase = 'after';
  if(C.phase === 'after' && sim.time >= C.cutAt){ C.phase = 'end'; while(!sim.done) step(1/30); }
  return C.phase === 'slow' ? 0.5 : 1;
}
function skipReplay(){
  if(!sim || sim.done) return;
  if(REPLAY.rec){ cancelRecording(); }
  while(!sim.done) step(1/30);
  draw();
}
/* showResults() calls this after rendering; the replay ends here */
function endReplayUI(){
  const wasRec = REPLAY.rec;
  restoreSeedBox();
  REPLAY.on = false; REPLAY.rec = false; REPLAY.clip = null; REPLAY.photoT = null;
  document.body.classList.remove('replaying');
  if(!wasRec){ document.body.classList.remove('recording'); $('replayBar').hidden = true; }
  else $('replayInfo').textContent = 'Finishing your clip…';
}
function stopReplayMode(){        // CHANGE TEAM etc. during a replay
  if(REC.rec && REC.rec.state !== 'inactive') cancelRecording();
  restoreSeedBox();
  REPLAY.on = false; REPLAY.rec = false; REPLAY.clip = null;
  document.body.classList.remove('replaying', 'recording');
  if($('replayBar')) $('replayBar').hidden = true;
}

/* ---------------- recording ---------------- */
const REC = { cv:null, cx:null, rec:null, chunks:[], mime:'', ext:'webm', blob:null, url:'', key:'', raf:0,
              endAt:0, endStart:0, imgs:{}, cancelled:false, file:null };
function pickMime(){
  if(!window.MediaRecorder || !MediaRecorder.isTypeSupported) return null;
  const mp4 = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'];
  const webm = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const prefer = new URLSearchParams(location.search).get('recfmt') === 'webm' ? webm.concat(mp4) : mp4.concat(webm);
  return prefer.find(m => { try{ return MediaRecorder.isTypeSupported(m); }catch(e){ return false; } }) || null;
}
function canRecord(){
  const c = document.createElement('canvas');
  return !!(c.captureStream && pickMime());
}
function img(src){ if(!REC.imgs[src]){ const i = new Image(); i.src = src; REC.imgs[src] = i; } return REC.imgs[src]; }
function shareClip(){
  const R = LAST_RACE; if(!R) return;
  if(REC.blob && REC.key === raceKey(R)){ openSheet(); return; }
  if(!canRecord()){ openSheet({noVideo:true}); return; }
  REC.mime = pickMime(); REC.ext = REC.mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  REC.cv = REC.cv || Object.assign(document.createElement('canvas'), {width:720, height:1280});
  REC.cx = REC.cv.getContext('2d'); REC.chunks = []; REC.cancelled = false; REC.endAt = 0; REC.endStart = 0;
  R.podium.forEach(p => { img(faceFor('dogs', p.dog)); img(faceFor('riders', p.rider)); });
  // Post to all (js/postforme.js) also needs a clean TikTok copy: record it at the same time
  if(REC.cleanURL) URL.revokeObjectURL(REC.cleanURL);
  REC.cleanBlob = null; REC.cleanURL = ''; REC.cv2 = null; REC.cx2 = null; REC.rec2 = null; REC.chunks2 = [];
  if(window.PFM && PFM.enabled){
    REC.cv2 = Object.assign(document.createElement('canvas'), {width:720, height:1280}); REC.cx2 = REC.cv2.getContext('2d');
    try{ REC.rec2 = new MediaRecorder(REC.cv2.captureStream(30), {mimeType: REC.mime, videoBitsPerSecond: 3000000}); }catch(e){ REC.rec2 = null; }
    if(REC.rec2) REC.rec2.ondataavailable = ev => { if(ev.data && ev.data.size) REC.chunks2.push(ev.data); };
  }
  const stream = REC.cv.captureStream(30);
  try{ REC.rec = new MediaRecorder(stream, {mimeType: REC.mime, videoBitsPerSecond: 3000000}); }
  catch(e){ REC.rec = new MediaRecorder(stream); REC.mime = REC.rec.mimeType || 'video/webm'; REC.ext = REC.mime.includes('mp4') ? 'mp4' : 'webm'; }
  REC.rec.ondataavailable = ev => { if(ev.data && ev.data.size) REC.chunks.push(ev.data); };
  REC.rec.onstop = () => {
    cancelAnimationFrame(REC.raf); document.body.classList.remove('recording'); $('replayBar').hidden = true;
    if(REC.cancelled){ REC.chunks = []; return; }
    if(REC.url) URL.revokeObjectURL(REC.url);
    REC.blob = new Blob(REC.chunks, {type: REC.mime.split(';')[0]}); REC.url = URL.createObjectURL(REC.blob);
    if(REC.chunks2 && REC.chunks2.length) REC.cleanBlob = new Blob(REC.chunks2, {type: REC.mime.split(';')[0]});
    REC.key = raceKey(R);
    REC.file = new File([REC.blob], `monkey-jockey-race-${R.seed}.${REC.ext}`, {type: REC.mime.split(';')[0]});
    window.MJ_LAST_CLIP = {mime: REC.mime, size: REC.blob.size};          // for the test harness
    openSheet();
  };
  startReplay({record: true});
  compose(performance.now());           // first frame before start so the stream has content
  REC.rec.start(250); if(REC.rec2) REC.rec2.start(250);
  REC.raf = requestAnimationFrame(composeLoop);
}
function cancelRecording(){
  REC.cancelled = true; cancelAnimationFrame(REC.raf);
  if(REC.rec2 && REC.rec2.state !== 'inactive') REC.rec2.stop();
  if(REC.rec && REC.rec.state !== 'inactive') REC.rec.stop();
}
function composeLoop(now){
  compose(now);
  if(REC.endAt && now >= REC.endAt){
    if(REC.rec2 && REC.rec2.state !== 'inactive') REC.rec2.stop();        // stops first: its last chunk lands before onstop of the main one
    if(REC.rec.state !== 'inactive') REC.rec.stop(); return; }
  REC.raf = requestAnimationFrame(composeLoop);
}
const FONT = 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function logo(c, cx, y, size){
  c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = `900 ${size}px ${FONT}`;
  const a = 'MONKEY ', b = 'JOCKEY';
  while(size > 24 && c.measureText(a + b).width > cx * 2 - 60){ size -= 2; c.font = `900 ${size}px ${FONT}`; }   // fit the canvas width
  const wa = c.measureText(a).width, wb = c.measureText(b).width, x0 = cx - (wa + wb) / 2;
  c.textAlign = 'left'; c.lineWidth = size * 0.12; c.strokeStyle = '#25170f';
  c.strokeText(a, x0, y); c.strokeText(b, x0 + wa, y);
  c.fillStyle = '#e0517d'; c.fillText(a, x0, y); c.fillStyle = '#8abd39'; c.fillText(b, x0 + wa, y);
}
function compose(now){
  const R = LAST_RACE; if(!REC.cx || !R) return;
  const ending = !!(REPLAY.clip && REPLAY.clip.phase === 'end') || !!(sim && sim.done);
  if(ending && !REC.endAt){ REC.endStart = now; REC.endAt = now + 3500; }
  composeTo(REC.cx, now, R, false);
  if(REC.cx2) composeTo(REC.cx2, now, R, true);
}
/* clean = the TikTok copy: TikTok's content rules forbid any brand name, logo, link or promo text
   in shared content, so it has no title, no URL and a plain result card (Post to all only) */
function composeTo(c, now, R, clean){
  const W = 720, H = 1280;
  if(REC.endAt){ endCard(c, W, H, R, Math.min(1, (now - REC.endStart) / 350), clean); return; }
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d1f15'); g.addColorStop(1, '#121514');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if(!clean) logo(c, W / 2, 92, 64);
  c.textAlign = 'center'; c.fillStyle = '#a9c2b3'; c.font = `700 22px ${FONT}`;
  c.fillText(`PUNAHĒLE SPRINT · 900 M · RACE #${R.seed}`, W / 2, clean ? 112 : 132);
  // the race canvas, scaled to full width (centre-cropped if it is taller than the slot)
  const top = 160, slot = 720, cw = canvas.width, ch = canvas.height;
  const sc = W / cw, dh = Math.min(slot, ch * sc), sy = Math.max(0, (ch * sc - dh) / 2) / sc;
  c.save(); rr(c, 12, top, W - 24, dh, 22); c.clip();
  c.drawImage(canvas, 0, sy, cw, dh / sc, 12, top, W - 24, dh);
  c.restore(); c.lineWidth = 6; c.strokeStyle = '#674224'; rr(c, 12, top, W - 24, dh, 22); c.stroke();
  // badges
  c.font = `900 22px ${FONT}`; c.textAlign = 'left';
  c.fillStyle = '#e0517d'; rr(c, 28, top + 16, 132, 40, 20); c.fill(); c.fillStyle = '#fff'; c.fillText('▶ REPLAY', 44, top + 44);
  const ph = REPLAY.clip ? REPLAY.clip.phase : '';
  const tag = ph === 'slow' ? 'PHOTO FINISH · SLOW-MO' : (now < (REPLAY.clip ? REPLAY.clip.flashUntil : 0) ? 'FINAL STRETCH' : '');
  if(tag){ const tw = c.measureText(tag).width + 36; c.fillStyle = '#f4d891'; rr(c, W - 28 - tw, top + 16, tw, 40, 20); c.fill();
    c.fillStyle = '#25170f'; c.fillText(tag, W - 28 - tw + 18, top + 44); }
  // live standings (top 4) under the race
  if(sim){
    const order = [...sim.racers].sort((a, b) => (a.finished && b.finished) ? (a.finish - b.finish || a.i - b.i) :
      a.finished ? -1 : b.finished ? 1 : (b.pos - a.pos || a.i - b.i));
    let y = top + dh + 26;
    order.slice(0, 4).forEach((r, i) => {
      const you = r.entrantId === PLAYER_ID;
      c.fillStyle = you ? '#1d3626' : '#ffffff10'; rr(c, 24, y, W - 48, 64, 14); c.fill();
      if(you){ c.lineWidth = 3; c.strokeStyle = '#8abd39'; rr(c, 24, y, W - 48, 64, 14); c.stroke(); }
      c.fillStyle = '#f4d891'; c.font = `900 30px ${FONT}`; c.textAlign = 'center'; c.fillText(String(i + 1), 58, y + 43);
      c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = `800 26px ${FONT}`; c.fillText(`${r.dog.name}${you ? ' ★' : ''}`, 92, y + 30);
      c.fillStyle = '#a9c2b3'; c.font = `600 19px ${FONT}`; c.fillText(r.rider.name, 92, y + 54);
      const p = r.pos / sim.track.distance; c.fillStyle = '#ffffff1f'; rr(c, 420, y + 26, 260, 12, 6); c.fill();
      c.fillStyle = '#8abd39'; rr(c, 420, y + 26, Math.max(12, 260 * p), 12, 6); c.fill();
      y += 74;
    });
  }
  if(!clean){ c.fillStyle = '#a9c2b3'; c.font = `700 24px ${FONT}`; c.textAlign = 'center';
    c.fillText(`Play free · ${SHARE_HOST}`, W / 2, H - 34); }
}
function endCard(c, W, H, R, a, clean){
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#102A5C'); g.addColorStop(1, '#35163F');
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = a;
  if(!clean) logo(c, W / 2, 190, 92);
  c.textAlign = 'center'; c.fillStyle = '#f4d891'; c.font = `900 26px ${FONT}`; c.fillText('W I N N E R', W / 2, 300);
  c.fillStyle = '#fff'; c.font = `900 54px ${FONT}`;
  const line = `${R.winDog} & ${R.winRider} won!`;
  let fs = 54; while(c.measureText(line).width > W - 60 && fs > 30){ fs -= 2; c.font = `900 ${fs}px ${FONT}`; }
  c.fillText(line, W / 2, 372);
  // podium faces: 2nd, 1st, 3rd
  const slots = [[1, W / 2 - 220, 560, 150], [0, W / 2, 520, 190], [2, W / 2 + 220, 580, 140]];
  slots.forEach(([k, x, y, s]) => {
    const p = R.podium[k]; if(!p) return;
    const d = img(faceFor('dogs', p.dog)), rd = img(faceFor('riders', p.rider));
    c.save(); rr(c, x - s / 2, y - s / 2, s, s, 22); c.clip();
    if(d.complete && d.naturalWidth) c.drawImage(d, x - s / 2, y - s / 2, s, s); else { c.fillStyle = '#ffffff22'; c.fillRect(x - s / 2, y - s / 2, s, s); }
    c.restore(); c.lineWidth = 6; c.strokeStyle = k === 0 ? '#f4d891' : '#ffffffcc'; rr(c, x - s / 2, y - s / 2, s, s, 22); c.stroke();
    const rs = s * 0.48, rx = x + s / 2 - rs * 0.55, ry = y + s / 2 - rs * 0.45;
    c.save(); c.beginPath(); c.arc(rx, ry, rs / 2, 0, Math.PI * 2); c.clip();
    if(rd.complete && rd.naturalWidth) c.drawImage(rd, rx - rs / 2, ry - rs / 2, rs, rs); c.restore();
    c.lineWidth = 4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(rx, ry, rs / 2, 0, Math.PI * 2); c.stroke();
    c.fillStyle = k === 0 ? '#f4d891' : '#fff'; c.font = `900 30px ${FONT}`; c.fillText(ORD(k + 1).toUpperCase(), x, y + s / 2 + 62);
    c.fillStyle = '#bfe3ff'; c.font = `700 20px ${FONT}`; c.fillText(p.dn, x, y + s / 2 + 92);
  });
  c.fillStyle = R.mine === 1 ? '#b8f07a' : '#bfe3ff'; c.font = `800 28px ${FONT}`;
  c.fillText(R.mine === 1 ? 'My team won!' : `My team finished ${ORD(R.mine)}`, W / 2, 820);
  if(!clean){
    c.fillStyle = '#fff'; c.font = `900 40px ${FONT}`; c.fillText('Can you beat it?', W / 2, 930);
    c.fillStyle = '#e0517d'; rr(c, 60, 975, W - 120, 96, 48); c.fill();
    c.fillStyle = '#fff'; c.font = `900 33px ${FONT}`; c.fillText(SHARE_HOST, W / 2, 1036);
  }
  c.fillStyle = '#a9c2b3'; c.font = `700 22px ${FONT}`; c.fillText(`Race #${R.seed} · Punahēle Sprint · 900 m`, W / 2, 1120);
  c.globalAlpha = 1;
}

/* ---------------- share sheet ---------------- */
function closeSheet(){ const s = $('shareSheet'); if(s) s.hidden = true; document.body.classList.remove('mjsheet-open'); }
function openSheet(opts = {}){
  const R = LAST_RACE; if(!R) return;
  const url = challengeURL(R), text = shareText(R), enc = encodeURIComponent;
  const hasVid = !!(REC.blob && REC.key === raceKey(R)) && !opts.noVideo;
  const canFiles = hasVid && navigator.canShare && (() => { try{ return navigator.canShare({files:[REC.file]}); }catch(e){ return false; } })();
  const canLink = !!navigator.share;
  const kb = hasVid ? Math.round(REC.blob.size / 1024) : 0;
  $('shareSheet').innerHTML = `<div class="sh-card" role="dialog" aria-modal="true" aria-labelledby="shTitle">
    <button type="button" class="sh-x" data-sh="close" aria-label="Close">✕</button>
    <h3 id="shTitle">Share your race</h3>
    ${hasVid ? `<video class="sh-vid" src="${REC.url}" controls playsinline muted loop autoplay></video>
      <div class="sh-meta">${REC.ext.toUpperCase()} · ${kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB'} · vertical 720×1280</div>`
      : `<p class="sh-note">${opts.noVideo ? 'This browser can’t record a video clip, but you can still share the challenge link.' : ''}</p>`}
    <p class="sh-text">${text}</p>
    ${canFiles ? `<button type="button" class="primary sh-main" data-sh="share-file">SHARE VIDEO</button>`
      : canLink ? `<button type="button" class="primary sh-main" data-sh="share-link">SHARE LINK</button>` : ''}
    ${hasVid && window.PFM && PFM.enabled ? `<button type="button" class="primary sh-main sh-pfm" data-sh="pfm">POST TO ALL MY ACCOUNTS</button>` : ''}
    ${hasVid ? `<a class="secondary sh-btn sh-save" data-sh="save" href="${REC.url}" download="${REC.file.name}">SAVE VIDEO</a>` : ''}
    <div class="sh-row">
      <a class="sh-btn sh-x-tw" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}">X / Twitter</a>
      <a class="sh-btn sh-fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}">Facebook</a>
      <a class="sh-btn sh-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(text + ' ' + url)}">WhatsApp</a>
    </div>
    <div class="sh-link"><input id="shLink" readonly value="${url}" aria-label="Challenge link"><button type="button" class="secondary" data-sh="copy">COPY LINK</button></div>
    <p class="sh-ig"><b>Instagram &amp; TikTok:</b> they have no web share link. ${hasVid ? 'Tap <b>SAVE VIDEO</b>, then post it from the app' : 'Share the link in your bio or story'} and paste the challenge link.</p>
  </div>`;
  $('shareSheet').hidden = false; document.body.classList.add('mjsheet-open');
}
async function sheetAction(act){
  const R = LAST_RACE; if(!R) return;
  const url = challengeURL(R), text = shareText(R);
  if(act === 'close') closeSheet();
  else if(act === 'pfm'){ if(window.PFM) PFM.open(); }
  else if(act === 'share-file'){ try{ await navigator.share({files:[REC.file], title:'Monkey Jockey', text, url}); }catch(e){} }
  else if(act === 'share-link'){ try{ await navigator.share({title:'Monkey Jockey', text, url}); }catch(e){} }
  else if(act === 'copy'){
    const inp = $('shLink'), b = document.querySelector('#shareSheet [data-sh="copy"]');
    try{ await navigator.clipboard.writeText(url); }catch(e){ inp.select(); try{ document.execCommand('copy'); }catch(_){} }
    if(b){ b.textContent = 'COPIED ✓'; setTimeout(() => { b.textContent = 'COPY LINK'; }, 1600); }
  }
}

/* ---------------- challenge links (?race=SEED&dog=&rider=&w=) ---------------- */
function readChallenge(){
  const q = new URLSearchParams(location.search), s = q.get('race'); if(!s) return null;
  const n = Number(s); if(!Number.isInteger(n) || n < 1 || n > 4294967295) return null;
  const dog = dogBy[q.get('dog')] ? q.get('dog') : null, rider = riderBy[q.get('rider')] ? q.get('rider') : null;
  const w = WEATHER[q.get('w')] ? q.get('w') : 'sunny-day';
  return {seed: n, dog, rider, weather: w};
}
const CHALLENGE = readChallenge();
function showChallenge(){
  const C = CHALLENGE; if(!C || $('challenge').dataset.seen) return;
  $('challenge').dataset.seen = '1';
  const team = C.dog && C.rider ? `${dogBy[C.dog].name} &amp; ${riderBy[C.rider].name}` : null;
  $('challenge').innerHTML = `<div class="ch-card" role="dialog" aria-modal="true" aria-labelledby="chTitle">
    <div class="ch-k">🏁 CHALLENGE</div>
    <h3 id="chTitle">Race #${C.seed}</h3>
    <p>${team ? `A friend raced <b>${team}</b> on this seed (${WEATHER[C.weather].label}). Watch their race, then pick your own team and try to beat it.` : 'A friend shared this race seed. Pick your team and race it.'}</p>
    ${team ? `<button type="button" class="primary" data-ch="watch">▶ WATCH THEIR RACE</button>` : ''}
    <button type="button" class="${team ? 'secondary' : 'primary'}" data-ch="race">RACE THIS SEED</button>
    <button type="button" class="ch-skip" data-ch="close">Not now</button></div>`;
  $('challenge').hidden = false;
}
function challengeAction(act){
  const C = CHALLENGE; $('challenge').hidden = true;
  if(act === 'watch' && C.dog && C.rider){
    playerPick = {dogId: C.dog, riderId: C.rider};
    $('weather').value = C.weather; lastWeather = C.weather; lastSeed = C.seed;
    lastEntries = buildField(C.seed).map(e => ({...e}));
    renderTeamSelect();
    $('seed').value = C.seed; seedTyped = true; REPLAY.keepSeed = String(C.seed);   // then GO = race this seed yourself
    startReplay({shared: true});
  } else if(act === 'race'){
    $('seed').value = C.seed; seedTyped = true; $('weather').value = C.weather; refreshPreview();
    try{ $('teamSelect').scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){}
  }
}

/* ---------------- wiring ---------------- */
$('replayBar').addEventListener('click', ev => {
  const b = ev.target.closest && ev.target.closest('button'); if(!b) return;
  if(b.dataset.sp) setReplaySpeed(Number(b.dataset.sp));
  else if(b.id === 'replaySkip') skipReplay();
});
$('shareSheet').addEventListener('click', ev => {
  if(ev.target === $('shareSheet')){ closeSheet(); return; }
  const b = ev.target.closest && ev.target.closest('[data-sh]'); if(!b || b.dataset.sh === 'save' || b.tagName === 'A') return;
  sheetAction(b.dataset.sh);
});
$('challenge').addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('[data-ch]'); if(b) challengeAction(b.dataset.ch); });
document.addEventListener('keydown', ev => { if(ev.key === 'Escape') closeSheet(); });
$('enterBtn').addEventListener('click', () => setTimeout(showChallenge, 650));
