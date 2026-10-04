/* GET /api/pfm/post-status?player=pl_...&id=sp_... -> {results:[{platform, username, success, error, url}]}
   Polled by the share UI after posting (TikTok's rules: tell players how their post is doing). Only
   results for this player's own accounts are returned. */
'use strict';
const P = require('../_pfm');
module.exports = async (req, res) => {
  if(!P.guard(req, res, ['GET'])) return;
  try{
    const q = P.query(req);
    if(!P.PLAYER_RE.test(q.player || '')) return P.send(res, 400, {error: 'bad player id'});
    if(!P.ID_RE.test(q.id || '')) return P.send(res, 400, {error: 'bad post id'});
    const mine = await P.playerAccounts(q.player), byId = Object.fromEntries(mine.map(a => [a.id, a]));
    const d = await P.pfm('/v1/social-post-results?' + new URLSearchParams({post_id: q.id, limit: '50'}).toString());
    const results = (d && d.data || []).filter(r => byId[r.social_account_id]).map(r => ({
      platform: byId[r.social_account_id].platform, username: byId[r.social_account_id].username,
      success: !!r.success, error: r.error ? String(typeof r.error === 'string' ? r.error : (r.error.message || JSON.stringify(r.error))).slice(0, 200) : null,
      url: r.platform_data && r.platform_data.url || null}));
    P.send(res, 200, {results, pending: mine.length > 0 && results.length === 0});
  }catch(e){ P.fail(res, e); }
};
