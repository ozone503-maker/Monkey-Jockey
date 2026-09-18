# Monkey Jockey — MASTER V89 hotfix

Date: 2026-09-18

## User-observed failure sequence

1. Intro appeared frozen.
2. SIDE race rendered correctly and looked polished.
3. Switching to FRONT showed no racers.
4. Switching back to SIDE left the race frozen.

## Root cause reproduced

The runtime contained development assertions that were allowed to throw during production boot.

Two assertions were false positives:

- V108 SIDE RNG audit searched `drawSide.toString()` for `Math.random(`. The only match was the literal text inside a comment: "deterministic, no Math.random()." The assertion threw anyway.
- V108 entrantId audit required the literal string `r.entrantId`, while the valid tie-break implementation uses `a.entrantId.localeCompare(b.entrantId)`.

Because the V108 assertion threw before the FRONT camera declarations executed, `FRONT_SEQUENCE_REGISTRY` and the downstream FRONT implementation were never initialized. Selecting FRONT therefore caused a runtime error. The race clock catches runtime draw/step exceptions by stopping the 30 Hz interval, which explains why returning to SIDE remained frozen.

There were also retired TOP-camera compatibility assertions still throwing even though TOP is no longer a production camera.

## V89 repair

- Fixed the V108 RNG audit to strip block/line comments before checking for actual `Math.random(` calls.
- Fixed the entrantId audit to validate the real deterministic `entrantId.localeCompare` tie-break.
- Changed retired TOP compatibility/provenance mismatches to warnings rather than production-boot failures.
- Reordered `enterGame()` so the title disappears synchronously before embedded image/audio warmup begins.
- Preserved the deterministic race engine, race RNG, results, replay, and SIDE rendering.
- Preserved the FRONT transparent canonical dog fallback.

## Automated browser verification

Headless Chromium validation completed with zero page errors:

- load: PASS
- ENTER: PASS
- start race: PASS
- SIDE advances: PASS
- SIDE -> FRONT: PASS
- FRONT racers visible: PASS
- FRONT race continues advancing: PASS
- FRONT -> SIDE: PASS
- SIDE continues advancing after return: PASS

Observed progress during the automated switch test:
- SIDE: ~5 m
- FRONT: ~19 m
- back to SIDE: ~39 m

No simulation reset or camera-induced state jump was introduced.

## Remaining FRONT art limitation

The current safe fallback is front-facing canonical dog imagery rather than completed full-body dog+rider running cycles. This is intentionally honest until approved front-running art exists for every entrant.
