# ShockBot — Monkey Jockey rider identity lock

Status: ACTIVE launch rider. Replaces Buff Bro Bot.

## Authority

Exact visual identity comes from Jessie's approved ShockBot artwork. If this text conflicts with an approved image, the image wins.

## Default avatar rule

ShockBot needs a **canonical/default Monkey Jockey avatar**, not a one-off music-video costume.

- The **Save the Dogs** outfit is a song/video-specific skin and is **not** ShockBot's permanent/default game identity.
- Default ShockBot should read immediately as ShockBot before any themed wardrobe is added.
- Keep the metallic/silver robot identity and signature turquoise/mineral necklace visible.
- Wardrobe should be clean, simple, confident, and neutral enough to work across the game and Brobots universe.
- No generic sci-fi armor redesign.
- No gold chain substitution.
- Do not permanently lock ShockBot to any single music-video costume.
- Future song-specific looks may be added as optional skins only.

## Locked traits

- Humanoid robot; do not reuse Buff Bro Bot anatomy or proportions.
- Metallic/silver robot identity.
- Turquoise/mineral necklace is signature and must remain visible.
- Cool, confident ShockBot silhouette; compact enough to ride the dogs in the Monkey Jockey scale system.
- No generic sci-fi robot redesign.

## SIDE production target

- True side profile facing RIGHT.
- Mounted racing crouch, compact and athletic.
- Transparent background.
- Preserve face/head identity from the approved reference.
- Default/canonical wardrobe only; themed video outfits are alternate skins.

## FRONT production target

- True front-facing, full body.
- Mounted racing crouch: torso slightly forward, knees bent outward, hands ready for the riding anchor.
- Transparent background.
- Consistent camera height with the other FRONT rider masters.
- Preserve face/head identity from the approved reference.
- Default/canonical wardrobe only; themed video outfits are alternate skins.

## Ownership

- rekker/Grok: Phase 1 art + Phase 2 rig parameters/proof.
- ChatGPT: runtime wire-up, integration QA, final production approval.
- Do not alter race engine or determinism for this rider.

## Required handoff

- `art/shockbot.png`
- `tools/params/shockbot.json`
- `out/shockbot.rig.json`
- `out/shockbot.proof.png`

All factory checks must return `RESULT: PASS`; never widen `rig_cut.py` tolerances.
