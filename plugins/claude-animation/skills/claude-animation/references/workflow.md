# Workflow: an original animation from a brief

1. **Brief → one paragraph**: who it's for, the story in three beats (setup, turn, payoff), length,
   format (1080×1080 for feeds, 1080×1920 vertical, 1920×1080 for YouTube), style preset
   (`references/styles.md`). Under a minute, a beat every 1–3 s.
2. **Style bible** (bottom of `templates/beat-sheet.md`): paper, ink, ≤ 6 colours + ink, which surfaces get
   which texture, line weight by depth, boil yes/no, the cast with scales. Paste it verbatim at the top of
   `film.mjs` as a comment; it stops the look drifting between sessions.
3. **Beat sheet**: every beat's start, duration, what the viewer notices, action → end state, camera,
   exposure, sound cue. If there's narration, lock beats to word timestamps (the start time of the word
   that names the thing), not to a stopwatch.
4. **Build** from `templates/film-template.mjs`:
   - `setup()` builds everything static once (paper, soil, sky, fruit texture, film finish).
   - `frame(ctx, t, i, S)` is scenes as functions of local time: `if (t < CUT[0]) sceneA(ctx, t) …`.
   - Inside a scene, every element is `at(ctx, x, y, scale, rot, () => draw())` driven by windows
     (`ss(a, b, t)`, `popS(t, t0)`, `eBack`, `eOut`) — never by state carried between frames.
   - Draw order is depth order: sky → bands → far set → ground → props → characters → effects → guides → finish.
5. **Look**: `node film.mjs sheet …` at every beat's end state. Fix. `strip` around each fast action and
   contact (12 frames). `verify` once.
6. **Detail pass** (`references/detail.md`, last section). This is where "fine" becomes "good".
7. **Render** (`node film.mjs render`), then **sound**: write `cues.json` from the beat sheet's cue
   column, `music.mjs` for a bed if the piece wants one, `sound.mjs` to mix and loudnorm.
8. **Check the master**: `ffmpeg -i out/final.mp4 -vf "fps=2,scale=480:-2,tile=6x6" -frames:v 1 sheet.jpg`
   and read it scene by scene; check duration and loudness. Only then deliver.

Speed reference (M-series Mac): the 32 s 1920×1080 colony film renders 768 frames in ~27 s; a 59 s
1920×1080 brush-watercolour film with two layers renders in ~100 s. Iterating on sheets is instant, so
iterate on sheets.
