/* Local stand-in for Vercel: serves the game statically and runs api/pfm/*.js like Vercel functions.
   usage: [POSTFORME_API_KEY=… POSTFORME_API_BASE=http://127.0.0.1:8823] node tools/pfm_dev_server.js PORT */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), PORT = Number(process.argv[2] || 8822);
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2','.ogg':'audio/ogg'};
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const m = u.pathname.match(/^\/api\/pfm\/([a-z-]+)$/);
  if(m){
    const f = path.join(ROOT, 'api', 'pfm', m[1] + '.js');
    if(!fs.existsSync(f)){ res.statusCode = 404; return res.end('{"error":"no such function"}'); }
    req.query = Object.fromEntries(u.searchParams);
    try{ return await require(f)(req, res); }catch(e){ res.statusCode = 500; return res.end(JSON.stringify({error: String(e)})); }
  }
  if(u.pathname.startsWith('/api/')){ res.statusCode = 404; return res.end('not found'); }
  let p = path.join(ROOT, decodeURIComponent(u.pathname)); if(!p.startsWith(ROOT)){ res.statusCode = 403; return res.end(); }
  if(fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if(!fs.existsSync(p)){ res.statusCode = 404; return res.end('not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream'); fs.createReadStream(p).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('dev server on', PORT, 'key', process.env.POSTFORME_API_KEY ? 'set' : 'MISSING'));
