# The detail bible

Why this file exists: the first storybook ant film had the right scenes, timing and layout, and still
read as cheap. Every gap was *detail*: stilt legs instead of a low-slung ant, a smooth sun instead of a
fibrous one, clover leaves instead of lobed melon leaves, one flat fill where a good illustration has
three layers. None of it is hard. It just has to be asked for, surface by
surface, before drawing — this file is the asking.

## Rule 1: three layers on every surface

| layer | what it is | how (lib) |
|---|---|---|
| **base** | the local colour, often a gentle gradient (light top-left, dark bottom-right) | `createRadialGradient` / `createLinearGradient`, or `pen.wash` in the watercolour look |
| **texture** | the material's own pattern: grain, hatch, cells, fibre, bands, veins | `hatch`, `fibre`, `grainOver`, `fleshCells`, `soil`, custom |
| **edge** | outline + one edge effect: rim light, pooled pigment, highlight, setae | `stroke`, a light arc inside the outline, a white streak, short hairs |

If you can only afford two, drop nothing from the hero and simplify the background (see line weight by depth).

## Rule 2: line weight and detail fall off with depth

| depth | outline | texture | example |
|---|---|---|---|
| hero (the thing the beat is about) | 2.6–3.4 px, near-black `#1E1612` | full: gradient + texture + highlight + setae | the ant, the seed, the sprout |
| midground | 1.6–2.4 px | one texture | the melon slice when the ant is the subject, the vine |
| background | 1–1.4 px or none, 40–60 % opacity | grain only | Gedung Merdeka sketch, strata lines, distant hills |
| construction guides | 1.2–2 px, `#5E80CC` blue, dashed where "projected" | none | circles with `+` centres, arrows, axis rulers with ticks |

## Materials

**Paper** (every frame): warm cream `#F3EEDD` + multiplied grain (`paper()`); for brush-ink looks,
fibres + faint blotches + vignette (`fibrePaper()`). In the editorial look add **diagonal light bands**
(`lightBands()`: 40°, 78 px wide every 250 px, `#EEDDB4` at 55 %, drifting 14 px/s). The bands are the
single most recognisable element of that style — never leave them out of a sky.

**Sun**: gradient `#F6C35A → #EFA43A`, then *fibre* strokes in two oranges and one pale yellow at −60°
(`sun()`), 1.5–3 px outline, 12 thin rays in `#D9A035`. A smooth disc reads as clip-art. In heat, rays go
red `#E4553A`, long and thick.

**Sky at night**: navy `#1C2458` + fine −20° hatch in `#2A3470` + dots + a few four-point stars (`nightSky()`).
A day/night band strip: day = cream with thin warm horizontal lines + small sun; night = lavender `#6E6FA8`
with dense hatch + moon (`moon()`) + dots.

**Soil cross-section** (`soil(kind)`): base brown, multiplied grain, −32° hatch at 7 px, three wavy
strata lines, then scatter: dark blotches (`day`), cream pebbles with dark outlines (`dig`), pale specks and
little outlined ovals (`night`). A horizon line 2.5–3 px and grass blades (`grass()`) on top.

**Fruit flesh**: packed juice cells (`fleshCells()`: 17 px cells, each a slightly different red, darker
outline, 40 % get a tiny highlight). Seeds: glossy teardrops with a white stroke highlight (`seed()`), one
pale unripe seed among the dark ones. **Rind**: outer dark green with vertical darker hatch, a light green
band with finer hatch, a pale pink band, then the flesh. The cut face on top: a thin parallelogram in a
lighter red with its own hatch and green rind ends. Every outline is separate: outer 4 px, bands 1.5 px.

**Chitin (insects)**: radial gradient `#A2653F → #5A301D → #26130B` from upper-left; form hatch at −60°
clipped to the lower half; segment bands (tergites) as darker arcs; a **specular streak** (white 70 %,
long thin ellipse, upper front) plus a small dot; a warm **rim light** arc along the bottom edge (bounce
light); **setae** — short hairs around the rear rim. All of these are in `rigs/ant.mjs`.

**Leaves**: never plain ellipses unless it's a cotyledon. Cotyledons: ellipse + midrib + 3 pairs of side
veins + hatch (`sprout()`). True leaves of cucurbits (melon, squash): five deep pointed lobes with
serrated edges, pale veins radiating from the petiole (`melonLeaf()`). Hatch at 40°. Outline 2.6 px.

**Vines and stems**: dark outline stroke, body stroke `#4E9E47`, a thin pale highlight offset up-left, and
tiny hairs every few samples (`vine()`). Tendrils end in a small closed curl-loop, never a plain spiral
(`tendril()`).

**Water**: drops are a teardrop with a white highlight (`drop()`); waves are a curling crest with a pale lip,
foam claws along the crest, darker body, lighter face, white foam arcs at the base.

**Light**: warm light = radial gradient drawn *over* a darkened scene (the candle in 1965, the door to
democracy): darken the whole plate with a multiply radial, then add the glow source-over. Colour grading
after the fact can't give you a light source.

## Characters: the detail checklist

Before a character appears on screen, it has all of these (the ant rig is the reference implementation):

- **Anatomy in segments**, each its own shape, not one silhouette (ant: head, mesosoma, petiole node, gaster).
- **Joints read**: limbs as femur + tibia + tarsus with a visible knee dot, thicker near the body.
- **Near side vs far side**: far limbs drawn first, lighter and thinner; near limbs over the body.
- **Eyes with two highlights** (a big one upper-left, a small one lower-right). One highlight = dead eye.
- **Mouth parts / hands that can act**: mandibles with teeth that open (`jaw`), front legs that can lift
  and hold (`rear`, `overhead`).
- **Antennae / hair / tail as secondary motion**: they sway (`ant: sin(t)`), lag behind turns, react.
- **Contact shadow** under the character on the ground (a flat dark ellipse at ~20 %).
- **Setae / fuzz / texture on the body** (short hairs on the gaster rim, fuzz on a bee).
- **Scale relative to the set**, decided per shot: a hero close-up ~45 % of frame width, a working shot
  ~15–25 %, a world shot ~5–9 % (and then it needs company: other ants, traffic, props).

## Props and effects that sell the moment

- **Burst lines** for a pop or a realisation (`burst()`): 7–14 short strokes around the contact, one frame
  after it, gone in ~0.3 s.
- **Speed lines** behind anything fast (`speedLines()`), 2–4 strokes, tapering.
- **Impact lines** under a landing (a fan below the feet).
- **Dirt clods** flying from a dig: small outlined ovals in the soil colour, re-seeded every 2 frames.
- **Construction guides** as a style device (blue circles with `+` centres, dashed spirals, arrows, axis
  rulers with ticks) — they explain the geometry of growth. Fade them as the real thing takes over.
- **Tally marks** to count time passing; a **day/night strip** that flips every ~0.33 s with the sun/moon
  stepping across.

## Before you render: the detail pass

Open a sheet at 3–6 key frames and ask of every visible thing: does it have base, texture, edge? Is the
hero the most detailed thing on screen? Do eyes have two highlights? Are the far limbs lighter? Is there a
contact shadow? Is anything still a flat fill? Fix, re-sheet, then render.
