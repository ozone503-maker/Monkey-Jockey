# Monkey Jockey — SIDE Camera + Scenery Lock

Status: ACTIVE design/runtime direction.

## Goal

The SIDE camera should feel like a real moving race broadcast, not a stationary security camera. The lead/front dog drives the composition while the course scrolls past with layered environmental detail.

## Camera behavior

- SIDE camera follows the **current lead/front dog**.
- Keep that dog around **75% of the viewport width** from the left edge.
- Do not pin the nose against the right wall.
- Do not keep the camera stationary while racers leave the composition.
- Camera movement must be smooth, not snapping every frame.
- Clamp camera motion to valid course bounds.
- Camera changes are presentation only; do **not** alter race determinism, entrant positions, or authoritative race state.

Reference implementation shape:

```js
const targetX = clamp(
  leadDog.x - viewportWidth * 0.75,
  0,
  courseWidth - viewportWidth
);

camera.x += (targetX - camera.x) * 0.08;
```

The exact smoothing constant may be tuned visually. The framing requirement is the contract.

## World movement

The visual world must move **right to left** as the race advances.

Use camera-relative parallax rather than a single static background.

Suggested layer behavior:

```js
farLayer.x   = -camera.x * 0.20;
midLayer.x   = -camera.x * 0.50;
frontLayer.x = -camera.x * 0.90;
```

At least three visual depth layers should be supported:

1. Far: sky, distant ridge/forest, large silhouettes.
2. Mid: trees, buildings, fences, spectator zones, signs.
3. Near: plants, lava rock, grasses, props, foreground detail.

## Scenery direction

The SIDE course may now carry richer, more intricate art because the camera travels through it.

Good candidates include:

- dense tropical plants and ferns
- banana / broad-leaf clusters
- lava rock and basalt details
- fences and course markers
- spectators / people where appropriate
- Brobots and Monkey Jockey signage
- small stands, props, flags and race-day objects
- critters / environmental details
- Outlet Mall / FlashTown / Rooster Island references when geographically appropriate

Avoid clutter that blocks the racers or makes the track unreadable. Detail belongs around the action, not over it.

## Acceptance checks

SIDE camera passes only when all are true:

- lead dog remains visible and framed around the 75% position during active racing
- camera visibly follows changes in race lead
- background moves right-to-left relative to racers
- multiple parallax depths are visible
- racers remain readable against the environment
- no race-state or deterministic-engine behavior changes
- start and finish boundaries still frame correctly

## Ownership

- ChatGPT: runtime camera/parallax integration and QA.
- rekker/Grok: scenery art, layered environmental assets, approved character art/rig work.
- Jessie: visual accept/reject gate.
