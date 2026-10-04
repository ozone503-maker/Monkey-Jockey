# SUPER v7.1 (Oct 3 2026, LIVE): Watch Replay, Share clip, Post to all (hidden until the Post for Me key is set)

Jessie approved: "Yes, put Replay and Share live on the test site." Deployed to Vercel monkey-jockey-test as `dpl_Fg3QbB6HoKBg3BAHYrawynBd4AtT`. Live check at 390×844: Watch Replay and Share Clip work, an MP4 clip was recorded, 0 JS errors, `/api/pfm/status` = `{"enabled":false}`, and Post to all is hidden.

Jessie asked: "We need a replay. Then the user should be able to share his/her replay on their social media sites to get other people to play."

**WATCH REPLAY** (`js/replay.js`, plus small hooks in `js/ui.js`)
- Re-runs the finished race from `lastSeed` + `lastEntries` + `lastWeather`. The race is deterministic, so the finish order and times are identical (tested).
- **Speed:** 1× / 0.5×, plus SKIP. A photo finish (margin < 0.05 s) slows to 0.5× automatically.
- **A replay counts for nothing.** It never rolls a new seed, and it restores the seed box so the next GO is a new race. Team, weather and entries are untouched. Results show a "▶ REPLAY · same race, nothing changes" tag.
- This build has **no Kudoken wallet, payouts or bets**, so there is nothing else for a replay to change.
- The RUN IT BACK button in the top bar now plays the replay. GO always starts a real new race.

**SHARE CLIP**
- **Recording:** canvas `captureStream(30)` + `MediaRecorder`. The race canvas is copied every frame onto a 720×1280 vertical compositor that adds a header, live top-4 standings and the URL.
- **Clip:** 3 s of the start → cut to the final stretch → 0.5× photo finish → 3.5 s end card. About 19 s, no audio.
- **End card:** the MONKEY JOCKEY title, "X & Y won!", the podium faces and monkey-jockey-test.vercel.app.
- **Format:** MP4 (avc1) where supported (Safari/iOS, current Chromium), otherwise WebM (vp9/vp8). `?recfmt=webm` forces WebM.
- **Share sheet:** `navigator.share({files, text, url})` when the browser can share files. Otherwise: SAVE VIDEO, SHARE LINK (if `navigator.share` exists), X / Facebook / WhatsApp intent links, and COPY LINK. A note explains that Instagram and TikTok have no web share link: save the video, then post it from the app.
- **Challenge link:** `?race=SEED&dog=ID&rider=ID&w=WEATHER`. The team and weather are needed to reproduce the race. On ENTER a "CHALLENGE · Race #N" card offers WATCH THEIR RACE (a replay; then GO races that seed with your own team) or RACE THIS SEED.
- **Link previews:** Open Graph and Twitter meta tags. The image `assets/share/og-card.jpg` (1200×630) is built by `tools/build_og_card.py` from a real game race frame plus the picker portraits. No image generation.

**POST TO ALL** via Post for Me (`api/pfm/*.js` Vercel functions + `js/postforme.js`)
- Hidden until `POSTFORME_API_KEY` is set on Vercel. The key is server-side only.
- Player identity is a random local id in localStorage (only created when the player opens Post to all). No accounts, no cookies, no analytics.
- **First time:** Connect accounts, with each platform's sign-in in a new tab so the recorded clip survives. **After that:** caption + POST TO ALL.
- **TikTok** gets its own confirm screen that follows TikTok's Content Sharing Guidelines, and a clean copy of the clip with no logo or URL.
- Tested against a local mock: `tools/pfm_mock.js` + `tools/pfm_dev_server.js` + `tools/pfm_flow_test.py`.

**Checks:** the 3000-race sim is byte-identical. 0 JS errors at 390×844. Tests: `tools/replay_share_test.py`, `tools/pfm_flow_test.py`.

# SUPER v7 (Oct 3 2026): Penny's realistic gallop

Jessie approved the realistic Penny sample ("Penny looks right, make 2-3 more frames so her gallop is real").
- **Art:** four Canva generations in the Fonk/MJ glossy 3D style, all from her current art and then from the approved stretched frame: hind-landing (H), stretched (E, the approved sample), front-landing (F), gathered (G). Sources and BiRefNet mattes are in `art-src/penny/`.
- **Registration** (`tools/penny_cycle_art.py`): scale from the eye-to-nose distance (all within 3%). Each frame is moved so its seat point (the back surface 276 px behind the collar centre) is shared, on one 932x380 canvas. The planted paws of H and F meet the road line (H is dropped 26 px). Output: `assets/dogs/penny/gallop-{h,e,f,g}.webp`.
- **Runtime** (`DOG_CYCLE` + `drawDogCycle` in `js/gait.js`; used by `js/render.js` and `js/title.js`): the frame is picked from the SIDE gait phase in quarters (rear stance starts at 0, so the order is H → E → F → G), at her own step rate (×1.04). No leg shear; a gentle body bob (0.45×). Riders sit at the seat at their v6 scale (×1.28 = the old rig's rider size).
- **Retired for Penny:** `RIG_PENNY` (still in `js/rigs.js`) and the single-frame `side-real.webp` (fallback only).
- **Previews:** `tools/dog_cycle_gif.py` (GIF per rider) and `tools/dog_strip.py`.
- **Checks:** the 3000-race sim is byte-identical. 0 JS errors.

# SUPER v6 (Oct 3 2026): official rider art for Erv, Fonk, Nonna and Monkey Jockey

No image generation was used. Jessie's art is the identity, and no faces were redrawn.
- **SIDE race riders** (`assets/riders/<id>-side.webp`, `RIDER_SIDE` in `js/gait.js`). They are drawn at the dog's seat, with a little lag sway.
  - Every rider gets the same seat-to-head-top height (Erv's 503 rig units). The name tag rises above the art.
  - **Erv:** the approved erv-sample v3. Canva pose from Jessie's Oct 2 reference, with her exact face pasted on. Only the near arm and near leg show.
  - **Fonk:** Jessie's transparent side crouch, used as-is (edge softened 0.6 px).
  - **Monkey Jockey:** a BiRefNet matte of the cream-background side crouch. The transparent original had keyed-out holes in the white suit. The far forearm and far boot are erased. This replaces the old torso+head side rig, which stays as a fallback.
  - **Nonna:** cut off the robot greyhound with a hand-traced polygon (`tools/nonna_side_poly.py`). The far arm and the dog's head and neck are left out, and the near hand is traced clean. The original's keyed-out chrome highlights and white cap were refilled.
- **Picker card + podium** (`assets/riders/<id>-full.webp`, `RIDER_CARD_SRC` in `js/ui.js`): BiRefNet mattes of the full-body-on-white originals, with edge colours decontaminated (no halo). Monkey Jockey's card art is replaced. Standing art uses the `.tall` podium placement.
- **Picker tiles** (`assets/faces/riders/<id>.webp`): square head crops of the busts on light blue.
- **Builders:** `tools/build_rider_art_v6.py` (sources in `art-src/<id>/`) and `tools/erv_sample_assets.py`. Previews are made by `tools/rider_preview.py` and go to `test-screens/v6/`.
- **Not changed:** FRONT camera art (all 8 riders still use the old Gate 1 FRONT art). ShockBot, Ipo, Dinny and Mystery Drone Pilot keep their old art.
- **Checks:** the 3000-race sim is byte-identical. Real phone race: 0 JS errors, RUN IT BACK identical, FRONT OK.

# SUPER v5 (Oct 2 2026): YOUR TEAM card in three columns

Jessie's feedback: the rider art overlapped and covered the dog portrait. She asked for "the stats in the middle and the dogs and the riders on each side." The new layout:
- **Three columns:** dog portrait on the left; stats in the middle (dog name + 4 bars, then rider name + 4 bars); the rider's full-body art on the right.
- The rider is `object-fit:contain` inside its own column, so nothing can overlap.
- **Phone:** columns are 23% / 1fr / 25%. Bars, labels and fonts are smaller (8.5 px labels, 6 px pips, 11 px numbers), and long names (more than 14 characters, e.g. Mystery Drone Pilot) drop to 11 px. The card is 210 px tall at 390x844, the same for every pick.
- **Desktop (≥900 px):** the card is capped at 780 px and centred, with columns 170 px / 1fr / 150 px.
- **Checked with `tools/card_shots.py`:** 8 dog+rider picks (including Nonna, ShockBot and Mystery Drone Pilot), phone and desktop. Results: no overlap, no clipped names or labels, no sideways scroll, 0 JS errors. Only the picker card's markup (`renderShowcase` in `js/ui.js`) and its CSS changed.

# SUPER v4 (Oct 2 2026): Ghostbuster's real SIDE gallop art

Jessie OK'd building Ghostbuster's SIDE art from the Sep 3 standing pack, with no image generation. The source is `standing/dogs/ghostbuster/stand.png` (1400x720 RGBA, faces right, white with black spots and black ears, sha256 `51a7a0ad416c4c3aa3f8d791582814521e6b9d4dd6c33290a0afdfd72344c673`). This is a different file from the corrupt 126 KB one in the first standing zip.

## How the other dogs run, and what Ghostbuster now uses
- **Penny:** a cut-out rig from the recovered Claude gallop prototype (`js/rigs.js` `RIG_PENNY`). Plain rectangle crops of her standing art in 1400x720 source space: body, head, tail, plus hip / knee / paw bands for the rear and the front leg pair. Each has a pivot. `drawRigDog()` drives the bands with `legAngles` (hip 34°, knee 80°, ankle 11°, stance 34% from the footfall bars, front delay 38%), plus bob/pitch/spine/tail spring and the head low (`HEAD_LOW`).
- **Meatball, Beaux, Kira, Mike, Diva, Noodle:** one baked running-pose sprite each (`assets/dogs/<id>/side.webp`). The leg band is sheared by the same gait (`drawSpriteGallop`).
- **Ghostbuster's art is a standing pose, like Penny's,** so it gets **Penny's rig format.** `tools/rig_ghostbuster.py` makes rectangle crops only:
  - Joints at hip 472 / knee 553 / ankle 622.
  - Rear pivot x 488, front pivot x 806. Ground 683, back 359. These were measured from the alpha profile.
  - The face and ear are cleared from the body copy so the low-tilted head has no ghost twin.
  - Parts are in `assets/rigs/ghostbuster/*.webp`, and the rig is `RIG_GHOSTBUSTER` in `js/rigs.js`.
  - `RIGS.ghostbuster` in `js/gait.js` makes the race SIDE camera and the title parade use it automatically.
- **Gait and scale are unchanged:**
  - The locked step rate is ×1.06. The physics notes give leg length 177 → ×1.06, stride ×0.95.
  - Draw scale is 0.90 (the compact pair with Noodle). Body length is normalised like Penny (`dogH*1.55/(front-back)`). He faces right like everyone else.
- **FRONT camera:** unchanged (drawn front placeholders for all dogs). Checked: 0 errors.

## Previews (`tools/gallop_preview.py`)
- `test-screens/v4/ghostbuster-gallop-strip.png`: 4 gait phases, Ghostbuster rig vs Penny rig.
- `test-screens/v4/race-side-phone.png` + `race-ghostbuster-zoom.png`: phone 390x844 SIDE, Ghostbuster + Ipo beside Meatball.
- `test-screens/v4/race-front-phone.png`: FRONT.

**Verdict:** reads as the same white spotted dog galloping, at a matching scale. The band seams on the legs are visible up close, the same as Penny's rig.

Race engine untouched: `race_sim.js` 3000 races are byte-identical to super-v2/v3.

# SUPER v3 (Oct 2 2026): picker visuals + attribute ratings, moving title, podium stands

Jessie, before merging PR #11: *"the player select screen is missing the visuals of the dog and rider. the attribute ratings are missing. the title screen is supposed to be moving with music. the post race is supposed to have 3 podiums."* The race engine is untouched: `node tools/race_sim.js . 3000` gives output byte-identical to super-v2.

## Where each piece was specified (real sources only)
| Piece | Source | What it says |
|---|---|---|
| Picker visuals | Master spec README §4 and §6 (GitHub main `9f99ed0`; local `/workspace/monkey-jockey-audit/raw/README.md`) | "Character selection must use visual portrait cards." "Selected team is visually obvious." No dropdowns. |
| Picker visuals | Fruity Puppy Master Bible v0.1 §13.4 (Sep 4) | "two rows of four dog face tiles and two rows of four rider face tiles" |
| Picker visuals | `art/select/README.md` + `portraits.json` (GitHub main `cff91e6`) | Canonical 512² dog portraits on light blue, used directly in the dog tiles |
| Attribute ratings | Bible §13.4 | "stat lines and tap-to-pick selection" |
| Attribute ratings | CHANGES.md U5 | "2×4 face tiles … with stat lines" |
| Attribute ratings | — | **No source gives a display style** (bars vs stars). Only "stat lines". Bars are my choice. Which stats to show comes from the engine (`js/data.js`). |
| Attribute ratings | 2021 Drive doc "MONKEY JOCKEY 3R…" | "all races decided by RNG and the attributes are just for decoration", which fits balance v2 |
| Moving title with music | 2021 Drive doc, "Opening screen" | "Scene of monkey on horse riding by so fast monkey can barely hold on. Distant scene of horse track… Logo comes up. Horse track music plays." |
| Moving title with music | Bible §13.4 | "video intro with audio before ENTER" |
| Moving title with music | Bible R-017 | Mobile can block autoplay, so there must be a fallback |
| Moving title with music | Master spec §5 | Present a clear gesture if autoplay is blocked |
| Moving title with music | V87–V89 notes | ENTER dismisses at once |
| Moving title with music | — | The later intro (`mj-title-v33.html`, Claude `monkey-jockey-4-audio-intro.zip`) exists only in the ChatGPT Library. It's still unreachable. |
| 3 podiums | Bible §13.4 | "trophy screen with 1st/2nd/3rd podium" |
| 3 podiums | Master spec §24 | 1ST/2ND/3RD exactly matching results, canonical art, RUN IT BACK, same visual world |
| 3 podiums | 2021 doc | "Award screen… ceremony that shows winning horses" |
| 3 podiums | CHANGES.md A1 rebuild plan | 1st centre and tallest |

Searched with no further detail found:
- All 9 branches of ozone503-maker/Monkey-Jockey (git grep for ratings/stats/attributes/podium/title).
- Gmail (Monkey Jockey + stats/attributes/ratings/podium/title/picker: no relevant mail).
- Google Drive (only the 2021 concept doc).
- `/workspace/mj-deep-audit`, `/workspace/mj-later-versions`, and the recovered Claude FRONT prototype (8 KB, no picker/stats).

**Note on the live build before v3:** super-v2 *did* already have portrait tiles and a 3-step podium (`test-screens/v3/before/`). But the tiles showed stats only as a hover tooltip, which a phone never shows. There was no big "your team" view. The podium was three small coloured blocks under portraits.

## What changed
- **Picker** (`js/ui.js`, `index.html`, `styles/main.css`):
  - New **YOUR TEAM** showcase at the top. It shows the dog's canonical portrait and the rider's **full-body locked Gate 1 FRONT art** (ShockBot = approved v2 art with hat, sunglasses and turquoise necklace; Mystery Drone Pilot = Gate 1 KEEPER).
  - The showcase has **attribute ratings**: 10-pip bars with the number, read straight from `js/data.js`.
    - Dog: SPEED / BURST / STAMINA / FOCUS (blue).
    - Rider: BALANCE / TIMING / NERVE / LUCK (pink).
  - Every tile also has mini rating bars labelled SP BU ST FO / BA TI NE LU.
  - The selected tile has a juicy-blue state with `aria-pressed`.
- **Title** (`js/title.js`, new):
  - The eight canonical teams gallop across a scrolling road at the bottom of the title. It uses the race's own SIDE gait code, so it's render-only and never touches `sim` or the rng.
  - The intro video has a slow Ken Burns drift, so it still moves when a phone blocks autoplay.
  - The logo rises in and glows, and ENTER pulses.
  - A **🎵 TAP FOR MUSIC** chip appears. A tap anywhere on the title starts the theme loop, which browsers require; the chip then hides.
  - Reduced-motion users get a still frame.
  - `js/core.js`: `ctx` is now `let`, so the parade can borrow the SIDE drawing functions on its own canvas.
- **Podium**:
  - Three distinct 3-D stands: 1st centre and tallest (gold, 🏆), 2nd left (silver), 3rd right (bronze). The place number is on each stand's face.
  - Each stand carries the dog portrait plus the rider's full-body art, the names and the finish time.
  - Spotlights and confetti. YOUR team's stand is outlined. On desktop the podium is capped at 640 px.
- **Asset warnings fixed:** `penny.png` / `ipo.png` were false positives. `build_dist.py` read example paths in code comments (`js/art.js`, `js/faces.js`). The comments now name real files, and `build_dist` reports `missing []`. All 8 dogs and 8 riders have picker art. All 8 riders have full-body FRONT art.

## Not found / not used
- `art/brand/monkey-face.png` (GitHub main, the UI-PALETTE title lockup) is **only the top hair tuft**. The rest of the 1254² image is transparent, so it can't be used as the monkey-face logo. **The real monkey-face file is needed from Jessie.**
- **No source specifies bars vs stars for ratings.**
- The later intro video/title page is still in the ChatGPT Library only.
- Ghostbuster still has no SIDE art (the title parade uses the drawn stand-in, as the race does).

## Tests
- Phone 390x844 + desktop 1366x900, local and live: title, picker, race, podium with 0 JS errors.
- Local real phone race: 6 leaders, podium = 3 stands, RUN IT BACK identical, FRONT camera OK.
- Live real phone race (deploy `dpl_ACRNr5AexPChYEmUgLXgxjWtDbDY`): Penny + Nonna won by 0.045 s, 6 different leaders, podium = 3 stands, RUN IT BACK identical = True, JS errors = 0.
- Engine sim is identical to super-v2 (3000 races).
- `/.env.local` → 404 on live.

# BALANCE v2 (Oct 2 2026): fair, unpredictable races

Jessie: *"we need the races to be fair, and not predictable. right now whoever takes the lead wins the race and so the whole race is unwatchable."* This is her sign-off to change seeded results, so **seeds no longer reproduce Sep 2 / super-v1 results** (they still reproduce themselves).

## Root cause of Monkey Jockey's ~75% win rate (Sep 2 engine, unchanged through super-v1)
There was no code that favoured Monkey Jockey by name. It came from the stat formula plus a race with almost no real randomness:
1. **Rider multiplier, `js/race.js` line 13:** `rmod = .86 + balance*.006 + timing*.004 + nerve*.003 + luck*.002`. Balance and timing weigh most, and Monkey Jockey (9/9/8/6) has the best total: 0.986, vs Ipo 0.978, ShockBot 0.977 … Erv 0.963. That's a 0.8–2.4% top-speed edge for the whole race, worth 7–20 m at the line.
2. **The randomness can't overcome it:** per-tick noise of ±1.5% (line 57) averages out to nothing over 2,000 ticks, and seeded surges (lines 49–52) are short and rare. So the fastest stat sheet almost always won. The same formula made Mike / Ghostbuster / Penny the best dogs and Beaux / Meatball never won (0 of 3000).
3. **Rich-get-richer:** whoever led got a +1.5% mood speed bonus (`js/systems.js` `updateMoods`, `rank===1 … mod=1.015`), and anyone running within 11 m behind other dogs got a compounding traffic penalty (race.js line 56), unless their timing+burst was high (Monkey Jockey's timing is 9). Fast starts came from acceleration `4.5 + burst*.55 + balance*.2` (line 62), which gave high-burst dogs about 6 m at the start.
4. **The default pick and fixed seed:** the game opens with Penny + Monkey Jockey selected (`js/ui.js` line 58), a top-3 dog with the best rider, and the seed box always stayed at 83479126 (`index.html` line 49). Pressing GO again replayed the same race, which Monkey Jockey won every time. Across random seeds the default pick won 91%.

## What changed
- `js/race.js`: stats now only *shape* how a team runs. The stat "class" edge is ±0.05% (dog) and ±0.04% (rider), and every rider stat weighs the same. Who wins comes from a **seeded race plan** per entrant, drawn from its own sub-generator `rng32(seed ^ PACE_SALT)` so the main rng sequence (weather plan, track events, surges, noise) is drawn exactly as before:
  - **Running style:** front-runner (fast early, fades), stalker (moves mid-race) or closer (patient, strong finish). The pace tilt is 0.8–2.5% and speed-neutral over the race. Burst/timing make front-running likelier, and stamina/nerve make closing likelier. All three styles win about equally (x0.97–1.03).
  - **1–2 mid-race moves:** a surge of +3.5–8% over 3–8% of the course, paid back right after at 42%.
  - **Late kick:** a seeded sprint from 80–88% of the course. It's saved up, not free, because a little is held back before it.
  - **Day form:** ±1.7%.
  - **Drafting:** tucked in 1–12 m behind the nearest dog gets up to +0.55%. Nose-to-tail (<1 m) is boxed in, at −0.6%. Only the nearest dog counts, so a pack never compounds.
  - **Fade:** the old energy curve sent everyone to the 0.66 floor. It's now a smooth fade to about −24% at the line, and stamina softens it slightly.
  - **Acceleration:** about equal (8.2 ± small). The launch is mild.
  - The race length is unchanged (winner ~65 s).
  - `trackEventMult` (events) and `raceVarianceMult` (seeded surges/hesitations) are still separate fields with the same owners. The new plan writes `paceMult` / `draftMult`.
- `js/systems.js` `updateMoods`: no speed bonus for leading (was +1.5%). The back-of-field and final-phase mood lifts dropped from 1.01 / 1.02 to 1.004 / 1.006. Moods, animation hooks and commentary hooks are unchanged.
- `js/ui.js`: **a fresh seed for every new race.** It's rolled at boot, on CHANGE TEAM and after each finish, unless you typed a seed, which is then used once. RUN IT BACK still reuses the same seed + teams + weather, so the replay is identical. `crypto.getRandomValues` is used only to choose the seed in the UI. The race itself still draws only from `rng32`.

## Numbers (`node tools/race_sim.js`, 3000 races, random seed + random player pick + random weather)
| | Before (super-v1 = Sep 2 engine) | After (v2) |
|---|---|---|
| Monkey Jockey rider win share | 49.4% (x3.95 fair) | 13.9% (x1.11) |
| Riders, range of fair share | x0.00 (Erv) – x3.95 | x0.88 – x1.12 |
| Dogs, range of fair share | x0.00 (Beaux, Meatball) – x3.13 (Mike) | x0.89 – x1.17 |
| Dog+rider combos above x1.5 | 15 / 64 (best x8) | 0 / 64 (best x1.45) |
| Leader at 25% wins | 72.4% | 27.3% |
| Leader at 50% wins | 69.6% | 36.7% |
| Leader at 75% wins | 78.4% | 51.2% |
| Lead changes per race (held ≥0.5 s, after the first 5%) | 2.95 | 4.79 (2.81 in the 2nd half) |
| Winning margin < 0.25 s | 38.5% | 71.5% |
| Photo finish < 0.05 s | 13.5% | 22.5% |
| Default pick (Penny + MJ) win rate, 500 random seeds | 91.4% | 14.8% |
| Average winning time | 65.4 s | 65.1 s |

Fair share = 12.5% (1 in 8).

## Tests
- Local, Chromium 390x844: 3 real races (Mike+Erv, Noodle+MJ, Meatball+ShockBot) with 0 JS errors. There were 6–16 lead-change highlights per race and 4–5 different leaders. The podium showed. RUN IT BACK was identical (same seed, same finish times). FRONT camera toggled. Seeds were distinct per race.
- Live (https://monkey-jockey-test.vercel.app/, deploy `dpl_47XvhKSm48Gz8GpK7qiwQPVCoub7`), phone 390x844, 2 races with 0 JS errors. Race 1: Ghostbuster + Monkey Jockey led at 512 m, and Noodle + Mystery Drone Pilot won by 0.183 s. That race had 6 different leaders and RUN IT BACK was identical. Race 2: Penny + Dinny won by 0.182 s with 5 different leaders. `/.env.local` returns 404.

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
