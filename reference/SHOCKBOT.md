# ShockBot — Monkey Jockey rider identity lock

Status: ACTIVE launch rider. Replaces Buff Bro Bot.

## Authority

Jessie's approved **ShockBot character sheet** is the identity source of truth
(`reference/identity/riders/shockbot_character_sheet.png`).
If prose here conflicts with that sheet, **the sheet wins**.

## Locked traits (from sheet)

- Bronze/gold metallic humanoid robot with visible mechanical joints
- Black stylized mustache; circular headphone-like ear hubs
- Leopard-print fedora with black band
- Dark rectangular sunglasses
- Thick gold chain with circular gold **S** medallion (not a turquoise substitute)
- Open light-blue Hawaiian shirt with white hibiscus over white tee
- Beige/linen shorts; white slides with three black stripes
- Compact medium-large rider silhouette — NOT Buff Bro Bot proportions

## FRONT production target

- True front-facing, full body
- Mounted racing crouch: torso slightly forward, knees bent outward, hands ready for the riding anchor
- Transparent background
- Consistent camera height with the other FRONT rider masters
- Preserve face/head/costume identity from the character sheet (pose may change; identity may not)

## Ownership

- rekker/Grok: Phase 1 art + Phase 2 rig parameters/proof
- ChatGPT: runtime wire-up, integration QA, final production approval
- Do not alter race engine or determinism for this rider

## Required handoff

- `art/shockbot.png`
- `tools/params/shockbot.json`
- `out/shockbot.rig.json`
- `out/shockbot.proof.png`

All factory checks must return `RESULT: PASS`; never widen `rig_cut.py` tolerances.
