# MONKEY JOCKEY

## MASTER PRODUCTION SPECIFICATION

**This README is the canonical production brief for Monkey Jockey.**

Build, repair, polish, and ship the game to match this document.

Treat the game as a finished entertainment product, not as a collection of disconnected features. Every system, visual decision, animation, camera, control, transition, and fallback must support one coherent experience.

Do not redesign Monkey Jockey into a generic racing game.
Do not invent substitute characters.
Do not replace working race logic simply because another implementation is easier.
Do not create duplicate race simulations for different cameras.
Do not declare the game complete merely because it compiles or loads.

The standard is: **a player can open the game, understand it instantly, choose a dog and rider, race, switch cameras, finish, see correct results, replay the same race, and immediately want to run another one.**

---

# 1. PRODUCT VISION

Monkey Jockey is a cinematic browser racing game set on the Big Island of Hawaiʻi.

It lives inside the Fruity Puppy Outlet Mall / Kudoken universe, but the game itself must stand on its own as a polished racing experience.

The race takes place on a narrow rural road through tropical rainforest and volcanic country around FlashTown Farm and Punahēle Street.

The atmosphere should feel like:

- a strange underground racing broadcast
- rural Hawaiʻi
- handmade arcade culture
- tropical weather
- dogs with real identities
- absurd riders treated with complete visual seriousness
- a real race engine underneath a playful world

The game should be funny because the premise is funny, not because the implementation looks cheap.

It should be beautiful without becoming sterile.
It should be weird without becoming incoherent.
It should be technically sophisticated without exposing machinery to the player.

**The player should feel like they discovered a real, impossible sport.**

---

# 2. NON-NEGOTIABLE CORE RULES

These rules override convenience.

1. There is **one authoritative race simulation**.
2. SIDE and FRONT are two visualizations of the same race state.
3. Camera switching must never restart, reseed, duplicate, accelerate, or otherwise alter the simulation.
4. Dog identity must remain consistent everywhere.
5. Rider identity must remain consistent everywhere.
6. ShockBot is a canonical rider and must use his canonical game identity.
7. Mobile landscape is a primary presentation target.
8. The opening screen must not freeze.
9. The FRONT camera must show genuine front-facing racers, not repurposed side or top-down art.
10. The SIDE camera must remain polished and cinematic.
11. Replay must reproduce the recorded race rather than generate a new outcome.
12. Results and podium placement must exactly match the authoritative race result.
13. Missing noncritical art must degrade gracefully instead of crashing the game.
14. Never use a noncanonical substitute character as a fallback.
15. Working deterministic race logic must be preserved unless a verified bug requires a narrowly scoped repair.

---

# 3. VISUAL IDENTITY

## Palette

The game uses a deliberate color language:

- juicy sky blue
- dark blue
- basalt grey
- Fruity Puppy pink
- plum purple

Use black sparingly where deep plum or dark blue creates a richer presentation.

Avoid generic neon-green game UI.

The visual system should feel saturated, juicy, tropical, and dimensional while retaining good contrast and readability.

## Interface character

UI should feel like a real game interface rather than a web form.

Use:

- large readable controls
- strong hierarchy
- visual states for selected / unselected / locked
- deliberate spacing
- tactile buttons
- clean race HUD
- obvious camera controls
- obvious Start / Replay / Run It Back actions

Avoid:

- dropdown-based character selection
- dense developer controls in production view
- browser-like form styling
- tiny text
- unnecessary modal stacks
- layout shifts during race

The MONKEY JOCKEY identity should include a monkey face as part of the branding.

---

# 4. COMPLETE PLAYER FLOW

The intended experience is:

1. Page loads.
2. Intro presentation appears immediately and reliably.
3. Intro media behaves correctly.
4. Player proceeds into race setup.
5. Player sees track, weather, seed, dog selection, rider selection, and camera options.
6. Player selects one dog.
7. Player selects one rider.
8. Selected team is visually obvious.
9. Player starts the race.
10. Race begins from one authoritative deterministic state.
11. SIDE camera presents the race.
12. Player may switch to FRONT at any time.
13. Player may switch back to SIDE.
14. Race continues without state discontinuity.
15. Finish line is reached.
16. Result is calculated once from the race state.
17. Photo finish appears when appropriate.
18. Finishing order appears.
19. Podium shows first, second, and third correctly.
20. Player can replay the same race.
21. Player can choose Run It Back and begin another race.

Every one of these transitions must work on mobile landscape without requiring a page refresh.

---

# 5. OPENING EXPERIENCE

The opening experience is part of the game, not a decorative splash page.

Requirements:

- load quickly
- never remain permanently frozen
- never block interaction after intro completion
- never start the race behind the intro
- never trap the player in an invisible state
- display a clear way to proceed
- preserve correct intro media behavior
- allow audio to behave intentionally
- avoid accidental overlapping audio

If intro video or audio cannot autoplay because of browser restrictions, present a clear user gesture to begin playback or enter the game.

No silent failure.

The intro state machine must have explicit transitions.

Recommended states:

`BOOT -> INTRO_READY -> INTRO_PLAYING -> SETUP`

Do not derive critical state only from media events that may fail to fire on all mobile browsers. Include a safe timeout / user-action path where appropriate.

---

# 6. RACE SETUP

The setup screen must expose the game cleanly.

Controls include:

- Weather
  - Sunny
  - Rainy
- Seed
- Track
- Dog
- Rider
- Start Race
- Camera preference where appropriate
- Change Team after a race
- Replay after a completed race

Character selection must use visual portrait cards.

Do not use dropdowns for dog or rider selection.

Selected dog and selected rider should each have an unmistakable active state.

Do not allow the Start Race action to proceed with an invalid or undefined team.

---

# 7. DOG ROSTER

The dogs are characters, not interchangeable tokens.

## Penny

- tan / yellow Lab-looking dog
- short coat
- white chest
- light or blue collar

## Beaux

- large dog
- white base coat
- dark / brindle patches
- both eyes / ears visibly patched
- white blaze
- white muzzle
- white chest
- folded ears
- larger than Ghostbuster

## Ghostbuster

- smaller than Beaux
- black-and-white
- both ears black
- large black patch over one ear / eye
- white blaze
- soft grey ticking
- not a Dalmatian

## Mike

- black pitbull-type dog
- white chest
- snout remains black
- folded ears

## Kira

- older brown / dark dog
- mature face
- softer folded ears
- amber eyes

## Noodle

- Spuds MacKenzie-type appearance
- white face / body
- upright pointy ears

## Diva

- brown pitbull-type dog
- sleek dark brown coat
- resembles Mike while remaining clearly distinct
- ears more upright than Kira

Dog identity must remain correct across:

- selection portrait
- SIDE run animation
- FRONT run animation
- HUD references
- finish state
- results
- podium
- replay

No frame in an animation should mutate coat markings, ear shape, muzzle shape, collar details, body size, or breed appearance.

---

# 8. RIDER ROSTER

Canonical riders include:

- Monkey Jockey
- Ipo
- Erv
- Dinny
- Brobots
- ShockBot

Additional canonical riders may be present in the existing data, but they must follow the same identity rules.

## ShockBot

ShockBot is a canonical Monkey Jockey rider.

Default game appearance:

- silver robot
- turquoise necklace
- clean neutral working-class wardrobe
- practical silhouette
- confident posture
- clearly robotic anatomy
- not superhero styling

ShockBot must look consistent in:

- selection portrait
- SIDE riding pose
- FRONT riding pose
- results
- podium
- replay

The default racing avatar does not use the gold Save the Dogs chain. That visual belongs to a separate music / song skin and is not the default game identity.

Do not substitute a different robot silhouette for ShockBot.

---

# 9. TEAM DATA MODEL

A race entrant is composed from separate dog and rider identities.

Minimum canonical identifiers:

`dogId`
`riderId`
`entrantId`

The entrant identity should be stable for the duration of a race and replay.

Mood, personality, commentary, highlights, and visual references must stay attached to the correct entrant.

Changing a rider must not silently change the selected dog.
Changing a dog must not reuse art belonging to another dog.

Seeded races must remain reproducible when all race-affecting inputs are the same.

---

# 10. TRACKS

## Active Track

### Punahēle Sprint

- distance: 900 m
- active / playable

The race begins near FlashTown / Rooster Island and travels along Punahēle Street toward Kīlauea through lava-tube country.

The course should visually communicate:

- narrow paved rural road
- dense ʻōhiʻa rainforest
- grass shoulders
- volcanic terrain
- strong vanishing point
- damp or sunlit asphalt depending on weather
- rural utility details
- Hawaiʻi atmosphere
- no stadium

This is a real-looking rural road transformed into an absurd racing venue.

## Locked Tracks

### Rainforest Run
- 1400 m
- unlock January 1, 2027

### Kīlauea Long Run
- 2100 m
- unlock February 14, 2027

Locked tracks should look intentionally unavailable rather than broken.

---

# 11. RACE ENGINE

Preserve the deterministic racing system.

The engine may include:

- seeded outcomes
- dog statistics
- rider statistics
- weather modifiers
- environmental events
- mood / personality
- highlights
- race logs
- finish order
- photo-finish detection
- replay data

The rendering layer must consume race state.

The rendering layer must not independently simulate race outcomes.

Recommended conceptual separation:

```
RaceEngine
  -> authoritative timeline / positions / events
  -> SIDE renderer
  -> FRONT renderer
  -> HUD
  -> finish detector
  -> replay
```

Never build:

```
SIDE race simulation
FRONT race simulation
```

There is only one race.

---

# 12. CAMERA SYSTEM

Production cameras are:

- SIDE
- FRONT

Camera selection changes presentation only.

The active camera may maintain its own interpolation / smoothing values, but never its own race progress or outcome.

Camera switching must be safe at any frame.

The following must remain unchanged when switching camera:

- race clock
- race distance
- racer positions
- event timing
- current leader
- stamina / stats
- finish order
- seed
- weather
- recorded highlights

---

# 13. SIDE CAMERA

The SIDE camera is the primary cinematic presentation.

The current visual target is a polished lateral racing shot.

## Framing

- dogs run toward screen-right
- scenery moves right-to-left
- focused / leading dog remains readable
- focused dog should sit approximately three-quarters across the useful race width
- leave visual space in front of the dog
- never pin the dog's nose to the right edge

## Motion

Use layered parallax.

Suggested layers:

1. immediate road texture
2. near grass / shoulder
3. shrubs / near trees
4. mid-distance forest
5. poles / roadside landmarks
6. distant rainforest / volcanic horizon
7. sky / weather

Foreground layers move faster than distant layers.

The background must communicate speed even while the camera tracks the dog.

Avoid a single flat image sliding behind the racer.

## Road

The road should feel physically grounded.

Support:

- asphalt texture
- wet sheen in rain
- edge lines only if environmentally appropriate
- subtle road variation
- believable contact shadows
- no floating feet

## Racer placement

Feet must meet the road consistently.
Rider must remain attached to the dog.
Dog scale should not pulse between animation frames.

---

# 14. FRONT CAMERA

The FRONT camera is a true front-facing racing camera.

Its purpose is to let the player see the dogs' faces and riders while maintaining the competitive race order.

The camera should feel like a tracking vehicle moving backward ahead of the pack.

## Required visual behavior

- dogs run toward the viewer
- dog faces are visible
- road recedes behind racers
- strong perspective vanishing point
- racers farther back appear smaller
- racers nearer the camera appear larger
- position order remains legible
- riders face forward and remain seated correctly
- road / lane relationships remain believable

## Prohibited FRONT shortcuts

Do not use:

- top-down sprites
- side sprites rotated toward camera
- portrait cards
- flat floating icons
- stretched SIDE frames
- dog heads pasted onto unrelated bodies
- placeholder circles
- distorted character thumbnails

If a proper front-facing asset is missing, use an explicit canonical fallback plan rather than silently converting unrelated art.

The FRONT camera must consume the exact same race state as SIDE.

---

# 15. DOG ANIMATION

## SIDE animation

Each dog should use a convincing running cycle.

Target:

- true profile
- facing right
- athletic running posture
- stable body size
- stable markings
- stable ear shape
- stable collar details
- feet contacting one believable ground line

Avoid:

- sliding
- moonwalking
- sudden scale changes
- limb duplication
- body morphing
- changing coat pattern
- changing breed shape

## FRONT animation

Front art must preserve:

- recognizable face
- correct ears
- coat markings
- muzzle
- body proportions
- size relationship to other dogs

The front cycle should sell forward motion toward the camera.

Small vertical body motion is acceptable if controlled and synchronized with stride.

---

# 16. RIDER ANIMATION AND RIGGING

Riders must appear physically connected to the dog.

The result should look absurd but mechanically believable.

Avoid:

- floating riders
- riders inside the dog body
- standing riders
- inverted riders
- backwards riders
- massive size changes
- feet / hands randomly detaching
- rider image lagging several frames behind dog position

Rider pose may react subtly to stride.

Anchor rider placement to stable dog rig points rather than arbitrary per-frame screen coordinates where possible.

For each dog / camera direction, maintain explicit attachment information.

---

# 17. WEATHER

## Sunny

Visual goals:

- warm Hawaiian daylight
- saturated but believable vegetation
- readable asphalt
- clear silhouettes
- natural shadows
- humid tropical atmosphere

## Rainy

Visual goals:

- wet asphalt
- subtle reflections
- richer / darker vegetation
- overcast sky
- rain atmosphere
- restrained road spray
- readable racers

Rain must not obscure gameplay.

Weather may affect engine behavior only through the established deterministic system.

Rendering code must not introduce unseeded gameplay randomness.

---

# 18. RACE HUD

The player should always understand:

- selected dog / rider
- current position
- race progress
- leader
- important race event
- finish state

Keep HUD visually quiet enough that the race remains the focus.

Do not expose raw development logs in production.

Useful HUD elements may include:

- position
- distance / progress
- camera toggle
- weather icon
- selected team identity
- race status

Avoid covering dogs with large interface panels.

---

# 19. START SEQUENCE

The beginning of the race should have anticipation.

A valid sequence may include:

1. racers staged
2. short ready state
3. start signal
4. movement begins
5. race clock begins

Do not allow racers to move before the authoritative engine enters the running state.

Do not let camera animation independently trigger race timing.

---

# 20. ENVIRONMENTAL STORYTELLING

Punahēle should feel specific.

Include appropriate detail such as:

- ʻōhiʻa forest
- ferns
- tropical roadside growth
- lava-country terrain
- wet basalt character
- utility poles
- rural road edges
- distant haze
- irregular vegetation
- road-side landmarks where useful

Avoid obvious continental-U.S. scenery that breaks Hawaiʻi identity.

Do not turn the environment into generic jungle wallpaper.

The road should appear to exist beyond the current camera frame.

---

# 21. FINISH

The finish must feel like a climax.

Requirements:

- visible finish line / finish marker
- authoritative crossing detection
- correct finishing order
- no racer teleports at finish
- no result screen before the finish event
- close finishes trigger photo-finish presentation where supported

The race result should be finalized once.

Do not recalculate winners separately for podium or replay.

---

# 22. PHOTO FINISH

For sufficiently close finishes:

- freeze or emphasize the decisive moment
- show the relevant racers clearly
- preserve actual authoritative position data
- do not fabricate a different visual winner
- transition cleanly into results

Photo finish is presentation, not a second result calculation.

---

# 23. RESULTS

Results must clearly show finishing order.

The selected team should be easy to locate.

Names and art must match the actual entrants.

Never display one dog with another dog's name.
Never display one rider with another rider's portrait.

Results should feel celebratory, not like a developer table.

---

# 24. PODIUM

Display:

- 1ST
- 2ND
- 3RD

The top three dogs and riders must exactly match race results.

Use canonical character art.

Include an obvious:

**RUN IT BACK**

action.

The podium should feel like the conclusion of the same visual world, not a separate template.

---

# 25. REPLAY

Replay uses the recorded race.

Replay must not reseed.

Replay must not create a new winner.

Replay may allow:

- SIDE
- FRONT
- camera switching
- highlights

All cameras remain synchronized to one replay timeline.

The exact event order and finish result must match the original race.

---

# 26. CONSECUTIVE WIN REWARD

The broader design supports a reward for three consecutive wins.

Rule:

`3 consecutive wins -> free Fruity Puppy jar eligibility`

Implementation must be conservative.

- increment streak only on a verified player win
- reset streak on a verified loss
- do not double-count replay
- do not count aborted races
- do not count duplicate finish callbacks
- do not trigger reward merely by refreshing results
- keep external fulfillment separate from race determinism

Never allow a visual-only replay to alter the win streak.

---

# 27. AUDIO

Audio is part of Monkey Jockey's personality.

Possible layers:

- intro / theme
- race start
- ambience
- footsteps / motion accents where tasteful
- weather
- finish
- result / podium cues

Requirements:

- no accidental overlapping music instances
- no restart on every component render
- no runaway audio loops
- clear mute / sound control
- respect mobile autoplay restrictions
- preserve a deliberate start / stop lifecycle

Audio state should be managed centrally.

---

# 28. MOBILE LANDSCAPE

Mobile is not a fallback target.

Treat mobile landscape as a primary game screen.

Requirements:

- gameplay fits within 16:9 intent where practical
- race controls stay visible
- camera controls stay tappable
- important UI respects safe areas
- no accidental vertical page scroll while racing
- no text hidden behind browser chrome
- no giant character cards
- no cropped dog heads
- no race canvas wider than the interactive viewport without deliberate handling

When portrait orientation is encountered, present a clean rotate-device / landscape treatment rather than a broken compressed race.

---

# 29. PERFORMANCE

Target smooth animation on normal mobile hardware.

Priorities:

- preload critical race assets
- decode images before race where possible
- reuse loaded assets
- avoid excessive DOM creation per frame
- animate with efficient transforms or canvas methods
- avoid layout thrashing
- do not repeatedly reparse large data structures in the animation loop
- keep race engine updates separate from expensive rendering work

Do not sacrifice character identity or major visual quality for micro-optimizations.

---

# 30. ASSET PRELOADING

Before Start Race becomes active, verify critical assets for the selected team and active camera set.

Critical assets include:

- selected dog SIDE frames
- selected dog FRONT assets
- selected rider SIDE art
- selected rider FRONT art
- required track background assets
- essential UI assets

If optional scenery fails, the game may continue with a canonical reduced scene.

If critical character art is unavailable, do not silently swap in a different character.

Expose a development warning and use only an approved canonical fallback.

---

# 31. FAILURE BEHAVIOR

The game must fail gracefully.

A missing decorative image must not destroy the race.

A failed audio file must not freeze the game.

A failed intro event must not permanently trap the user.

A missing optional effect must not stop finish detection.

Use explicit error boundaries / fallback paths where appropriate.

Log enough information during development to locate failures.

Do not expose noisy stack traces to normal players.

---

# 32. STATE MANAGEMENT

Keep major state domains separate.

Suggested domains:

- app / screen state
- setup selections
- race configuration
- authoritative race state
- camera state
- replay state
- audio state
- reward streak state

Avoid one giant mutable object where UI code can accidentally mutate race logic.

Camera state must not own race progress.

UI state must not be allowed to recalculate results.

---

# 33. DETERMINISM

Given the same:

- seed
- dog roster / stats
- rider roster / stats
- weather
- track
- engine version
- race-affecting configuration

the authoritative race should produce the same event sequence and result.

Visual interpolation may differ by frame rate, but outcome data may not.

Do not call unseeded `Math.random()` or equivalent inside gameplay logic if it affects the race.

Presentation-only effects may use nondeterministic variation only if they cannot alter race outcome or replay correctness.

---

# 34. CAMERA INTERPOLATION

Cameras may smooth positions for visual quality.

However:

- interpolate from engine state
- do not write smoothed visual coordinates back into engine state
- do not let camera lag alter finish timing
- do not let camera bounds alter racer positions
- do not let viewport width influence race outcome

Rendering follows simulation, never the reverse.

---

# 35. SCENE DEPTH

The race must feel spatial.

SIDE camera depth comes from parallax and layered environment motion.

FRONT camera depth comes from:

- perspective road
- racer scale
- overlap
- shadows
- atmospheric depth
- vanishing point

Do not fake depth using arbitrary per-racer size changes unrelated to race position.

---

# 36. CHARACTER SCALE

Relative character scale should remain stable.

Beaux should read as larger than Ghostbuster.

Dogs should not become larger simply because a different animation frame was exported at a different crop.

Normalize sprite bounds and anchor points.

Character art preprocessing should account for transparent padding.

---

# 37. CHARACTER ANCHORS

Each animated asset should use predictable anchors.

Recommended conceptual anchors:

- ground / paws
- dog center
- shoulders
- rider seat
- head reference

Do not anchor every frame by raw image top-left.

Transparent whitespace must not cause visible bouncing.

---

# 38. ART INTEGRATION

New art must be integrated deliberately.

For every character asset:

1. verify identity
2. verify orientation
3. verify transparent background
4. trim / normalize bounds
5. assign canonical filename
6. map to character ID
7. define anchor
8. test at runtime
9. verify mobile scaling
10. verify opposite camera does not accidentally reuse it

Do not import image files and assume naming alone is sufficient.

---

# 39. FILE NAMING

Use predictable names.

Example pattern:

```
assets/
  dogs/
    penny/
      side-01.png
      side-02.png
      side-03.png
      side-04.png
      front.png
    beaux/
    ghostbuster/
    mike/
    kira/
    noodle/
    diva/

  riders/
    shockbot/
      side.png
      front.png
```

If the repository already uses a different organized structure, preserve it rather than creating duplicate asset trees.

The goal is one canonical location per asset.

---

# 40. NO DUPLICATE CANON

Before adding a new constant, asset, roster, or configuration object, search the repository.

Do not create:

- a second dog roster
- a second rider roster
- a second camera enum
- a second race engine
- a second track configuration
- duplicate ShockBot definitions
- duplicate reward logic

Refactor toward one source of truth where practical.

---

# 41. DEBUGGING ORDER

When something is visually wrong, diagnose in this order:

1. Is authoritative race state correct?
2. Is the correct character ID selected?
3. Is the correct asset mapped?
4. Is the anchor correct?
5. Is the camera transform correct?
6. Is CSS / canvas scaling correct?
7. Is there stale fallback logic?
8. Is cached or duplicate code overriding the canonical path?

Do not rewrite the engine to fix a rendering problem.

---

# 42. INTRO FREEZE DIAGNOSTICS

If the opening screen freezes, inspect:

- media promise rejection
- missing `ended` event
- autoplay restriction
- unresolved preload promise
- intro state never advancing
- z-index overlay intercepting taps
- disabled pointer events
- race app mounted behind intro
- exception during asset initialization
- stale service worker / cached bundle
- conditional code waiting for an asset that never resolves

A robust intro must have both normal completion and safe user-controlled escape to setup.

---

# 43. FRONT CAMERA DIAGNOSTICS

If FRONT looks wrong, inspect:

- accidental top-down renderer reuse
- SIDE sprite reuse
- wrong asset key
- incorrect perspective scaling
- stale camera mode constant
- old placeholder art
- dog body anchor errors
- rider front pose missing
- z-order
- road projection
- viewport transform
- fallback path selecting unrelated images

Do not conceal a bad FRONT camera with UI.

Fix the visual source.

---

# 44. SIDE CAMERA QUALITY CHECK

SIDE should pass all of these:

- focused dog has room ahead
- dog is not pinned to right wall
- scenery moves right-to-left
- road feels grounded
- parallax reads at race speed
- vegetation has depth
- dog stride does not slide
- rider remains attached
- lead changes remain visually understandable
- weather looks integrated
- HUD does not block racers

---

# 45. FRONT CAMERA QUALITY CHECK

FRONT should pass all of these:

- dogs clearly face viewer
- faces recognizable
- road vanishes into distance
- far racers smaller
- near racers larger
- riders face forward
- dogs do not look like cards or stickers
- actual race order readable
- switch from SIDE causes no state jump
- switch back to SIDE returns to the exact same race moment

---

# 46. TEST MATRIX

At minimum test:

## Browsers

- Chrome desktop
- Chrome Android / equivalent mobile Chromium
- Safari iPhone if available
- another modern desktop browser if available

## Orientations

- mobile landscape
- desktop widescreen

## Weather

- Sunny
- Rainy

## Camera

- SIDE entire race
- FRONT entire race
- switch SIDE -> FRONT
- switch FRONT -> SIDE
- repeated switching during race

## Character

Test every dog.

Test ShockBot specifically in:

- selection
- SIDE
- FRONT
- finish
- podium
- replay

Test multiple other riders to ensure mappings are not globally hardcoded.

---

# 47. REQUIRED END-TO-END TEST

Before declaring a production pass complete:

1. Hard reload.
2. Confirm intro renders.
3. Confirm intro can finish / be entered.
4. Choose Punahēle Sprint.
5. Choose Sunny.
6. Select Penny.
7. Select ShockBot.
8. Start race.
9. Watch SIDE for at least several seconds.
10. Confirm focused dog framing.
11. Switch to FRONT.
12. Confirm Penny is recognizably Penny.
13. Confirm ShockBot is recognizably ShockBot.
14. Confirm race position did not jump.
15. Switch back to SIDE.
16. Finish race.
17. Confirm result.
18. Confirm podium matches result.
19. Replay.
20. Confirm replay winner and event order match.
21. Run It Back.
22. Choose another dog.
23. Choose Rainy.
24. Start again.
25. Confirm second race initializes cleanly without stale state.

---

# 48. ACCEPTANCE CRITERIA

A build is ready only when all of the following are true:

- opening screen does not freeze
- setup works
- visual dog selection works
- visual rider selection works
- ShockBot appears correctly
- SIDE is polished
- FRONT is truly front-facing
- camera switching is synchronized
- deterministic race logic remains intact
- finish works
- photo finish works when triggered
- results are correct
- podium is correct
- replay reproduces the race
- Run It Back works
- mobile landscape is usable
- no critical console errors
- no missing required character assets
- no duplicate race simulation
- no accidental character substitution

---

# 49. IMPLEMENTATION DISCIPLINE

When making changes:

1. inspect the existing code first
2. identify the authoritative implementation
3. make the smallest coherent change that moves the game toward this specification
4. preserve working systems
5. test immediately
6. remove obsolete competing paths when safe
7. keep commit messages specific
8. do not leave temporary placeholders in production paths
9. do not merge a visual repair that breaks determinism
10. do not merge engine changes to solve a purely visual problem

The preferred pattern is deliberate integration, not repeated patch stacking.

---

# 50. REPOSITORY ROLE

This repository contains the production source of Monkey Jockey.

Supporting documentation may describe art generation, rigs, or implementation contracts.

This README defines the finished game experience.

When another document conflicts with this README on product identity, camera behavior, character canon, or player experience, use this README unless a newer explicitly approved canonical specification supersedes it.

---

# 51. FINAL CREATIVE DIRECTION

The finished race should feel like this:

A narrow Hawaiian road disappears into dense rainforest and volcanic country. Dogs explode off the line carrying impossible riders. The camera locks onto them like a real sports broadcast. The asphalt moves fast beneath their feet. Trees, poles, grass, mist, and wet road detail slide through layers of depth. The SIDE camera makes the race feel fast and beautiful. The FRONT camera drops ahead of the pack and suddenly the dogs are charging directly toward the viewer, faces visible, riders holding on, the road narrowing into the rainforest behind them. Weather changes the atmosphere without hiding the action. The finish arrives with actual tension. A close race deserves a photo finish. The correct dogs and riders climb the podium. The player sees RUN IT BACK and immediately wants another race.

Nothing should feel generic.

Nothing should feel like a placeholder.

Nothing should feel like two separate games stitched together.

The simulation, cameras, dogs, riders, scenery, sound, and interface should all feel as though they were designed together from the beginning.

**MAKE MONKEY JOCKEY FEEL LIKE MONKEY JOCKEY.**
