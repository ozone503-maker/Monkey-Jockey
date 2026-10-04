/* GET /api/pfm/accounts?player=pl_... -> {accounts:[{id, platform, username, profile_photo_url}]}
   Only accounts whose external_id is this player; tokens are stripped. */
'use strict';
const P = require('../_pfm');
module.exports = async (req, res) => {
  if(!P.guard(req, res, ['GET'])) return;
  try{
    const player = P.query(req).player || '';
    if(!P.PLAYER_RE.test(player)) return P.send(res, 400, {error: 'bad player id'});
    P.send(res, 200, {accounts: await P.playerAccounts(player)});
  }catch(e){ P.fail(res, e); }
};
