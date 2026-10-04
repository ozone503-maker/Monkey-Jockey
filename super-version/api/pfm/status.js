/* GET /api/pfm/status -> {enabled, platforms}. The share sheet only shows "Post to all" when enabled
   (POSTFORME_API_KEY is set). Never reveals the key. */
'use strict';
const P = require('../_pfm');
module.exports = async (req, res) => {
  if(req.method !== 'GET') return P.send(res, 405, {error: 'method not allowed'});
  P.send(res, 200, {enabled: P.enabled(), platforms: P.enabled() ? P.PLATFORMS : []});
};
