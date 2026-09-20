# V134 — read-only Android acceptance diagnostics

V134 adds an opt-in acceptance panel to the zero-dependency recovery build. Append `?mjdiag=1` when opening the build.

The panel observes only: authoritative pulse age, scheduler debt, suspension state, watchdog rearms, entrantId presence, replay weather snapshot presence/freeze state, separate track-event/racer-variance multiplier fields, and runtime/presentation errors.

## Non-negotiable invariants

The diagnostics panel does **not** call `step()`, render the race canvas, add scheduler debt, consume RNG, or mutate entrant/weather/event/replay state. Seeded fixed-step determinism and entrantId architecture remain authoritative.

## Purpose

This turns the remaining physical Android acceptance test into an observable test: if a race appears frozen, the screen itself can show whether the authoritative pulse died, the page remained suspended, scheduler debt accumulated, the watchdog rearmed, or a runtime/presentation exception occurred.

V133 lifecycle watchdog behavior is otherwise unchanged.