# Monkey Jockey V125 — replay completion firewall

## Correctness fix
V124 correctly quarantined post-finish digest capture/assertion failures, but replay parity assertions were still outside that nonfatal firewall. A replay that had already produced a valid canonical `finishOrder` could therefore throw on split/checkpoint/outcome/weather/track-event parity before `showResults()` ran.

V125 moves replay parity assertions into the same post-finish nonfatal audit domain. A mismatch is preserved in `window.MJ_LAST_REPLAY_PARITY_ERROR` and logged, but cannot erase a valid completed race or suppress the results attempt.

## Invariants preserved
- seeded fixed-step determinism unchanged
- `entrantId` architecture unchanged
- replay `weatherSnapshot` unchanged
- `trackEventMult` and `raceVarianceMult` writer domains unchanged
- no RNG consumed by the new firewall
- no race physics altered
- SIDE/FRONT presentation untouched

## Validation
All 25 inline executable JavaScript blocks in the V125 self-contained build pass `node --check`.

## Remaining
Android/browser lifecycle acceptance remains decisive. Full production FRONT roster art remains incomplete. The self-contained V125 build is packaged separately as a zero-dependency static webpage.