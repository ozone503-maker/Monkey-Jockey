# V132 — lifecycle suspension latch

V132 closes an Android/BFCache race-clock edge case left after V131.

`document.hidden` is not guaranteed to become authoritative before every `pagehide` / freeze transition. The race pulse now also checks an explicit `MJ_RACE_SUSPENDED` latch. `pagehide`, `freeze`, and hidden visibility set the latch and rebase `MJ_RACE_LAST_PULSE_MS`. `pageshow`, `resume`, and visible visibility rebase the clock before clearing the latch.

While suspended: no wall time is added to simulation debt, no `step()` executes, no render occurs, and no RNG is consumed. Already-earned visible-time debt remains untouched.

Preserved contracts: seeded fixed 1/30 simulation, entrantId architecture, frozen replay weather snapshot, separate track-event and racer-variance multipliers, completion firewall, canonical embedded Penny + Monkey Jockey ART, and Punahēle presentation.

Local V132 package syntax validation: 28/28 executable script blocks pass Node `--check`.
