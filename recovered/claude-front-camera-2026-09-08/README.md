# Front-Facing Camera Source

## What's here

- `tue-morning-monkey-jockey-front-camera-source.html` — self-contained HTML with real perspective projection, tunable controls, and placeholder dog bodies
- `faces.json` — manifest for embedding base64 portrait PNGs (currently empty stubs)

## Perspective math

The camera rides ahead of the leader looking back. Distance is converted to screen position using real perspective projection:

```javascript
function project(distance) {
  const squash = parseFloat(document.getElementById('squash').value);
  const lead = parseFloat(document.getElementById('lead').value);
  const camHeight = parseFloat(document.getElementById('height').value);
  const drel = distance - lead;
  const k = 1 / (1 + Math.max(0, drel) * squash / 100);
  const y = H * 0.5 + (distance / 100) * H * (0.5 - camHeight) * k;
  return { k, y };
}
```

**Tuning parameters:**
- **Depth squash** (1.0–12): How hard perspective compresses the field. Higher = back dogs vanish faster. Find the spot where 8th place is still readable but the leader dominates.
- **Lead distance** (10–120m): How far ahead the camera rides. Lower = closer to their faces.
- **Camera height** (0.4–2.0): Viewing angle. 1.0 = level. Higher = looking down.
- **Lane spread** (0.5–3.0): Horizontal spacing between lanes.

## Art spec decision

The four tuning parameters decide what the front-facing dog artwork needs:
- How much of each dog is on screen determines whether full legs are needed or just chest up
- Scale range at extreme positions determines size ratio across 8-dog pack
- The perspective math is locked, so once you pick numbers, the poses are specified

## Faces.json format

Currently empty stubs. To populate:

1. Extract each dog portrait from your select-screen lineup as a 256x256 PNG with circular alpha mask
2. Convert to base64: `base64 -w 0 < dog.png`
3. Paste into the manifest as `"data:image/png;base64,<base64-string>"`

The HTML loads them into `IMG[dogname]` on startup.

## Current state

- Perspective projection is real and correct
- Placeholder body blocks stand in for the chest/legs
- Finish line appears when final-stretch is on and race position > 85m
- Camera follows the leader with configurable framing
- Dogs sort by depth for correct occlusion

## Next steps

1. Tune the controls until the framing feels right
2. Export those four numbers
3. Send them to set the art pose spec
4. Populate faces.json with real portraits
5. Replace placeholder blocks with rigged front-facing dog sprites

---

Built Sep 8 2026. Camera math by Claude, parametric tuning by you.
