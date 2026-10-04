/* POST /api/pfm/post -> one Post for Me post to all of the player's selected connected accounts.
   body: {player, accounts:[ids] (optional, default all), caption, race:{seed,dog,rider,w},
          media_url, clean_media_url (TikTok copy without logo/URL, see TikTok watermark rule),
          tiktok:{title, privacy:'public'|'private', allow_comment, allow_duet, allow_stitch,
                  disclose_your_brand, disclose_branded_content, draft, consent:true}}
   - every account id must belong to this player (external_id), checked against Post for Me
   - the game link is rebuilt here from the race params and appended to the caption (not on TikTok,
     where captions can't link and TikTok's rules forbid promotional links in shared content)
   - TikTok values are sent explicitly (their API defaults some to true; TikTok's UX rules need the
     player's own choices, none pre-checked) and the player must have ticked the consent line */
'use strict';
const P = require('../_pfm');
const mediaOk = u => { try{ const x = new URL(u); return x.protocol === 'https:' && x.hostname === (process.env.POSTFORME_MEDIA_HOST || 'data.postforme.dev'); }catch(e){ return false; } };
const str = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);
module.exports = async (req, res) => {
  if(!P.guard(req, res, ['POST'])) return;
  try{
    const b = await P.readBody(req);
    if(!P.PLAYER_RE.test(b.player || '')) return P.send(res, 400, {error: 'bad player id'});
    if(!mediaOk(b.media_url)) return P.send(res, 400, {error: 'media_url must be a Post for Me upload'});
    if(b.clean_media_url && !mediaOk(b.clean_media_url)) return P.send(res, 400, {error: 'bad clean_media_url'});
    const mine = await P.playerAccounts(b.player);
    const want = Array.isArray(b.accounts) && b.accounts.length ? b.accounts.filter(id => P.ID_RE.test(id)) : mine.map(a => a.id);
    if(want.some(id => !mine.some(a => a.id === id))) return P.send(res, 403, {error: 'account does not belong to this player'});
    const targets = mine.filter(a => want.includes(a.id));
    if(!targets.length) return P.send(res, 400, {error: 'no connected accounts selected'});

    const link = P.gameLink(b.race);
    const text = str(b.caption, 1500) || 'Can you beat my Monkey Jockey race?';
    const caption = text.includes(link) ? text : `${text}\n${link}`;
    const xText = text.length + 1 + 23 > 280 ? text.slice(0, 280 - 25) + '…' : text;          // X counts any URL as 23
    const body = {caption, social_accounts: targets.map(a => a.id), media: [{url: b.media_url}],
      platform_configurations: {
        x: {caption: `${xText} ${link}`},
        instagram: {placement: 'reels'},
        facebook: {placement: 'reels'},
        threads: {placement: 'reels'},
        youtube: {title: str(b.youtube_title || 'Monkey Jockey race replay #Shorts', 100), privacy_status: 'public', made_for_kids: false}
      }};
    const tt = targets.filter(a => a.platform === 'tiktok' || a.platform === 'tiktok_business');
    if(tt.length){
      const t = b.tiktok || {};
      if(t.consent !== true) return P.send(res, 400, {error: 'TikTok needs the player to confirm on the TikTok screen'});
      if(t.privacy !== 'public' && t.privacy !== 'private') return P.send(res, 400, {error: 'TikTok privacy must be chosen'});
      if(t.disclose_branded_content && t.privacy === 'private') return P.send(res, 400, {error: 'Branded content cannot be private'});
      const cfg = {caption: str(t.title, 2200), title: str(t.title, 90), privacy_status: t.privacy,
        allow_comment: t.allow_comment === true, allow_duet: t.allow_duet === true, allow_stitch: t.allow_stitch === true,
        disclose_your_brand: t.disclose_your_brand === true, disclose_branded_content: t.disclose_branded_content === true,
        is_ai_generated: false, is_draft: t.draft === true};
      if(b.clean_media_url) cfg.media = [{url: b.clean_media_url}];
      body.platform_configurations.tiktok = cfg; body.platform_configurations.tiktok_business = cfg;
    }
    const d = await P.pfm('/v1/social-posts', {method: 'POST', body});
    P.send(res, 200, {id: d && d.id, status: d && d.status, accounts: targets.map(a => ({id: a.id, platform: a.platform, username: a.username}))});
  }catch(e){ P.fail(res, e); }
};
