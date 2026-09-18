# ShockBot Phase 2 — Status

**Updated:** 2026-09-18 12:46 PM HST  
**Issue:** Monkey Jockey #3 — ShockBot Phase 2  
**Gate 1:** Jessie APPROVED v2 (LOCKED)  
**Phase 2 RESULT:** `RESULT: FAIL (1 checks)` — **NOT ready to push as PASS**

---

## Art lock (verified)

Source: `art/shockbot_gate1_preview_v2.png`  
Copied to:

- `art/shockbot.png`
- `tools/art/shockbot.png`

MD5 (all three identical): `f315f47045c00eda6d41bdc9a8210cf6`

Identity locks present in art:

- leopard fedora + sunglasses ALWAYS
- turquoise necklace
- silver robot
- clean wardrobe
- NOT Hawaiian / NOT gold-S

---

## Tool / method

- Tool: `tools/rig_cut.py` (SIDE dog cutter) — **unchanged**
- Params: `tools/params/shockbot.json` (FRONT biped mapped onto dog-side cutter)
- Mapping note: `rear` = image-left leg, `front` = image-right leg; left forearm/hand used as tail stand-in; head is center-front
- Tolerances: **NOT widened** (hard rule)
- Race engine: **NOT touched**
- GitHub: **NOT pushed** (parent owns push)

---

## Final `rig_cut` report

```
=== shockbot ===
  [PASS] REST INTEGRITY       missing 0.01% (limit 2.00%), added 0.30% (limit 6.00%)
  [PASS] NO DETACHED PARTS    largest blob holds 100.000% of the pixels at phase 0.00 (limit 99.500%)
  [FAIL] NO HOLES             worst interior gap 4.03% of body at phase 0.81 (limit 1.50%)
  [PASS] FOOT TRAVEL          lowest point moves 17.3% of leg length (want 4%-70%)
  leg length 283 px  -> step rate x0.84 relative to a 200px leg
  RESULT: FAIL (1 checks)
```

---

## BLOCKER (FRONT biped cannot PASS without widening tolerances)

### Failing check

| Check | Measured | Limit | Status |
| --- | --- | --- | --- |
| NO HOLES | 4.03% worst interior gap (phase 0.81) | 1.50% | **FAIL** |

### Why params cannot fix it

1. The **source PNG itself** already has an enclosed transparent loop of **3.70%** of body pixels (`binary_fill_holes` on alpha).
2. Cause: FRONT-facing grip — both arms + horizontal bar + torso enclose empty space. That loop is anatomy of the approved Gate 1 art, not a bad cut.
3. Hole Y-fraction in source ≈ `0.37–0.50` (chest / arms / bar). Leg `bands.erase` starts at `0.575` — **below** the hole. Leg/collar/`legPad` knobs cannot remove it.
4. `REST INTEGRITY` requires the zero-angle rebuild to match the source silhouette, so the enclosed loop **must** remain in the composed body.
5. Therefore composed NO HOLES ≥ ~source holes (3.70%) > limit (1.50%) for any legal param set.

### Param sweep (no tolerance change)

120 trials sweeping `bands.collar` ∈ {0.04…0.12}, `bands.erase` ∈ {0.575…0.68}, `legPad` ∈ {0.18…0.35}:

- **0 PASS**
- Best NO HOLES achieved: **~3.96%** (still ~2.5× over 1.50%)
- Other three checks stayed PASS across the sweep

### What would unblock (out of Phase 2 scope)

- **Art change:** break the enclosed arm–bar–torso loop (e.g. open one side of the grip / no closed handle loop), **or** ship a true SIDE profile for the dog cutter; **or**
- **Tool change:** widen NO HOLES tolerance / add a FRONT-biped cutter — **forbidden** for this phase.

---

## Handoff paths collected

| Path | Present |
| --- | --- |
| `art/shockbot.png` | yes |
| `tools/art/shockbot.png` | yes (same bytes as art) |
| `tools/params/shockbot.json` | yes |
| `tools/out/shockbot.rig.json` | yes (FAIL cut) |
| `tools/out/shockbot.proof.png` | yes |
| `out/shockbot.rig.json` | yes (copy of tools/out) |
| `out/shockbot.proof.png` | yes (copy of tools/out) |

Extra diagnostics (not required handoff):

- `tools/out/shockbot_blocker_proof.json` — source hole math
- `tools/out/shockbot_source_holes.png` / `shockbot_holes_phase.png` — red overlay of enclosed holes

---

## Ready to push?

**No — not as a PASS Gate 2 handoff.**

Parent may still push artifacts + this status for review / Jessie decision on art remake vs FRONT-camera pipeline, but Phase 2 mechanical gate is **blocked** until art or an approved cutter path changes. Do not widen `rig_cut.py` tolerances.
