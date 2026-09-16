# Monkey Jockey — Canonical Recovery / Grok Verification README

**Purpose:** This file records what ChatGPT currently believes is the authoritative recovery chain. It is intentionally written so Grok/Rekker can independently inspect the repository and either verify or correct each claim before more runtime work is promoted.

## STOP: production direction

- Production race cameras are **SIDE + FRONT-FACING**.
- **TOP-DOWN / OVERHEAD IS RETIRED. Do not restore or develop it.**
- SIDE should track the race leader at approximately **75% of viewport width** while the roadside world scrolls right-to-left.
- FRONT-FACING exists to show the dogs coming toward the camera, with dog faces visible.
- Do not promote a file merely because its V-number is higher.

## Runtime source-of-truth finding

ChatGPT's recovery audit found a persisted **Production FRONT V33** runtime described as the latest complete authoritative self-contained runtime in the recovery inventory.

Recorded V33 runtime characteristics:
- self-contained `index.html`
- recorded size: **19,405,362 bytes**
- zero-dependency/static deployment model
- QA recorded as passing in the recovery material

**Important:** ChatGPT has NOT yet proven that those exact V33 runtime bytes are currently present on the GitHub default branch. The recovery material indicated the runtime existed in the ChatGPT project/library, while binary/materialization access had previously failed. Grok should verify this independently.

## Correctness invariants that must survive every build

Do not promote a candidate unless all are verified:

1. Seeded race determinism remains authoritative.
2. `entrantId` remains the race-state identity architecture.
3. Replay uses the **frozen race-start weather snapshot**; replay must not silently use a newly selected UI weather value.
4. `trackEventMult` and `raceVarianceMult` remain separate multiplier domains.
5. Presentation/rendering code must not consume race RNG or mutate authoritative race state.
6. SIDE and FRONT must display the same authoritative race state/result.
7. Intro -> selection -> race -> results -> replay must remain traversable.
8. Build remains runnable as a normal static webpage / zero-dependency runtime unless intentionally changed.

## Character / art invariants

### ShockBot
- **ShockBot replaces Buff Bro Bot.**
- Buff Bro Bot must not reappear through stale labels, rider IDs, portraits, fallback art, or old dictionaries.
- Canonical ShockBot identity: silver robot with **turquoise/mineral necklace** and clean neutral wardrobe.
- The Hawaiian shirt + gold chain look was a **Save the Dogs music-video skin**, not canonical game ShockBot.

### Penny + Monkey Jockey
- Preserve the approved real Penny + Monkey Jockey SIDE production frames.
- Do not route pair-specific Penny/Monkey Jockey art onto other entrants.
- Current production work is SIDE + FRONT. Legacy TOP art is not a production priority.

### Whole race presentation
Target is an **eight-team race**:
- SIDE: more than the lead team must be visibly racing; preserve authoritative gaps and leader tracking.
- FRONT: multiple/all dog+rider teams should be visible with depth/scale driven by authoritative race positions.
- Temporary composition art must never be mislabeled as finished authored movement art.

## Punahēle presentation contract

Use established real-road references and the already-approved visual language:
- basalt / wet basalt
- ʻōhiʻa / lehua
- ginger
- monstera / fern / rainforest roadside vegetation
- race-day spectators and transient roadside dressing may be added

Do **not** invent geography. Presentation additions must not create unsupported roads, driveways, buildings, guardrails, poles, landmarks, or geographic features.

## Known regression history — why this README exists

Recent work repeatedly regressed because a newer-looking file or compatibility branch was treated as canonical without a full visual/runtime acceptance test. Observed regressions included:
- Buff Bro Bot returning after ShockBot had replaced him
- missing/incorrect riders
- FRONT rendering collapsing into incomplete dog/head presentation
- stale/broken runtime branches being patched instead of returning to the last visually working ancestor
- accidental renewed work on retired TOP-DOWN art
- title-screen/boot regressions

Therefore **version number is not authority**. The game must pass the acceptance contract below.

## Mandatory promotion gate

Before Grok, ChatGPT, Claude, or any other agent calls a build canonical, verify:

- [ ] intro displays and advances
- [ ] audio behavior works after permitted user interaction
- [ ] selection screen opens
- [ ] all intended dogs/riders are selectable
- [ ] ShockBot is present
- [ ] Buff Bro Bot is absent
- [ ] race starts
- [ ] SIDE camera works
- [ ] SIDE leader is held near 75% viewport width
- [ ] SIDE shows a readable racing pack
- [ ] FRONT-FACING camera works
- [ ] FRONT shows dogs + riders, not just broken/floating portraits
- [ ] no TOP/OVERHEAD production control
- [ ] results screen works
- [ ] replay works
- [ ] replay weather equals frozen race-start weather
- [ ] same seed/input reproduces the same authoritative result
- [ ] `entrantId` architecture intact
- [ ] `trackEventMult` and `raceVarianceMult` remain separate
- [ ] presentation consumes no race RNG
- [ ] no console-stopping ReferenceError
- [ ] static/zero-dependency build opens normally

## Grok / Rekker verification request

Please independently inspect the repo history, recovery notes, contracts, issues/PRs, and runtime files.

Specifically report:

1. Is Production FRONT V33 truly the latest complete authoritative runtime in the persisted production lineage?
2. Are the exact V33 runtime bytes present anywhere in this repository? If yes, give path + commit SHA + byte size.
3. Identify the exact commit(s) where ShockBot replaced Buff Bro Bot.
4. Identify the exact SIDE leader-tracking / scrolling-background contract.
5. Confirm FRONT-FACING replaced TOP-DOWN as the second production camera.
6. Confirm replay weather snapshot + multiplier separation + `entrantId` invariants in the candidate runtime.
7. Flag any later commit that is a genuine forward production build rather than a compatibility/experimental branch.
8. Do not modify race physics while auditing.

If any statement in this README is wrong, **correct it with repository evidence rather than preserving the claim.**

## Working rule going forward

Once Grok and ChatGPT agree on the exact good runtime, tag/designate it **MONKEY-JOCKEY-CANON** (or equivalent), record its commit SHA + file hash + byte size here, and require every future candidate to pass the promotion gate before replacing it.
