# Monkey Jockey — MASTER V88 staged runtime

Date: 2026-09-17

This is the immediate repair pass after live mobile testing of MASTER V87.

## User-observed V87 failure sequence

1. Intro screen froze.
2. SIDE race view ran and looked correct.
3. Switching to FRONT showed no dogs.
4. Switching back to SIDE left the race frozen.

That sequence identified two presentation-path problems rather than a race-engine problem.

## V88 repair

### Intro

- ENTER now dismisses the intro immediately.
- Heavy embedded production-art warming is deferred until after the transition.
- Intro transition delay reduced to 180 ms.
- Audio unlock remains intact.

### FRONT camera

V87 attempted to instantiate/decode all eight large transparent FRONT dog masters from the live race render path. On mobile this can stall the main thread and leave FRONT blank during decode.

V88:
- removes those high-resolution FRONT masters from the live hot path;
- retains them as source assets for future optimized sequences;
- uses the lightweight canonical FRONT dog-face assets as the current fallback;
- keeps FRONT projection tied to the existing authoritative race state.

### Race freeze isolation

V87 still allowed a renderer failure to bubble through the 30 Hz race pulse and stop `running`.

V88 explicitly separates engine and renderer failures:
- engine failure may stop the race;
- renderer failure may not stop authoritative simulation;
- if FRONT throws, camera automatically falls back to SIDE while the same race continues;
- SIDE/FRONT switching never reseeds or restarts the race.

## Non-changes

No changes were made to:
- race physics
- seeded RNG
- entrantId ownership
- finish logic
- replay identity
- weather snapshot contract
- result calculation

## Static validation

The complete inline JavaScript was extracted and passed through `node --check` successfully.

## Runtime file

- `Monkey-Jockey-MASTER-V88.html`
- bytes: `20,748,153`

Visual/mobile acceptance is still required before production promotion.
