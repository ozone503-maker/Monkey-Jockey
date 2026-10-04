/* Shared helpers for the Post for Me ("Post to all") serverless functions.
   Docs read Oct 3 2026: https://api.postforme.dev/docs (OpenAPI), https://www.postforme.dev/resources/*
   - The API key is a PROJECT-level credential (full control of every connected account). It is read from
     env POSTFORME_API_KEY here, server-side only, and never sent to the browser.
   - Players have no accounts: the browser makes a random id (pl_ + 32 hex) in localStorage and we pass it
     as Post for Me `external_id`, then filter every read/post by it.
   - Post for Me returns social-account access/refresh tokens: we strip them before anything leaves here.
   Files starting with "_" in /api are not deployed as functions by Vercel. No analytics, no cookies. */
'use strict';
const API = (process.env.POSTFORME_API_BASE || 'https://api.postforme.dev').replace(/\/$/, '');   // BASE override = tests only
const GAME = (process.env.GAME_URL || 'https://monkey-jockey-test.vercel.app/').replace(/\/?$/, '/');
// platforms offered in "Connect accounts" (Bluesky needs an app password, Pinterest a board, LinkedIn is not
// a game-clip network: left out on purpose; add here + in js/postforme.js to offer them)
const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x', 'facebook', 'threads'];
const PLAYER_RE = /^pl_[0-9a-f]{32}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

const key = () => process.env.POSTFORME_API_KEY || '';
const enabled = () => key().length > 0;

function allowedOrigin(req){
  const o = req.headers.origin || '';
  if(!o) return true;                                   // same-origin GETs / server-to-server
  const list = (process.env.ALLOWED_ORIGINS || 'https://monkey-jockey-test.vercel.app').split(',').map(s => s.trim()).filter(Boolean);
  return list.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o) || /^https:\/\/monkey-jockey-test(-[a-z0-9-]+)?\.vercel\.app$/.test(o);
}
function send(res, code, obj){
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
async function readBody(req){
  if(req.body && typeof req.body === 'object') return req.body;          // Vercel parses JSON bodies
  if(typeof req.body === 'string'){ try{ return JSON.parse(req.body); }catch(e){ return {}; } }
  const chunks = []; let n = 0;
  for await (const c of req){ n += c.length; if(n > 64 * 1024) throw Object.assign(new Error('body too large'), {status: 413}); chunks.push(c); }
  try{ return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }catch(e){ return {}; }
}
function query(req){
  if(req.query) return req.query;
  const u = new URL(req.url, 'http://x'); const q = {};
  for(const [k, v] of u.searchParams) q[k] = v;
  return q;
}
/* guard: method, origin, key present. Returns false (and responds) when the request must stop. */
function guard(req, res, methods){
  if(!methods.includes(req.method)){ res.setHeader('Allow', methods.join(', ')); send(res, 405, {error: 'method not allowed'}); return false; }
  if(!allowedOrigin(req)){ send(res, 403, {error: 'origin not allowed'}); return false; }
  if(!enabled()){ send(res, 503, {error: 'Post to all is not set up yet', enabled: false}); return false; }
  return true;
}
/* one Post for Me call. Retries a 429 once after Retry-After (their limit: 5 req/s, 40 req/min per project). */
async function pfm(path, {method = 'GET', body} = {}, retry = true){
  const r = await fetch(API + path, {
    method,
    headers: {'Authorization': 'Bearer ' + key(), 'Content-Type': 'application/json'},
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if(r.status === 429 && retry){
    const wait = Math.min(5, Number(r.headers.get('retry-after')) || 1);
    await new Promise(ok => setTimeout(ok, wait * 1000));
    return pfm(path, {method, body}, false);
  }
  const text = await r.text(); let data = null;
  try{ data = text ? JSON.parse(text) : null; }catch(e){ data = {raw: text.slice(0, 300)}; }
  if(!r.ok){ const err = new Error('Post for Me ' + r.status); err.status = r.status; err.data = data; throw err; }
  return data;
}
/* public-safe view of a social account: never the tokens */
const cleanAccount = a => ({id: a.id, platform: a.platform, username: a.username || null,
  profile_photo_url: a.profile_photo_url || null, status: a.status});
async function playerAccounts(player){
  const q = new URLSearchParams({external_id: player, status: 'connected', limit: '50'});
  const d = await pfm('/v1/social-accounts?' + q.toString());
  return (d && d.data || []).filter(a => a.external_id === player && a.status === 'connected').map(cleanAccount);
}
/* the challenge link, rebuilt server-side from validated race params so a post always carries the game link */
function gameLink(race){
  const r = race || {}, u = new URL(GAME);
  const seed = Number(r.seed);
  if(Number.isInteger(seed) && seed >= 1 && seed <= 4294967295){
    u.searchParams.set('race', String(seed));
    if(ID_RE.test(r.dog || '')) u.searchParams.set('dog', r.dog);
    if(ID_RE.test(r.rider || '')) u.searchParams.set('rider', r.rider);
    if(/^[a-z-]{1,30}$/.test(r.w || '')) u.searchParams.set('w', r.w);
  }
  return u.toString();
}
function fail(res, e){
  const status = e.status && e.status >= 400 && e.status < 600 ? (e.status === 401 || e.status === 403 ? 502 : e.status) : 500;
  const detail = e.data && (e.data.error || e.data.message) || undefined;
  send(res, status, {error: e.message || 'error', detail});
}
module.exports = {API, GAME, PLATFORMS, PLAYER_RE, ID_RE, enabled, guard, send, readBody, query, pfm, playerAccounts, gameLink, fail};
