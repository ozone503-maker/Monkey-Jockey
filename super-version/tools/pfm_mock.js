/* Mock of the Post for Me API (only the endpoints api/pfm/* uses), for local tests without a key.
   usage: node tools/pfm_mock.js PORT GAME_ORIGIN   Logs every request body to /tmp/pfm_mock_log.json */
'use strict';
const http = require('http'), fs = require('fs');
const PORT = Number(process.argv[2] || 8823), GAME = process.argv[3] || 'http://127.0.0.1:8822';
const accounts = [], posts = [], log = [], uploads = {};
let n = 0;
const json = (res, code, o) => { res.writeHead(code, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}); res.end(JSON.stringify(o)); };
const save = () => fs.writeFileSync('/tmp/pfm_mock_log.json', JSON.stringify({log, accounts, posts, uploads}, null, 1));
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks); let body = null; try{ body = JSON.parse(raw.toString() || 'null'); }catch(e){}
  if(req.method === 'OPTIONS'){ res.writeHead(204, {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PUT', 'Access-Control-Allow-Headers': 'Content-Type'}); return res.end(); }
  if(u.pathname.startsWith('/upload/')){                                   // the signed storage URL
    uploads[u.pathname] = {bytes: raw.length, type: req.headers['content-type']}; save();
    res.writeHead(200, {'Access-Control-Allow-Origin': '*'}); return res.end('ok');
  }
  if(u.pathname === '/oauth'){                                             // fake platform sign-in -> back to the game
    const p = u.searchParams.get('platform'), ext = u.searchParams.get('ext'); const id = 'spc_' + p + '_' + (++n);
    accounts.push({id, platform: p, username: 'jessie_' + p, user_id: 'u' + n, profile_photo_url: null, access_token: 'SECRET_ACCESS_' + n,
      refresh_token: 'SECRET_REFRESH_' + n, access_token_expires_at: null, refresh_token_expires_at: null, status: 'connected', external_id: ext, metadata: {}});
    save();
    res.writeHead(302, {Location: `${GAME}/?pfm=connected&provider=${p}&projectId=proj_mock&isSuccess=true&accountIds=${id}`}); return res.end();
  }
  const auth = req.headers.authorization || '';
  log.push({method: req.method, path: u.pathname + u.search, auth: auth.slice(0, 12) + '…', body}); save();
  if(auth !== 'Bearer test_key_123') return json(res, 401, {error: 'bad key'});
  if(req.method === 'POST' && u.pathname === '/v1/social-accounts/auth-url')
    return json(res, 200, {url: `http://127.0.0.1:${PORT}/oauth?platform=${body.platform}&ext=${encodeURIComponent(body.external_id || '')}`, platform: body.platform});
  if(req.method === 'GET' && u.pathname === '/v1/social-accounts'){
    const ext = u.searchParams.getAll('external_id'), st = u.searchParams.getAll('status');
    const d = accounts.filter(a => (!ext.length || ext.includes(a.external_id)) && (!st.length || st.includes(a.status)));
    return json(res, 200, {data: d, meta: {total: d.length, offset: 0, limit: 50, next: null}});
  }
  if(req.method === 'POST' && u.pathname === '/v1/media/create-upload-url'){
    const k = 'm' + (++n);
    return json(res, 200, {upload_url: `http://127.0.0.1:${PORT}/upload/${k}`, media_url: `https://data.postforme.dev/storage/v1/object/public/post-media/${k}`});
  }
  if(req.method === 'POST' && u.pathname === '/v1/social-posts'){
    const id = 'sp_' + (++n); posts.push({id, body, polls: 0}); save();
    return json(res, 200, {id, status: 'processing', caption: body.caption, social_accounts: accounts.filter(a => body.social_accounts.includes(a.id))});
  }
  if(req.method === 'GET' && u.pathname === '/v1/social-post-results'){
    const p = posts.find(x => x.id === u.searchParams.get('post_id')); if(!p) return json(res, 200, {data: [], meta: {}});
    if(p.polls++ < 1) return json(res, 200, {data: [], meta: {}});
    return json(res, 200, {data: p.body.social_accounts.map((sa, i) => ({id: 'spr_' + i, social_account_id: sa, post_id: p.id, success: true, error: null,
      platform_data: {id: 'x' + i, url: 'https://example.com/post/' + i}})), meta: {}});
  }
  json(res, 404, {error: 'mock: not found'});
}).listen(PORT, '127.0.0.1', () => console.log('pfm mock on', PORT));
