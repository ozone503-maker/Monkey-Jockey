/* ============================================================
   ART
   ------------------------------------------------------------
   Resolution chain for every sprite, first hit wins:
     1. embedded data URI in ART.dogs   (fully self-contained)
     2. assets/dogs/<id>/side-N.png | top.png   (folder deploy)
     3. legacy assets/penny-mj-*.png            (Penny only)
     4. embedded SVG placeholder                (never a broken img)

   An image that falls all the way to the placeholder is marked
   isPlaceholder, and the renderers skip it in favour of the
   vector racer. Placeholder art must never reach gameplay.

   To add production art either drop PNGs into assets/dogs/<id>/
   or paste data URIs here:
       ART.dogs.mike = { side:["data:...","","",""], top:"data:..." };
   ============================================================ */
const ART = {
  dogs: {},                      // per-dog overrides, see above

  /* Selection-screen portraits. Any entry here overrides the
     generated placeholder in js/faces.js. Data URI or path.
       faces.dogs.penny  = "assets/faces/penny.png"
       faces.riders.ipo  = "data:image/png;base64,..."           */
  faces: {
    /* Canonical dog select portraits: GitHub ozone503-maker/Monkey-Jockey main,
       art/select/dogs/<id>.png (512², light-blue school picture), resized to 256 WebP. */
    dogs: Object.fromEntries(["meatball","beaux","kira","penny","mike","diva","noodle","ghostbuster"]
            .map(id=>[id, `assets/faces/dogs/${id}.webp`])),
    /* Rider busts cropped from the locked Gate 1 FRONT KEEPERs
       (/workspace/monkey-jockey/art/riders/<name>_front_gate1_KEEPER.png, checkerboard keyed)
       and ShockBot's approved art/shockbot_gate1_preview_v2.png, on the same light-blue backdrop. */
    riders: Object.fromEntries(["shockbot","nonna","ipo","erv","mystery-drone-pilot","monkey-jockey","dinny","fonk"]
            .map(id=>[id, `assets/faces/riders/${id}.webp`]))
  }
  // FRONT-camera rider art lives in js/front.js (RIDER_FRONT_SRC)
};

const svgURI = s => "data:image/svg+xml," + encodeURIComponent(s);

const PLACEHOLDER_SIDE = svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150">
<g stroke="#0b0e0c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
<path d="M42 92 C22 84 18 70 26 60" fill="none"/>
<path d="M78 108 L66 134 M96 110 L92 136 M158 106 L172 132 M140 110 L134 136" fill="none"/>
<ellipse cx="112" cy="94" rx="60" ry="30" fill="#c98a52"/>
<path d="M168 78 q22 -6 30 10 q4 12 -10 16 q-16 4 -22 -6 z" fill="#c98a52"/>
<path d="M172 70 q10 -14 18 -4 q-4 10 -10 12 z" fill="#8a5a30"/>
<circle cx="192" cy="86" r="3.4" fill="#0b0e0c" stroke="none"/>
</g>
<text x="6" y="144" font-family="monospace" font-size="10" fill="#ffffff55">placeholder</text>
</svg>`);

const PLACEHOLDER_TOP = svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96">
<g stroke="#090b0a" stroke-width="3" stroke-linejoin="round">
<path d="M20 28 q12 -16 24 0 z" fill="#8a5a30"/>
<ellipse cx="32" cy="54" rx="18" ry="30" fill="#c98a52"/>
<circle cx="32" cy="24" r="10" fill="#c98a52"/>
</g>
</svg>`);

/* sources may be a single URL or an ordered list; the last entry
   tried is always the placeholder. */
function loadArt(sources, placeholder){
  const chain = [].concat(sources).filter(Boolean).concat(placeholder);
  const img = new Image();
  let i = 0;
  img.isPlaceholder = false;
  const next = () => { img.isPlaceholder = (i === chain.length - 1); img.src = chain[i++]; };
  img.onerror = () => { if(i < chain.length) next(); };
  next();
  return img;
}

const dogArt = id => (ART.dogs && ART.dogs[id]) || {};

/* SIDE sprites. The Sep 2 deploy requested assets/dogs/<id>/side-1..4.png,
   top.png and assets/penny-mj-*.png — none of those files exist anywhere
   (45 × 404 per load). The real dog art that does exist is ONE running-pose
   side sprite per dog from the "standing" art pack (attachments zip,
   dogs/<id>/stand.png, cropped + WebP). Only files that exist are requested,
   so there are no missing-file errors; a dog with no art falls through to
   the vector gallop placeholder (render.js / gait.js).
     Penny also has the cut-out gallop rig (js/rigs.js), which SIDE prefers.
     Ghostbuster: the pack's stand.png is corrupt (a green glyph, not a dog),
     and no other Ghostbuster sprite exists → placeholder. */
const DOG_SIDE_ART = {
  meatball:"assets/dogs/meatball/side.webp", beaux:"assets/dogs/beaux/side.webp",
  kira:"assets/dogs/kira/side.webp", penny:"assets/dogs/penny/side.webp",
  mike:"assets/dogs/mike/side.webp", diva:"assets/dogs/diva/side.webp",
  noodle:"assets/dogs/noodle/side.webp"
  // ghostbuster: none
};
const DOG_FRAMES = Object.fromEntries(DOGS.map(d => {
  const src = (dogArt(d.id).side || [])[0] || DOG_SIDE_ART[d.id];
  return [d.id, src ? [loadArt([src], PLACEHOLDER_SIDE)] : []];
}));

/* Top-down sprites are no longer requested: the top-down camera is retired
   (dead code behind DEBUG_TOP_CAMERA) and no top-down dog art exists. */
const DOG_TOPS = {};

/* Draw scale per the packet's scale lock. Meatball and Beaux are
   the tall pair, Noodle and Ghostbuster the compact pair with
   Ghostbuster slightly shorter. Feet stay on one road line. */
const DOG_SCALE = {
  meatball:1.14, beaux:1.14,
  kira:1.00, penny:1.00, mike:1.00, diva:1.00,
  noodle:0.93, ghostbuster:0.90
};
const scaleFor = id => DOG_SCALE[id] || 1;
