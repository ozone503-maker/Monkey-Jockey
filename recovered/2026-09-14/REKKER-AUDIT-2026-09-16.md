# Rekker independent verification — CANONICAL-RECOVERY-README

**Date:** 2026-09-16 (PT) / 2026-09-17T00:45Z  
**Auditor:** rekker (Grok Bot)  
**Against:** `main` @ `5b3de939b678faab89856c4650ab8b11c3ccd50f`  
**Issue:** #6  
**Scope:** audit/recovery only — no race physics / runtime math changes.

## Verdict on the README

`CANONICAL-RECOVERY-README.md` is **mostly correct**. The important hedge already in the README is right: ChatGPT had **not** proven V33 runtime bytes are on the GitHub default branch. Independent inspection confirms they are **still absent**.

Corrections / sharpening (do not treat as disputes of intent):

1. There is **no runnable race runtime** anywhere on `main` (no `index.html`, no `.js` race sources, no `.zip` packages under the tree).
2. **No GitHub tag** named `MONKEY-JOCKEY-CANON` (or equivalent) exists yet — correctly so; promotion gate cannot be passed from this repo alone.
3. Approved **Penny + Monkey Jockey SIDE production pair frames** cited in V33 notes are **not** present in this repository. Only the select-screen portrait `art/select/dogs/penny.png` is on `main`.
4. Library folder names through **V35** / patch lines **V57–V62** exist in recovery notes, but recovery explicitly says **do not promote** the V22–V62 compatibility lineage; V35 was empty when checked. So V33 remains the latest *complete persisted Production FRONT package described in recovery*, not “highest V-number wins.”

## Answers (repository evidence)

### 1. Is Production FRONT V33 the latest complete authoritative persisted runtime?

**Best current answer from repo evidence: yes, among recovered Production FRONT packages — with caveats.**

Evidence:
- `recovered/2026-09-14/RECOVERY-INVENTORY.md` (commit `e3c9177bb01b50f20464ea550839a1e2852484a0`) states V33 is the latest complete persisted authoritative Production FRONT package found; V35 existed as a Library folder name but was empty; do not promote V22–V62 compatibility derivatives over the consolidation base.
- `recovered/2026-09-14/BUILD-NOTES-PROD-FRONT-V33.txt` (`e65f36dc5a15e9d0b47f5fa012a16abce81826f6`)
- `recovered/2026-09-14/QA-PROD-FRONT-V33.json` (`0add895a7a7d315cf9340d7fd8d0fc85e3926fac`) reports `all_pass: true`, `index_bytes: 19405362`

No later **genuine production** runtime bytes appear in this GitHub repo. Higher Library version *names* alone are not authority.

### 2. Exact runnable runtime bytes in this repository?

**Not present.**

| Claimed artifact | Recorded size | In GitHub `main`? |
| --- | ---: | --- |
| `PRODUCTION-FRONT-V33/index.html` | 19,405,362 bytes | **No** |
| `MONKEY-JOCKEY-PRODUCTION-FRONT-V33.zip` | 14,517,254 bytes | **No** |

What *is* on `main` under `recovered/2026-09-14/`: notes, QA JSON, consolidation manifest, FRONT merge map — **not** the runtime bytes. Inventory explicitly records Library binary materialization previously failed (HTTP 403).

### 3. ShockBot replaces Buff Bro Bot — commit + stale resurrection risk

**Canonical lock commits on `main`:**
- `1ce0c45bb1a1a0a214035af76aa6805ff0fe45b7` — `Lock ShockBot rider identity and FRONT production requirements` (adds `reference/SHOCKBOT.md`)
- `4f8232e9e642a3834fa279d39067c6b0cfb86280` — `Clarify canonical ShockBot avatar vs Save the Dogs skin` (turquoise/neutral default; Hawaiian/gold-S = song skin only)

Issue #3 body also orders ShockBot to permanently replace Buff Bro Bot.

**Stale risk (open branches, not merged):**
- PR #4 / branch `phase-b-shockbot-identity` still carries Hawaiian/gold-S character-sheet identity assets and an older `reference/SHOCKBOT.md` rewrite. Merging it **as-is** can resurrect the song skin as if it were default canon. Rebase/rewrite against `4f8232e` + turquoise Gate 1 before merge.
- Code search on `main` found **no** remaining `Buff Bro` string hits in indexed paths (roster runtime files are absent because the runtime itself is absent).

### 4. SIDE leader tracking (~75%) + scrolling scenery

**Governing file:** `design/SIDE-CAMERA-SCENERY.md`  
**Commit:** `fedb7bad5aa0f7e7e3fb6153ba1fe034e81b6d5a` — `Add SIDE camera tracking and parallax scenery contract`

Contract: follow current lead dog; hold near **75% viewport width** from the left; world scrolls right-to-left via multi-layer parallax; presentation only (no race-state mutation).

Also restated in `CANONICAL-RECOVERY-README.md` @ `5b3de939b678faab89856c4650ab8b11c3ccd50f`.

### 5. SIDE + FRONT-FACING only; TOP-DOWN retired

**Confirmed** across:
- `CANONICAL-RECOVERY-README.md`
- `FACTORY.md` / `CONTRACT.md`
- `recovered/2026-09-14/00-START-HERE.md`
- `recovered/2026-09-14/CONSOLIDATION-MANIFEST.json` (`production_cameras: SIDE, FRONT`; `top_down_status: retired-production-legacy-only`)
- `recovered/2026-09-14/FRONT-CAMERA-MERGE-MAP.md` (retire `drawTop(...)` from player-facing production)

### 6. Replay weather / entrantId / seeded determinism / multiplier split

**Cannot execute-verify** — no runtime bytes on GitHub.

**Documented claims for V33** (notes + QA only):
- QA flags true: `replay_weather_snapshot`, `entrantId_architecture`, `split_multiplier_domains`, plus V27–V33 RNG/replay chain checks (`QA-PROD-FRONT-V33.json`).
- Build notes: frozen replay weather snapshot; separate `trackEventMult` vs `raceVarianceMult`; V33 exact per-draw RNG phase-sequence replay.

Treat as **recovery-attested**, not **repo-proven**.

### 7. Approved Penny + Monkey Jockey SIDE pair art provenance/routing

**In-repo gap.**

- V33 build notes claim the four current Penny + Monkey Jockey SIDE production frames were preserved **inside the V33 package** (Library / not GitHub).
- On `main` today: only `art/select/dogs/penny.png` (403,801 bytes) — select-screen portrait per `art/select/README.md`, **not** the SIDE race pair frames.
- Consolidation manifest hashes source zips that still live outside GitHub (`mj-dogs-rgba-run-v6-1.zip`, character packs, etc.).

**Do not** route the select portrait as SIDE race pair art.

### 8. Candidate that passes the README promotion gate?

**None available from this repository.**

Promotion gate requires a runnable build (intro → select → race → results → replay, SIDE 75%, FRONT dogs+riders, ShockBot present, Buff Bro absent, etc.). With no runtime bytes on GitHub, **do not** designate `MONKEY-JOCKEY-CANON` yet.

Next recovery step remains: copy exact V33 (or agreed later) runtime bytes into GitHub via a binary-capable path, then run the gate for real.

## ShockBot Gate 1 preview location (Issue #3 follow-up)

`art/shockbot_gate1_preview.png` is **not on `main`**. It exists on:

| Field | Value |
| --- | --- |
| Branch | `phase-b-shockbot-gate1-turquoise` |
| PR | https://github.com/ozone503-maker/Monkey-Jockey/pull/5 |
| Tip commit | `5f612623576754765d797e5880e3e1902b1a1d3b` |
| Art commit | `181693863af97817466f7d1fdbad384eedfa3799` |
| Path | `art/shockbot_gate1_preview.png` |
| Blob SHA | `ac6a0c99834f8a0bfc1fa34ae20f80b319200122` |
| Bytes | 349,785 |
| SHA-256 | `f14f80d5abe99669f1163c95d9115bb2b92df3c6f81cca06f2a4fd075e2aee3d` |

Identity intent (PR #5 / Issue #3 comment): silver ShockBot + visible turquoise necklace + clean neutral racing wardrobe — **not** Hawaiian/gold-S song skin. Still awaiting Jessie Gate 1 yes/no before Phase 2 / `rig_cut.py`.

## Working rule

Agree on exact good runtime bytes → materialize into GitHub → pass promotion gate → only then tag `MONKEY-JOCKEY-CANON` with commit SHA + file hash + byte size. Version number alone is never authority.
