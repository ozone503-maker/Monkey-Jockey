# HANDOFF: Monkey Jockey "super version"

> **On GitHub (branch `super-version`) the playable game is in `super-version/`.** The file paths below are relative to that folder. The repo-root `README.md` is the older ChatGPT master spec from `main`, left unchanged. The local working repo is `/workspace/mj-fix`, tag `super-v5`.

Written for any AI or developer picking this up cold.

## What the game is
**Monkey Jockey** ("brought to you by the Kudoken") is a phone-first browser game.
- Eight rescue dogs race with cartoon riders on the Punahēle Sprint (900 m), a rainforest road over basalt.
- You pick one dog and one rider. The other seven teams are paired from the seed.
- Races are **deterministic**: same seed + team + weather = same race.
- It's plain HTML/CSS/JS with classic `<script>` tags, no build step and no dependencies.

## Live
- Live URL: https://monkey-jockey-test.vercel.app/
- Hosting: Vercel project `monkey-jockey-test`, team `team_58sWigSRcWk4dakvfkImg5nY`.
- Public, no login.

## How to run it
- `python3 -m http.server 8820`, then open http://127.0.0.1:8820/index.html
- Single file: `python3 tools/build_dist.py --inline-assets` writes `dist/monkey-jockey.html`. Everything is inlined, including audio.

## File layout
| Path | What it is |
|---|---|
| `index.html` | Title screen, team picker, HUD, canvas, results, `<audio>` tags. Script load order matters. |
| `js/data.js` | Roster (DOGS, RIDERS with stats), tracks, weather, events, rider personalities |
| `js/race.js`, `js/systems.js` | **The seeded race engine** (balance v2, Oct 2 2026). Any edit changes seeded results — re-run `tools/race_sim.js` before and after and keep the targets below. |
| `js/core.js` | Shared state and the `rng32` seeded RNG |
| `js/render.js` | SIDE camera and standings |
| `js/front.js` | FRONT camera |
| `js/gait.js`, `js/rigs.js` | Gallop animation |
| `js/art.js`, `js/faces.js` | Sprite/portrait lookup (`ART.faces` overrides the SVG fallbacks) |
| `js/audio.js` | Sound manager and track mapping (`AUDIO_FILES`) |
| `js/ui.js` | Picker (YOUR TEAM showcase + attribute rating bars), race start, victory podium (3 stands), controls, boot |
| `js/title.js` | Moving title: the 8 teams gallop across the title on the SIDE gait code (render-only) |
| `assets/audio/` | theme, menu-loop, race-start, race-loop, victory (mapping in CHANGELOG.md) |
| `assets/faces/{riders,dogs}/` | Picker/podium avatars; `*-head.webp` are the SIDE heads |
| `assets/riders/*-front.webp` | FRONT rider art (locked Gate 1 KEEPERs, keyed) |
| `assets/dogs/`, `assets/rigs/` | SIDE dog sprites; Penny + Ghostbuster gallop rigs (cut from standing art), Monkey Jockey side rig |
| `assets/video/` | Intro loop (Sep 2) and menu reels |

**Tools:**
- `node tools/race_sim.js [ROOT] [N] [--default-pick] [--json]`: headless balance simulator on the game's own engine files. Reports win share per dog / rider / combo, leader-at-25/50/75% win rates, lead changes, close finishes. Pass `/path/to/old/checkout` as ROOT to get "before" numbers.
- `tools/browser_races.py URL [N] [SHOT]` (needs playwright, e.g. `/workspace/.venv-pw/bin/python`): plays real races at 390x844, checks 0 JS errors, lead changes, podium, RUN IT BACK identical, FRONT camera, fresh seed per race.
- `tools/detcheck.py BASE_URL NEW_URL`: seeded-results comparison between two builds. Since balance v2 it will (correctly) report differences against the Sep 2 base; use it between two v2 builds.
- `tools/key_checker.py [--strict]`: removes baked checkerboards.
- `tools/avatars.py`, `tools/heads.py`: avatar crops.

**Docs:**
- `CHANGELOG.md`: every change, the audio mapping, test results.
- `CHANGES.md`: full catalogue of later-version features rebuilt from written sources (112 items).

## Done
- **Fixes 1–7:**
  - ShockBot replaces Buff Bro Bot.
  - Top-down camera removed.
  - Standings fixed.
  - FRONT camera added.
  - SIDE gallop.
  - Real dog art, 0 missing files.
  - Phone layout.
- **Super version:**
  - Audio (music, start sound, victory sting, mute button).
  - Mystery Drone Pilot replaces Ruch.
  - Real rider and dog avatars.
  - Victory podium with RUN IT BACK and photo-finish call.
- **Super v5 (Oct 2):** picker YOUR TEAM card is now three columns (dog | stats | rider), no overlap (`tools/card_shots.py`).
- **Super v4 (Oct 2):** Ghostbuster SIDE gallop rig cut from the Sep 3 standing pack (`tools/rig_ghostbuster.py`), used in the race and title parade.
- **Super v3 (Oct 2):** picker YOUR TEAM showcase with dog portrait + full-body rider art and 10-pip attribute ratings (real `js/data.js` numbers), mini ratings on every tile; moving title (team parade, Ken Burns video, logo motion, TAP FOR MUSIC); 3 distinct podium stands (1st centre/tallest) with dog + full-body rider art.
- **Balance v2 (Oct 2 2026, Jessie's OK):** fair, unpredictable races. 3000-race sim: every dog and rider within x0.88–x1.17 of fair share, no combo above x1.5, early leader at 25% wins 27% (was 72%), 4.8 lead changes per race, Monkey Jockey 13.9% (was 49%). A fresh seed is rolled for every new race; RUN IT BACK replays identically. Details in CHANGELOG.md.
- **Balance targets to keep:** no entrant above ~x1.5 fair share; leader at 25% wins < 35%, at 50% < 45%; 2+ lead changes per race.

## Left to do (priority order)
1. **Background plants and layered scenery** per `design/SIDE-CAMERA-SCENERY.md` (GitHub main):
   - Ferns, banana plants, basalt, markers, spectators, drawn in code.
   - Parallax factors 0.20 / 0.50 / 0.90; leader at 75%.
   - **No utility poles or driveways.** The docs conflict, so ask Jessie first.
2. **READY-SET-GO overlay:**
   - `race-start.mp3` already plays for 4.138 s before race-loop.
   - Hold `sim` stepping for that time and draw READY / SET / GO on the bar lines (0.81 s, 2.47 s, 4.14 s).
3. **Rain visuals** when the weather is rainy: streaks, wet sheen, light spray. Today it's only a badge.
4. **Missing assets:**
   - The later **intro video**; only the Sep 2 `intro-loop.mp4` exists.
   - SIDE art for all riders except Monkey Jockey.
   - Full-body FRONT dog art.
5. **Monkey-face title lockup:** `art/brand/monkey-face.png` on GitHub main is only the hair tuft (rest transparent). Get the real file from Jessie.
6. **The rest of `CHANGES.md`:**
   - Palette (plum/dark-blue menus instead of green).
   - 3-win streak → free jar.
   - KDU / MallTickets hook-up.
   - Android lifecycle latch and watchdog (V132/V133).
   - `?mjdiag=1` diagnostics.
   - Landscape mode (Jessie is undecided; keep portrait-first for now).

## Canon rules (must hold)
- Cameras: **SIDE and FRONT only**. Top-down/overhead is retired and stays dead code behind `DEBUG_TOP_CAMERA=false`.
- Riders (8): **Ipo, Erv, Fonk, Dinny, Nonna, Monkey Jockey, Mystery Drone Pilot, ShockBot.**
  - **ShockBot** replaced Buff Bro Bot. He's a silver robot with a turquoise necklace, and always wears a hat and sunglasses. The Hawaiian shirt / gold chain is only the "Save the Dogs" song skin.
  - **Mystery Drone Pilot** (electric-blue alien) replaced Ruch.
- Dogs (8): Meatball, Beaux, Kira, Penny, Mike, Diva, Noodle, Ghostbuster.
- Keep the title "MONKEY JOCKEY" and the line "brought to you by the Kudoken".
- No analytics or trackers. Audio only after a user tap.
- Build new art from the approved/locked art; don't reinvent characters from text.

## Do not touch
- Netlify sites `monkey-jockey-punahele` and `monkey-jockey-b`, the `outlet-mall` project, and any other project.
- `main` and the existing branches of `ozone503-maker/Monkey-Jockey`. No force-push; work on branches and open PRs.
- Never commit `.env.local`, Vercel/GitHub tokens or other secrets.
