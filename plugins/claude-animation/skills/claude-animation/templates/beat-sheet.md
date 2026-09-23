# Beat sheet — fill this BEFORE writing drawing code

One row per beat. A beat is one change the viewer could point at, followed by the hold that lets it land.
If a row has no "end state", it is not a beat yet.

| # | start | dur | the viewer notices | action → end state | camera | exposure | sound cue (t) |
|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 0.95 | an ant tugging a seed out of a melon | lean, tug ×2 → the seed pops free | locked | twos | pop 0.93 |
| 2 | 0.95 | 0.90 | the melon is huge and the ant tiny | stands with the seed overhead → zoom-out, slice flies off | pull back + roll | ones (fast) | whoosh 1.08 |
| … | | | | | | | |

Rules for the table
- **The key beat of a shot sits in its middle**, not at the end where the cut eats it.
- **A cut must add information.** If the next shot shows the same thing bigger, move the camera instead.
- **State the camera for every row**, even "locked". For a locked shot, name what must NOT move.
- **Show feeling as behaviour**: "antenna droops, body sinks 6 px", not "the ant is sad".
- **Exposure per action**: twos for acting, ones for fast flights, zooms and anything the camera tracks, hold
  for a read. Decide it here, not in code.
- **Sound cue = the frame of the contact minus ~0.03 s.** Write it in this table; `cues.json` is generated
  from the same numbers.

Style bible (paste verbatim into every build session; paraphrasing it causes drift)
- Paper: … | Ink: … px, colour … | Palette: … (max 6 + ink) | Textures: which surfaces get grain / hatch / cells
- Line weight by depth: hero … px, midground … px, background … px or no outline
- Boil: none / only on … at … fps
- Cast: rig names + scale (e.g. `ant` s=1.3 on the melon, 1.9 in the dig close-up, .6 on the vine)
