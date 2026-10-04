/* POST /api/pfm/upload-url {player} -> {upload_url, media_url}
   Their media flow: create-upload-url, then the BROWSER PUTs the clip straight to the signed upload_url
   (the clip is ~2-5 MB, and Vercel functions cap request bodies at 4.5 MB, so it must not pass through here).
   Media is temporary on their side: deleted when the post publishes, or after 24 h if unused.
   Only players with at least one connected account can ask for an upload URL. */
'use strict';
const P = require('../_pfm');
module.exports = async (req, res) => {
  if(!P.guard(req, res, ['POST'])) return;
  try{
    const b = await P.readBody(req);
    if(!P.PLAYER_RE.test(b.player || '')) return P.send(res, 400, {error: 'bad player id'});
    const mine = await P.playerAccounts(b.player);
    if(!mine.length) return P.send(res, 403, {error: 'connect an account first'});
    const d = await P.pfm('/v1/media/create-upload-url', {method: 'POST', body: {}});
    if(!d || !d.upload_url || !d.media_url) return P.send(res, 502, {error: 'no upload url'});
    P.send(res, 200, {upload_url: d.upload_url, media_url: d.media_url});
  }catch(e){ P.fail(res, e); }
};
