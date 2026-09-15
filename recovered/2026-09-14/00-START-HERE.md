# MONKEY JOCKEY — CONSOLIDATED MASTER

**Consolidated:** 2026-09-08  
**Production camera direction:** **SIDE + FRONT-FACING**  
**Top-down:** retired from production. Legacy files may still contain top/overhead code or art, but it is not a production target or blocker.

## What is authoritative now

### 1. Current game source
`01-CURRENT-GAME-SOURCE/monkey-jockey/`

This is the Claude folder build from `monkey-jockey-4-audio-intro.zip`. It contains the real game source, intro/audio work, player-select assets, deterministic race engine, and Claude's SIDE sizing mechanism.

Important contracts already documented by Claude:
- `rng32` is the race randomness source.
- `entrantId` owns racer-specific state.
- renderers read race state; they do not simulate.
- `trackEventMult` and `raceVarianceMult` have separate owners.
- the project can run as a static folder and can build a self-contained HTML.

### 2. Claude FRONT camera source
`02-CLAUDE-FRONT-CAMERA/tue-0900-monkey-jockey-front-camera/`

This is the authoritative FRONT camera geometry/sizing prototype. It includes Claude's `project(distance)` perspective mechanism and the tunable controls:
- depth squash
- lead distance
- camera height
- lane spread

**Do not replace this sizing/perspective mechanism with the later compatibility-camera experiments.**

### 3. Canonical art source packs
`03-CANONICAL-ART-PACKS/`

These are preserved unchanged:
- `monkey-jockey-character-pack.zip` — rider Character Factory source
- `dog-monkey-jockey-dog-pack.zip` — Dog Factory source
- `mj-dogs-rgba-run-v6-1.zip` — normalized dog side/run/top source pack

Factory rule remains: derive new art from approved assets; do not restart characters from text.

### 4. Audio source
`04-AUDIO-SOURCE/Volcano Jockey.mp3`

Original supplied music master. The current game source already contains cut/looped game audio.

## The branch rule from now on

**Continue production development from `01-CURRENT-GAME-SOURCE/monkey-jockey/`.**

For the second camera, transplant/integrate Claude's FRONT projection from `02-CLAUDE-FRONT-CAMERA/` into that source.

Do **not** continue production from the V22–V62 compatibility derivative line. Those experiments contain useful QA ideas and presentation experiments, but they are not the authoritative game branch.

Do **not** continue from rejected Run18 or the mistaken Run32 lineage.

## Next actual integration

The next code merge should be narrow:

1. Keep Claude's race engine, selection flow, intro/audio, SIDE renderer, and SIDE sizing mechanism.
2. Replace the player-facing overhead/top renderer with a FRONT renderer.
3. Use Claude's `project(distance)` math for FRONT perspective and size.
4. Feed it only authoritative race-state position/progress keyed by `entrantId`.
5. Preserve depth sorting and lane placement as presentation only.
6. Connect approved Claude/Grok FRONT body-movement art when it arrives.
7. Keep portrait/body placeholders only as temporary fallbacks.
8. Do not alter race RNG, finish logic, weather replay behavior, or multiplier ownership to make the camera work.

That gives us **one game source, one FRONT camera mechanism, one Character Bible, one Dog Bible, and one audio master.**