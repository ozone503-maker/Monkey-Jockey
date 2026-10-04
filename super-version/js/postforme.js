/* ============================================================
   POST TO ALL (Oct 3 2026), via Post for Me (postforme.dev). Jessie signs up Oct 4; until
   POSTFORME_API_KEY is set on Vercel, /api/pfm/status says enabled:false (or 404s on a static
   server) and nothing here shows: the normal share sheet stays the default.
   - Identity: a random local player id (pl_ + 32 hex) in localStorage. No accounts, no cookies,
     no analytics. The server passes it to Post for Me as external_id and filters by it.
   - First time: "Connect accounts" (each opens the platform sign-in in a new tab so the recorded
     clip in this tab survives). After that: caption + POST TO ALL in one tap.
   - TikTok: a separate confirm screen following TikTok's Content Sharing Guidelines (preview,
     account name, editable title, privacy with no default, interactions unticked, commercial
     content disclosure, Music Usage Confirmation consent, "may take a few minutes") and a clean
     copy of the clip with no logo/URL (TikTok forbids branding/links in shared content).
   The API key never reaches the browser; every call goes through /api/pfm/*.
   ============================================================ */
const PFM = { enabled:false, platforms:[], accounts:[], player:null, view:'', sel:null, tt:null, postId:null, polls:0, msg:'' };
window.PFM = PFM;
const PFM_NAMES = { tiktok:'TikTok', instagram:'Instagram', youtube:'YouTube Shorts', x:'X', facebook:'Facebook Page', threads:'Threads', tiktok_business:'TikTok' };
const PFM_NOTES = { instagram:'Business or Creator account', facebook:'Pages only (not personal profiles)', youtube:'posts as a Short', x:'', tiktok:'', threads:'' };
const MUSIC_URL = 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en';
const BC_URL = 'https://www.tiktok.com/legal/page/global/bc-policy/en';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function pfmPlayer(){
  if(PFM.player) return PFM.player;
  let id = null; try{ id = localStorage.getItem('mj.playerId'); }catch(e){}
  if(!/^pl_[0-9a-f]{32}$/.test(id || '')){
    const b = new Uint8Array(16); crypto.getRandomValues(b);
    id = 'pl_' + Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    try{ localStorage.setItem('mj.playerId', id); }catch(e){}
  }
  return (PFM.player = id);
}
async function pfmApi(path, opts = {}){
  const r = await fetch('/api/pfm/' + path, Object.assign({cache:'no-store', headers:{'Content-Type':'application/json'}}, opts));
  let d = null; try{ d = await r.json(); }catch(e){}
  if(!r.ok) throw new Error((d && (d.detail || d.error)) || ('HTTP ' + r.status));
  return d;
}
async function pfmCheck(){
  // the /api functions only exist on Vercel: don't probe static hosts (a 404 would log a console error)
  const q = new URLSearchParams(location.search);
  if(!/\.vercel\.app$/.test(location.hostname) && !q.has('pfmdev')) return;
  try{
    const r = await fetch('/api/pfm/status', {cache:'no-store'});
    if(!r.ok) return;                                   // static hosting / no functions: stay hidden
    const d = await r.json();
    PFM.enabled = !!(d && d.enabled); PFM.platforms = (d && d.platforms) || [];
  }catch(e){}
}
async function pfmRefresh(){
  try{ PFM.accounts = (await pfmApi('accounts?player=' + encodeURIComponent(pfmPlayer()))).accounts || []; PFM.msg = ''; }
  catch(e){ PFM.msg = 'Could not load your accounts: ' + e.message; }
  if(PFM.sel) PFM.sel = PFM.sel.filter(id => PFM.accounts.some(a => a.id === id));
}
function pfmCard(inner){
  $('shareSheet').innerHTML = `<div class="sh-card pfm-card" role="dialog" aria-modal="true" aria-labelledby="pfmTitle">
    <button type="button" class="sh-x" data-pf="close" aria-label="Close">✕</button>${inner}</div>`;
  $('shareSheet').hidden = false; document.body.classList.add('mjsheet-open');
}
PFM.open = async function(){
  pfmCard(`<h3 id="pfmTitle">Post to all</h3><p class="sh-text">Checking your accounts…</p>`);
  const k = raceKey(LAST_RACE); if(PFM.race !== k){ PFM.race = k; PFM.tt = null; PFM.caption = ''; }
  PFM.msg = ''; await pfmRefresh();
  PFM.sel = PFM.accounts.map(a => a.id);
  PFM.accounts.length ? pfmCompose() : pfmConnect();
};
/* ---- step 1: connect accounts (first time, or "Manage accounts") ---- */
function pfmConnect(){
  PFM.view = 'connect';
  const rows = PFM.platforms.map(p => {
    const mine = PFM.accounts.filter(a => a.platform === p || (p === 'tiktok' && a.platform === 'tiktok_business'));
    return `<div class="pf-row"><div class="pf-name"><b>${PFM_NAMES[p] || p}</b>${PFM_NOTES[p] ? `<small>${PFM_NOTES[p]}</small>` : ''}
      ${mine.map(a => `<span class="pf-ok">✓ ${esc(a.username ? '@' + a.username : 'connected')}</span>`).join('')}</div>
      <button type="button" class="secondary" data-pf="connect" data-p="${p}">${mine.length ? 'ADD' : 'CONNECT'}</button></div>`;
  }).join('');
  pfmCard(`<h3 id="pfmTitle">Connect your accounts</h3>
    <p class="sh-text">Connect once, then post every race clip to all of them with one tap. Each one opens the site's own sign-in in a new tab (it says <b>Post for Me</b>, the service that does the posting). Come back to this tab when you're done.</p>
    <div class="pf-list">${rows}</div>
    ${PFM.msg ? `<p class="pf-err">${esc(PFM.msg)}</p>` : ''}
    <button type="button" class="primary sh-main" data-pf="done" ${PFM.accounts.length ? '' : 'disabled'}>${PFM.accounts.length ? 'DONE' : 'CONNECT AT LEAST ONE'}</button>
    <button type="button" class="ch-skip" data-pf="refresh">I connected one: refresh</button>
    <button type="button" class="ch-skip" data-pf="back">Back to share options</button>
    <p class="sh-ig">No sign-up here: this browser remembers you with a random id. Clear site data to forget it.</p>`);
}
async function pfmStartConnect(platform){
  const w = window.open('about:blank', '_blank');          // open now (inside the tap) so pop-up blockers allow it
  try{
    const d = await pfmApi('connect', {method:'POST', body: JSON.stringify({player: pfmPlayer(), platform})});
    if(w){ w.location.href = d.url; PFM.msg = `Finish signing in to ${PFM_NAMES[platform]} in the new tab, then come back.`; }
    else { PFM.msg = 'Pop-up blocked: allow pop-ups for this site, then tap CONNECT again.'; }
  }catch(e){ if(w) w.close(); PFM.msg = `Could not start ${PFM_NAMES[platform]}: ${e.message}`; }
  pfmConnect();
}
/* ---- step 2: caption + POST TO ALL ---- */
function pfmCompose(){
  PFM.view = 'compose';
  const R = LAST_RACE, link = challengeURL(R);
  const sel = PFM.sel || [], hasTT = PFM.accounts.some(a => sel.includes(a.id) && /^tiktok/.test(a.platform));
  const prev = $('pfCaption') ? $('pfCaption').value : (PFM.caption || shareText(R));
  pfmCard(`<h3 id="pfmTitle">Post to all</h3>
    ${REC.url ? `<video class="sh-vid pf-vid" src="${REC.url}" controls playsinline muted loop autoplay></video>` : ''}
    <div class="pf-chips">${PFM.accounts.map(a => `<label class="pf-chip"><input type="checkbox" data-pf="sel" value="${esc(a.id)}" ${sel.includes(a.id) ? 'checked' : ''}>
      ${a.profile_photo_url ? `<img src="${esc(a.profile_photo_url)}" alt="" referrerpolicy="no-referrer">` : ''}<span>${PFM_NAMES[a.platform] || esc(a.platform)}<small>${esc(a.username ? '@' + a.username : '')}</small></span></label>`).join('')}</div>
    <label class="pf-lab" for="pfCaption">Caption</label>
    <textarea id="pfCaption" class="pf-cap" rows="3" maxlength="1500">${esc(prev)}</textarea>
    <div class="sh-meta">We add your challenge link: ${esc(link.replace('https://', ''))}</div>
    ${PFM.msg ? `<p class="pf-err">${esc(PFM.msg)}</p>` : ''}
    <button type="button" class="primary sh-main sh-pfm" data-pf="${hasTT ? 'tiktok' : 'post'}" ${sel.length ? '' : 'disabled'}>${hasTT ? 'NEXT: TIKTOK DETAILS' : `POST TO ALL (${sel.length})`}</button>
    <button type="button" class="ch-skip" data-pf="manage">Manage accounts</button>
    <button type="button" class="ch-skip" data-pf="back">Back to share options</button>`);
}
/* ---- step 3: TikTok confirm (TikTok Content Sharing Guidelines, Direct Post) ---- */
function pfmTikTok(){
  PFM.view = 'tiktok';
  const R = LAST_RACE, t = PFM.tt || (PFM.tt = {title: `${R.winDog} & ${R.winRider} won race #${R.seed}! 🐕`, privacy:'', allow_comment:false, allow_duet:false,
    allow_stitch:false, commercial:false, your_brand:false, branded:false, draft:false});
  const tt = PFM.accounts.filter(a => PFM.sel.includes(a.id) && /^tiktok/.test(a.platform));
  const cleanURL = pfmCleanURL();
  const label = t.commercial && t.branded ? "Your video will be labeled as 'Paid partnership'" : t.commercial && t.your_brand ? "Your video will be labeled as 'Promotional content'" : '';
  const consent = t.commercial && t.branded ? `By posting, you agree to TikTok's <a href="${BC_URL}" target="_blank" rel="noopener">Branded Content Policy</a> and <a href="${MUSIC_URL}" target="_blank" rel="noopener">Music Usage Confirmation</a>.`
    : `By posting, you agree to TikTok's <a href="${MUSIC_URL}" target="_blank" rel="noopener">Music Usage Confirmation</a>.`;
  const ready = !!t.privacy && (!t.commercial || t.your_brand || t.branded) && !(t.branded && t.privacy === 'private');
  pfmCard(`<h3 id="pfmTitle">Post to TikTok</h3>
    <div class="pf-tt-acct">Posting to ${tt.map(a => `<b>${esc(a.username ? '@' + a.username : 'your TikTok')}</b>`).join(', ')}</div>
    ${cleanURL ? `<video class="sh-vid pf-vid" src="${cleanURL}" controls playsinline muted loop autoplay></video><div class="sh-meta">TikTok gets this copy, with no logo or link (TikTok's rules)</div>` : ''}
    <label class="pf-lab" for="ttTitle">Title</label>
    <input id="ttTitle" class="pf-in" maxlength="90" value="${esc(t.title)}">
    <label class="pf-lab" for="ttPrivacy">Who can see this video</label>
    <select id="ttPrivacy" class="pf-in"><option value="" ${t.privacy ? '' : 'selected'} disabled>Choose…</option>
      <option value="public" ${t.privacy === 'public' ? 'selected' : ''}>Everyone</option>
      <option value="private" ${t.privacy === 'private' ? 'selected' : ''} ${t.branded ? 'disabled title="Branded content visibility cannot be set to private."' : ''}>Only me</option></select>
    <div class="pf-lab">Allow viewers to</div>
    <div class="pf-checks">${[['allow_comment','Comment'],['allow_duet','Duet'],['allow_stitch','Stitch']].map(([k, n]) =>
      `<label><input type="checkbox" data-tt="${k}" ${t[k] ? 'checked' : ''}> ${n}</label>`).join('')}</div>
    <label class="pf-switch"><input type="checkbox" data-tt="commercial" ${t.commercial ? 'checked' : ''}> <span><b>Disclose video content</b><small>Turn on if this video promotes yourself, a brand, product or service</small></span></label>
    ${t.commercial ? `<div class="pf-checks pf-col">
      <label><input type="checkbox" data-tt="your_brand" ${t.your_brand ? 'checked' : ''}> <span><b>Your brand</b><small>You are promoting yourself or your own business</small></span></label>
      <label><input type="checkbox" data-tt="branded" ${t.branded ? 'checked' : ''}> <span><b>Branded content</b><small>You are promoting another brand or a third party</small></span></label></div>
      ${label ? `<p class="pf-note">${label}</p>` : `<p class="pf-err">You need to indicate if your content promotes yourself, a third party, or both.</p>`}` : ''}
    <label class="pf-switch"><input type="checkbox" data-tt="draft" ${t.draft ? 'checked' : ''}> <span><b>Send to my TikTok drafts instead</b><small>Finish it (sounds, effects) in the TikTok app</small></span></label>
    <p class="pf-consent">${consent}</p>
    <p class="pf-note">After you post, it can take a few minutes for the video to process and show on your profile.</p>
    <button type="button" class="primary sh-main sh-pfm" data-pf="post" ${ready ? '' : 'disabled'} title="${ready ? '' : (t.privacy ? 'You need to indicate if your content promotes yourself, a third party, or both.' : 'Choose who can see this video')}">POST TO ALL (${PFM.sel.length})</button>
    <button type="button" class="ch-skip" data-pf="compose">Back</button>`);
}
function pfmCleanURL(){
  if(!REC.cleanBlob && REC.chunks2 && REC.chunks2.length) REC.cleanBlob = new Blob(REC.chunks2, {type: REC.blob.type});
  if(REC.cleanBlob && !REC.cleanURL) REC.cleanURL = URL.createObjectURL(REC.cleanBlob);
  return REC.cleanBlob ? REC.cleanURL : '';
}
/* ---- step 4: upload + post + live status ---- */
async function pfmUpload(blob){
  const u = await pfmApi('upload-url', {method:'POST', body: JSON.stringify({player: pfmPlayer()})});
  const r = await fetch(u.upload_url, {method:'PUT', headers:{'Content-Type': blob.type || 'video/mp4'}, body: blob});
  if(!r.ok) throw new Error('video upload failed (' + r.status + ')');
  return u.media_url;
}
async function pfmPost(){
  const R = LAST_RACE, cap = $('pfCaption') ? $('pfCaption').value : (PFM.caption || shareText(R));
  PFM.caption = cap;
  const tt = PFM.accounts.some(a => PFM.sel.includes(a.id) && /^tiktok/.test(a.platform));
  const step = s => pfmCard(`<h3 id="pfmTitle">Posting…</h3><p class="sh-text">${s}</p><div class="pf-spin"></div>`);
  try{
    step('Uploading your clip…');
    const media_url = await pfmUpload(REC.blob);
    let clean_media_url;
    if(tt){ pfmCleanURL(); if(REC.cleanBlob){ step('Uploading the TikTok copy…'); clean_media_url = await pfmUpload(REC.cleanBlob); } }
    step('Posting to all your accounts…');
    const t = PFM.tt || {};
    const d = await pfmApi('post', {method:'POST', body: JSON.stringify({player: pfmPlayer(), accounts: PFM.sel, caption: cap,
      race: {seed: R.seed, dog: R.dog, rider: R.rider, w: R.weather}, media_url, clean_media_url,
      tiktok: tt ? {title: t.title, privacy: t.privacy, allow_comment: t.allow_comment, allow_duet: t.allow_duet, allow_stitch: t.allow_stitch,
        disclose_your_brand: !!(t.commercial && t.your_brand), disclose_branded_content: !!(t.commercial && t.branded), draft: t.draft, consent: true} : undefined})});
    PFM.postId = d.id; PFM.polls = 0; PFM.sent = d.accounts || []; PFM.results = [];
    pfmStatus(); pfmPoll();
  }catch(e){ PFM.msg = 'Posting failed: ' + e.message; tt && PFM.view === 'tiktok' ? pfmTikTok() : pfmCompose(); }
}
function pfmStatus(){
  PFM.view = 'status';
  const res = PFM.results || [];
  const rows = PFM.sent.map(a => { const r = res.find(x => x.platform === a.platform && x.username === a.username);
    return `<div class="pf-row"><div class="pf-name"><b>${PFM_NAMES[a.platform] || esc(a.platform)}</b><small>${esc(a.username ? '@' + a.username : '')}</small></div>
      <span class="${r ? (r.success ? 'pf-ok' : 'pf-bad') : 'pf-wait'}">${r ? (r.success ? (r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">Posted ✓</a>` : 'Posted ✓') : 'Failed: ' + esc(r.error || '')) : 'Processing…'}</span></div>`; }).join('');
  const done = res.length >= PFM.sent.length;
  pfmCard(`<h3 id="pfmTitle">${done ? 'Posted!' : 'Sent. Processing…'}</h3>
    <div class="pf-list">${rows}</div>
    <p class="pf-note">Videos can take a few minutes to process and appear on your profiles${PFM.tt && PFM.tt.draft ? '. Your TikTok draft will show up in the TikTok app' : ''}.</p>
    <button type="button" class="primary sh-main" data-pf="close">DONE</button>`);
}
async function pfmPoll(){
  if(!PFM.postId || PFM.view !== 'status' || PFM.polls++ > 30) return;
  try{ const d = await pfmApi(`post-status?player=${encodeURIComponent(pfmPlayer())}&id=${encodeURIComponent(PFM.postId)}`); PFM.results = d.results || []; }catch(e){}
  if(PFM.view !== 'status') return;
  pfmStatus();
  if((PFM.results || []).length < PFM.sent.length) setTimeout(pfmPoll, 5000);
}
/* ---- events ---- */
$('shareSheet').addEventListener('click', ev => {
  const b = ev.target.closest && ev.target.closest('[data-pf]'); if(!b || b.tagName === 'INPUT') return;
  const a = b.dataset.pf;
  if(a === 'close'){ PFM.view = ''; closeSheet(); }
  else if(a === 'back'){ PFM.view = ''; openSheet(); }
  else if(a === 'connect') pfmStartConnect(b.dataset.p);
  else if(a === 'refresh'){ pfmRefresh().then(() => { PFM.sel = PFM.accounts.map(x => x.id); pfmConnect(); }); }
  else if(a === 'done' || a === 'compose'){ PFM.msg = ''; if(a === 'done') PFM.sel = PFM.accounts.map(x => x.id); pfmCompose(); }
  else if(a === 'manage'){ PFM.msg = ''; pfmConnect(); }
  else if(a === 'tiktok'){ PFM.caption = $('pfCaption').value; PFM.msg = ''; pfmTikTok(); }
  else if(a === 'post') pfmPost();
});
$('shareSheet').addEventListener('change', ev => {
  const el = ev.target;
  if(el.dataset && el.dataset.pf === 'sel'){
    PFM.sel = [...document.querySelectorAll('#shareSheet [data-pf="sel"]:checked')].map(x => x.value); pfmCompose();
  } else if(el.dataset && el.dataset.tt){
    const t = PFM.tt, k = el.dataset.tt; t[k] = el.checked;
    if(k === 'commercial' && !el.checked){ t.your_brand = false; t.branded = false; }
    if(k === 'branded' && el.checked && t.privacy === 'private'){ t.privacy = 'public'; PFM.msg = ''; }   // branded content can't be private
    t.title = $('ttTitle').value; pfmTikTok();
  } else if(el.id === 'ttPrivacy'){ PFM.tt.privacy = el.value; PFM.tt.title = $('ttTitle').value; pfmTikTok(); }
});
$('shareSheet').addEventListener('input', ev => { if(ev.target.id === 'ttTitle' && PFM.tt) PFM.tt.title = ev.target.value; });
/* accounts connected in the other tab: refresh this one */
function pfmPinged(){ if(PFM.view === 'connect' || PFM.view === 'compose') pfmRefresh().then(() => { PFM.sel = PFM.accounts.map(x => x.id); PFM.view === 'connect' ? pfmConnect() : pfmCompose(); }); }
window.addEventListener('storage', ev => { if(ev.key === 'mj.pfm.ping') pfmPinged(); });
document.addEventListener('visibilitychange', () => { if(!document.hidden) pfmPinged(); });
/* the sign-in tab lands back here (?pfm=connected&isSuccess=…&provider=…): tell the race tab, say so */
(function pfmReturn(){
  const q = new URLSearchParams(location.search); if(!q.has('isSuccess') && q.get('pfm') !== 'connected') return;
  const ok = q.get('isSuccess') !== 'false', who = PFM_NAMES[q.get('provider')] || 'Your account';
  try{ localStorage.setItem('mj.pfm.ping', String(Date.now())); }catch(e){}
  history.replaceState(null, '', location.pathname);
  pfmCard(`<h3 id="pfmTitle">${ok ? `${esc(who)} connected ✓` : 'Not connected'}</h3>
    <p class="sh-text">${ok ? 'Go back to your race tab and tap POST TO ALL.' : esc(q.get('error') || 'The sign-in was cancelled.')}</p>
    <button type="button" class="primary sh-main" data-pf="closetab">CLOSE THIS TAB</button>
    <button type="button" class="ch-skip" data-pf="close">Keep playing here</button>`);
  $('shareSheet').addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('[data-pf="closetab"]'); if(b){ window.close(); closeSheet(); } });
})();
pfmCheck();
