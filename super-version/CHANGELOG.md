# SUPER VERSION (Sep 26 2026): later-version features on top of Fixes 1–7

The commits are Feature A–D plus docs. Race engine (`js/race.js`, `js/systems.js`) is **unchanged**. `tools/detcheck.py` runs 36 seeded races (sunny + rainy, varied picks) on the Sep 2 base and on this build and compares every finish time, the dog, the rider slot, the log count and the highlight count. **Result: 36/36 identical.**

## Audio mapping (how to swap tracks)
Files are in `assets/audio/`. Names come from Jessie's phone list, matched by exact byte size. To swap a track, replace the file, or edit `AUDIO_FILES` in `js/audio.js`.

| Build file | Source attachment | Length | Role in game |
|---|---|---|---|
| `theme.mp3` | `4cd2a10e…54d56.mp3` (364,190 B) | 0:16 | Title screen music, looped. Starts on the first tap on the title (ENTER or anywhere). |
| `menu-loop.mp3` | same bytes as theme.mp3 (md5 identical) | 0:16 | Team-select music after CHANGE TEAM, and after the victory sting ends. Looped. |
| `race-start.mp3` | `713a6970…51464.mp3` (85,142 B) | 0:04 | Start sound on RACE / RUN IT BACK |
| `race-loop.mp3` | `25f42f39…5e8d29.mp3` (2,373,494 B ≈ 2.37 MB) | 1:52 | Race music, looped. Starts exactly when race-start ends. |
| `victory.mp3` | `1d55ba71…10240.mp3` (477,830 B) | 0:24 | Victory sting on the podium. Plays once. |
| *(not shipped)* | `77cf0d23…0247f.mp3` (2,445,743 B) | 2:32 | **Volcano Jockey.mp3, the original master.** |

**Why Volcano Jockey isn't shipped:**
- The file's sha256 `77cf0d239fb8b31aa7fba765dde71211daa74f7f1eff53e785499d77e540247f` and size 2,445,743 B exactly match the manifest entry in `CONSOLIDATION-MANIFEST.json` (Sep 8).
- It isn't in Jessie's list.
- It isn't a clean loop: it fades in over about 2 s and fades out to silence at the end.
- The four cuts already cover all of it.

**Analysis** (ffmpeg decode, numpy):
- All five files are at **144 BPM** with the same spectrum (centroid about 2.6 kHz, same low/high energy split). They are one song.
- Cross-correlation against the master (match 0.98–0.997):

| Cut | Where it sits in the master |
|---|---|
| theme / menu-loop | 0.07–16.14 s (song intro; fades in from -29 dB) |
| race-start | 12.00–16.14 s (the lead-in bar into the groove) |
| race-loop | 16.14–128.0 s (the body) |
| victory | 127.99–152 s (outro; decays to silence, a stinger ending) |

**How they fit together:**
- race-start ends exactly where race-loop begins, so the game starts race-loop the moment race-start finishes (`START_LEAD = 4.138 s`). It plays as one continuous piece of music.
- race-loop has no fade at either end. Both end samples are about 0, so the seam doesn't click, and the tail's spectrum matches its head (cos 0.85 vs a 0.88 in-song baseline).
- The seam lands 0.42 beat off the bar grid (268.4 beats). Browser `loop` also adds a small MP3 gap. Both are barely audible.
- theme.mp3 fades in over its first 2 s, so the title loop "breathes" every 16 s. Swapping in a cleaner title loop is easy if Jessie wants one.

**Behaviour:**
- Nothing plays before the first tap.
- The first real gesture primes every `<audio>` element (silent play + pause) so iOS/Android later let race music start at the race start and the victory sting play at the finish.
- The RACE tap re-primes race-loop and victory.
- There is one element per track and one music channel, so REPLAY / RUN IT BACK / CHANGE TEAM never stack tracks.
- Music pauses when the tab is hidden.
- The **🔊 SOUND ON / 🔇 SOUND OFF** button sits top-right on desktop and bottom-right on phones. It is remembered per device in localStorage `mj-muted`.
- Test hook: `window.MJ_AUDIO_LOG` records every `play()` call.

## Feature B: Mystery Drone Pilot replaces Ruch
- Same rider index (slot 4) and stats (BAL 7, TIM 9, NRV 8, LCK 6, size 3), with the same mood trigger keys, so seeded fields and outcomes are unchanged.
- New moods: detached / tracking / full-signal. Short tag name: "MDP".
- FRONT art: `/workspace/monkey-jockey/art/riders/mystery_drone_pilot_front_gate1_KEEPER.png`, checkerboard keyed and saved as `assets/riders/mystery-drone-pilot-front.webp`.
- SIDE: no side art exists. MDP gets the same drawn crouched jockey as the other non-MJ riders, in electric blue (`#2f6fd6`), with the real head cut from the locked art.

## Feature C: real avatars
- **Riders:** 256 px busts on a light-blue backdrop (sampled from the dog portraits) in `assets/faces/riders/<id>.webp`.
  - Cropped from the locked Gate 1 FRONT KEEPERs (Ipo, Erv, Fonk, Monkey Jockey, MDP, Nonna, Dinny).
  - ShockBot comes from `art/shockbot_gate1_preview_v2.png`.
  - Scripts: `tools/avatars.py` and `tools/heads.py`.
- **SIDE rider heads:** transparent head cut-outs from the same art, `assets/faces/riders/<id>-head.webp`.
- **Dogs:** canonical portraits from GitHub `main:art/select/dogs/*.png` (read-only fetch), resized to 256 WebP in `assets/faces/dogs/`. FRONT dog heads still use the drawn SVG faces, because they need transparency.
- **Keying fix:** `tools/key_checker.py --strict` only floods through real checker texture. The old keyer had deleted **Nonna's white chef hat**, which is now restored in both FRONT art and the avatar.

## Feature D: victory screen (bible §13.4, master spec §21–25)
- Podium: 2nd / 1st / 3rd, each with the dog portrait, the rider avatar badge, names and time, on gold/silver/bronze steps.
- A 🏆 WINNER header.
- A 📸 PHOTO FINISH call when 1st→2nd is under 0.05 s.
- "YOU WON!" or "You finished Nth".
- CSS confetti, turned off under reduced-motion.
- **RUN IT BACK** runs the same seed, teams and weather. It replaces the REPLAY label; the button id is unchanged.
- The Official Finish list now has avatars.
- The dev system log is hidden (still in the DOM).
- Colours follow `design/UI-PALETTE.md` (dark blue, plum, pink, juicy blue).

## Not done this round (see HANDOFF.md)
Background plants and layered scenery, the READY-SET-GO overlay, and rain visuals were left out because of the credit limit. The start sound and music timing are already in place for a countdown.

# Monkey Jockey — local fix log (/workspace/mj-fix)

Base: Sep 2 Netlify Punahēle build (copy of `/workspace/mj-deep-audit/candidates/netlify-punahele/`), committed untouched as the first commit.
Local only: nothing here was deployed, pushed or sent. The live Netlify site was not touched.

Test harness: `/workspace/mj-deep-audit/tools/run_mjfix.py` (driven by `run_both.sh`) runs desktop 1280x800 and phone 390x844 (DPR 2, touch) in parallel against `python3 -m http.server 8820 --bind 127.0.0.1`.
Flow per viewport: ENTER → pick dog #2 + rider #1 → RACE (SIDE) → FRONT at ~14 s (if the button exists) → finish → standings vs Official Finish → REPLAY (must match race 1) → CHANGE TEAM → race 3. That's 3 full races per viewport, 6 per run.
Freeze check: `sim.time` and a canvas hash are sampled every ~1 s. Keys t/T/o/2/Tab are pressed each race to show no key reaches a top-down view.
Engine check: `/workspace/mj-deep-audit/tools/winsim.py` runs 24 seeded races in-page with the game's own `buildField/makeRace/step`. The finish order and times must be identical to the untouched base.
Screens are in `test-screens/<nn-fix>/{desktop,mobile}/`. Reports are `run-report-*.json`.

## Commit index
| commit | change |
|---|---|
| f7863dd | Base: untouched Sep 2 Netlify Punahēle build |
| 06f2e10 | Fix 1: ShockBot replaces Buff Bro Bot |
| 06e2691 | Fix 2: OVERHEAD/top-down removed from player paths |
| b4273ab | Fix 3: standings in finish order |
| 4e06e1f | Fix 4: FRONT camera (SIDE/FRONT toggle) |
| 15f533b | Fix 5: SIDE gallop cycle |
| 72478e5 | Fix 6: real dog art, 404s 45 → 0, label pile-up |
| a3f47be | Fix 7: phone layout + single-file dist with videos |
| 53f687d | Fix 6b: lane spacing / FRONT tag polish, final results + notes |

Engine files `js/race.js`, `js/systems.js` and `js/core.js` have zero diff vs base (`git diff f7863dd HEAD -- js/race.js js/systems.js js/core.js` is empty).
"OVERHEAD" still appears only in code comments next to the dead `drawTop()` code. "buff" appears nowhere in the game files except as random letters inside base64 data in the dist.

## 0. f7863dd — Base: untouched Sep 2 Netlify Punahēle build
Baseline test (`test-screens/00-base`), both viewports:
- 0 JS errors. **45 × 404** (dog sprites + Penny art). 3/3 races finished. No freezes. REPLAY identical.
- **Standings ≠ Official Finish** (entry order was shown).
- OVERHEAD button visible. No FRONT.
- RACE button below the fold: desktop top=840 px of 800; phone top=1244 px of 844.
- Buff Bro Bot in the roster.

## 1. ShockBot replaces Buff Bro Bot everywhere
Files: `js/data.js`, `js/faces.js`, `js/art.js`, `js/render.js`, `assets/riders/shockbot-front.png`, `assets/riders/shockbot-face.png`, `tools/key_checker.py`, `tools/build_dist.py`, `dist/monkey-jockey.html`.
- Rider slot 0: `buff-bro-bot`/"Buff Bro Bot" → `shockbot`/"ShockBot". It keeps the same array index and the same stats (bal 10, tim 6, nrv 9, lck 3, size 8), so seeded field shuffles and race outcomes are unchanged. `DEFAULT_ENTRIES` e1 and the `RIDER_PERSONALITIES` key are renamed too. The mood names are new (cool / dialed-in / full-voltage) but use the identical trigger keys, so mood modifiers and timing are the same.
- Art: the locked Phase 2 art `/workspace/monkey-jockey/art/shockbot.png` (Jessie-approved no-rein-bar remake: silver, turquoise bead necklace, leopard hat, sunglasses).
  - The baked checkerboard was removed with `tools/key_checker.py`. It keys only the flat two-tone checker; it does not repaint the character.
  - This produced a front sprite (358x520) and a 256 px head-crop portrait for the picker (`ART.faces.riders.shockbot`).
  - The in-art chest badge reads "SHOCKBOT PHASE-2". It was left as-is.
- The fallback SVG portrait in faces.js was redrawn as ShockBot: silver head, hat, sunglasses, turquoise beads.
- SIDE: **no side-view ShockBot art exists.** A drawn placeholder head (silver, leopard hat, sunglasses, turquoise beads) is used on the vector racer. **Gap.**
- The Phase 2 "rig" output isn't usable: it was the dog cutter misapplied to a biped, and no rig files exist on the box.
- `dist/monkey-jockey.html` is rebuilt from source by `tools/build_dist.py`.

Tests (`test-screens/01-shockbot`), desktop + phone:
- Riders now read ShockBot, Nonna, Ipo, Erv, Ruch, Monkey Jockey, Dinny, Fonk. `buff` does not appear in the DOM. "ShockBot on Beaux" can be picked.
- 0 JS errors. 45 × 404 (unchanged; fix 6). 3/3 races finished per viewport. No sim stalls. No canvas freezes. REPLAY identical.
- Engine: winsim 24/24 races have identical finish order and times vs base (with the Buff Bro Bot → ShockBot name mapped).
- Still open: standings mismatch (fix 3), OVERHEAD (fix 2).

## 2. OVERHEAD / top-down camera removed from everything a player can reach
Files: `index.html`, `js/ui.js`, `js/render.js`, `dist/monkey-jockey.html`, `.gitignore`.
- The OVERHEAD button (`#topBtn`) and its handler are gone. The base had no key binding and no auto-switch to top-down, and none were added.
- `drawTop()`/`topRacer()` stay as dead code behind `const DEBUG_TOP_CAMERA = false`. `draw()` forces `camera='side'` if anything ever sets `'top'` while the flag is off.
- SIDE stays the default.

Tests (`test-screens/02-no-overhead`), desktop + phone:
- No visible button matches /overhead|top/. After pressing t/T/o/2/Tab in every race, camera = `side`. Cameras seen in every race: `side` only.
- 0 JS errors. 45 × 404 (fix 6). 3/3 races finished per viewport. No stalls or freezes. REPLAY identical.

## 3. Final standings list shows finish order and matches the Official Finish
Files: `js/render.js` (`rankings()`), `dist/monkey-jockey.html`.
- Finished racers are sorted by `r.finish` (the exact crossing time the engine resolves, the same key as `sim.finishOrder`). Racers still running follow, sorted by distance.
- The old sort used `pos` only. At the finish every racer is clamped to 900 m, so it fell back to entry order.
- Display only. No engine change.

Tests (`test-screens/03-standings`), desktop + phone:
- In all 6 races (3 per viewport), the standings list (dog + rider, top to bottom) equals the Official Finish list exactly.
- 0 JS errors. 45 × 404 (fix 6). No stalls or freezes. REPLAY identical.

## 4. FRONT camera added as a player-selectable view (SIDE / FRONT toggle)
Files: `js/front.js` (new), `js/render.js` (`draw()`, `stageHeight()`), `js/ui.js` (`setCamera`), `js/art.js`, `index.html` (FRONT button, script tag), `styles/main.css`, `assets/riders/{shockbot,nonna,ipo,erv,monkey-jockey,dinny,fonk}-front.webp`, `dist/monkey-jockey.html`.
- **Perspective port** of `recovered/claude-front-camera-2026-09-08`, using the README tuning: squash 6.0, lead 50 m, camera height 1.1, lane spread 1.5.
  - `frontProject(distance)` keeps the prototype's depth formula `k = 1/(1+max(0,distance-lead)*squash/100)`, with distance = metres from the camera.
  - The camera rides `lead` metres ahead of the front of the field (the max engine `pos`), looking back. Racers are depth-sorted far to near.
  - Lane x uses the prototype's lane layout `(i-3.5)*0.6*lanes`, scaled by k.
- **Deliberate port changes** (documented in the file header):
  1. Screen y comes from the same k on a ground plane. Fed real camera distances, the prototype's y term put the nearest dog highest on screen.
  2. The finish line ahead of the leader uses plain 1/z, because the squash curve diverges for negative gaps.
  3. The prototype's 150 px canvas strip and accumulating DPR scale did not carry over. The canvas height is responsive: 16:9 on wide screens; under 700 px wide it is ≥44% of the viewport height (371 px tall on a 390x844 phone). The DPR transform is reset each frame, never accumulated.
- **Real race state:** every racer is drawn from the engine's `r.pos`. The camera follows the leader to the line. The finish banner and checker line appear as the leader reaches 900 m. After the leader finishes, the camera holds at the line while the rest of the field arrives.
- **Rider FRONT art:** Gate 1 KEEPER files `art/riders/<name>_front_gate1_KEEPER.png` for Nonna, Ipo, Erv, Monkey Jockey, Dinny and Fonk, keyed and saved as WebP (≤420 px). ShockBot uses the locked Phase 2 art.
- **Gaps (drawn fallbacks, no art invented):**
  - Ruch has no usable FRONT art (no KEEPER, and `ruch_front_gate1*.png` shows a different character). Ruch gets a team-colour crouched body with the picker portrait as the head.
  - **No front-view dog art exists for any of the 8 dogs.** Dogs are drawn bodies in each dog's canon coat colours, with the picker portrait cropped as the head. The front legs lift alternately on a render-side gait clock driven by engine speed.
- Labels in FRONT: only the two racers nearest the camera get a small tag; the player's is marked ★. No pile-up.

Tests (`test-screens/04-front`), desktop + phone:
- FRONT button present. FRONT screenshots mid-race and late race in every run. Cameras seen: side + front.
- Phone canvas is 362x371 CSS px, and the center hit-test lands on the canvas.
- 0 JS errors. 45 × 404 (fix 6). 3/3 races finished per viewport. Standings match the finish. No stalls or freezes. REPLAY identical.
- The camera choice persists across races (player preference). SIDE is the default on load.

## 5. SIDE gallop cycle ported (dogs gallop instead of sliding)
Files: `js/gait.js` (new), `js/rigs.js` (new), `assets/rigs/penny/*.webp`, `assets/rigs/monkey-jockey-side/*.webp`, `js/render.js` (`racer()`), `js/front.js`, `index.html`, `dist/monkey-jockey.html`.
- **Port** of `recovered/claude-side-gallop-timing-2026-09-21/gallop-timing.html`:
  - `legAngles()` stance/swing, with the prototype's values hip 34°, knee 80°, ankle 11°, stance 34%, front delay 38%.
  - Footfall-driven bob, pitch and suspension; spine flex; tail spring; rider torso lag and head level.
  - The Penny rig (`const D`) and the Monkey Jockey side rig (`const R`) geometry are copied verbatim into `js/rigs.js`. Their data-URI part images are extracted to `assets/rigs/`.
- **Physics locks** (`side-stride-physics-notes-2026-09-21`):
  1. Head low and thrust forward: `HEAD_LOW` = 0.26 rad plus a forward/down neck offset.
  2. Stance from the footfall bars: `DUTY` = 0.34.
  3. Per-dog step rate from the measured leg-length table: Beaux ×0.89, Meatball ×0.96, Kira ×1.00, Mike ×1.00, Diva ×1.03, Penny ×1.04, Noodle ×1.05, Ghostbuster ×1.06.
- **Speed:** each racer's stride clock advances on `sim.time` at `3.6 Hz × STEP_RATE[dog] × r.speed / 13.8`. The animation follows engine speed, pauses with the race and replays identically. After the line, a dog pulls up over 2.5 s. Render only: the gait never writes to `sim`. winsim 24/24 races are identical to base.
- **Port corrections** (commented in code):
  - (a) The prototype's stance sweep moved the planted paw back to front against the scrolling ground (a moonwalk), so the hip sign is flipped.
  - (b) The prototype's seat left the rider hovering above Penny's back (visible in the prototype itself), so the rider is dropped onto the withers.
- **Rendering paths:**
  - Penny uses the cut-out rig.
  - Single-pose running sprites (wired in fix 6) use `drawSpriteGallop`: the body rides the footfall bob and pitch, and the leg band is drawn in strips sheared by the rear/front hip angles, so the baked legs swing through the cycle.
  - Dogs with no art use a vector placeholder with four two-segment legs driven by `legAngles` (rotary-gallop far-leg offset), a long flat body and the head low.
- **Riders in SIDE:**
  - Monkey Jockey uses the prototype side rig (on any dog).
  - **No SIDE art exists for ShockBot, Nonna, Ipo, Erv, Ruch, Dinny or Fonk.** They get a drawn crouched jockey in rider colours. The head is the picker portrait, except ShockBot, whose drawn head has the hat, sunglasses and turquoise beads. **Gap.**
- FRONT now shares the same gait clock.

Tests (`test-screens/05-gallop`), desktop + phone:
- 0 JS errors. 45 × 404 (fix 6). 3/3 races finished per viewport. Standings match. No stalls or freezes. REPLAY identical. FRONT reachable.
- A filmstrip check (8.00–8.28 s) shows Penny's legs cycling through stance and swing with suspension.

## 6. Real dog art wired in; missing-file errors 45 → 0; label pile-up fixed
Files: `js/art.js`, `js/render.js` (`racer()`, `sideLabels()`, `drawSide()`, `forest()`), `js/gait.js`, `index.html` (data: favicon), `assets/dogs/{meatball,beaux,kira,penny,mike,diva,noodle}/side.webp`, `dist/monkey-jockey.html`.
- **Where the 45 × 404 came from:** `assets/dogs/<id>/side-1..4.png` (32), `assets/dogs/<id>/top.png` (8), `assets/penny-mj-1..4.png` and `penny-mj-top.png` (5). Searching the whole box found **none of those files anywhere**: not in `/workspace/monkey-jockey/art`, not in `params`, not in rig outputs, not in the attachments, not in the audit candidates.
- **Real dog art that does exist and is now used:**
  - The "standing" art pack in the attachments zip (`0927cd2e…zip`, `dogs/<id>/stand.png`, 1400x720 RGBA) holds one running-pose side sprite per dog. Each was cropped and saved as WebP (≤300 px tall).
  - Used for Meatball, Beaux (merle catahoula, matches canon), Kira, Mike, Diva and Noodle, drawn with the fix-5 sprite gallop.
  - Penny uses the prototype's cut-out gallop rig. Her sprite is also loaded as the fallback.
- **Only files that exist are requested now.** The top-down sprites are no longer requested (camera retired). A `data:` favicon was added.
- **Dogs still lacking real art:**
  - **Ghostbuster:** no usable art at all. The pack's `ghostbuster/stand.png` is corrupt (a green glyph, not a dog), and the only other images are a photo reference (`reference/identity/ghostbuster.jpg`) and a menu video. SIDE uses the vector gallop placeholder (white, black drop ears, one body spot). FRONT uses the drawn placeholder.
  - **All 8 dogs: no FRONT-view art** (drawn bodies plus picker-portrait heads).
  - **Meatball, Beaux, Kira, Mike, Diva, Noodle:** real SIDE art, but only one pose each (no multi-frame cycle or rig). The legs are animated by strip-shear.
  - Picker portraits for all dogs are still the build's generated SVGs (unchanged from base).
- **Label pile-up fix (SIDE):**
  - The old view packed ~230–520 m into the screen with 8 stacked name pairs. Now the leader sits ~80% across and the view widens only as the field spreads (dog size stays fixed).
  - The 8 depth lanes are drawn back to front.
  - Every racer gets a small numbered disc in its colour. Full tags appear only for **your** racer (★, green) and the **leader** ("· 1st"), nudged apart if they would overlap. The rankings list carries every name.
  - Added scrolling road dashes, 100 m distance boards, forest parallax and a SIDE finish line, so motion reads as running.
- Dog sizes are height-normalised per the existing `DOG_SCALE` lock (feet on one road line). The Penny rig is matched to the sprite body length. The drawn jockeys are enlarged to ~35% of dog height.

Tests (`test-screens/06-dog-art`), desktop + phone:
- **0 JS errors, 0 console errors, 0 HTTP 4xx/5xx, 0 failed requests.** 3/3 races finished per viewport. Standings match. No stalls or freezes. REPLAY identical. FRONT reachable.

## 7. Phone layout + single-file dist with working videos
Files: `index.html` (control groups, HUD moved out of the canvas, results above standings), `styles/main.css` (layout + `max-width:650px` block), `js/ui.js` (results-panel REPLAY / CHANGE TEAM buttons, scroll-to-top on race start, CHANGE TEAM resets the camera to SIDE), `js/render.js` (desktop canvas height capped to 64% of the viewport so the whole race view fits), `tools/build_dist.py --inline-assets`, `dist/monkey-jockey.html`.
- **Phone (390x844):**
  - Compact one-line logo.
  - The menu shows only Weather and Seed; during a race only CHANGE TEAM / REPLAY and SIDE / FRONT show (one row each).
  - Team select comes first, with smaller tiles. **The RACE button is at 496–538 px of 844 right after ENTER, with no scrolling** (base: 1244 px).
  - The track cards moved below the race area.
  - During a race: the HUD is a strip above the canvas (it used to cover the left third of the track). The canvas sits at 170–541 px. Results sit directly under the canvas, then compact 2-column standings.
  - The center hit-test on the canvas returns the canvas (nothing overlaps it).
- **Desktop:** RACE is at 697 px of 800 (base: 840, below the fold). The race canvas is 1152x512 and fits the viewport (259–771 px).
- **Single-file dist:** `python3 tools/build_dist.py --inline-assets` inlines the CSS and JS plus all 29 referenced assets as base64 `data:` URIs: 3 videos, rider WebPs, dog sprites, rig parts, ShockBot face. Output: `dist/monkey-jockey.html`, 4.0 MB, fully self-contained.
  - Opened via `file://`, all 3 videos report readyState 4 with no errors. Broken images: 0. Failed requests: 0.
  - The script lists two "missing" paths, `assets/faces/penny.png` and `assets/faces/ipo.png`. These are example paths inside code comments; nothing requests them.

Tests:
- `test-screens/07-phone` (index.html) and `test-screens/07-phone-dist` (single file over HTTP), desktop + phone: 0 JS errors, 0 404s, 3/3 races finished per viewport, standings match, no stalls or freezes, REPLAY identical.
- **Final acceptance run, `test-screens/08-final`:** 5 full races per viewport, 10 total. Flow: ENTER → select → race in SIDE → FRONT → finish → results → REPLAY → CHANGE TEAM (3 different teams) → race again.
  - **0 JS errors, 0 console errors, 0 HTTP errors, 0 failed requests** (both viewports).
  - 10/10 races finished (sim 67.8–68.3 s, wall 69–70.5 s). 0 sim stalls. 0 frozen canvas samples.
  - Standings = Official Finish in 10/10. REPLAY identical.
  - No top-down camera seen. Keys t/T/o/2/Tab never change the camera.
  - ShockBot is in the roster and the picker. `buff` does not appear in the DOM.
- Engine: winsim 24/24 races are identical to the untouched base (finish order and times).

## 6b. SIDE lane spacing + FRONT tag overlap (follow-up polish)
Files: `js/render.js` (lanes spread over the full road, slightly smaller dogs), `js/front.js` (FRONT tags nudged apart), `README.md`, `dist/monkey-jockey.html`.
- The back lanes were buried under the front rows. For example, the player's Kira + ShockBot showed only a floating head. Lanes now span the whole road.
- The two FRONT tags could overlap at the finish ("Beaux★odle"). They now stack.

**Final acceptance tests** (after this commit's code):
- `test-screens/08-final` (index.html): 5 full races per viewport, 10 total. Flow: ENTER → select → race in SIDE → FRONT → finish → results → REPLAY → CHANGE TEAM ×3 → race again.
  - Desktop and phone: **0 JS errors, 0 console errors, 0 HTTP 4xx/5xx, 0 failed requests.** 10/10 finished (wall 69.1–70.4 s, sim 67.80–68.33 s). 0 sim stalls. 0 frozen canvas samples.
  - Standings = Official Finish 10/10. REPLAY identical. No top-down camera ever. ShockBot present. No "buff" in the DOM.
  - RACE is at 496 px of 844 on phone and 697 px of 800 on desktop, right after ENTER.
- `test-screens/08-final-dist` (single-file dist over HTTP): 3 races per viewport. Same results: 0 errors, 0 404s, standings match, REPLAY identical, no freezes.
- Engine: `test-results/winsim-final.json`: 24/24 seeded races are identical to the untouched base (finish order and times to 4 dp).

---

## Roster vs current canon (noted, NOT fixed)
Canon riders: Ipo, Erv, Fonk, Dinny, Nonna, Monkey Jockey, Mystery Drone Pilot (replaced Ruch), ShockBot.
- **Ruch is still in the build** (`data.js` RIDERS slot 4, `RIDER_PERSONALITIES.ruch`, faces.js "thorny toad from Texas" SVG). **Mystery Drone Pilot is missing.** Its FRONT KEEPER art exists (`art/riders/mystery_drone_pilot_front_gate1_KEEPER.png`) but is not wired in, since the roster wasn't changed.
- Identity drift between the build's picker SVGs and the KEEPER art:
  - **Ipo**: SVG is a human-like figure ("FlashTown, blue hibiscus"); KEEPER is a pink poodle in a "Fruity Puppy" cap.
  - **Fonk**: SVG is a flame-headed "fire sprite"; KEEPER is a red goblin with a honeycomb head.
  - **Monkey Jockey**: three looks. SVG has a green cap and pink shirt; the FRONT KEEPER has a blue "K" cap and blue tee; the SIDE rig (prototype) has a white/blue racing suit.
  - **Nonna**: SVG optics are magenta; KEEPER eyes are red. Otherwise consistent: chrome skeleton, spaghetti hair.
  - Erv (thorny toad) and Dinny (toad in pink suit) match.
- **Meatball** is still flagged as a provisional identity in the build (dashed ring in the picker).
- The locked ShockBot art carries an in-art chest badge "SHOCKBOT PHASE-2". It was left as-is.

## Win distribution (balance NOT changed)
`test-results/winsim-final.json`: 24 seeded races, 24 distinct line-ups (the player pick rotates through dogs and riders; the rest are seeded shuffles), 16 sunny and 8 rainy. It uses the game's own `buildField/makeRace/step`. Every race fields all 8 riders.
- **Wins by rider:** Monkey Jockey **18/24 (75%)**, ShockBot 2, Ipo 1, Dinny 1, Ruch 1, Nonna 1, Erv 0, Fonk 0. An even split would be 3 each (12.5%).
- **Podiums:** Monkey Jockey 20/24, Ipo 15, Ruch 11, ShockBot 9, Fonk 8, Dinny 7, Nonna 2, Erv 0.
- **Wins by dog:** Mike 11, Noodle 5, Ghostbuster 4, Penny 3, Diva 1, Meatball / Beaux / Kira 0.
- The 10 real-time UI races in the final run (3 distinct line-ups plus REPLAYs) were all won by Monkey Jockey.
- **Likely cause** (from `race.js`; not changed): the rider multiplier is `rmod = .86 + bal*.006 + tim*.004 + nrv*.003 + lck*.002`.
  - Monkey Jockey (9/9/8/6) gets 0.986. Next are Ipo 0.978 and ShockBot 0.977, then Ruch 0.974, Nonna 0.972, Fonk 0.970, Dinny 0.969, Erv 0.963.
  - That ~0.8% base-speed edge is about 0.5 s over a ~65 s race, which is larger than typical 1st–2nd margins.
  - The same formula (the 0.55 speed weight) favours the high-speed dogs Mike, Noodle and Ghostbuster.

## Remaining gaps (placeholders are drawn, not invented art)
- **Ghostbuster: no real art at all.** The pack sprite is corrupt, and there is no other sprite. SIDE and FRONT use drawn placeholders.
- **No FRONT-view dog art for any dog.** FRONT dogs are drawn bodies with the picker portrait as the head.
- **SIDE dogs other than Penny have a single running pose** (no frame cycle or rig). The legs are animated by strip-shear, not true joints. Only Penny is rigged. Mike's `rig_cut` output exists but showed cut artifacts (doubled front legs), so it isn't used.
- **No SIDE rider art** for ShockBot, Nonna, Ipo, Erv, Ruch, Dinny or Fonk. These get a drawn jockey with the picker portrait as the head; ShockBot gets a drawn head with hat, sunglasses and turquoise beads. Only Monkey Jockey has a SIDE rig.
- **No FRONT art for Ruch** (drawn fallback).
- **No usable ShockBot side art or rig.** The Phase 2 "rig" was the dog cutter misapplied to a biped, and there are no output files.
- Picker portraits for all 8 dogs and for 7 of the 8 riders are still the build's generated SVGs. ShockBot's is a crop of the real art.
- The camera choice (SIDE/FRONT) persists across REPLAY. CHANGE TEAM resets it to SIDE, and SIDE is the default on load.
