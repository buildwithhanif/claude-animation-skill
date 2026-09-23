# Style presets

Pick one per film and write its recipe into the style bible. Mixing presets inside a film reads as a mistake.

## 1. Textured editorial (the storybook look)

Storybook science illustration: calm, precise, tactile.
- Paper `#F3EEDD` + grain; diagonal **light bands** in the sky; soft film finish (grain tiles, ±2.5 % flicker,
  vignette .18).
- Ink `#1E1612`, 2.6–3.4 px on heroes, round joins; no boil on still shots; acting on twos.
- Every material textured (detail bible): fibre sun, cell-packed fruit, hatched soil with pebbles, glossy
  chitin with setae, lobed leaves with pale veins.
- Blue **construction guides** `#5E80CC` (circles with `+` centres, dashed spirals, arrows, rulers) as a
  device for growth and geometry.
- Palette: cream, melon red `#D02A3B`, leaf greens `#5EAA4E #94D46C`, soil browns `#8C5E3D #9A6A45`,
  night navy `#1C2458`, sun orange `#EFA43A`, one yellow `#F5CF3A`.
- Square 1080×1080, 24 fps.

## 2. Brush ink + watercolour (the history recap v2 look)

Hand-lettered explainer: lively, warm, a little imperfect.
- `fibrePaper()`; ink lines are **tapered brush strokes** (`pen.stroke`, w 4–6) that **boil at 10 fps**;
  shapes are filled with **watercolour washes** that bloom from a point (`pen.wash`), multiplied, with a
  pooled edge and granulation; lettering writes itself (`pen.text`).
- Things draw themselves on (`pen.begin(name, reveal)`), then act; exits pop out or get whipped away by
  the camera.
- Cast: `rigs/bean.mjs` people, washed clothes, stick limbs, blinking.
- Dark chapters: darken the plate with a multiply radial and let one light source glow through it.
- Palette: cream, ink `#2A2420`, one accent red `#D0312D`, soft greens/blues/yellows as washes.

## 3. Line doodle (the history recap v1 look)

Minimal: black line on cream, one red accent, a tiny mascot. Uniform 5 px strokes drawn on by length,
fills fade in after; a subtle SVG-turbulence-like wobble. Fast to make; reads as "made quickly". Use the
brush look instead when quality matters.

## 4. 3D extruded type around live action

For celebrating a number over footage (the "1 MILLION VIEWS" ring): glyphs placed on a cylinder around the
subject, width = cos(angle), extrusion drawn as 1-px-spaced layers along the inward normal, front half on a
layer above a person matte, back half below it. Flat ring (vertical radius ≈ 11 % of horizontal), slow spin
(~0.34 rad/s), land on the headline facing camera and hold ~2 s before turning. Temporal supersampling
(6 samples) for motion blur while it flies in or out.

## Matching a new reference

Make a swatch sheet before the film: paper, ink line at three weights, each material's three layers, one
character pose, side by side with crops from the reference. Adjust until a crop of yours could sit in their
frame. Then write the numbers down as a new preset here.
