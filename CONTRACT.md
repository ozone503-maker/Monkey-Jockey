# rig.json — what comes back

Written by `rig_cut.py`. ChatGPT's runtime reads exactly this shape; do not
hand-edit it, re-cut instead.

```
{
  "id":      "penny",
  "body":    { "src": "data:image/png;base64,...", "w":, "h":, "ox":, "oy": },
  "parts": {
    "rear_hip":  { "src":, "w":, "h":, "px":, "py":, "ax":, "ay": },
    "rear_knee": {...}, "rear_paw": {...},
    "front_hip": {...}, "front_knee": {...}, "front_paw": {...},
    "head": {...}, "tail": {...}
  },
  "joints":  { "hip":, "knee":, "ankle": },
  "ground":, "back":, "top":, "front":,
  "seat":    [x, y],
  "legLen":
}
```

- `ox,oy` place the body in the source image's coordinate space.
- `px,py` are the pivot inside that part's own cropped image.
- `ax,ay` are the same pivot in the source image's coordinate space.
- All eight part keys are REQUIRED. A rig missing one is rejected.
- Coordinates stay in source-image pixels. The runtime scales; the factory
  does not.

## Validation / proof

A character is shippable only when `rig_cut.py` prints `RESULT: PASS` for all
four checks and writes `out/<id>.rig.json` plus `out/<id>.proof.png`. Paste
the stdout with the handoff. Never widen tool tolerances to force a pass.
