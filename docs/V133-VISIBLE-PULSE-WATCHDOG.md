# V133 — visible pulse watchdog

V133 adds a presentation-clock watchdog around the existing authoritative race pulse. Android/Chrome can rarely leave an interval handle numerically present while callbacks have stopped, even outside a clean lifecycle event. While the document is visible and a race is active, requestAnimationFrame checks the pulse heartbeat. If no authoritative pulse has arrived for 750 ms, it clears the stale interval, rebases `MJ_RACE_LAST_PULSE_MS`, and re-arms the same `MJ_RACE_PULSE` at 100 ms.

Correctness contract: the watchdog never calls `step()` or `draw()`, never adds scheduler debt, never consumes RNG, and never mutates entrant, weather, event, finish, or replay state. Hidden/suspended time remains excluded by the V132 suspension latch. Seeded fixed-step determinism, `entrantId`, replay `weatherSnapshot`, and the separate `trackEventMult` / `raceVarianceMult` ownership remain unchanged.

Local recovery artifact: `MONKEY-JOCKEY-RECOVERY-V133` (self-contained zero-dependency `index.html` plus static-host configs).