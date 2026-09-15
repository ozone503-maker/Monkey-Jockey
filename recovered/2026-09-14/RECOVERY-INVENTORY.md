# Monkey Jockey recovery inventory — 2026-09-14

This folder was created to stop production history from living only in the ChatGPT Library.

## Recovered into GitHub now

- `00-START-HERE.md` — authoritative consolidation/branch rules.
- `FRONT-CAMERA-MERGE-MAP.md` — source-file map and FRONT integration contract.
- `CONSOLIDATION-MANIFEST.json` — source archive hashes and production camera status.
- `BUILD-NOTES-PROD-FRONT-V33.txt` — latest complete persisted Production FRONT build notes found during recovery.
- `QA-PROD-FRONT-V33.json` — V33 QA record; all checks passed.

## Important Library artifacts located

The ChatGPT Library contains a much larger Monkey Jockey history than the GitHub repo previously showed, including:

- `/Monkey Jockey/CONSOLIDATED/2026-09-08/PRODUCTION-FRONT-V1` through at least `PRODUCTION-FRONT-V35` folder names.
- `PRODUCTION-FRONT-V33/index.html` — 19,405,362-byte self-contained runtime.
- `MONKEY-JOCKEY-PRODUCTION-FRONT-V33.zip` — 14,517,254-byte deploy package.
- `mj-title-v33.html` — 5,054,997 bytes.
- `/Monkey Jockey/PATCHES/2026-09-08-runnable-v57` through `v62` were also located.
- `/Monkey Jockey/monkey-jockey-1.zip` — 2,242,624 bytes.
- `/Monkey Jockey/monkey-jockey-dog-pack-1.zip` — 16,608,439 bytes.
- `/Monkey Jockey/tue-0900-monkey-jockey-front-camera-all.zip` — 5,676 bytes.
- Current ShockBot / rider reference images from 2026-09-14 are also present in the Library.

## What is actually authoritative

The recovered consolidation rule says the production base is the consolidated Claude game source plus Claude FRONT projection. It explicitly says **do not promote the V22–V62 compatibility derivative lineage** over that production base. This matters because a high version number by itself does not make a build canonical.

The latest complete persisted authoritative Production FRONT package located so far is **V33**. Its QA record reports `all_pass: true` and a 19,405,362-byte self-contained `index.html`.

`PRODUCTION-FRONT-V35` exists as a Library folder name but was empty when checked during this recovery pass. V32 was also documented as an empty Library folder and was reconstructed when V33 was built.

## Large-file recovery status

The current GitHub connector can write UTF-8 repository files, but the ChatGPT Library binary/materialization path returned HTTP 403 when attempting to copy the ZIP source archives into the working container. The 19 MB self-contained HTML also cannot be safely reconstructed from snippets. Therefore these large artifacts have **not** been falsely claimed as copied.

They remain preserved in the ChatGPT Library and are listed here by exact name/path/size so they are not lost or confused with older branches. The next recovery step is to copy the exact V33 runtime/package bytes into GitHub when a binary-capable transfer path is available, rather than rebuilding them from partial text.

## Current production changes after recovery

Newer repo-side design contracts remain active on top of the recovered history:

- ShockBot replaces Buff Bro Bot; default/canonical game identity is silver robot + turquoise/mineral necklace. Save the Dogs Hawaiian/gold-chain styling is a song skin, not default canon.
- Production cameras are SIDE + FRONT-FACING; top-down remains retired.
- SIDE camera should track the lead dog around 75% of viewport width with smooth following and right-to-left layered parallax scenery.
- Do not change race engine determinism to implement presentation work.
