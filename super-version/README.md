# Monkey Jockey: super version

**Play:** https://monkey-jockey-test.vercel.app/ (phone portrait first; desktop works too)

This is the Sep 2 Punahēle build plus Fixes 1–7 plus later-version features:
- Soundtrack and sound effects with a mute button.
- Mystery Drone Pilot (replaces Ruch).
- Real rider and dog avatars.
- Victory podium with RUN IT BACK.

Seeded race results are identical to the Sep 2 base.

## Run it locally
- `python3 -m http.server 8820`, then open http://127.0.0.1:8820/index.html
- Single file: `python3 tools/build_dist.py --inline-assets`, then open `dist/monkey-jockey.html`

## More
- `HANDOFF.md`: start here if you're continuing the work (layout, canon, to-do, do-not-touch).
- `CHANGELOG.md`: every change and the **audio mapping** (which file plays where, and how to swap).
- `CHANGES.md`: catalogue of later-version features.
