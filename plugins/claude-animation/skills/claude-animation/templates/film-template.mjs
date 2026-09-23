// film-template.mjs — copy to your project as film.mjs, set LIB, then edit the [EDIT] regions.
//   node film.mjs sheet 0,1,2,3   ->  look before you render
//   node film.mjs strip 1.9 12    ->  12 consecutive frames around a fast action
//   node film.mjs verify          ->  frames must not depend on render order
//   node film.mjs render          ->  out/<name>.mp4
// This template: an ant walks in on a textured-editorial set, sniffs a sprout, a bee drifts past.
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = process.env.CLAUDE_ANIMATION_LIB || path.join(HERE, "../lib");          // [EDIT] path to the skill's lib/
const { clamp, lerp, ss, eOut, popS, at, line, burst, INK } = await import(path.join(LIB, "core.mjs"));
const { paper, lightBands, sun, grass, soil, filmFinish } = await import(path.join(LIB, "textures.mjs"));
const { sprout, bee } = await import(path.join(LIB, "nature.mjs"));
const { ant } = await import(path.join(LIB, "rigs/ant.mjs"));
const { run, exposure } = await import(path.join(LIB, "film.mjs"));

// [EDIT] format and length
const W = 1080, H = 1080, FPS = 24, DUR = 5;
const G = 790;                                             // ground line

run({
  name: "template", W, H, fps: FPS, dur: DUR, out: path.join(process.cwd(), "out"),
  // heavy, static layers are built ONCE here
  setup() { return { paper: paper(W, H), soil: soil(W, H - G, "day"), finish: filmFinish(W, H, { grain: .1 }) }; },
  frame(ctx, t, i, S) {
    const d = exposure(t, [{ at: 0, on: 2 }], FPS);       // drawings on twos; the camera could stay on ones
    ctx.drawImage(S.paper, 0, 0); lightBands(ctx, W, H, t);
    sun(ctx, 860, 60, 120);
    ctx.drawImage(S.soil, 0, G); line(ctx, [[0, G], [W, G]], 2.5); grass(ctx, G, 0, W, 20, 12);
    // [EDIT] the beats. Every beat: one change the viewer could point at, then a hold.
    at(ctx, 330, G, 1.2 * popS(d, .3, .4), 0, () => sprout(ctx, { sway: Math.sin(d * 3) }));
    const walk = 1 - eOut(clamp((d - .2) / 2.2));                                    // walk in, decelerate
    ant(ctx, lerp(1250, 640, 1 - walk), G, 1.1, { flip: true, gait: walk > .01 ? d * 9 : undefined, ant: Math.sin(d * 5) * .5, headDip: ss(2.6, 3.0, d) * 16 });
    if (d > 3.0 && d < 3.5) burst(ctx, 450, 640, 150, 185, 8, 3, INK, Math.PI * 1.05, Math.PI * .9);
    if (d > 3.4) at(ctx, lerp(1180, 820, eOut((d - 3.4) / 1.2)), 240 + Math.sin(d * 18) * 5, .9, 0, () => bee(ctx, t));
    S.finish(ctx, i);                                       // grain tiles + flicker + vignette, last
  },
});
