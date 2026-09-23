# Motion: timing, acting, camera

## Timing that reads well (24 fps storybook films)

| thing | value |
|---|---|
| shot length | 0.8 – 2.7 s; the montage flips its sky every 0.33 s |
| a "pop" (seed out, stamp, reveal) | the change happens in 1–2 frames (0.04–0.07 s), then a hold |
| overshoot on pop-ins | `eBack` s ≈ 1.8–2.2 over 0.3–0.4 s (`popS`) |
| burst lines | appear the frame after the contact, gone within ~0.3 s |
| zoom-out transition | 0.55 s `eIO`, with a slight roll that reverses, the subject shrinking to ~15 % |
| camera tilt following a climb | ~220 px over 0.3 s in, held, 0.25 s out |
| growth (root, shoot, vine) | 0.7–2 s per segment, `ss` windows, leaves pop as the tip passes them |

## Principles that made the difference

- **Snap, then hold.** A change that takes 0.07 s and then holds reads as intentional. A change that eases
  over 0.5 s reads as a slideshow transition. Use the ease on the *settle*, not on the change.
- **Anticipation**: a small move the opposite way first (the ant leans back before the tug; the seed
  sinks before it pops).
- **Overlap**: parts arrive at different times — body first, antennae 2–3 frames later.
- **One thing moves at a time on screen** unless they're a group; stagger groups by 0.05–0.14 s.
- **Loops never all in phase**: every repeated thing gets its own phase (`i * 1.1`), and a looping element
  starts mid-cycle so the first frame isn't empty.
- **Holds need life**: breathing (±2 %), a blink every ~3.3 s, antennae sway, the light bands drifting.

## Exposure (ones, twos, holds)

`exposure(t, track, fps)` returns the time the drawings should show. Acting on twos (12 drawings/s at
24 fps) gives the hand-drawn cadence; fast flights, zooms and anything the camera tracks go on ones or
they strobe; a read gets a hold. Camera moves stay on ones even when the drawing is on twos: pass
`exposure(t)` to the drawing code and the raw `t` to the camera transform.

## Boil

Boil = the linework redrawn with slightly different jitter a few times a second. It is a *style choice
with a meaning* (alive, nervous, hand-made), not a default. The
textured-editorial look holds its still shots perfectly still; the brush-ink look boils at ~10 fps.
In the Pen, boil is opt-in: `pen.begin(name, reveal, { boil: 10, t })`.

## Camera

- The camera is a transform on the whole scene layer (`ctx.translate/scale/rotate` around a pivot), set
  per shot: locked, slow push (+5–10 % over the shot), pan (±30 px at ≥ 105 % so edges never show), tilt
  to follow a climb, zoom-out as a transition.
- Keep UI-ish overlays (day/night strip, tally, mascots, captions) OUT of the camera transform.
- Cuts: hard cuts on the beat. Transitions only when they mean something (zoom-out = "the world is
  bigger than this", iris = "and that's the end", whip = "meanwhile").

## Effects vocabulary

burst lines (a pop, a realisation) · speed lines (fast travel) · impact lines (landing) · dirt clods (dig)
· a dashed arc (a thrown or flicked thing's path) · a water drop with a highlight · shine dots on a revived
plant · a sweat drop · construction guides (explaining geometry) · a tally + day/night strip (time passing)
