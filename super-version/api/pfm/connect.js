/* POST /api/pfm/connect {player, platform} -> {url}
   A fresh auth URL per connect tap (their docs: generate exactly when the user taps Connect; don't cache).
   external_id = the player's local id, so the accounts that come back belong to that player only.
   Quickstart projects cannot pass redirect_url_override: set the project redirect URL in the Post for Me
   dashboard to  https://monkey-jockey-test.vercel.app/?pfm=connected  (see HANDOFF). */
'use strict';
const P = require('../_pfm');
module.exports = async (req, res) => {
  if(!P.guard(req, res, ['POST'])) return;
  try{
    const b = await P.readBody(req);
    if(!P.PLAYER_RE.test(b.player || '')) return P.send(res, 400, {error: 'bad player id'});
    if(!P.PLATFORMS.includes(b.platform)) return P.send(res, 400, {error: 'unsupported platform'});
    const body = {platform: b.platform, external_id: b.player};
    if(b.platform === 'instagram') body.platform_data = {instagram: {connection_type: 'instagram'}};   // Instagram login (Business/Creator accounts)
    if(process.env.POSTFORME_REDIRECT_URL) body.redirect_url_override = process.env.POSTFORME_REDIRECT_URL;   // White Label projects only
    const d = await P.pfm('/v1/social-accounts/auth-url', {method: 'POST', body});
    if(!d || !d.url) return P.send(res, 502, {error: 'no auth url'});
    P.send(res, 200, {url: d.url, platform: b.platform});
  }catch(e){ P.fail(res, e); }
};
