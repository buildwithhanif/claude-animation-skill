# Sound

- **Cues come from the picture's timeline.** Each beat in the beat sheet has a cue time = the contact
  frame − ~0.03 s. Sound that lands late reads as broken; slightly early reads as synced.
- **`scripts/sound.mjs`** synthesises every effect (pop, tick, thump, crack, whoosh, whip, riser, scratch,
  sparkle, drip, boing, buzz), mixes them on the cue times over an optional bed, runs a two-pass loudnorm
  (default −16 LUFS, −1.5 dBTP) and muxes onto the picture. No sample library, nothing to license.
- Per cue: `vol`, `dur`, `pan` (−1..1) and `pitch` (a multiplier: typing and pops vary 0.9–1.3 so repeats
  don't sound pasted). Newer sounds: `splash`, `click` (typing, mandibles), `step` (tiny footfalls — one per
  ~0.1 s of walking sells a small character), `fall` (descending whistle), `chime`.
- `--bed-at 2.0` starts the music late: a hook that plays on typing and clicks alone, then the bed lands
  with the first cut, hits harder than music from frame 0.
- **`scripts/music.mjs`** makes an original ukulele bed (C–G–Am–F, pentatonic bell, shaker, soft kick):
  `--dur`, `--bpm`, `--end` (a final strum + bell on the last beat), `--quiet a-b,c-d` (hold one soft chord
  under sad or serious beats).
- Mapping used in the colony film: click (typing, mandibles chewing), step (every ~0.1 s of walking),
  whip + pop (each build stage), scratch + pop (the leaf piece comes free), riser + whoosh (the dive),
  sparkle + chime (the fungus garden grows, the queen lays), drip (nursery), chime (the end card).
- **No continuous "pencil drawing" scratch.** It was built (loudness following the ink laid per frame)
  and rejected: it competes with everything. Draw-on is silent; contacts make sound.
- Bed level under narration ≈ −22 dB relative; with no narration, bed at ~0.5 and SFX 0.3–0.6.
- Check the final: `ffmpeg -i final.mp4 -af loudnorm=print_format=summary -f null -` → integrated near the
  target, true peak ≤ −1.
