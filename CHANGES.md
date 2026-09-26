# MONKEY JOCKEY: what later versions added (rebuilt from written sources)

Compiled Sep 26, 2026 (HST). Read-only research. Nothing was written to GitHub, Gmail, Drive, Vercel or Netlify.

**Baseline for "in fixed build?":** the build Jessie played, which is the Sep 2 Punahele base plus our fixes.
- Source: `/workspace/mj-fix`
- Live: https://monkey-jockey-test.vercel.app/

**Why this is a paper reconstruction:** the V33+ build bytes (V33, V87–V89, V125, V132–V134, the late ShockBot candidate) exist only in the ChatGPT Library and can't be reached. Everything below comes from specs, notes, issues, emails, Drive docs and art that *is* reachable.

**Confidence levels:**
- `detailed spec`: numbers, rules or layout given, so we can rebuild from the text.
- `described`: the intent is clear but details need design choices.
- `mentioned only`: a name or one line.

**Other markers:**
- `⚠ CONFLICT`: disagrees with canon. Canon is: SIDE and FRONT cameras only (TOP-DOWN retired); ShockBot replaces Buff Bro Bot; Mystery Drone Pilot replaces Ruch; the 8 riders are Ipo, Erv, Fonk, Dinny, Nonna, Monkey Jockey, Mystery Drone Pilot, ShockBot.
- `concept (2021)`: from the 2021 Drive design doc, which predates the game.
- Trust: the incident report (`7575c49`) says the ChatGPT V-number docs aren't build proof. They're used here as feature descriptions only.

---------------------------------------------------------------------

## PART A — JESSIE'S SIX MUST-FINDS

### A1. Victory screen (trophy / podium / Run It Back)
- **In fixed build:** NO.
  - What exists: an "Official Finish" list, standings, and the raw system log (dev text shown to players), plus REPLAY and CHANGE TEAM buttons.
  - `systems.js` detects a `photo_finish_threat` highlight but never shows it.
- **Where it's described:**
  - Fruity Puppy Universe Master Bible v0.1 (Sep 4 2026), §13.4:
    - "trophy screen with 1st/2nd/3rd podium".
    - "Run It Back" repeats the race with the same teams "for revenge".
    - §20 active work lists the "trophy/Run It Back flow". Local copy: `/home/box/agent-data/agents/4457db95-0e2d-489c-9d97-bf02a156406d/attachments/69335057a33bb926cec31455b90d4a7602f5fdde0264658b36781c6e8e6d95bc.md`
  - Master spec README (GitHub main `9f99ed0`, Sep 17), §21–§25: `detailed spec`.
    - Finish climax.
    - Photo-finish presentation for close finishes.
    - A celebratory results screen instead of a dev table.
    - Podium 1ST/2ND/3RD with a **RUN IT BACK** button; the podium must match the official results.
    - Replay with SIDE/FRONT switching.
    - Local copy: `/workspace/monkey-jockey-audit/raw/README.md`
  - MASTER V87 notes: required checks include "finish / result / podium". `/workspace/monkey-jockey-audit/raw/recovered_V87*`
  - 2021 Drive doc "MONKEY JOCKEY 3R digital horse racing game" (Jun 14 2021): "Award screen", "payout ceremony" showing the winners. `concept (2021)`
- **Assets that exist:**
  - Standing full-body art, Sep 3 standing pack: `/home/box/agent-data/agents/992a3f25-91e9-4d42-b243-9d05be59cd7a/attachments/0927cd2e475e668b34f6a9c3e00af535cd85449d93a1476b917d5523f33c07d0.zip`
    - `standing/dogs/<8 dogs>/stand.png`
    - `standing/riders/{dinny,erv,fonk,ipo,monkey-jockey,nonna,buff-bro-bot,ruch}/stand.png`, 1400×720.
    - ⚠ The buff-bro-bot and ruch files are non-canon. There is no ShockBot or MDP standing art.
  - Rider FRONT Gate 1 KEEPERs (see A6) and ShockBot `art/shockbot_gate1_preview_v2.png`.
  - Dog select portraits: GitHub main `art/select/dogs/*.png`, 512², commit `cff91e6`, Sep 13.
  - Brand mark: `art/brand/monkey-face.png` on GitHub main.
  - NOT FOUND: trophy art, podium art, confetti, a victory music cue.
- **Rebuild plan:**
  - Results state with a 3-step podium: 1st center and tallest.
  - Each step shows the dog stand.png plus the rider KEEPER/portrait, name, and finish time.
  - Keep the finish order list underneath and hide the dev log.
  - Buttons: RUN IT BACK (same seed+teams = current REPLAY, renamed) and CHANGE TEAM.
  - Add a photo-finish freeze for margins under ~0.05 s.
  - Needs: a trophy/podium graphic (draw it in code or ask for art) and a victory sting (see A2).

### A2. Soundtrack (music during play)
- **In fixed build:** NO audio at all. Every video is `muted` and there is no audio code.
- **Where it's described:**
  - `00-START-HERE` (Sep 8 consolidation, `/workspace/monkey-jockey/00-START-HERE*`):
    - The music master is `04-AUDIO-SOURCE/Volcano Jockey.mp3`, 2,445,743 B, sha256 `77cf0d239fb8…`.
    - The production base Claude build `monkey-jockey-4-audio-intro.zip` (11,665,530 B, sha `238ad519…`) "already contains cut/looped game audio".
  - Bible §13.4 "video intro with audio before ENTER"; decision R-017 covers audio autoplay on the looping intro.
  - Master spec §27 (`described`):
    - Layers: intro/theme, race start, ambience, footsteps, weather, finish, podium cues.
    - One central audio manager and a mute control.
    - Start only after an allowed user gesture.
  - V88 notes: "audio unlock remains intact". V89: embedded image/audio warmup. This means later builds had working audio.
  - 2021 doc: "horse track music plays" on the opening screen. `concept (2021)`
- **Assets:**
  - **Volcano Jockey.mp3 is NOT on the box, in Drive, in Gmail, or on GitHub.** I checked the sha256/size of every mp3 on the box and every audio file's ID3 title; nothing matched.
  - On-box music that is *not confirmed MJ* (Fruity Puppy site, `/workspace/fruity-puppy/site-source/public/audio/`):
    - `SAVE THE DOGS (1).mp3`: the ShockBot song, 153 s, tied to ShockBot's "Save the Dogs" skin.
    - `MOVE ON ZERO (1).mp3`, `TECH TO WRECK.mp3`.
    - Ambience: `jungle-ambience.mp3` (a good rainforest race bed), `thorny-toad-ambience.mp3`, `lava-guava-ambience.mp3`, and others.
    - `/workspace/fruity-puppy/incoming-video/audio/2026-09-06-track-*.mp3`
- **Rebuild plan:**
  - Add `audio.js`: one manager, unlocked on the first ENTER/tap, with a mute toggle saved to localStorage.
  - Loop the theme on intro/menu and a race-loop during play. Add start, finish and podium stings.
  - Rainy weather adds a rain bed.
  - **Need from Jessie: `Volcano Jockey.mp3`.** Ask her to re-send it or say where it lives. Until then, `jungle-ambience.mp3` can stand in as ambience.

### A3. Mystery Drone Pilot replaces Ruch
- **In fixed build:** NO. ⚠ CANON CONFLICT in our build.
  - Ruch is still rider slot 4: `js/data.js` RIDERS, `RIDER_PERSONALITIES.ruch`, `RIDER_COLORS.ruch` in gait.js, and the thorny-toad SVG portrait in `js/faces.js`.
- **Where it's described:**
  - GitHub issue #3 (https://github.com/ozone503-maker/Monkey-Jockey/issues/3):
    - Comment 2026-09-19 07:40Z (Sep 18 21:40 HST): "Roster: Ruch → Mystery Drone Pilot (photo locked)".
    - Comment 07:51Z (Sep 18 21:51 HST): "MDP FRONT Gate 1 LOCKED (stylized electric-blue; replaces Ruch)".
  - `/workspace/monkey-jockey/reference/identity/riders/PHOTO_LOCK_NOTES.md`: MDP is on the locked Gate 1 list.
  - Character bio: `/workspace/brobots/roster/from-site/parts/mystery-drone-pilot.json` (BroBots roster).
  - Gmail: a brobots-space-academy PR #5 "Ship Mystery Drone Pilot UFO prototype" (Sep 14 2026). This is a separate game but is useful character context.
- **Locked art (paths):**
  - **`/workspace/monkey-jockey/art/riders/mystery_drone_pilot_front_gate1_KEEPER.png`**: 1280×720, 360,156 B, sha `85ce7fb516b7`.
    - The checkerboard is baked in (RGB), so it must be keyed before use.
    - Byte-identical copy: `/workspace/monkey-jockey/art/mystery_drone_pilot.png`.
    - Preview: `…/art/riders/mystery_drone_pilot_front_gate1_KEEPER_view.jpg`. It shows a glossy electric-blue alien, big black eyes, black wristbands, gripping a wooden bar, front pose.
    - Earlier drafts: `…_front_gate1_v1*.png`, `…_v4*.png`.
  - Face lock: `/workspace/monkey-jockey/reference/identity/riders/mystery_drone_pilot_face_LOCK.jpg`, 330×501. It is identical to `mystery_drone_pilot_ref.jpg`.
  - The MDP art is not on GitHub.
  - Missing: a keyed PNG (`/tmp/keyed/` has the other 6 riders but not MDP, and `/tmp` doesn't survive), SIDE art, picker portrait, stats and personality.
- **Rebuild plan:**
  - Replace the `ruch` entry with `mystery-drone-pilot`: name, colors, personality text from the BroBots json, stats.
  - Key the KEEPER to `assets/riders/mystery-drone-pilot-front.webp` for FRONT.
  - Crop a picker face from the face LOCK.
  - SIDE: use a silhouette/colored rider until SIDE art exists.

### A4. A different intro video and music than the Sep 2 build
- **In fixed build:** Sep 2 intro only.
  - `assets/video/intro-loop.mp4`: 1,056,614 B, muted, no audio track. A pink character in a bucket hat and the monkey riding dogs.
  - Menu reels: `road-loop.mp4`, `ghostbuster-loop.mp4`.
- **Where it's described:**
  - `00-START-HERE`: the Claude build `monkey-jockey-4-audio-intro.zip` was chosen as production base for its "intro/audio work". It's unreachable.
  - RECOVERY-INVENTORY: `mj-title-v33.html`, 5,054,997 B. This was a separate, media-heavy title/intro page for V33. ChatGPT Library only. `mentioned only`
  - Bible §13.4: "video intro with audio before ENTER"; R-017 covers audio autoplay on the intro loop.
  - V87: redundant intro escape by click, touch or keyboard. V88: ENTER dismisses at once, 180 ms fade, audio unlock, heavy art warmup deferred. V89: `enterGame()` reordered.
  - Master spec §5 (`detailed spec`): intro state machine BOOT → INTRO_READY → INTRO_PLAYING → SETUP, with a timeout and an escape.
  - 2021 doc (`concept (2021)`): the opening shows a monkey on a racer "going so fast the monkey can barely hold on", a distant race track, the logo, then track music.
- **Assets:**
  - NO file identified as the later MJ intro, and the Volcano Jockey music is missing (A2).
  - Candidate, not confirmed: `/workspace/fruity-puppy/incoming-video/commercials/commercial-03.mp4`.
    - 1,993,935 B, 10 s, 568×320, has audio.
    - Two FP characters (one frog/toad rider in a pink suit, one in shorts) race black dogs on a dirt track. It's a Fruity Puppy commercial.
- **Rebuild plan:**
  - Swap in the new intro video and loop the theme music under it, starting on the first gesture. Use the spec's state machine.
  - **Need from Jessie:** the newer intro video file (or confirm commercial-03), plus Volcano Jockey.mp3.

### A5. Background plants on the track
- **In fixed build:** PARTIAL.
  - One procedural ʻōhiʻa forest band (`forest()` in `js/render.js`) scrolling at 0.25× plus road dashes.
  - No foreground plants, ferns, monstera, ginger, rocks, markers or spectators.
- **Where it's described:**
  - `design/SIDE-CAMERA-SCENERY.md` (GitHub main `fedb7ba`, Sep 14; `/workspace/monkey-jockey/SIDE-CAMERA-SCENERY*`), `detailed spec`:
    - 3 parallax layers at 0.20 / 0.50 / 0.90.
    - Scenery: dense tropical plants and ferns, banana/broad-leaf clusters, lava rock/basalt, fences, course markers, spectators, Brobots and MJ signage, stands, props, flags, critters, and Outlet Mall/FlashTown/Rooster Island references.
  - RUNTIME-BLOCKER and Canonical Recovery README (Sep 16):
    - Approved Punahēle roadside: basalt/wet basalt, ʻōhiʻa/lehua, ginger, monstera, ferns, rainforest plants, race-day spectators.
    - "Do not invent roads/driveways/buildings/guardrails/poles/landmarks."
  - Master spec §13 and §20: 7 layers (road, grass, shrubs, mid forest, poles, horizon, sky); ʻōhiʻa, ferns, lava, **utility poles**, haze. ⚠ CONFLICT with the no-poles rule.
  - Bible §13.1: course over lava tubes with grass shoulders, ʻōhiʻa, **utility lines, driveways**. ⚠ Same conflict.
  - Late candidate contracts (`mentioned only`): MJ_WET_BASALT_V82, MJ_TRADE_WIND_V84 (likely wind sway), MJ_ROAD_MOTION_V86, and race-day/spectator/side-world contracts.
  - V32 basalt road edge and V33 wet-road depth bands on the basalt road polygon (`described`).
- **Assets:** NO MJ plant or scenery art exists in /workspace, Drive, Gmail or GitHub. I searched fern/ohia/lehua/monstera/ginger/plant/scenery/foliage.
  - Reference only: FP photos, e.g. `/workspace/fruity-puppy/site-source/public/images/moon-tea/night-02-pond-ferns.jpg`, and FP rainforest clips.
- **Rebuild plan:**
  - Draw plants procedurally in canvas (ferns, monstera, ginger, ʻōhiʻa with red lehua, basalt rocks) on 3 layers at 0.20/0.50/0.90, with a seeded placement per track.
  - Add a small trade-wind sway and wet sheen when rainy.
  - Or commission 6–10 transparent plant PNGs; per the contract, rekker owns scenery art.
  - Skip poles and driveways until Jessie rules on the conflict.

### A6. Custom rider avatars (locked Gate 1 FRONT rider art)
- **In fixed build:** PARTIAL.
  - FRONT camera uses 7 KEEPER-derived images in `assets/riders/`:
    - nonna-front.webp, ipo-front.webp, erv-front.webp, monkey-jockey-front.webp, dinny-front.webp, fonk-front.webp
    - shockbot-front.webp, plus shockbot-face.png for the picker.
  - **The rider picker and results still use generated SVG placeholder faces** (`js/faces.js`) for every rider except ShockBot.
  - No MDP. No SIDE art except the Monkey Jockey rig.
- **Where it's described:**
  - Issue #3 (Phase B FRONT riders, Gate 1 status comments Sep 14–19 HST).
  - `PHOTO_LOCK_NOTES.md`.
  - Identity locks in Issue #3 comments:
    - Ipo: pink FP character, no hat, no monkey parts.
    - Erv: stout toad in ʻōhiʻa-green/lemon Thorny Toad outfit.
    - MJ: Kudoken two-blues + K, solid panels.
    - Nonna: chef-hat terminator robot.
    - Dinny: coqui frog in a pink suit.
    - Fonk: see fonk_face_LOCK.
    - ShockBot: silver body, turquoise necklace, leopard fedora + sunglasses always on.
- **Locked Gate 1 FRONT paths** (`/workspace/monkey-jockey/art/riders/`, each with a `_view.jpg`):
  - `ipo_front_gate1_KEEPER.png` (1080×1204 RGBA, already transparent)
  - `erv_front_gate1_KEEPER.png` (1280×720 RGB). Issue #3 later said "Erv redo in progress", so check which Erv is final.
  - `fonk_front_gate1_KEEPER.png` (1280×720 RGB)
  - `monkey_jockey_front_gate1_KEEPER.png` (1280×720 RGB)
  - `mystery_drone_pilot_front_gate1_KEEPER.png` (1280×720 RGB)
  - `nonna_front_gate1_KEEPER.png` (1280×720 RGB)
  - `dinny_front_gate1_KEEPER.png` (1280×720 RGB)
  - ShockBot: `/workspace/monkey-jockey/art/shockbot_gate1_preview_v2.png` (Jessie-approved v2, 416×700 RGBA). Also `art/shockbot_phase2_noloop.png`, and `art/shockbot.png` + `out/shockbot.rig.json` on PR #5 branch `phase-b-shockbot-gate1-turquoise`.
  - Face locks in `/workspace/monkey-jockey/reference/identity/riders/`:
    - ipo_face_LOCK.jpg (+ _CUTOUT.png), monkey_jockey_face_LOCK.jpg (+ _CUTOUT.png)
    - fonk_face_LOCK.jpg, nonna_face_LOCK.png, dinny_face_LOCK_thumb.png
    - mystery_drone_pilot_face_LOCK.jpg, erv_style_vs_ipo_LOCK.jpg
    - shockbot_face.jpg
  - Keyed (transparent) copies of 6 riders plus ShockBot are in `/tmp/keyed/`. They're temporary; re-key into the repo.
- **Rebuild plan:**
  - Make 256² face crops from the KEEPERs/face LOCKs for all 8 riders and replace the faces.js SVGs.
  - Use those in the picker, the HUD tag, and the podium (A1).
  - Swap the dog placeholders for the GitHub canonical dog portraits (`art/select/dogs/*.png`).

---------------------------------------------------------------------

## PART B — EXHAUSTIVE CATALOG (by area)

Fields: **ID · Version · Description · Source · Confidence · Conflict · In fixed build?**

Source key:
- `SPEC` = master README `9f99ed0`
- `BIBLE` = FP Universe Master Bible v0.1 §13 (Sep 4)
- `SCN` = SIDE-CAMERA-SCENERY.md `fedb7ba`
- `V33N` = BUILD-NOTES-PROD-FRONT-V33.txt + QA-PROD-FRONT-V33.json
- `LATE` = LATE-CANDIDATE doc `07be3a8` (index 20260915-162152.html)
- `V87/V88/V89/V125/V132/V133/V134` = recovered docs on main (`b88a04a` … `9d0e23d`)
- `REC` = CANONICAL-RECOVERY-README / START-HERE / merge map / manifest
- `INC` = incident report `7575c49`
- `MALL` = `/workspace/mall/outletmall/units/arcade/monkey-jockey/README.md`
- `2021` = Drive doc "MONKEY JOCKEY 3R digital horse racing game" (Jun 14 2021)
- `#n` = GitHub issue/PR at https://github.com/ozone503-maker/Monkey-Jockey/issues/n

### 1. Gameplay / racing
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| G1 | — | Photo-finish presentation for close finishes (deterministic, must match results) | SPEC §22; BIBLE §13.2 | described | — | NO (highlight detected only) |
| G2 | — | Start sequence: staged → ready → start signal → go | SPEC §19 | described | — | NO (race starts instantly) |
| G3 | — | Finish climax: final-stretch emphasis, prominent finish line | SPEC §21; 2021 | described | — | PARTIAL (FRONT finish gantry) |
| G4 | — | Race pace signatures per dog+rider pairing with collision-breaking transforms; acceptance tests over all 64 pairings vs. a no-signature baseline | BIBLE §13.2 | described | — | NO |
| G5 | V27–V33 | Frozen replay weather snapshot, kept apart from the live weather execution | V33N | described | — | YES (replay restores weather) |
| G6 | V28–V30 | trackEventMult vs raceVarianceMult split into separate domains | V33N | described | — | YES (base has both) |
| G7 | V31–V33 | RNG draw replay, phase-count accounting, per-draw phase-sequence replay verification | V33N | described | — | NO (QA tooling) |
| G8 | V33 | Digest chain: weather execution/plan, event activation/lifecycle/effect matrix, split, checkpoint, outcome digests | V33N (QA json) | mentioned only | — | NO |
| G9 | V88 | Renderer failure isolation: a renderer throw can't stop the sim; FRONT failure falls back to SIDE | V88 | detailed spec | — | NO |
| G10 | V89/V108 | Dev assertion fixes; TOP assertions demoted to warnings | V89 | described | ⚠ TOP refs | N/A |
| G11 | V124–V125 | Replay-parity firewall: post-finish digest mismatch is non-fatal and logged to `window.MJ_LAST_REPLAY_PARITY_ERROR` | V125 | detailed spec | — | NO |
| G12 | V131–V132 | Lifecycle suspension latch: pagehide/freeze/visibilitychange → `MJ_RACE_SUSPENDED`; rebase `MJ_RACE_LAST_PULSE_MS`; no sim while hidden | V132 | detailed spec | — | NO (rAF loop pauses but no latch) |
| G13 | V133 | Pulse watchdog: rAF checks heartbeat; if no pulse for 750 ms, clear and re-arm `MJ_RACE_PULSE` at 100 ms | V133 | detailed spec | — | NO |
| G14 | V88/V132 | Fixed 1/30 s simulation on a 30 Hz race pulse with scheduler-debt handling | V88, V132 | described | — | PARTIAL (fixed 1/30 steps on rAF) |
| G15 | — | Race variance ±15% vs ±3% debate; Jessie: "races seemed decided in the first seconds" | INC items 12–14 | mentioned only | not canon | Our build: MJ rider wins 18/24 in tests, so balance needs tuning |
| G16 | — | All 8 teams visible and racing in SIDE and FRONT | REC | described | — | YES |
| G17 | — | Player picks dog+rider; 7 opponents generated | REC merge map | described | — | YES |
| G18 | — | Deterministic moods, events, highlights, logs, rankings | BIBLE §13.2 | described | — | YES (base) |
| G19 | — | ~1-minute races with multiple lead changes; monkeys' tails show; falling-off poses | 2021 | described | concept (2021) | PARTIAL (races ~60 s+) |
| G20 | — | Rider wobble/fall-off event animations | 2021 | mentioned only | concept (2021) | NO |

### 2. Betting / Kudoken
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| K1 | — | Standalone mode: free play awards KDU; link MetaMask before credit/withdrawal; never ask for a seed phrase | BIBLE §13.3; R-015 | described | — | NO |
| K2 | — | In-mall arcade mode: KDU may be charged to play and tickets awarded; currencies stay separate | BIBLE §13.3 | described | — | NO |
| K3 | — | `MallTickets` API hookup: get / award / spend / canAfford / onChange (spend returns null if short) | MALL | detailed spec | — | NO |
| K4 | — | Tickets ≠ Kudokens; any wagering currency stays internal to MJ until built | MALL | described | — | N/A |
| K5 | — | KDU → ETH/USD conversion intent; not cash-redeemable (open decision) | BIBLE R-016 | mentioned only | — | NO |
| K6 | — | "MONKEY JOCKEY — brought to you by the Kudoken" branding | BIBLE §13; MALL | described | — | YES |
| K7 | — | Betting screen: wager Kudoken (ETH20) via MetaMask; house winnings go to a liquidity pool | 2021 | described | concept (2021) | NO |
| K8 | — | Hi/Lo two-card side game | 2021 | mentioned only | concept (2021) | NO |
| K9 | — | Scheduled races (5 min; 1 min solo), synced race numbers, Thursday livestream with chat betting | 2021 | described | concept (2021) | NO |
| K10 | — | 2021 Kudoken signage/race ads as in-world "period fixtures" in Kudoken Meadows | Meadows README | described | — | NO (could be trackside signs) |

### 3. Riders / dogs / characters
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| C1 | — | **Mystery Drone Pilot replaces Ruch** (see A3) | #3 (Sep 18 HST) | described + locked art | canon | **NO: Ruch still in build ⚠** |
| C2 | — | ShockBot replaces Buff Bro Bot | #3; `1ce0c45` | detailed spec | canon | YES |
| C3 | — | ShockBot canon look: silver, turquoise necklace, leopard fedora + sunglasses; Hawaiian shirt/gold chain only as the "Save the Dogs" song skin | #3; `4f8232e`; SHOCKBOT.md | detailed spec | PR #4 Hawaiian pack ⚠ | YES (v2 art) |
| C4 | V67/V75 | MJ_SHOCKBOT_ROSTER_V67 / MJ_SHOCKBOT_ART_V75 contracts; ShockBot full-body in selection and results | LATE; V87 | described | — | PARTIAL (no results full-body) |
| C5 | — | Rider FRONT Gate 1 art for all 8 (see A6) | #3; PHOTO_LOCK_NOTES | locked art | — | PARTIAL (7 of 8 in FRONT; MDP missing) |
| C6 | — | Custom rider face portraits in picker and results (see A6) | #3; BIBLE §13.4 | described | — | NO (SVG placeholders) |
| C7 | — | Canonical dog select portraits, 512², light-blue backdrop, all 8 dogs | GitHub main `cff91e6` `art/select/dogs/` | assets exist | — | NO |
| C8 | V68/V87 | 8 transparent FRONT dog cutouts; colored torso placeholder removed | LATE; V87 | described (bytes lost) | — | NO (drawn bodies + portrait heads) |
| C9 | V88 | Lightweight FRONT dog-face fallback when heavy masters aren't decoded | V88 | described | — | PARTIAL |
| C10 | V30–V33 | Penny + Monkey Jockey production SIDE pair frames (4 frames) embedded | V33N | described (bytes lost) | — | PARTIAL (Penny/MJ gallop rig from Claude prototype, #10) |
| C11 | — | Full-body FRONT dog+rider running cycle | V33N/V87/V89 blockers | mentioned only (never finished) | — | NO |
| C12 | — | SIDE art for non-MJ riders | FACTORY/CONTRACT | gap | — | NO (none exists anywhere) |
| C13 | — | Standing full-body art (8 dogs, 8 riders) for podium/results | Sep 3 standing pack | assets exist | buff-bro-bot/ruch ⚠ | PARTIAL (dog SIDE sprites only) |
| C14 | — | Dog identity canon (8 dogs incl. Meatball; per-dog DOG_SCALE) | SPEC §7; REC | detailed spec | BIBLE R-001 had Meatball open | YES |
| C15 | — | Rider identity locks: Ipo, Erv, MJ, Nonna, Dinny, Fonk (outfits/colors) | #3; PHOTO_LOCK_NOTES | detailed spec | — | YES in FRONT art |
| C16 | — | "Brobots" listed as a rider | SPEC §8 | mentioned | ⚠ not in canon 8 | NO (correctly absent) |
| C17 | — | Rider list including Buff-Bro-Bot and Ruch | BIBLE R-002 | — | ⚠ superseded | — |
| C18 | — | Data-driven rosters from `/outletmall/meadows/data/riders.json` / `dogs.json`; real rescue dogs from FlashTown/Rooster Island | MALL | described | — | NO |
| C19 | — | 8 dogs × (4 SIDE frames + 1 TOP) = 40-asset ledger | BIBLE §13.5 | detailed spec | ⚠ TOP frame retired | PARTIAL |

### 4. Tracks / cameras
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| T1 | — | **Background plants/scenery** (see A5) | SCN; REC; SPEC §20 | detailed spec (no art) | poles/driveways ⚠ | PARTIAL |
| T2 | V66 | SIDE leader anchor at 75% of screen width, smoothing 0.08, clamp | SCN; LATE (MJ_SIDE_CAMERA_LEADER_ANCHOR_V66) | detailed spec | — | PARTIAL (~80%) |
| T3 | — | Parallax 3 layers 0.20/0.50/0.90 (spec suggests 7: road, grass, shrubs, mid forest, poles, horizon, sky) | SCN; SPEC §13 | detailed spec | poles ⚠ | PARTIAL (1 layer) |
| T4 | V32 | Basalt road edge | V33N | described | — | NO |
| T5 | V33/V82 | Wet-road depth bands clipped to the basalt road polygon; MJ_WET_BASALT_V82 | V33N; LATE | described | — | NO |
| T6 | — | Rainy visuals: rain streaks, wet sheen/reflections, overcast, restrained spray | SPEC §17 | described | — | NO (rain has no visuals, only a badge) |
| T7 | V84 | MJ_TRADE_WIND_V84 (wind motion) | LATE | mentioned only | — | NO |
| T8 | V86 | MJ_ROAD_MOTION_V86 (road scroll/motion) | LATE | mentioned only | — | PARTIAL (road dashes) |
| T9 | — | Race-day spectators / side-world props contracts | LATE; SCN; REC | mentioned only | — | NO |
| T10 | — | Contact shadows under teams | SPEC §13 | described | — | PARTIAL |
| T11 | — | FRONT = true front-facing art, Claude projection, finish gantry | #9; SPEC §14 | detailed spec | — | YES |
| T12 | — | TOP-DOWN retired | canon; #3 | — | canon | YES (dead code, flag off) |
| T13 | — | "Real rider-inclusive TOP" camera work | V33N | described | ⚠ TOP retired | NO (correct) |
| T14 | — | Side/Overhead toggle | BIBLE §13.4 | described | ⚠ TOP retired | NO (correct) |
| T15 | — | Locked tracks Rainforest Run 1400 m (Jan 1 2027) and Kīlauea Long Run 2100 m (Feb 14 2027) | SPEC §10 | detailed spec | — | YES |
| T16 | — | Course story: FlashTown/Rooster Island rainforest road over lava tubes | BIBLE §13.1; SPEC §10 | described | — | PARTIAL (text only) |
| T17 | — | Replay with SIDE/FRONT switching; camera persists between races | SPEC §25 | described | — | YES |
| T18 | — | 2021 track: dirt oval, lake infield, cartoon trees, waterfalls, volcanos, starting gate | 2021 | described | concept (2021) | NO |

### 5. UI / menus / screens
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| U1 | — | **Victory/podium screen + RUN IT BACK** (see A1) | BIBLE §13.4; SPEC §24 | detailed spec | — | NO |
| U2 | — | Celebratory results screen; raw dev/system log hidden from players | SPEC §18/§23 | described | — | NO (system log shown) |
| U3 | — | Palette lock: juicy blue #2AA8FF, basalt #4B5257, FP pink #E0517D, dark blue #102A5C, plum #35163F; no green menus | `design/UI-PALETTE.md` (`cff91e6`); SPEC §3 | detailed spec | — | NO (green/wood/cream palette) |
| U4 | — | Title lockup with the monkey-face mark beside "MONKEY JOCKEY" | UI-PALETTE; GitHub `art/brand/monkey-face.png` | assets exist | — | NO |
| U5 | — | Picker: 2×4 dog face tiles + 2×4 rider face tiles with stat lines, tap to pick, no dropdowns | BIBLE §13.4; SPEC §6 | detailed spec | — | PARTIAL (tiles exist; placeholder faces) |
| U6 | — | Race HUD: position, progress, leader, active event, weather icon | SPEC §18 | described | — | PARTIAL |
| U7 | V87–V89 | Intro escape by click/touch/keyboard; ENTER dismisses at once; 180 ms transition; deferred art warmup | V87, V88, V89 | detailed spec | — | PARTIAL (ENTER works) |
| U8 | — | Intro state machine BOOT → INTRO_READY → INTRO_PLAYING → SETUP with timeout | SPEC §5 | detailed spec | — | NO |
| U9 | V134 | `?mjdiag=1` diagnostics panel (pulse, suspension, parity error, camera, renderer state) | V134 | detailed spec | — | NO |
| U10 | — | Asset preloading; Start Race enabled only when the team is valid and assets are ready | SPEC §30 | described | — | NO |
| U11 | — | Weather + seed selectors on the menu | SPEC §6 | detailed spec | — | YES |
| U12 | — | Locked tracks shown as intentionally unavailable | SPEC §10 | described | — | YES |
| U13 | — | REPLAY / CHANGE TEAM | base | — | — | YES |
| U14 | — | Rankings / results table | BIBLE §13.4 | described | — | YES |
| U15 | — | Must keep "MONKEY JOCKEY", the tagline, and a link back to /outletmall/meadows/ when mounted in the mall | MALL | detailed spec | — | NO (standalone) |

### 6. Audio / video
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| A1 | — | **Soundtrack**: Volcano Jockey.mp3 cut/looped for menu and race (see A2) | START-HERE; manifest | described | — | NO (file missing) |
| A2 | — | **New intro video with music before ENTER** (see A4) | BIBLE §13.4, R-017; START-HERE | described | — | NO |
| A3 | — | Audio layers: race start, ambience, footsteps, weather, finish, podium cues | SPEC §27 | described | — | NO |
| A4 | — | Central audio manager + mute control | SPEC §27 | described | — | NO |
| A5 | V88 | Audio unlock on first gesture preserved through intro dismissal | V88 | mentioned only | — | NO |
| A6 | V33 | `mj-title-v33.html` (5.05 MB) standalone title/intro page | RECOVERY-INVENTORY | mentioned only | — | NO (bytes lost) |
| A7 | — | Menu video reels (road-loop, ghostbuster-loop) | base | — | — | YES |
| A8 | — | Claude build "monkey-jockey-4-audio-intro.zip" (11.67 MB) with intro/audio | START-HERE | described | — | NO (bytes lost) |
| A9 | — | Opening: monkey barely holding on, logo reveal, track music | 2021 | described | concept (2021) | NO |

### 7. Economy / progression
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| E1 | — | 3 consecutive wins → free Fruity Puppy jar eligibility (conservative counting; ops rules open) | BIBLE §13.4, R-014; SPEC §26 | described | — | NO |
| E2 | — | Win streak counter persisted locally | SPEC §26 | described | — | NO |
| E3 | — | KDU rewards / mall tickets (see K1–K3) | BIBLE; MALL | described | — | NO |
| E4 | — | Award/payout ceremony after each race | 2021 | described | concept (2021) | NO |

### 8. Mobile
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| M1 | — | Landscape-first 16:9 layout, safe areas, no scrolling while racing | SPEC §28 | described | ⚠ our build is tuned for portrait phones | PARTIAL |
| M2 | — | Rotate-device prompt in portrait | SPEC §28 | described | ⚠ same (confirm with Jessie) | NO |
| M3 | V131–V133 | Android background/resume hardening (see G12, G13) | V132, V133 | detailed spec | — | NO |
| M4 | V88 | Heavy FRONT masters kept off the hot path; decode deferred | V88 | described | — | PARTIAL (webp ≤420 px) |
| M5 | — | "Phone game (Angry Birds-like)" framing | agent memory 2026-09-04 | mentioned only | — | — |

### 9. Other (packaging, process, integration)
| ID | Ver | Item | Source | Conf. | Conflict | In fixed? |
|---|---|---|---|---|---|---|
| O1 | V33 | Single self-contained index.html with embedded assets; Vercel/Netlify configs + deploy README | V33N | described | — | YES (`dist/monkey-jockey.html`) |
| O2 | V33 | PNG IHDR validation of embedded images | V33N | mentioned only | — | NO |
| O3 | — | Promotion gate checklist (8 teams in SIDE/FRONT, no TOP, no Buff Bro Bot, replay parity, mobile checks) | REC | detailed spec | — | Used in our tests |
| O4 | — | Canonical source package + asset ledger | BIBLE §13.5–13.6; REC | described | — | NO |
| O5 | — | Asset naming conventions | SPEC §39 | described | — | PARTIAL |
| O6 | — | Rig factory (`FACTORY.md`, `CONTRACT`, `tools/rig_cut.py`, rig.json) for SIDE gallop rigs | GitHub main `0d40ee1` | detailed spec | — | Used for Penny/MJ |
| O7 | — | Do-not-promote lines: Run18, Run32, the V22–V62 compatibility line; runnable patches v57–v62 exist (Library only) | REC; INC | mentioned only | — | N/A |
| O8 | V34–V36, V136–V146 | Later version numbers mentioned in the incident report, no feature notes | INC | mentioned only | untrusted | — |
| O9 | — | Outlet Mall mount at `/outletmall/units/arcade/monkey-jockey/` (Kudoken Meadows back lot) | MALL; Pink Commander doc §31 | detailed spec | — | NO |
| O10 | — | End-to-end acceptance test: Penny + ShockBot, Sunny then Rainy | SPEC | detailed spec | — | Partly run |
| O11 | — | GitHub → Vercel production path | #1, #2 | described | — | Test deploy live on Vercel |
| O12 | — | 10 lanes, 50-horse stable, horses as racers | 2021 | described | ⚠ superseded (8 dogs) | — |

---------------------------------------------------------------------

## PART C — COUNTS

**Catalog totals:**
- Total catalog items: **112 table rows** (G 20, K 10, C 19, T 18, U 15, A 9, E 4, M 5, O 12). The six must-finds in Part A are expanded versions of rows U1, A1, C1, A2, T1, C5/C6.
- Confidence: 28 `detailed spec`, 4 with locked art or assets on hand, 59 `described`, 16 `mentioned only`, 5 other (gap or base feature).
- Not in the fixed build (NO or PARTIAL): 80 rows. That includes a few "NO (correct)" rows for conflicting items such as TOP.
- `concept (2021)` rows: 8.
- ⚠ conflict rows: 13.

**Rebuildable now from specs plus on-box assets (no missing bytes):**
- Podium/Run It Back, photo finish, start sequence
- Results cleanup, palette/monkey-face title
- Picker faces (rider + dog portraits), MDP swap
- Procedural plants/parallax at 75%, rainy visuals
- Lifecycle latch/watchdog/diagnostics, renderer isolation
- Streak counter, MallTickets hook, rotate prompt

**Blocked on Jessie:**
- `Volcano Jockey.mp3`
- The newer intro video
- Any plant art she wants instead of procedural
- Rulings on landscape-vs-portrait and poles/driveways

## PART D — SOURCES CHECKED AND LIMITS
- **GitHub** `ozone503-maker/Monkey-Jockey`: every branch, issues #1–#3 and #6, PRs #4, #5, #7–#10 (all open), and the commit log to `7575c49` (Sep 20). Mirror: `/workspace/mj-deep-audit/raw/gh-clone.git`. Dumps: `/workspace/mj-later-versions/raw/`.
- **Google Drive:** only the 2021 MJ concept doc plus Kudoken 2021 docs/logo zip. No MJ audio, video or art.
- **Gmail:** no MJ build, soundtrack or victory emails. One brobots-space-academy MDP prototype PR (Sep 14).
- **/workspace and agent attachments:**
  - Monkey-jockey art/reference tree, audits, the FP Universe Bible, the mall README, the Sep 3 standing pack, and Fruity Puppy audio/video.
  - Every mp3 on the box was checked by hash, size and tag against Volcano Jockey.mp3; nothing matched.
- **Can't be reached:** the ChatGPT Library (V33 → V146 bytes, mj-title-v33.html, runnable v57–v62), the Claude `monkey-jockey-4-audio-intro.zip`, `04-AUDIO-SOURCE/Volcano Jockey.mp3`, and the character/dog RGBA packs named in START-HERE.
