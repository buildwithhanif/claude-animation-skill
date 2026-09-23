# Prior art: what other animation skills do, and what this one took

Read on 23 Sep 2026. Ideas only; no code was copied (one repo has no licence at all).

| repo | what it is | licence |
|---|---|---|
| IshaanKalra2103/creative-skills | 12 skills; `hand-drawn-canvas-animation` is a synced copy of alesha-pro's | MIT |
| alesha-pro/tools | the origin of `hand-drawn-canvas-animation` (Canvas 2D in headless Chrome, cels, exposure sheets, materials, verify) + MiniMax H3 prompt skills | MIT |
| misbahsy/claude-horizon-animation | `horizon-reel` (JSON-driven canvas reel), `sketch-to-sim` (three.js + physics) | **none — all rights reserved** |
| Ali0092/Sketchy | ~40 animated hand-drawn scenes in Compose Canvas + a `sketchy-illustrations` skill | MIT |

## Taken (and where it lives here)

1. **Decide cadence and boil on purpose** (twos for acting, boil only where it means something) → rule 4 in SKILL.md.
2. **Exposure: ones / twos / holds per action**, drawing clock separate from camera clock → `film.mjs exposure()`.
3. **Stroke seeds from stable names, boil opt-in** → `Pen.begin(name, reveal, { boil })`.
4. **Strip preview around fast actions + seek-determinism check** → `film.mjs strip`, `verify`.
5. **Beat sheet with an end state per beat, key beat mid-shot, "a cut must add information", camera stated
   for every row, emotion as behaviour** (from the H3 prompt skills) → `templates/beat-sheet.md`.
6. **Project bible pasted verbatim** (paraphrase causes drift) → style bible in the beat sheet.
7. **Film finish from a few precomputed grain tiles** cycled with offsets + flicker + vignette → `filmFinish()`.
8. **Pencil as broken thin passes; boxes with overshooting corners** → `pen.pencil`, `pen.box`.
9. **Line weight by depth; contact shadows; parts as poseable pieces** (Sketchy) → detail bible, ant rig.
10. **Stage renders, publish only after a good encode, write a sidecar** → `film.mjs render` + `render.json`.
11. **SFX from the same event timeline as the picture** → `scripts/sound.mjs`.

## Not taken

- A single huge global-script engine with shared top-level names (a name clash hangs the render).
- Headless-Chrome rendering: node canvas is faster, has no browser to manage, and is deterministic.
- Hedged docs ("optional", "not mandatory") — rules here are rules.
- Soft UI-style motion (gentle waves, no springs) as an acting model: wrong for characters.
