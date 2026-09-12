# MONKEY JOCKEY — RIG FACTORY
### A protocol for turning one drawing per character into a jointed, animated racer

---

## What this replaces

The old plan asked for four gallop frames plus a top-down per dog (top-down is now retired): **40 dog
images**, each of which had to match the last one for colour, markings, scale,
camera and light. Image models do not hold identity across forty generations.
That is the failure mode that cost twelve hours on one dog.

This plan asks for **one drawing per character**, cut into eight pieces and
animated by code. Eight dog drawings, eight rider drawings. Sixteen
generations total, each one independent, none of which has to match a
previous generation of itself.

The motion is not lost. A three-segment leg driven on gallop timing folds,
whips forward and extends. It has been built and tested; see
`penny.proof.png`.

---

## Roles

| Who | Does |
| --- | --- |
| **Generator** (Grok / rekker) | Phase 1 art. Phase 2 parameter fitting. Runs the tool, reads the report, adjusts numbers, re-runs. |
| **Jessie** | Two accept/reject gates. Nothing else. |
| **ChatGPT** | Wires passing rigs into the build. Owns the runtime code. Integration, review, testing, GitHub issues/PR feedback. |

The generator never judges by eye. It judges by the tool's report.

---

## Cameras (production)

Production art is **SIDE** (true side profile facing RIGHT) and **FRONT-FACING**.
**TOP-DOWN is retired** from production. Do not generate or require top-down
views for shipping.

---

## Shared build loop (GitHub)

Repo: `ozone503-maker/Monkey-Jockey` — shared source of truth.
Deploy path: **GitHub → Vercel**.

1. ChatGPT opens issues / PRs with precise fix notes against `FACTORY.md` /
   `CONTRACT.md`.
2. rekker (Grok Bot) watches the repo, implements art/rig work, pushes or
   opens a PR with art + `rig.json` + proof.
3. ChatGPT reviews against contracts, retests, comments fixes; repeat until
   production passes.

**Do not change the runtime race engine / determinism just to make
presentation or art work.** Art and params adapt to the contracts; the race
engine stays put.

---

## Phase 1 — ART (8 dogs, 8 riders)

One image per character. See `00-generation/`.

**Non-negotiable for every character:**

1. **True side profile, facing RIGHT.** Not three-quarter. Both eyes must
   not be visible. (FRONT-FACING is a separate production camera; SIDE is the
   primary rig source.)
2. **Athletic standing crouch, NOT parade stance.** Knees and hocks
   already slightly bent, weight forward, head lowered a little. A rig can
   fold a bent leg further; it cannot unbend a straight one. Parade-straight
   legs are the single most common cause of a weak gait.
3. **All four feet on one flat ground line**, legs clearly separated left
   from right so the leg columns can be read off the image.
4. **Transparent background.** No shadow, no floor, no grid, no label, no
   border, nothing cropped.
5. **Nothing overlapping the legs.** No tail across a leg, no long fur
   bridging the gap between front and rear legs. Those bridges make the leg
   columns unreadable and the fit will fail.
6. **PNG, at least 1200px wide**, animal filling most of the frame.

**Identity** comes from `reference/identity/<dog>.jpg`, which is the
approved sprite. Markings, colour, ears, collar and proportions match it
exactly. If a photo of the real dog exists, attach it too; **when a photo and
a written description disagree, the photo wins.** New art must derive from
approved/canonical assets — no freeform character reinvention.

**Style** comes from `reference/gait-*.jpg`. Rendered, real fur, real light.
The flat outlined style is retired.

**GATE 1 — Jessie:** looks at each drawing once, says yes or no. Rejected
drawings are regenerated, not patched.

---

## Phase 2 — FIT (the tedious part, and the point of this document)

For each accepted drawing the generator produces one small JSON file of
numbers describing where that animal's joints are. This is the work that
does not scale by hand and does scale for an agent, because **the acceptance
test is mechanical**.

```
cp tools/params/_TEMPLATE.json tools/params/beaux.json
# fill in id, src, and the fractions
cd tools && python3 rig_cut.py params/beaux.json
```

The tool prints four checks. **Iterate until all four read PASS.** Do not
stop at three. Do not judge the proof sheet by eye and override a FAIL.

### The four checks, and what to change when one fails

| Check | Means | Fix |
| --- | --- | --- |
| **REST INTEGRITY** | Parts put back at zero rotation do not rebuild the original silhouette. `missing` too high = the erase lines cut away pixels no part covers. `added` too high = pieces overlap each other badly. | Move `bands.erase` DOWN toward the feet. Move `head.erase` and `tail.erase` closer to their pivots. |
| **NO DETACHED PARTS** | Something flies off during the cycle. Reported as the largest connected blob's share of pixels, plus the phase where it is worst. | Your `joints` fractions are not on the real anatomy. Move `joints.knee` and `joints.ankle` onto the visible bend points. If still failing, raise `bands.collar` to give each piece more overlap. |
| **NO HOLES** | A gap opens inside the body mid-cycle. | Raise `bands.collar`. Move `bands.erase` down. Widen the leg columns slightly via `legPad`. |
| **FOOT TRAVEL** | The paws barely move (columns are on the belly, not the legs) or move absurdly (joints inverted). | Re-read `legs.rear` and `legs.front` off the image. They are fractions of WIDTH, left edge then right edge, tail end is 0. |

### Rules for fitting

- **Never touch `gait`.** Those five numbers are approved and identical for
  every dog. Per-dog difference comes from measured leg length, which the
  tool computes; it is not a taste decision.
- **Never widen a tolerance in the tool.** If a check fails, the numbers are
  wrong, not the check.
- Fit one character completely before starting the next.
- `penny.json` is a worked, passing example. Copy its shape.

**GATE 2 — mechanical, not human:** every character has a `.rig.json` and a
report reading `RESULT: PASS`. Jessie glances at the eight proof sheets and
can veto, but a FAIL never ships regardless of how it looks.

---

## Phase 3 — HANDOFF

Send back one zip (or commit the same shape to this repo):

```
out/<id>.rig.json      one per character   REQUIRED
out/<id>.proof.png     one per character   REQUIRED
tools/params/<id>.json one per character   REQUIRED (so a re-cut is possible)
art/<id>.png           the source drawings REQUIRED
```

ChatGPT wires these into the build. Nothing else is needed and nothing else
should be sent.

---

## Why the checks are shaped this way

An agent cannot iterate against "does it look right." It can iterate against
"NO DETACHED PARTS returned 89.567% at phase 0.62, limit is 99.500%." Every
check returns a number, a limit and the phase where it is worst, so the next
adjustment is obvious and the loop terminates.

The checks were verified to reject as well as accept. Leg columns placed on
the belly fail FOOT TRAVEL at 0.5%. A knee fraction placed down at the paw
fails NO DETACHED PARTS at 89.567%. A tool that only ever passes is not a
gate.

---

## Estimated volume

| | Old plan | This plan |
| --- | --- | --- |
| Dog images | 40 | 8 |
| Rider images | 40 | 8 |
| Must match a previous generation | every one | none |
| Human accept/reject decisions | 80 | 16 |
