# SIDE stride / gait physics notes — captured 2026-09-21 from Jessie paste

Source: conversation paste (Claude/ChatGPT analysis Jessie forwarded). Not executable runtime.
Jessie hunting Claude SIDE dog-stride tech; these notes record the *physics* intent.

## Key locks Jessie is taking
1. Gallop silhouette: **head low and thrust forward**, spine long and flat — not standing head height.
2. Footfall bars → stance duration per gait (Stance slider), not eyeballing.
3. Step frequency scales ~ 1/sqrt(leg length). Per-dog, not eight hand-tuned constants. Physics from measured sprites.

## Measured leg lengths / derived rates
| dog | leg length | step rate | stride |
|---|---|---|---|
| Beaux | 248 | ×0.89 | ×1.12 |
| Meatball | 213 | ×0.96 | ×1.04 |
| Kira | 199 | ×1.00 | ×1.00 |
| Mike | 196 | ×1.00 | ×1.00 |
| Diva | 188 | ×1.03 | ×0.98 |
| Penny | 182 | ×1.04 | ×0.96 |
| Noodle | 178 | ×1.05 | ×0.95 |
| Ghostbuster | 177 | ×1.06 | ×0.95 |

Ghostbuster ~19% more steps than Beaux for same ground; each ~15% shorter. Holds if art changes if measured from sprites.

## Failed approach
Auto-rig all eight twice (measured anatomy + Penny proportions) → floating paws / holes. Penny needed ~4 passes. Cut lines do not transfer across dogs (different leg heights/widths).

## Conclusion (author of paste)
Do not rig standing pack then again later. Rig **athletic-crouch SIDE** real art once, pass per dog with render check.
