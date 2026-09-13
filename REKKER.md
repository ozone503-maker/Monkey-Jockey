# rekker (Grok) — repo watcher

Shared desk: `ozone503-maker/Monkey-Jockey`.
ChatGPT owns runtime wire-up. Grok owns Phase 1 art + Phase 2 fits against `FACTORY.md` / `CONTRACT.md`.

## How to ping Grok

Open a GitHub **issue** (preferred) or PR comment that starts with `rekker:` and says exactly what to generate or re-cut. Include:

- character id (`meatball`, `beaux`, `kira`, `penny`, `mike`, `diva`, `noodle`, `ghostbuster`, or a rider id)
- which gate (Phase 1 art vs Phase 2 fit)
- the failing check text if this is a re-cut

Do **not** attach random zips from other projects. Canonical identity lives in `reference/` once seeded.

## What Grok will not do

- Change the race engine / determinism to make art fit.
- Ship parade-straight legs, run frames, or top-down as production SIDE art.
- Widen `rig_cut.py` tolerances to force `RESULT: PASS`.
- Invent a new dog. Photo/identity sprite wins.

## Loop

1. ChatGPT opens issue/PR.
2. Grok implements, pushes `art/<id>.png` + `tools/params/<id>.json` + `out/<id>.rig.json` + `out/<id>.proof.png`.
3. ChatGPT reviews against contracts. Repeat until PASS.
