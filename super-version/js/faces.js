/* ============================================================
   FACES — portraits for the selection screen.
   ------------------------------------------------------------
   These are GENERATED PLACEHOLDER PORTRAITS, not production art.
   They exist so the picker reads as characters instead of two
   generic dropdowns, and so there is a slot for Grok's real art
   to land in without touching UI code.

   To replace one, drop a data URI (or any URL) into ART.faces:
       ART.faces.dogs.penny   = "data:image/png;base64,...";
       ART.faces.riders.ipo   = "assets/faces/ipo.png";
   The override wins. Nothing else changes.

   Identity cues below follow stated canon only. Dogs marked in
   NO_IDENTITY_CANON have no appearance description on file yet,
   so their portraits are deliberately neutral and the UI flags
   them with a dashed ring.
   ============================================================ */

const PROVISIONAL_IDENTITY = new Set(['meatball']);   // no photo yet, approved stand-in
const NO_IDENTITY_CANON = PROVISIONAL_IDENTITY;       // alias kept for the UI

const EARS = (style, color) => ({
  upright: `<path d="M19 23 L13 2 L31 16 Z" fill="${color}"/><path d="M53 23 L59 2 L41 16 Z" fill="${color}"/>`,
  folded:  `<path d="M18 22 C9 17 11 6 19 9 C25 12 25 20 22 25 Z" fill="${color}"/><path d="M54 22 C63 17 61 6 53 9 C47 12 47 20 50 25 Z" fill="${color}"/>`,
  soft:    `<path d="M17 25 C8 25 8 39 17 41 C22 37 22 29 21 25 Z" fill="${color}"/><path d="M55 25 C64 25 64 39 55 41 C50 37 50 29 51 25 Z" fill="${color}"/>`,
  floppy:  `<path d="M16 25 C4 27 4 47 15 49 C22 44 22 31 20 25 Z" fill="${color}"/><path d="M56 25 C68 27 68 47 57 49 C50 44 50 31 52 25 Z" fill="${color}"/>`
}[style] || '');

function dogFace(o){
  return svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
<defs><clipPath id="h"><ellipse cx="36" cy="33" rx="20" ry="18"/></clipPath></defs>
<g stroke="#0d100e" stroke-width="2.4" stroke-linejoin="round">
<path d="M8 72 C8 56 20 50 36 50 C52 50 64 56 64 72 Z" fill="${o.coat}"/>
${o.chest?`<path d="M27 72 C27 ${o.chestY||61} 31 ${(o.chestY||61)-4} 36 ${(o.chestY||61)-4} C41 ${(o.chestY||61)-4} 45 ${o.chestY||61} 45 72 Z" fill="${o.chest}"/>`:''}
${o.speck?`<ellipse cx="36" cy="63" rx="4.5" ry="5" fill="${o.speck}"/>`:''}
${o.collar?`<rect x="17" y="51" width="38" height="7" rx="3.5" fill="${o.collar}"/>`:''}
${EARS(o.ears, o.earColor||o.coat)}
<ellipse cx="36" cy="33" rx="20" ry="18" fill="${o.coat}"/>
${o.mottle?`<g clip-path="url(#h)" stroke="none" fill="${o.mottle}"><ellipse cx="24" cy="24" rx="7" ry="6"/><ellipse cx="47" cy="22" rx="6" ry="5"/><ellipse cx="52" cy="36" rx="5" ry="4.5"/><ellipse cx="20" cy="38" rx="4.5" ry="4"/></g>`:''}
${o.blaze?`<g clip-path="url(#h)" stroke="none"><path d="M32 14 L40 14 L38.5 40 L33.5 40 Z" fill="${o.blaze}"/></g>`:''}
<ellipse cx="36" cy="42" rx="${o.longSnout?12.5:11.5}" ry="${o.longSnout?7:8}" fill="${o.muzzleTip||o.muzzle||o.coat}"/>
${o.nose2
  ? `<g stroke="none"><path d="M31.4 37 a4.6 3.4 0 0 1 4.6 -3.4 v6.8 a4.6 3.4 0 0 1 -4.6 -3.4 Z" fill="${o.nose}"/><path d="M40.6 37 a4.6 3.4 0 0 0 -4.6 -3.4 v6.8 a4.6 3.4 0 0 0 4.6 -3.4 Z" fill="${o.nose2}"/></g>`
  : `<ellipse cx="36" cy="37" rx="4.6" ry="3.4" fill="${o.nose||'#14100e'}" stroke="none"/>`}
<circle cx="27" cy="29" r="3.4" fill="${o.eye||'#14100e'}" stroke="none"/>
<circle cx="45" cy="29" r="3.4" fill="${o.eye||'#14100e'}" stroke="none"/>
<circle cx="28.3" cy="27.8" r="1.2" fill="#fff" stroke="none"/>
<circle cx="46.3" cy="27.8" r="1.2" fill="#fff" stroke="none"/>
</g></svg>`);
}

const DOG_FACES = {
  // 1 MEATBALL — cane corso, dark brown, no white, drop ears, heavy head
  meatball:    dogFace({coat:"#3d2a1d", muzzle:"#332217", ears:"floppy"}),
  // 2 BEAUX — catahoula, mottled merle, white blaze + muzzle tip, white neck/chest, brown eyes, drop ears
  beaux:       dogFace({coat:"#6f6258", mottle:"#4a3f38", ears:"floppy", earColor:"#5a4e45",
                        blaze:"#f2efe6", muzzleTip:"#f2efe6", chest:"#f2efe6", chestY:57, eye:"#4a2f1c"}),
  // 3 KIRA — dark brown, upturned/pricked ears, grey FROST on chest (not white), no spots
  kira:        dogFace({coat:"#4a2f22", muzzle:"#3d2619", ears:"upright", chest:"#8e948f", chestY:63}),
  // 4 PENNY — tan/yellow lab-look, floppy ears, white chest, light blue collar, black nose
  penny:       dogFace({coat:"#d8a45c", muzzle:"#e9c88f", ears:"floppy", chest:"#f6f1e4", collar:"#4a90d9"}),
  // 5 MIKE — black, folded ears, all-black snout AND neck, white chest only (never up the throat)
  mike:        dogFace({coat:"#1c1b1e", muzzle:"#1c1b1e", ears:"folded", chest:"#f2efe6", chestY:65}),
  // 6 DIVA — dark brown, folded ears like Mike, small white chest speck, orange collar
  diva:        dogFace({coat:"#4a2f22", muzzle:"#3d2619", ears:"folded", speck:"#f2efe6", collar:"#e8853a"}),
  // 7 NOODLE — mostly white, long narrow snout, pink-and-black parti nose, TAN upright ears, red/pink collar
  noodle:      dogFace({coat:"#f4f2ec", muzzle:"#f4f2ec", ears:"upright", earColor:"#c9a06a",
                        longSnout:true, nose:"#e2929f", nose2:"#14100e", collar:"#e0517d"}),
  // 8 GHOSTBUSTER — white, white face, BOTH ears black and drop, black nose, one body spot (not on the face)
  ghostbuster: dogFace({coat:"#f2efe6", muzzle:"#f2efe6", ears:"folded", earColor:"#1c1b1e"})
};

const riderSVG = body => svgURI(
  `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
<g stroke="#0d100e" stroke-width="2.4" stroke-linejoin="round">${body}</g></svg>`);

const EYES = (cx1,cx2,cy,r,fill) =>
  `<circle cx="${cx1}" cy="${cy}" r="${r}" fill="${fill}" stroke="none"/><circle cx="${cx2}" cy="${cy}" r="${r}" fill="${fill}" stroke="none"/>`;

const RIDER_FACES = {
  // the one Monkey Jockey — jockey cap over a monkey face
  "monkey-jockey": riderSVG(`
<path d="M10 72 C10 57 21 51 36 51 C51 51 62 57 62 72 Z" fill="#e0517d"/>
<circle cx="16" cy="33" r="8" fill="#c98a52"/><circle cx="56" cy="33" r="8" fill="#c98a52"/>
<ellipse cx="36" cy="34" rx="19" ry="18" fill="#c98a52"/>
<ellipse cx="36" cy="41" rx="12" ry="9" fill="#e8c9a2"/>
<path d="M17 26 C20 12 52 12 55 26 C46 21 26 21 17 26 Z" fill="#8abd39"/>
<path d="M17 26 L9 30 L18 31 Z" fill="#8abd39"/>
${EYES(29,43,31,3.2,"#14100e")}
<path d="M31 44 q5 4 10 0" fill="none" stroke="#0d100e" stroke-width="2.2"/>`),

  // ShockBot — LOCKED identity: clean silver robot, turquoise bead necklace,
  // hat + sunglasses ALWAYS on. Fallback only; the real portrait (head crop of
  // the Jessie-approved Phase 2 art) is wired through ART.faces in art.js.
  "shockbot": riderSVG(`
<path d="M8 72 C8 57 20 51 36 51 C52 51 64 57 64 72 Z" fill="#4a4f55"/>
<rect x="17" y="22" width="38" height="30" rx="6" fill="#c9ced4"/>
<rect x="13" y="28" width="6" height="12" rx="3" fill="#9aa1a8"/><rect x="53" y="28" width="6" height="12" rx="3" fill="#9aa1a8"/>
<path d="M19 30 L53 30 L51 37 Q44 40 38 36 L34 36 Q28 40 21 37 Z" fill="#101316"/>
<path d="M28 44 q4 -3 8 0 q4 -3 8 0" fill="none" stroke="#6d737a" stroke-width="2.2"/>
<path d="M8 22 Q36 14 64 22 Q60 26 36 24 Q12 26 8 22 Z" fill="#b8874a"/>
<path d="M20 22 Q20 6 36 6 Q52 6 52 22 Z" fill="#c99a58"/>
<path d="M20 19 L52 19 L52 22 L20 22 Z" fill="#2a1d12" stroke="none"/>
<g stroke="none" fill="#6b4a26"><circle cx="28" cy="11" r="1.8"/><circle cx="38" cy="9" r="1.6"/><circle cx="45" cy="13" r="1.8"/><circle cx="32" cy="16" r="1.4"/><circle cx="14" cy="21" r="1.4"/><circle cx="58" cy="21" r="1.4"/></g>
<g fill="#2bb5a8" stroke="#0d100e" stroke-width="1.4"><circle cx="18" cy="55" r="3.6"/><circle cx="25" cy="59" r="3.6"/><circle cx="32" cy="61" r="3.6"/><circle cx="40" cy="61" r="3.6"/><circle cx="47" cy="59" r="3.6"/><circle cx="54" cy="55" r="3.6"/></g>`),

  // Spaghetti Nonna — chrome endoskeleton, magenta optics
  "nonna": riderSVG(`
<path d="M9 72 C9 57 21 50 36 50 C51 50 63 57 63 72 Z" fill="#7d858c"/>
<path d="M24 14 q6 -6 12 0 q6 -6 12 0 q-4 6 -12 4 q-8 2 -12 -4 Z" fill="#f2c14e"/>
<ellipse cx="36" cy="34" rx="19" ry="19" fill="#c9ced4"/>
<path d="M18 30 q18 -8 36 0 q0 8 -18 8 q-18 0 -18 -8 Z" fill="#1b2024"/>
${EYES(28,44,32,3.6,"#e0517d")}
<path d="M28 45 L44 45 M30 45 L30 50 M36 45 L36 50 M42 45 L42 50" stroke="#0d100e" stroke-width="2.2" fill="none"/>`),

  // Ipo — FlashTown, blue hibiscus
  "ipo": riderSVG(`
<path d="M9 72 C9 57 21 50 36 50 C51 50 63 57 63 72 Z" fill="#4a90d9"/>
<ellipse cx="36" cy="33" rx="18" ry="19" fill="#d9a074"/>
<path d="M18 30 C18 12 54 12 54 30 C50 22 22 22 18 30 Z" fill="#241812"/>
<path d="M18 28 C14 40 16 48 18 50 C15 40 17 32 18 28 Z" fill="#241812"/>
<g stroke="none"><circle cx="56" cy="28" r="4" fill="#4a90d9"/><circle cx="52" cy="22" r="4" fill="#4a90d9"/><circle cx="59" cy="21" r="4" fill="#4a90d9"/><circle cx="55" cy="24" r="2.4" fill="#f2c14e"/></g>
${EYES(29,43,33,3.2,"#14100e")}
<path d="M31 42 q5 4 10 0" fill="none" stroke="#0d100e" stroke-width="2.2"/>`),

  // ERV — thorny toad, Rooster Island / Thorny Toad Gang
  "erv": riderSVG(`
<path d="M8 72 C8 57 20 51 36 51 C52 51 64 57 64 72 Z" fill="#5c7a3f"/>
<ellipse cx="36" cy="36" rx="22" ry="17" fill="#6aa84f"/>
<circle cx="25" cy="22" r="8" fill="#6aa84f"/><circle cx="47" cy="22" r="8" fill="#6aa84f"/>
${EYES(25,47,22,3.4,"#14100e")}
<path d="M16 40 q20 10 40 0" fill="none" stroke="#0d100e" stroke-width="2.6"/>
<g stroke="none" fill="#4d7a35"><circle cx="20" cy="34" r="2.4"/><circle cx="52" cy="34" r="2.4"/><circle cx="36" cy="47" r="2.4"/><circle cx="28" cy="45" r="2"/><circle cx="44" cy="45" r="2"/></g>`),

  // Mystery Drone Pilot — electric-blue alien (Gate 1 lock, replaces Ruch). Fallback only; the real crop is in ART.faces.
  "mystery-drone-pilot": riderSVG(`
<path d="M9 72 C9 58 21 52 36 52 C51 52 63 58 63 72 Z" fill="#2f6fd6"/>
<ellipse cx="36" cy="30" rx="20" ry="23" fill="#4a86d8"/>
<ellipse cx="27" cy="33" rx="7" ry="5" transform="rotate(20 27 33)" fill="#0d1014"/>
<ellipse cx="45" cy="33" rx="7" ry="5" transform="rotate(-20 45 33)" fill="#0d1014"/>
<circle cx="25" cy="31" r="1.6" fill="#fff" stroke="none"/><circle cx="43" cy="31" r="1.6" fill="#fff" stroke="none"/>
<path d="M32 46 q4 -2 8 0" fill="none" stroke="#0d100e" stroke-width="2"/>`),

  // Dinny — ERV's cousin, the toad in the pink suit
  "dinny": riderSVG(`
<path d="M8 72 C8 57 20 51 36 51 C52 51 64 57 64 72 Z" fill="#e0517d"/>
<path d="M28 51 L36 62 L44 51 Z" fill="#f6f1e4"/>
<path d="M34 58 L38 58 L40 72 L32 72 Z" fill="#8abd39"/>
<ellipse cx="36" cy="35" rx="21" ry="16" fill="#8fbf6a"/>
<circle cx="26" cy="22" r="7.5" fill="#8fbf6a"/><circle cx="46" cy="22" r="7.5" fill="#8fbf6a"/>
${EYES(26,46,22,3.2,"#14100e")}
<path d="M17 39 q19 9 38 0" fill="none" stroke="#0d100e" stroke-width="2.6"/>`),

  // Relentless Fonk — fire sprite
  "fonk": riderSVG(`
<path d="M9 72 C9 58 21 52 36 52 C51 52 63 58 63 72 Z" fill="#8f2420"/>
<path d="M36 2 C44 12 52 14 50 24 C58 20 58 32 52 36 L20 36 C14 32 14 20 22 24 C20 14 28 12 36 2 Z" fill="#f2952e"/>
<path d="M36 10 C41 17 46 19 44 26 C48 24 48 31 45 34 L27 34 C24 31 24 24 28 26 C26 19 31 17 36 10 Z" fill="#f2c14e"/>
<ellipse cx="36" cy="42" rx="18" ry="15" fill="#c8342e"/>
${EYES(29,43,40,3.6,"#f7e07a")}
<path d="M27 50 q9 6 18 0" fill="none" stroke="#0d100e" stroke-width="2.4"/>`)
};

const PLACEHOLDER_FACE = svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
<circle cx="36" cy="36" r="26" fill="#2a3b30" stroke="#0d100e" stroke-width="2.4"/>
<text x="36" y="46" text-anchor="middle" font-family="system-ui" font-size="28" font-weight="900" fill="#8fa89a">?</text></svg>`);

/* kind is 'dogs' or 'riders' */
function faceFor(kind, id){
  const override = ART.faces && ART.faces[kind] && ART.faces[kind][id];
  if(override) return override;
  return (kind === 'dogs' ? DOG_FACES[id] : RIDER_FACES[id]) || PLACEHOLDER_FACE;
}
