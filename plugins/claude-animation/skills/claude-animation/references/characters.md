# Characters and rigs

## The ant (`lib/rigs/ant.mjs`)

```js
import { ant, seed } from "<lib>/rigs/ant.mjs";
ant(ctx, x, groundY, s, {
  flip,            // face left
  gait: t * 9,     // walking: phase advances ~9 rad/s at normal pace; omit to stand still
  stride: 26,      // step length (local units)
  ant: Math.sin(t * 5) * .5,   // antenna sway, -1..1
  headDip: 14,     // sniff / dig (px, local)
  jaw: .6,         // mandibles open
  rear: 1,         // stand up on the hind legs (pivots on the bottom of the gaster)
  overhead: (c) => seed(c, 1.35),   // held above the head by the raised front legs
  carry: (c) => seed(c, .9),        // held in the mandibles
  rot, pivot,      // pitch the whole body: climbing a vine, tumbling, falling
  sweat: 1, blink: true, dust: 1,
  look: { ink: 1, fill: 0, tex: 0 },   // draw only some layers: build-up reveals (guides → ink → colour → texture)
});
antGuides(ctx, x, groundY, s, p);      // blue construction shapes + centre crosses, drawn on as p goes 0 → 1
```

**Local space**: facing +x, origin on the ground under the waist, feet on y = 0. Body ≈ 300 × s px long,
≈ 150 × s px tall. `groundY` is the ground line in canvas px — pass it, don't compute an offset.

**Anatomy it draws** (all of it on every frame; this is what "detailed" means):
gaster with 3 tergite bands, form hatch, rim light, specular streak + dot, 16 setae · petiole with a node ·
mesosoma with pronotum hump, suture line, gloss, propodeal spine · head with hatch, clypeus line, compound
eye (faceted sheen, two highlights), toothed mandibles (near + far) · elbowed antennae: long scape, 10-bead
funiculus, club · six legs: coxa, femur, knee, tibia, 3-bead tarsus, two claws; far legs lighter and thinner ·
contact shadow.

**Legs are inverted Vs, not IK.** Each leg has a fixed hip, a knee offset (front: forward-up, mid: up, hind:
back-up, crossing the gaster) and a foot on the ground; walking slides the foot and half-slides the knee.
A two-bone IK was tried first and picked knees that crossed the body; explicit knees read cleaner in side
view. `core.mjs` keeps `ik(a, c, l1, l2, pref)` with a preferred knee *direction* for other rigs.

**Gait**: tripod — near front + near hind + far mid move together, the other three on the opposite phase.
The body bobs 3 px at twice the step rate. At `gait` speed ~9 rad/s with stride 26 the feet don't skate at
≈ 45 px/s × s of travel; tune `stride` to the travel speed, not the other way around.

**Acting vocabulary**:

| beat | pose |
|---|---|
| tugging | no gait, `rot` −6° → −18° over the tug, `headDip` 8, antenna sway fast |
| triumph, holding the prize | `rear: 1`, `overhead: seed`, snap in 0.07 s with `eBack` |
| digging | big scale, `headDip` 14, gait fast (26 rad/s) but no travel, dirt clods |
| carrying | `carry` in the mandibles, lean −5°, walk |
| curious | `headDip` rising to 16, antenna reaching forward (`ant` .6 → 1) |
| hot / tired | `sweat`, body lowered, slower gait |
| cutting a leaf | stand still, `headDip` 10 ± 5 at 30 rad/s, `jaw` 0.5 ± 0.5, leaf bits flying, a blue dashed cut line drawn first |
| climbing a vine | `rot` = path tangent from `pathOf(pts).at(u)`, speed lines behind |
| falling | `rot` spinning, then impact lines under the feet on landing |

**Build-up reveal** (the showcase's 2–7 s): draw `antGuides` first, then sweep a vertical line across the
ant; left of the line draw the next `look`, right of it the previous one (two clipped draws per frame).
Stages: guides → `{ink:1}` → `{ink:1, fill:1}` → full. Each draw call in the rig is classed by colour into
ink / fill / tex, so any new detail added to the rig joins the right layer automatically.

## The chibi person (`lib/rigs/chibi.mjs`)

For turning a real person's cartoon (a model sheet) into a rig that can act: read the sheet, then write a
look preset: `{ skin, shirt, pants, shoes, hair, pocket, pen, spikes, glasses }`. Keep the sheet's shapes
(hair silhouette, glasses shape, the one signature detail like a pocket pen); proportions are fixed by the
rig (head ≈ 40 % of height). Test with a pose sheet (rest, run ×2, jump, point, wave, shrug, cheer, carry,
flipped) next to the model sheet before any film. Arms take `[shoulder°, elbow°]` or a preset; a prop
goes in `holdR` / `holdL`. When the hair came out too tall and needle-like, more, shorter tufts (22, tip
93–104 px) matched a "bushy" sheet.

## The bean cast (`lib/rigs/bean.mjs`, brush-ink + watercolour look)

`person(pen, x, groundY, s, opts, t)` draws with a `Pen`, so the figure draws itself on (`pen.begin(name,
reveal)`) and can boil. Head circle 31 px with a skin wash, a bean torso washed in the shirt colour, stick
limbs 4.6 px, hands as small washed circles. Options: `hat` (peci, pith, helmet, turban, fez, cap), `glasses`
(sun, round), `arms [l, r]` degrees from straight down, `bend`, `face` (smile, open, flat, sad), `walk`
phase, `look`, `mustache`, `sash`, `medals`, `mask`, `flip`. Blinks every 3.3 s on its own. `bust()` for
crowds and tables, `bubble()` for speech, `flagCloth()` for a waving flag.

## Building a new creature rig

1. **Study sheet first.** Pull 3–5 reference images or frames of the creature and list its parts, their
   proportions (in body lengths) and how each moves. Write it as a comment at the top of the rig file.
2. **One local space, stated in the header**: origin on the ground under the centre of mass, facing +x,
   y up negative. The caller passes the ground line; nothing else knows about offsets.
3. **Parts as separate shapes**, drawn back to front: far limbs → body segments → near limbs → head →
   face details. Each part gets base + texture + edge (detail bible).
4. **Pose parameters, not keyframes**: a handful of named numbers (`gait`, `rear`, `headDip`, `jaw`, `blink`…)
   that the film animates. Defaults = a neutral standing pose.
5. **Secondary motion for free**: antennae, tails, ears, hair follow a sine of `t` plus a lag from turns.
6. **Test sheet before use**: standing, 4 walk phases, each special pose, flipped, and a 2× zoom crop —
   exactly what `ant-test` did. Fix the zoom crop until you would be happy to see it full screen.
7. **Seed from the name** of the character if anything in it is random (fur, spots), so it never changes
   between frames.
