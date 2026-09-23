---
name: claude-animation
description: Make short hand-drawn 2D animations entirely in JavaScript — storybook / textured-editorial illustration (paper grain, hatching, blue construction guides, glossy insect characters, nest cross-sections) and brush-ink + watercolour explainers — rendered frame-exact with node canvas and ffmpeg, with synthesised sound. Use for "bikin animasi", "animate this story", "hand-drawn animation", "storybook animation", "JS animation", "line drawing animation", "animasi semut", kids' story or science explainer animations. Not for UI micro-interactions, slide decks, or talking-head video editing.
---

# claude-animation

**Frame-exact, hand-drawn-looking 2D animation written as code.** A film is a pure function
`frame(ctx, t)`; the library draws the look (brush, pencil, watercolour, grain, hatching), the rigs act
(a detailed ant, a bean-bodied cast), and the harness renders, previews and checks it.

Every rule below is something that went wrong on a real film — a 59 s brush-ink + watercolour history
recap and a set of storybook insect films — and took a render to find.

## Read first

| I need to… | Go to |
|---|---|
| Make an original animation from a brief | `references/workflow.md` → `templates/beat-sheet.md` → `templates/film-template.mjs` |
| **Make it more detailed** (materials, textures, characters) | `references/detail.md` — the detail bible. Read it before drawing any surface |
| Draw / pose / walk the ant, or build a new creature rig | `references/characters.md`, `lib/rigs/ant.mjs` |
| A colony: leaves, brood, fungus, roots, a nest cross-section with walkable tunnels | `lib/colony.mjs` |
| People (bean body, stick limbs, watercolour) | `lib/rigs/bean.mjs` |
| Timing, acting, cuts, camera, transitions | `references/motion.md` |
| Pick or match a look (editorial-texture, brush-watercolour, line-doodle, 3D type) | `references/styles.md` |
| Sound: SFX from the picture's timeline, a synthesised bed, loudness | `references/sound.md`, `scripts/sound.mjs`, `scripts/music.mjs` |
| Something broke | `references/traps.md` |
| What other animation skills do, and what we took | `references/prior-art.md` |

## The library (`lib/`)

| file | gives you |
|---|---|
| `core.mjs` | easing (`eOut eIn eIO eBack eElastic eBounce eExpo popS`), `ss` windows, `hash rng noise1`, `catmull pathOf ik`, canvas helpers (`at line poly smooth ellipse stroke fill taper`), texture (`hatch fibre grainOver burst speedLines`) |
| `pen.mjs` | `Pen`: tapered brush `stroke`, `pencil` (3 broken passes), `ring`, `box` (overshooting corners), `wash` (blooming watercolour), `text` (writes itself), reveal-in-order, **stable named seeds**, opt-in boil |
| `textures.mjs` | `paper fibrePaper lightBands sun moon star4 grass soil nightSky fleshCells filmFinish` |
| `nature.mjs` | `sprout melonLeaf tendril vine blossom bee drop` |
| `rigs/ant.mjs` | `ant(ctx, x, groundY, s, pose)` — the detailed ant (`pose.look` = ink / fill / tex layers for build-up reveals); `antGuides()` blue construction lines; `seed()` |
| `colony.mjs` | `leaf leafPiece egg larva cocoon seedGrain fungus roots nestCanvas` (chambers + tunnels baked into soil, returns `pathOf` walkers) |
| `rigs/bean.mjs` | `person bust bubble flagCloth hat SKIN` |
| `film.mjs` | `run({...})` → `render / sheet / strip / verify`; `exposure(t, track, fps)` for ones / twos / holds |

Install once per machine: `cd <skill dir> && npm install` (only dependency: `@napi-rs/canvas`). ffmpeg on PATH.

## The loop

```
brief ─▶ style bible + beat sheet ─▶ film.mjs (copy the template) ─▶ sheet ─▶ fix ─▶ strip the fast bits
     ─▶ verify ─▶ render ─▶ cues.json ─▶ sound.mjs ─▶ look at the master's contact sheet ─▶ deliver
```


## Hard rules

1. **Beats before code.** Fill `templates/beat-sheet.md`: every beat has an end state the viewer could
   point at, a camera, an exposure and a sound cue. Designing inside the code makes slides.
2. **Every surface gets three layers: base → texture → edge.** A flat fill is unfinished. The detail bible
   lists the texture for each material (fruit = packed cells + seeds with highlights, soil = hatch + strata +
   pebbles, chitin = gradient + form hatch + specular streak + rim light + setae…).
3. **Characters are rigs with anatomy, not blobs.** Use `lib/rigs/ant.mjs` for insects; its local origin is
   the ground under the waist, so `ant(ctx, x, groundY, …)` always stands on the ground. Never add a
   per-call "ground" offset (that exact knob produced stilt legs for two passes).
4. **Boil is a decision, not a default.** The textured-editorial look holds still shots perfectly still;
   the brush-watercolour look boils at 10 fps. Write the choice in the style bible.
5. **Stable seeds.** Marks are seeded from a name (`pen.begin("ant/body")`), never from the frame index, so
   a held drawing keeps its marks and a re-render is identical. `node film.mjs verify` must pass.
6. **Look at pixels, every pass.** `sheet` before `render`, `strip` around every contact or fast action,
   and a contact sheet of the encoded master before you call it done. A render that exits 0 proves nothing.
7. **Sound comes from the picture's timeline**, ~0.03 s before each contact. No continuous pencil-scratch
   bed (tested, rejected: it fights everything). Loudnorm the mix.
8. **Show the world, not a slide.** A setting needs layers (sky, far, mid, ground, foreground passing
   the camera), and a place needs inhabitants doing things. The camera moves through it.

## Quick start

```bash
SK=~/.claude/skills/claude-animation            # wherever this skill lives
mkdir my-film && cd my-film && cp $SK/templates/film-template.mjs film.mjs
CLAUDE_ANIMATION_LIB=$SK/lib node film.mjs sheet 0,1,2,3,4    # look
CLAUDE_ANIMATION_LIB=$SK/lib node film.mjs render             # out/template.mp4
node $SK/scripts/music.mjs bed.wav --dur 5 --end 4.4
node $SK/scripts/sound.mjs cues.json out/template.mp4 out/final.mp4 --bed bed.wav
```

Worked film in the repo: `examples/ant-colony/` — 32 s, 16:9: a sketch → ink → colour → polish build-up,
a leafcutter cutting and carrying a leaf through a meadow, a dive into a nest cross-section (fungus garden,
nursery, queen, stores, tunnels full of traffic), 240 sound cues from the timeline; renders in ~27 s.
