# HANDOFF: Monkey Jockey "super version"

Written for any AI or developer picking this up cold.

> **On GitHub (branch `super-version`) the playable game is in `super-version/`.** The file paths below are relative to that folder. The repo-root `README.md` is the older ChatGPT master spec from `main`, left unchanged. The local working repo is `/workspace/mj-fix`, tag `super-v1`.

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
| `js/race.js`, `js/systems.js` | **The seeded race engine. Do not change them.** Any edit breaks seeded results. |
| `js/core.js` | Shared state and the `rng32` seeded RNG |
| `js/render.js` | SIDE camera and standings |
| `js/front.js` | FRONT camera |
| `js/gait.js`, `js/rigs.js` | Gallop animation |
| `js/art.js`, `js/faces.js` | Sprite/portrait lookup (`ART.faces` overrides the SVG fallbacks) |
| `js/audio.js` | Sound manager and track mapping (`AUDIO_FILES`) |
| `js/ui.js` | Picker, race start, victory podium, controls, boot |
| `assets/audio/` | theme, menu-loop, race-start, race-loop, victory (mapping in CHANGELOG.md) |
| `assets/faces/{riders,dogs}/` | Picker/podium avatars; `*-head.webp` are the SIDE heads |
| `assets/riders/*-front.webp` | FRONT rider art (locked Gate 1 KEEPERs, keyed) |
| `assets/dogs/`, `assets/rigs/` | SIDE dog sprites; Penny + Monkey Jockey gallop rigs |
| `assets/video/` | Intro loop (Sep 2) and menu reels |

**Tools:**
- `tools/detcheck.py BASE_URL NEW_URL`: seeded-results check against the Sep 2 base (commit `f7863dd`).
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
- **Seeded results:** identical to the Sep 2 base (36/36 races).

## Left to do (priority order)
1. **Balance:** the Monkey Jockey rider wins about 75% of races (18/24 in a seeded sweep).
   - The engine is untouched, so this is the original tuning.
   - Fixing it changes seeded results, so get Jessie's sign-off first.
   - The incident report discusses ±3% vs ±15% variance; neither is canon.
2. **Background plants and layered scenery** per `design/SIDE-CAMERA-SCENERY.md` (GitHub main):
   - Ferns, banana plants, basalt, markers, spectators, drawn in code.
   - Parallax factors 0.20 / 0.50 / 0.90; leader at 75%.
   - **No utility poles or driveways.** The docs conflict, so ask Jessie first.
3. **READY-SET-GO overlay:**
   - `race-start.mp3` already plays for 4.138 s before race-loop.
   - Hold `sim` stepping for that time and draw READY / SET / GO on the bar lines (0.81 s, 2.47 s, 4.14 s).
4. **Rain visuals** when the weather is rainy: streaks, wet sheen, light spray. Today it's only a badge.
5. **Ghostbuster SIDE art:** the standing-pack sprite is corrupt, so Ghostbuster uses a drawn stand-in.
6. **Missing assets:**
   - The later **intro video**; only the Sep 2 `intro-loop.mp4` exists.
   - SIDE art for all riders except Monkey Jockey.
   - Full-body FRONT dog art.
7. **The rest of `CHANGES.md`:**
   - Palette/monkey-face title (`art/brand/monkey-face.png`).
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
