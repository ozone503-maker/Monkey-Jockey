# FRONT CAMERA MERGE MAP

## Current production source
`01-CURRENT-GAME-SOURCE/monkey-jockey/`

Relevant files:
- `js/render.js` — current SIDE + legacy overhead renderer
- `js/race.js` — authoritative race construction/step
- `js/core.js` — shared state + seeded RNG
- `js/ui.js` — camera/UI controls
- `js/art.js` — sprite resolution / scale
- `js/data.js` — roster/tracks/weather
- `build.py` — static folder → self-contained HTML

## Claude FRONT prototype
`02-CLAUDE-FRONT-CAMERA/tue-0900-monkey-jockey-front-camera/index.html`

The piece to promote is the perspective/projection model around:

`project(distance)`

with four tuning inputs:
- squash
- lead
- camera height
- lane spread

The production implementation should convert those prototype controls into named constants/config after tuning rather than leave development sliders in the final game.

## Preserve
- SIDE renderer sizing derived from actual rendered stage height.
- Per-dog `DOG_SCALE`.
- Bottom-edge SIDE art anchoring.
- entrantId architecture.
- seeded `rng32` race determinism.
- renderer read-only contract.
- separate `trackEventMult` / `raceVarianceMult`.
- existing select screen and generated-seven-opponents behavior.
- audio/intro lifecycle.

## Retire from player-facing production
- `drawTop(...)`
- overhead/top camera button/text
- top-down art as a required production asset

Top assets can remain in the repository temporarily for compatibility/reference until the FRONT conversion is proven, then they can be archived without affecting race systems.

## FRONT art contract
The camera should accept approved front dog+rider frames without changing simulation code. Art sizing comes from Claude's perspective projection plus per-dog scale metadata. Movement animation must be deterministic/presentation-only and must never consume the race RNG.