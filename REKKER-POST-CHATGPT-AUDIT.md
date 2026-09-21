# Rekker post-ChatGPT audit — Monkey Jockey

**Auditor:** rekker audit worker (Grok Bot)  
**Date:** 2026-09-21 ~07:55 HST (PT / Pacific/Honolulu)  
**Repo:** `ozone503-maker/Monkey-Jockey`  
**Against `main` tip:** `7575c49babe6d29dae8b9b0559acb218a1b422da` — *Add ChatGPT incident report for Rekker*  
**Incident report (untrusted as diagnosis):** `CHATGPT-INCIDENT-REPORT-FOR-REKKER.md` @ that commit  
**Blob SHA / size:** `0e114869bcd9559023e6b4dc81bf351297d62169` / **6135** bytes  
**Issue:** #6  
**Scope:** AUDIT ONLY — no race physics / runtime / art “fixes.” ChatGPT claims treated as untrusted unless independently proven by path/SHA/size in this repository.  
**Method:** GitHub remote reads only (`gh` API + GitHub MCP). **No `git clone`.** No invention of runtimes or hashes. No `MONKEY-JOCKEY-CANON` tag.

---

## Executive verdict (what Jessie can still trust)

| Trust object | Verdict |
| --- | --- |
| Exact runnable game bytes on GitHub `main` | **ABSENT.** No `index.html`, no `.js` race sources, no `.zip` packages in any commit tree inspected on this repo’s history. |
| Can `main` run E2E today? | **NO.** |
| Production FRONT V33 as “latest complete *described*” package | **Notes-only** on GitHub. Recorded size **19,405,362** bytes / QA `all_pass: true` — bytes **not** in repo. |
| V34–V36 / V87–V146 / MASTER V87–V89 / V125–V134 | **Docs-only recovery narratives** on `main`. Claimed HTML sizes exist in notes; **zero** corresponding blobs in GitHub. |
| `FACTORY.md` / `CONTRACT.md` / `design/SIDE-CAMERA-SCENERY.md` / `reference/SHOCKBOT.md` (turquoise lock on `main`) | **Still trustworthy as contracts / intent locks** (text on `main` with stable blob SHAs). They do **not** prove a working game. |
| ChatGPT master `README.md` @ `9f99ed0` (31,625 bytes) | **Untrusted as runtime truth.** Speculative requirements mixed with recovery claims. Treat as ChatGPT prose, not proven build state. |
| Claude FRONT + SIDE stride systems Jessie loved | **Not present as executable bytes in this GitHub repo.** Described in consolidation notes + merge map; materialization claimed in ChatGPT Library only. See dedicated section. |
| ShockBot vs Buff Bro | **Canon text on `main` says ShockBot replaces Buff Bro.** No runtime to prove display. Gate 1 turquoise art is on **PR #5**, not `main`. Hawaiian sheet pack is on **PR #4** (merge risk). |
| Prior rekker audit (PR #7 / `REKKER-AUDIT-2026-09-16.md`) | **Still true** on the hard facts (V33 bytes absent; no E2E; TOP retired in contracts). **Needs update** for post-`5b3de93` ChatGPT doc cascade through `7575c49`, and PR tip SHA drift on #5. |

**Bottom line for Jessie:** Trust the **contracts and ShockBot identity lock on `main`**, and the **honest inventory that the game binary never landed in GitHub**. Do **not** trust ChatGPT version ladders (V33→V146, Production FRONT V34–V36, MASTER V87+) as proof that a playable build exists here. The Claude-era FRONT camera + SIDE stride tech Jessie remembers is **documented as Library/consolidation paths, not recoverable from this repo’s blobs.**

---

## 1. Build lineage: docs vs runnable bytes

### 1.1 What `main` actually contains (tip `7575c49`)

Recursive tree on `main`: **37 blobs**. Categories:

- **Contracts / desk:** `FACTORY.md` (7445, `447691f396e89093149804274a36141ad8e1deb7`), `CONTRACT.md` (1200, `b83499d8cba1df814b3d589bda200cff6f66b83f`), `REKKER.md`, `CANONICAL-RECOVERY-README.md` (6727, `86796ef8b781cc21dd3ca8fa595877d801ae3a0d`)
- **ChatGPT docs:** `README.md` (31625, `68c637ef34f89d0497f91737b6f3c0057afb86c5` from commit `9f99ed0`), incident report, `docs/V133-*.md`, `docs/V134-*.md`, many `recovered/**` notes
- **Select/brand art only:** eight dog portraits under `art/select/dogs/*.png`, `art/brand/monkey-face.png`, `art/select/contact-sheet.jpg`, `portraits.json`
- **Design:** `design/SIDE-CAMERA-SCENERY.md` (2878, `412d32c1cc080ade82feef73b497d69d388008b7`), `design/UI-PALETTE.md`
- **Deploy stub:** `vercel.json` (41 bytes) — `{"cleanUrls":true,"trailingSlash":false}` — **no app entrypoint**

**Executable hunt (proven absent):**

| Pattern | On `main` tip | On any of 6 historical trees sampled¹ | On open PR branch trees |
| --- | --- | --- | --- |
| `index.html` / `*.html` | none | none | none |
| `*.js` race sources | none | none | none |
| `*.zip` packages | none | none | none |
| `js/render.js` / `drawSide` / `drawFront` source | none | none | none |

¹ Sampled trees: `e91a1a8`, `0d40ee1`, `e3c9177`, `07be3a8`, `9f99ed0`, `7575c49`. Full commit list on `main` is 25 commits; **every** commit message is docs/recovery/art/config — none claim adding a runtime binary, and trees corroborate absence.

**Tags:** none (`[]`). **No `MONKEY-JOCKEY-CANON`.**

### 1.2 Version ladder (claimed vs in-repo)

| Label | Where claimed | Runnable bytes in GitHub? | Evidence class |
| --- | --- | --- | --- |
| **Production FRONT V33** | `BUILD-NOTES-PROD-FRONT-V33.txt`, `QA-PROD-FRONT-V33.json`, `RECOVERY-INVENTORY.md` | **NO** | Notes: `index_bytes: 19405362`; Library path `PRODUCTION-FRONT-V33/index.html`; zip `MONKEY-JOCKEY-PRODUCTION-FRONT-V33.zip` 14,517,254 — **not copied** (inventory cites prior HTTP 403) |
| **V34–V36** | ChatGPT incident (§2, §33–34) | **NO** | Incident self-describes unverified jump; **no** `recovered/*V34*` / `*V35*` / `*V36*` files on `main`. Inventory: V35 Library folder was **empty** when checked |
| **V87–V89 MASTER** | `recovered/2026-09-17/MASTER-V87-STAGED.md`, `…V88…`, `…V89…` | **NO** | V88 notes claim `Monkey-Jockey-MASTER-V88.html` **20,748,153** bytes — file **not** in repo |
| **Late ShockBot candidate** | `recovered/2026-09-16/LATE-CANDIDATE-RECOVERED.md` @ `07be3a8` | **NO** | Claims Library `index(20260915-162152).html` **20,512,770** bytes, SHA-256 `302285ce5637562beb9b49655e312970eb5294158844c6977b9d19fed5593bf7` — **explicitly not committed** |
| **V125 / V132 / V133 / V134** | `recovered/2026-09-19/*`, `docs/V133-*`, `docs/V134-*` | **NO** | Docs only; V133 cites local artifact name `MONKEY-JOCKEY-RECOVERY-V133` not present |
| **V136–V146** | Incident report only | **NO** | No matching files under `recovered/` or `docs/` on `main` |

**Hypothesis (labeled):** ChatGPT’s “builds” after mid-September lived outside GitHub (Library / local packages). GitHub was used as a **documentation ledger**, not a binary store. That would explain confident V-numbers with zero matching blobs.

### 1.3 Consolidation hashes (external zips — not in repo)

From `recovered/2026-09-14/CONSOLIDATION-MANIFEST.json` (blob `032b057a313c3557aa435679a7f9d3fa64e03856`, commit `60552b6`):

| Source zip (Library / external) | Recorded bytes | Recorded sha256 |
| --- | ---: | --- |
| `monkey-jockey-4-audio-intro.zip` | 11,665,530 | `238ad5199e6b357897291659bc8a4f9d07a493e1306e60bac59c0723a64c5595` |
| `tue-0900-monkey-jockey-front-camera-all.zip` | **5,676** | `7ec617f4b2854c163515aafb0f1d3f94a62b6aca5400ddcb9645218fb0019cd0` |
| `monkey-jockey-character-pack.zip` | 28,680,072 | `4b6bbad06a79971f6f1441a67e9bd8e947fee8cef5228f3fd4909a371adc6d77` |
| `dog-monkey-jockey-dog-pack.zip` | 10,403,336 | `f57ee15bda25e0c82342b49791c93381785ad73f0130e63d304387e25f2085a0` |
| `mj-dogs-rgba-run-v6-1.zip` | 13,771,356 | `03b1bd1582e8295c7bb16e2fd3d98af67f76d496e60e4c5f28cefff70a9ce798` |

**These zip bytes are not in this GitHub repository.** Hashes above are **as recorded in the JSON**, not re-hashed from files we possess.

`do_not_promote`: Run18, Run32, V22–V62 compatibility derivative lineage.

---

## 2. Can `main` run E2E?

### **NO.**

**Evidence:**

1. No HTML/JS/ZIP entrypoint on `main` tree (37 blobs; list in §1.1).
2. `vercel.json` only sets URL hygiene — nothing to serve as a game.
3. Prior rekker audit PR #7 (`eb7bffb9ba17345c31033d4ce56d6948a6278682`) already concluded the same against `5b3de93`; post-cascade commits through `7575c49` added **more docs only**, not bytes.
4. Static checks cited in ChatGPT QA JSON (`node_syntax`, `http_200`, `zip_integrity`) are **not reproducible from this repo** because the artifacts they describe are absent.

There is nothing to open → select → race → SIDE → FRONT → finish on `main`.

---

## 3. ShockBot vs Buff Bro; turquoise vs Hawaiian; Gate 1

### 3.1 Canon on `main` (text)

| Commit | Message | Role |
| --- | --- | --- |
| `1ce0c45bb1a1a0a214035af76aa6805ff0fe45b7` | Lock ShockBot rider identity and FRONT production requirements | Adds `reference/SHOCKBOT.md` |
| `4f8232e9e642a3834fa279d39067c6b0cfb86280` | Clarify canonical ShockBot avatar vs Save the Dogs skin | Turquoise/neutral default; Hawaiian/gold = song skin |

Current `reference/SHOCKBOT.md` on `main`: blob `a698744766072bfac3b61fdd66b694a3bfd0b39d`, **2395** bytes — “Replaces Buff Bro Bot”; turquoise necklace required; Hawaiian not default.

**Runtime proof of ShockBot on screen:** **UNKNOWN / impossible from GitHub** — no executable.

**Buff Bro string in runtime:** **UNKNOWN** (no runtime). Code search API returned empty (likely unindexed / no code files). Cannot claim Buff Bro is gone from a binary that is not here.

### 3.2 Open PRs (identity art)

| PR | Branch | Tip SHA | Mergeable | Contents vs ShockBot canon |
| --- | --- | --- | --- | --- |
| **#4** | `phase-b-shockbot-identity` | `a7bb0df211fbe0ddf2d643483cba468a57755a50` | **false / dirty** | Hawaiian character-sheet pack: `shockbot_character_sheet.png` (2,087,586), face/front extracts; **older** `reference/SHOCKBOT.md` rewrite (1592 bytes, blob `10112522dbaa…`) — **merge risk: song skin as default** |
| **#5** | `phase-b-shockbot-gate1-turquoise` | `4067263680b01e3645a567985435cdcf549f25d1` | **true / clean** | Gate 1 turquoise: `art/shockbot_gate1_preview.png` **349,785** bytes, blob `ac6a0c99834f8a0bfc1fa34ae20f80b319200122`; `art/shockbot.png` 257,312 (`d0c870f607fb…`); `out/shockbot.rig.json` 435,813; `out/shockbot.proof.png` 280,735; params + status docs. **Not on `main`.** |
| **#7** | `rekker-issue-6-recovery-audit` | `eb7bffb9ba17345c31033d4ce56d6948a6278682` | **true / clean** | Prior rekker audit docs only |

**Note:** Prior audit cited PR #5 tip `5f61262…`; current tip is `4067263680b0…` (branch advanced; Gate 1 preview blob SHA **unchanged** `ac6a0c99834f…`).

---

## 4. TOP-DOWN resurrection

### Contracts say retired

- `FACTORY.md`: “TOP-DOWN is retired”
- `CANONICAL-RECOVERY-README.md`: “TOP-DOWN / OVERHEAD IS RETIRED”
- `CONSOLIDATION-MANIFEST.json`: `top_down_status: retired-production-legacy-only`
- `FRONT-CAMERA-MERGE-MAP.md`: retire `drawTop(...)` from player-facing production
- `00-START-HERE.md`: top-down retired; not a production blocker

### Contradictory / resurrection signals (docs, not code)

| Signal | Location | Assessment |
| --- | --- | --- |
| Incident §17–18 | ChatGPT incident | ChatGPT **admits** resurrecting TOP/overhead as concern and calling missing TOP costume a blocker |
| V33 build notes still list current-costume TOP-DOWN replacement as **REMAINS / BLOCKERS** | `BUILD-NOTES-PROD-FRONT-V33.txt` | Legacy note preserved; conflicts with retirement rule if treated as active work |
| QA flag `real_rider_top: true` | `QA-PROD-FRONT-V33.json` | Shows TOP still in V33 QA vocabulary |
| V89 hotfix: “retired TOP-camera compatibility assertions still throwing” | `MASTER-V89-HOTFIX.md` | Implies staged runtimes still carried TOP assertion paths (bytes not in repo) |
| Master README @ `9f99ed0` | diagnostics mention “accidental top-down renderer reuse” | Spec language; not proof TOP was re-enabled in a GitHub binary |

**Verdict:** On GitHub, TOP is **retired in contracts**. There is **no code** here to resurrect. ChatGPT’s own incident + V33/V89 notes show **conceptual / assertion-level** TOP resurrection risk in **off-repo** builds. Do not treat TOP costume work as a production blocker.

---

## 5. Trust: FACTORY / CONTRACT / SIDE-CAMERA vs ChatGPT docs

| Document | Blob SHA | Size | Trust posture |
| --- | --- | ---: | --- |
| `FACTORY.md` | `447691f396e89093149804274a36141ad8e1deb7` | 7445 | **Trust as art/rig protocol** (SIDE+FRONT; TOP retired; gait params; ChatGPT wires runtime). Seeded `0d40ee1`. |
| `CONTRACT.md` | `b83499d8cba1df814b3d589bda200cff6f66b83f` | 1200 | **Trust as `rig.json` shape** for factory handoff. |
| `design/SIDE-CAMERA-SCENERY.md` | `412d32c1cc080ade82feef73b497d69d388008b7` | 2878 | **Trust as SIDE camera/scenery contract** (lead @ ~75%, parallax, presentation-only). Commit `fedb7ba`. |
| `reference/SHOCKBOT.md` | `a698744766072bfac3b61fdd66b694a3bfd0b39d` | 2395 | **Trust as rider identity lock** on `main`. |
| `CANONICAL-RECOVERY-README.md` | `86796ef8b781cc21dd3ca8fa595877d801ae3a0d` | 6727 | **Mostly trust direction**; still correctly hedges that V33 bytes may not be on GitHub. |
| `README.md` (master spec) | `68c637ef34f89d0497f91737b6f3c0057afb86c5` | 31625 | **Untrusted as proven state.** ChatGPT-authored at `9f99ed0`. Fine as wishlist; not evidence of runnable Claude FRONT/SIDE. |
| `recovered/**` MASTER/V-docs after `5b3de93` | various | — | **Untrusted as presence proofs.** Useful as *claims to verify elsewhere*; none materialize binaries here. |
| Incident report | `0e114869…` / 6135 | — | **Trust as admission of process failure**; do **not** trust its technical diagnoses without independent check (per its own framing). |

**Conflict pattern:** Contracts say “don’t change race engine; SIDE+FRONT; ShockBot; TOP retired.” ChatGPT recovery docs then narrate dozens of runtime repairs to builds that **never appear in GitHub**, while incrementing V-numbers. Contracts win for *direction*; recovery V-docs lose for *existence*.

---

## 6. Open PR merge risks (#4, #5, #7)

| PR | Risk if merged now | Recommendation (audit only — not executing merges) |
| --- | --- | --- |
| **#4** Hawaiian identity | **HIGH.** Dirty vs `main`; older ShockBot.md; Hawaiian/gold sheet assets can be misread as default canon (already flagged in PR #7 audit). | Do **not** merge as-is. Rebase onto turquoise lock; demote Hawaiian to explicit song-skin path. |
| **#5** Gate 1 turquoise | **MEDIUM (art-only).** Clean; adds Gate 1 preview + rig artifacts; does **not** add a playable game. May be useful art handoff **after** Jessie Gate 1 yes/no. | Safe *as art PR* relative to runtime; still no E2E. Confirm Jessie Gate 1 before treating as shippable rider. |
| **#7** prior rekker audit | **LOW (docs).** Clean; documents V33 absence. Slightly stale vs commits `9f99ed0`→`7575c49` and PR #5 tip drift. | Can merge as historical record, or supersede with **this** audit PR. |

None of these PRs restore Claude FRONT/SIDE stride executables.

---

## 7. Art on `main` vs branches (riders)

### On `main`

- **Dogs (select portraits only):** beaux, diva, ghostbuster, kira, meatball, mike, noodle, penny under `art/select/dogs/` — e.g. penny.png **403,801** bytes / `cc326cbeca8b6450f1b5e4536d1dc78973d7a5d7`
- **Brand:** `art/brand/monkey-face.png` **786,444** / `bc040e0d4377…`
- **No** `art/shockbot.png`, **no** SIDE race pair frames, **no** FRONT dog+rider run cycles, **no** rider identity PNGs under `reference/identity/`

**Do not** treat select portraits as SIDE stride frames (same warning as PR #7 audit — still true).

### On PR branches (riders)

| Branch | Rider-related blobs |
| --- | --- |
| `phase-b-shockbot-gate1-turquoise` | Turquoise Gate 1 + `shockbot.png` + proof/rig/params (sizes in §3.2) |
| `phase-b-shockbot-identity` | Hawaiian character sheet + keyed front extracts |
| `rekker-issue-6-recovery-audit` | No new rider art |

---

## 8. Claude FRONT + SIDE stride recovery hunt

**Jessie priority:** locate Claude-era (1) FRONT-facing camera / dog+rider movement and (2) SIDEWAYS dog stride/gait tech.

### 8.1 FRONT-facing (Claude)

| Lead | Result |
| --- | --- |
| Documented path | `02-CLAUDE-FRONT-CAMERA/tue-0900-monkey-jockey-front-camera/` — **not in GitHub tree** |
| Mechanism named | Claude `project(distance)` with squash / lead / camera height / lane spread — `FRONT-CAMERA-MERGE-MAP.md`, `00-START-HERE.md` |
| Zip fingerprint (manifest only) | `tue-0900-monkey-jockey-front-camera-all.zip` **5,676** bytes, sha256 `7ec617f4…` — **bytes not in repo** |
| Inventory also lists | Library `tue-0900-monkey-jockey-front-camera-all.zip` 5,676 bytes |
| Production intent | Keep Claude race engine + SIDE renderer; **replace** overhead with Claude FRONT projection (`00-START-HERE.md`) |
| `drawFront` / `FRONT_SEQUENCE_REGISTRY` | Named only in **off-repo** MASTER V89 narrative (`drawSide.toString()`, FRONT init order) — **no source file in GitHub** |
| Approved full-body FRONT dog+rider movement | V33 notes + V87 notes: **explicitly unavailable / incomplete**; V89: fallback is front dog faces, not full running cycles |
| Last known good **commit/path with FRONT executable bytes in this repo** | **NONE / UNKNOWN in-repo.** Closest *described* production package remains Library V33 `index.html` 19,405,362 (notes only). Closest *described* Claude prototype is the 5,676-byte zip (notes only). |

**Verdict:** Claude FRONT tech is **documented, not materializable from GitHub.** If Jessie still has ChatGPT Library or a local copy of `tue-0900-monkey-jockey-front-camera*` or Production FRONT V33 HTML, that is the recovery surface — **not this repo.**

### 8.2 SIDEWAYS dog stride / gait

| Lead | Result |
| --- | --- |
| Claude SIDE renderer | Named as preserve-target in `00-START-HERE.md` / merge map: Claude SIDE sizing + `js/render.js` SIDE renderer under `01-CURRENT-GAME-SOURCE/monkey-jockey/` — **folder not in GitHub** |
| Source zip for base game | `monkey-jockey-4-audio-intro.zip` 11,665,530 / sha256 `238ad519…` — **not in repo** |
| `drawSide` | Referenced in `MASTER-V89-HOTFIX.md` as existing function in a staged HTML — **HTML not in repo** |
| Four Penny + Monkey Jockey SIDE production frames | Claimed preserved **inside** V33 Library package (`BUILD-NOTES-PROD-FRONT-V33.txt`) — **not** as separate GitHub blobs |
| Dog side/run pack | `mj-dogs-rgba-run-v6-1.zip` 13,771,356 — manifest only |
| Factory gait (code-driven legs) | `FACTORY.md` describes 3-segment gallop / `rig_cut.py` / never touch `gait` numbers; `penny.proof.png` referenced — **`tools/rig_cut.py` and penny proof not on `main`**. ShockBot rig appears only on **PR #5** (`out/shockbot.rig.json`, `tools/params/shockbot.json`) — rider rig, not the Claude dog stride system Jessie is asking about |
| SIDE camera contract (presentation) | `design/SIDE-CAMERA-SCENERY.md` — **camera follow/parallax only**, not dog gait animation bytes |
| Master README §15 SIDE animation | Requirements prose only (`9f99ed0`) |

**Verdict:** The **SIDE dog stride/gait system Jessie calls fantastic is not present as executable or frame-sequence bytes in this GitHub repository.** Evidence of its existence is **notes pointing at Claude consolidation folders and Library zips**. Last known good **in-repo** commit for SIDE *stride code*: **does not exist**. Last known good *described* packaging: Production FRONT V33 / Claude `monkey-jockey-4-audio-intro` lineage — **external**.

### 8.3 Overwritten / lost timeline (GitHub-scoped)

| When | What happened on GitHub | Effect on Claude FRONT/SIDE bytes |
| --- | --- | --- |
| Repo seed `e91a1a8` → contracts `0d40ee1` | vercel + FACTORY/CONTRACT | Never contained Claude game source |
| `16ac059`–`e3c9177` (2026-09-15) | Recovered **notes** about consolidation / V33 | Documented Library locations; **failed to copy** large HTML/ZIP (403) |
| `07be3a8` (2026-09-17) | Late candidate fingerprint doc | Fingerprinted ~20.5 MB HTML; **explicitly not committed** |
| `9f99ed0` → `9d0e23d` | Master README + V87–V134 docs | More narrative of runtimes still off-repo |
| `7575c49` | Incident report | Admits lineage confusion; still no bytes |

**Conclusion:** Claude FRONT + SIDE stride were **never successfully landed in this GitHub repo**, so they were not “overwritten by a bad commit” *here* — they were **never transferred**. Loss, if any, is relative to ChatGPT Library / local disks outside this audit’s visibility. **UNKNOWN** whether Library copies still exist.

---

## 9. Reconcile prior rekker audit (PR #7) after ChatGPT commits `9f99ed0` → `7575c49`

Prior audit: `recovered/2026-09-14/REKKER-AUDIT-2026-09-16.md` on branch `rekker-issue-6-recovery-audit` (blob `cac48d53c5f6…`, **7521** bytes), against `main` @ `5b3de939b678…`.

| Prior finding | Still true after newer ChatGPT commits? |
| --- | --- |
| V33 runtime bytes not in GitHub | **YES** |
| No runnable race runtime on `main` | **YES** |
| No `MONKEY-JOCKEY-CANON` tag | **YES** |
| Penny SIDE pair frames not on `main` (only select portrait) | **YES** |
| ShockBot lock commits `1ce0c45` / `4f8232e` | **YES** |
| SIDE 75% contract `fedb7ba` / `SIDE-CAMERA-SCENERY.md` | **YES** |
| TOP-DOWN retired in contracts | **YES** (plus new evidence ChatGPT conceptually resurrected TOP off-repo) |
| PR #4 Hawaiian merge risk | **YES** (still dirty) |
| Gate 1 preview on PR #5 not `main` | **YES** (tip SHA advanced to `40672636…`; preview blob unchanged) |
| Determinism / weather / multipliers “repo-proven” | Still **not** — still notes-only |
| “Latest complete described Production FRONT = V33” | **Still best *named* complete Production FRONT package in recovery notes.** Newer MASTER/V125–V134 docs claim later **recovery** HTML sizes, but those bytes are also **absent** from GitHub and are ChatGPT-attested only. **Do not promote by V-number.** Incident itself undermines V34–V36 / V136–V146 trust. |

**New since prior audit (must add):**

1. ChatGPT installed 31 KB master `README.md` (`9f99ed0`) — untrusted as runtime proof.
2. Docs cascade V87–V89, V125, V132–V134 — all docs-only.
3. Incident report `7575c49` — process confession; treat diagnoses as untrusted.
4. Claude FRONT + SIDE stride hunt: **confirmed absent as bytes** (this document §8).

---

## 10. Hypotheses (clearly labeled)

1. **H1:** Authoritative playable builds Jessie remembers live only in ChatGPT Library / local packages, never in `ozone503-maker/Monkey-Jockey` blobs. **Supported** by empty executable trees across history + inventory 403 notes.
2. **H2:** “Late candidate” 20.5 MB HTML (`07be3a8` fingerprint) may contain more ShockBot/SIDE camera contracts than V33 notes — **but cannot be verified here** without the file.
3. **H3:** ChatGPT V108 assertions / TOP compatibility throws described in V89 may explain some device freezes Jessie saw — **hypothesis only**; no binary to re-run.
4. **H4:** Factory gait rig (`rig_cut.py`) is a **replacement plan** for older multi-frame SIDE gallop art, not proof the Claude multi-frame stride Jessie loved is still available. **Supported** by FACTORY.md “What this replaces” language.

---

## 11. What Jessie can still trust (short list)

1. **Contracts on `main`:** SIDE + FRONT cameras; TOP retired; don’t touch race engine for art; ShockBot turquoise default (`FACTORY` / `CONTRACT` / `SIDE-CAMERA-SCENERY` / `SHOCKBOT.md`).
2. **Dog select portraits + brand art** currently on `main` (paths/sizes above).
3. **Honest recovery inventory:** large V33/late-candidate HTML/ZIPs were **never** successfully copied into GitHub.
4. **PR #5 turquoise Gate 1 art blobs** (if Jessie wants to review ShockBot look) — still branch-only.
5. **ChatGPT’s incident report as a process warning** — not as a technical map.

## 12. What Jessie should not trust

1. Any claim that GitHub `main` currently runs the game.
2. Version numbers V34–V36, V87–V146, MASTER V87+ as proof of a healthy progression.
3. Master `README.md` as evidence Claude FRONT/SIDE are integrated.
4. Merging PR #4 as “ShockBot done.”
5. Select-screen penny portrait as SIDE stride art.
6. Static Node/`http_200`/zip checks cited in QA JSON without the underlying artifact present.

---

## Appendix A — Key SHAs

| Ref | SHA |
| --- | --- |
| `main` tip (incident) | `7575c49babe6d29dae8b9b0559acb218a1b422da` |
| Master README commit | `9f99ed0f1f1af594ab4246b3e6935316498cb6f7` |
| Canonical recovery README commit (pre-cascade base for PR #7) | `5b3de939b678faab89856c4650ab8b11c3ccd50f` |
| Late candidate doc | `07be3a8a00caae4e9ce21a1202b41975adaed4ea` |
| ShockBot lock | `1ce0c45bb1a1a0a214035af76aa6805ff0fe45b7` |
| ShockBot turquoise clarify | `4f8232e9e642a3834fa279d39067c6b0cfb86280` |
| SIDE camera contract | `fedb7bad5aa0f7e7e3fb6153ba1fe034e81b6d5a` |
| FACTORY/CONTRACT seed | `0d40ee154684a13446dd9c59e0560e0c30da27cc` |
| V33 build notes | `e65f36dc5a15e9d0b47f5fa012a16abce81826f6` |
| V33 QA | `0add895a7a7d315cf9340d7fd8d0fc85e3926fac` |
| Consolidation manifest | `60552b6ea4e526d9b946bf9ccec9b350d42b53d9` |
| FRONT merge map | `26a0ed4534b5b18acdfc5a4d98918de5ed8936ff` |
| Prior rekker audit PR tip | `eb7bffb9ba17345c31033d4ce56d6948a6278682` |
| PR #5 tip | `4067263680b01e3645a567985435cdcf549f25d1` |
| PR #4 tip | `a7bb0df211fbe0ddf2d643483cba468a57755a50` |


## Appendix B — Method limits

- No clone; no local re-hash of missing binaries.
- GitHub code search returned empty for this repo (no indexed code files) — absence conclusions rest on **git tree listings**, not search alone.
- ChatGPT Library contents **not** accessible to this audit worker; Library paths/sizes are quoted from recovery markdown only.

---

*End of audit. No race physics changes. No canon tag. No game fixes.*
