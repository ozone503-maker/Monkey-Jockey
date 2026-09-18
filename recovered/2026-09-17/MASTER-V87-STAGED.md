# Monkey Jockey — MASTER V87 staged runtime

Date: 2026-09-17

This record documents the current staged runtime built against the root MASTER PRODUCTION SPECIFICATION.

## Source

Base executable:
- Library artifact: `index(20260918-004447).html`
- bytes: `19,381,002`
- SHA-256: `7e162833a44fe435a189055dec2341a22898f648cac8de2c25d7d4bc1c3e8f38`

Staged successor:
- filename: `Monkey-Jockey-MASTER-V87.html`
- bytes: `20,745,886`
- SHA-256: `f904d92ec562265f1bbb18515f42816ee867f40e51327a9c2545826f38496509`

## Runtime changes

- Preserved the existing authoritative deterministic race engine.
- Preserved SIDE race presentation and leader framing.
- Preserved replay/race RNG behavior; this pass makes no race-physics or race-RNG changes.
- Locked the runtime rider ID `shockbot` to ShockBot art rather than a generic robot substitute.
- Embedded a turquoise-necklace ShockBot avatar/full-body source for selection/results/runtime fallback.
- Verified there is no `buff-bro-bot` runtime ID in the staged file.
- Added eight canonical transparent FRONT dog cutouts.
- Removed the FRONT camera's colored rectangular torso-placeholder treatment.
- FRONT fallback now draws transparent canonical dog art with preserved aspect ratio.
- Kept SIDE and FRONT as renderers of the same authoritative race state.
- Added redundant intro escape handling for click/touch/keyboard so a stalled media event cannot permanently trap the player on the title overlay.

## Explicit non-changes

This pass does **not**:
- alter seeded race outcomes
- alter finish logic
- alter replay result ownership
- add a second race simulation
- restore TOP/OVERHEAD as a production camera
- permit a substitute robot for ShockBot

## Remaining visual limitation

The accessible approved asset set still does not contain a finished full-body FRONT running cycle for every dog+rider combination. V87 therefore improves the FRONT fallback by using transparent canonical dog art and removing the obvious colored torso/card construction, but this is not the final full-body FRONT art solution.

The next FRONT art pass should replace fallback cutouts with approved true front-running dog+rider assets without touching race state or determinism.

## Promotion rule

Do not promote this staged runtime merely because the static checks pass. Perform visual/runtime acceptance first:
- intro -> setup
- select dog + ShockBot
- SIDE race
- SIDE -> FRONT -> SIDE without state jump
- finish/result/podium
- replay equality
- Run It Back
- mobile landscape

Only after that should it replace the production executable.
