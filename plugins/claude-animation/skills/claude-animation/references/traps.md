# Traps (each one cost a render or a pass)

| # | Trap | Fix |
|---|---|---|
| 1 | **A per-call `ground` offset on a rig** drifted from the placement math: legs grew into stilts, and after the default was fixed, three call sites still passed the old value. | Rig origin = the ground point. Callers pass `groundY`. No offset parameter exists. When a fix "doesn't take", grep for overrides at the call sites. |
| 2 | **Two-bone IK chose knees that crossed the body** (the "higher" solution is not the readable one). | Explicit knee offsets per leg (inverted V), or `ik(..., pref=[dx,dy])` with a preferred knee direction. |
| 3 | **Rotating a standing-up character about its waist** sank its abdomen into the surface. | Pivot on the contact point that stays put (bottom of the gaster, the heel). |
| 4 | **Short polygons smoothed into blobs** (a 4-point tower became a rounded cone). | `wash(..., { sharp: true })`; the Pen smooths only polygons with > 6 points unless `round: true`. |
| 5 | **Multiply washes on a dark shape** (a phone screen) went muddy. | `wash(..., { over: true })` for opaque paint on dark. |
| 6 | **A preview image read back from cache** showed the old version, and a fix looked like it failed. | Write each sheet to a new filename, or check the file's mtime. |
| 7 | **zsh eats `$var:l`** (`measured_thresh=$e:linear` → `$e` + `:l` modifier). | Brace every variable in shell: `${e}`. `sound.mjs` does the loudnorm in node to avoid it. |
| 8 | **ffmpeg without `drawtext`** (common in homebrew builds). | Draw labels with canvas/PIL into a PNG and `overlay` it. |
| 9 | **A page's CSP blocks posting canvas frames to localhost**; an in-app browser pane that isn't displayed can't screenshot. | Use the user's real browser; read the network requests for the `.m3u8` and pull the file with ffmpeg. |
| 11 | **State carried between frames** (a counter, a cached "last position") breaks seeking and parallel renders. One film cached where an ant let go of a vine; `verify` passed only because its sample frames happened not to cross that moment. | Recompute from `t` (recompute the hand-off point from `t`). Pick `verify` frames that straddle every hand-off, or just never cache. |
| 12 | **Loud first draft of the SFX mix** clipped against the bed. | `sound.mjs` soft-clips (tanh) and loudnorms; keep individual SFX 0.3–0.6. |
| 13 | **Frame 0 empty** because everything pops in. | Start with something already on screen (open mid-action). |
