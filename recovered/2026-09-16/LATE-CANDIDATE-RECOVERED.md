# Monkey Jockey — late executable candidate recovered

A later executable runtime has now been recovered from the ChatGPT Library instead of inferred from QA metadata.

Source Library file: `index(20260915-162152).html`

- bytes: `20,512,770`
- SHA-256: `302285ce5637562beb9b49655e312970eb5294158844c6977b9d19fed5593bf7`
- self-contained HTML

Static inspection of the actual executable confirms:

- frozen replay weather contract present (`weatherSnapshot`)
- separate `trackEventMult` and `raceVarianceMult` domains present
- `entrantId` architecture present
- ShockBot roster contract `MJ_SHOCKBOT_ROSTER_V67` present
- ShockBot art lock `MJ_SHOCKBOT_ART_V75` present
- no `buff-bro-bot` runtime ID in the executable
- eight FRONT dog transparency contract `FRONT_DOG_TRANSPARENT_V68` present
- SIDE leader camera contract `MJ_SIDE_CAMERA_LEADER_ANCHOR_V66` present with `leaderScreenX:0.75`
- later SIDE/Punahēle presentation contracts present through at least V86 (`MJ_ROAD_MOTION_V86`, `MJ_WET_BASALT_V82`, `MJ_TRADE_WIND_V84`, race-day/spectator/side-world contracts)
- no external `<script src>` and no runtime `fetch()` call found by static audit

This is materially stronger evidence than the previous QA-only V75 finding because the executable bytes themselves are now recovered and fingerprinted.

## Important status

Treat this as the current **CANON CANDIDATE**, not an unquestioned final canon, until visual/runtime acceptance is performed. Do not replace it with an older V33 or a compatibility-line file merely because of naming/version confusion.

Production cameras remain SIDE + FRONT. TOP is legacy/source-only.

A portable candidate package was also generated from these exact bytes with `vercel.json`, `netlify.toml`, README, and recovery QA. The executable itself is not committed here in this step because it is ~20.5 MB and the connector's normal text-file contents path is not an appropriate binary/large-runtime transfer mechanism.
