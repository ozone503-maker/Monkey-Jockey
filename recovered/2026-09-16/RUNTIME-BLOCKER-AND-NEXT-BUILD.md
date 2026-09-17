# Monkey Jockey — Runtime Blocker + Safe Next Build Procedure

Date: 2026-09-16

## Verified repository state

The default branch currently contains recovery documentation and QA for Production FRONT V33, but **does not contain the V33 runnable `index.html` itself** in `recovered/2026-09-14/`.

This is now a hard promotion rule: **do not reconstruct or replace the production runtime from an older/later mystery `index.html` just because its timestamp or version number looks newer.**

## V33 authority

Until an actual later runnable production artifact is verified byte-for-byte, Production FRONT V33 remains the recovery baseline described by:

- `recovered/2026-09-14/00-START-HERE.md`
- `recovered/2026-09-14/BUILD-NOTES-PROD-FRONT-V33.txt`
- `recovered/2026-09-14/QA-PROD-FRONT-V33.json`
- `recovered/2026-09-14/RECOVERY-INVENTORY.md`
- root `CANONICAL-RECOVERY-README.md`

## Required correctness invariants

Any recovered runtime must be rejected unless all of these survive:

- seeded deterministic race engine
- `entrantId` ownership of racer-specific state
- replay uses the exact frozen race-start weather snapshot
- mutable weather-transition execution state is separate from the frozen weather plan
- `trackEventMult` and `raceVarianceMult` are separate ownership domains
- rendering/presentation consumes no race RNG and writes no authoritative race state
- SIDE and FRONT read the same authoritative race state

## Art / camera invariants

- Production cameras: **SIDE + FRONT-FACING**.
- TOP/OVERHEAD is retired from player-facing production. Legacy TOP art may remain only as source/compatibility material.
- Preserve exact real Penny + Monkey Jockey SIDE pair frames when the canonical runtime is recovered.
- ShockBot is canonical; Buff Bro Bot must not return through stale IDs, labels, fallback dictionaries, or portraits.
- Canonical ShockBot: silver robot + turquoise/mineral necklace + neutral racing wardrobe.
- SIDE leader target is approximately 75% of viewport width with scenery scrolling right-to-left.

## Punahēle presentation

Safe presentation-only additions may use established basalt/wet-basalt, ʻōhiʻa/lehua, ginger, monstera/fern/rainforest roadside language. Do not invent roads, driveways, buildings, guardrails, utility poles, landmarks, or other unsupported geography. Presentation changes must remain deterministic/read-only with respect to race state.

## Exact next build procedure

1. Recover/materialize the actual V33 `index.html` (recorded size 19,405,362 bytes) OR locate a demonstrably later complete runnable production artifact.
2. Record source path, byte size, SHA-256, and provenance before editing.
3. Run the canonical promotion gate before making changes.
4. Apply only missing correctness patches; do not redesign settled race systems.
5. Apply post-V33 canonical deltas narrowly: ShockBot identity, SIDE 75% leader tracking/parallax, approved FRONT dog/rider art.
6. Re-run deterministic replay checks and visual acceptance tests.
7. Only then publish a new runnable build and update `CANONICAL-RECOVERY-README.md` with its exact hash/commit.

## Current blocker

The exact V33 runnable bytes are not present in the GitHub recovery directory. QA/build notes alone are insufficient to safely generate a successor. A later QA report alone is also insufficient without its corresponding runnable HTML/ZIP.

This file exists to prevent another stale-branch promotion while recovery continues.