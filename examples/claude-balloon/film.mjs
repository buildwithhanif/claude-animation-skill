// film.mjs — "Claude's Balloon": a 30 s ambient loop in the faceted low-poly poster style.
//   node film.mjs sheet 0,6,12,18,24,29.9 | verify | cues | render
//
// STYLE BIBLE: flat vector, faceted (lib/lowpoly.mjs), no outlines on the landscape. Dusk ramp: plum sky →
// rose → peach at the horizon; canyon rocks orange → magenta → deep plum, lit from the left. Distant layers
// fade toward the haze colour. The only outlined things are the balloon rig and Claude (the character reads
// as "drawn" against a painted world). Every motion is periodic in 30 s, so the file loops seamlessly.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = process.env.CLAUDE_ANIMATION_LIB || path.join(HERE, "../../plugins/claude-animation/skills/claude-animation/lib");
const { clamp, lerp, ss, eIO, at, line, ellipse, stroke, fill, poly, smooth, hatch, rrect, rng, rad, hash, createCanvas, INK } = await import(path.join(LIB, "core.mjs"));
const { RAMPS, facetMass, ridge, skyGradient, facetCloud, rampColor } = await import(path.join(LIB, "lowpoly.mjs"));
const { starburst } = await import(path.join(LIB, "fx.mjs"));
const { critter } = await import(path.join(LIB, "rigs/critter.mjs"));
const { filmFinish } = await import(path.join(LIB, "textures.mjs"));
const { run } = await import(path.join(LIB, "film.mjs"));
const { GlobalFonts } = await import(path.join(LIB, "../node_modules/@napi-rs/canvas/index.js"));
const FD = process.env.FONT_DIR || path.join(process.env.HOME, ".claude/skills/tesseract-edit/assets/fonts");
if (fs.existsSync(path.join(FD, "Inter/Inter_28pt-Medium.ttf"))) GlobalFonts.registerFromPath(path.join(FD, "Inter/Inter_28pt-Medium.ttf"), "IMed");

const W = 1920, H = 1080, FPS = 30, DUR = 30, TAU = Math.PI * 2;
const HAZE = "#E8A08A";
const loop = (t, period) => ((t % period) + period) % period / period;          // 0..1 phase that repeats

// ---------------------------------------------------------------- the painted world (baked once)
function buildWorld() {
  const sky = createCanvas(W, H), s = sky.getContext("2d");
  skyGradient(s, W, H, [[0, "#2E1B48"], [.38, "#8A3E6E"], [.62, "#D8667A"], [.8, "#F2A07A"], [1, "#FBD3A0"]], [1250, 600, 64, "#FFE7B8"]);
  const r = rng(3); for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * 330, a = .25 + .5 * (1 - y / 330); s.fillStyle = `rgba(255,240,230,${a * r()})`; s.beginPath(); s.arc(x, y, .8 + r() * 1.6, 0, 7); s.fill(); }
  const far = facetMass(W, H, ridge(0, W, H, [610, 540, 575, 505, 560, 520, 590, 560], 2, 22), { ramp: RAMPS.dusk, fade: .58, haze: HAZE, cell: 74, seed: 3 });
  const mid = facetMass(W, H, ridge(0, W, H, [720, 660, 700, 630, 690, 650, 710, 680], 5, 34), { ramp: RAMPS.mesa, fade: .32, haze: HAZE, cell: 66, seed: 4 });
  // mesas with flat tops in the middle distance
  const mesaPoly = (x0, x1, top, base, lean = 30) => [[x0, base], [x0 + lean, top + 14], [x0 + lean + 30, top], [x1 - lean - 30, top], [x1 - lean, top + 16], [x1, base]];
  const mesas = createCanvas(W, H), m = mesas.getContext("2d");
  for (const [x0, x1, top, sd] of [[520, 820, 560, 11], [1040, 1300, 590, 12]]) m.drawImage(facetMass(W, H, mesaPoly(x0, x1, top, 860), { ramp: RAMPS.mesa, fade: .18, haze: HAZE, cell: 50, dome: [(x0 + x1) / 2, (x1 - x0) / 2], seed: sd }), 0, 0);
  // the river winding out of the canyon
  const riverP = [[700, H], [780, 1000], [880, 940], [930, 890], [960, 862], [1000, 856], [1030, 866], [1010, 900], [1080, 950], [1180, 1010], [1260, H]];
  const river = facetMass(W, H, riverP, { ramp: ["#3A2450", "#5A3468", "#8A4A7A", "#C0708A", "#E8A09A", "#F8D6B8"], light: [-.2, -.9, .6], cell: 40, zAmp: 16, bottomDark: .25, ridge: .8, contrast: .7, seed: 8 });
  const floor = facetMass(W, H, [[380, H], [380, 850], [700, 840], [1200, 845], [1560, 850], [1560, H]], { ramp: RAMPS.canyon, fade: .1, haze: HAZE, cell: 60, bottomDark: .7, seed: 9 });
  // foreground cliffs framing the view
  const left = [[0, H], [0, 170], [70, 128], [190, 150], [270, 230], [330, 420], [390, 640], [430, 860], [470, H]];
  const right = [[W, H], [W, 150], [1850, 118], [1730, 170], [1640, 300], [1590, 520], [1540, 760], [1500, H]];
  const cliffs = createCanvas(W, H), c = cliffs.getContext("2d");
  c.drawImage(facetMass(W, H, left, { ramp: RAMPS.canyon, cell: 58, dome: [190, 250], seed: 5 }), 0, 0);
  c.drawImage(facetMass(W, H, right, { ramp: RAMPS.canyon, cell: 58, dome: [1730, 240], seed: 6 }), 0, 0);
  // a little lit window hut on the left cliff top: someone lives here
  c.save(); poly(c, [[70, 128], [70, 96], [98, 74], [126, 96], [126, 128]]); fill(c, "#5A2A3A"); poly(c, rrect(88, 102, 20, 18, 3)); fill(c, "#FFD27A"); c.restore();
  const clouds = [facetCloud(460, 170, 2), facetCloud(340, 130, 5), facetCloud(560, 190, 9), facetCloud(300, 110, 13)];
  return { sky, far, mid, mesas, river, floor, cliffs, clouds };
}

// ---------------------------------------------------------------- the balloon (envelope baked once)
const EW = 300, EH = 350;
function buildEnvelope() {
  const P = []; for (let i = 0; i <= 60; i++) { const a = -Math.PI / 2 + i / 60 * TAU, x = Math.cos(a), y = Math.sin(a); const taper = y > 0 ? 1 - .55 * Math.pow(y, 1.6) : 1;
    P.push([EW / 2 + x * EW * .48 * taper, EH * .46 + y * EH * .46 * (y > 0 ? 1.08 : 1)]); }
  const base = facetMass(EW, EH + 20, P, { ramp: RAMPS.balloon, light: [-.8, -.4, .5], cell: 30, zAmp: 12, dome: [EW / 2, EW * .48], bottomDark: .35, ridge: .2, contrast: 1.2, seed: 21 });
  const cream = facetMass(EW, EH + 20, P, { ramp: ["#8A6A5A", "#C8A890", "#E8D0B8", "#F6E6D2", "#FFF4E6", "#FFFFFF"], light: [-.8, -.4, .5], cell: 30, zAmp: 12, dome: [EW / 2, EW * .48], bottomDark: .35, ridge: .2, contrast: 1.2, seed: 21 });
  const c = createCanvas(EW, EH + 20), x = c.getContext("2d"); x.drawImage(base, 0, 0);
  // cream gores: vertical bands that follow the envelope's curve
  x.save(); x.beginPath(); for (const k of [-.62, -.12, .38]) { const u0 = k, u1 = k + .24;
    for (let i = 0; i <= 30; i++) { const yy = i / 30 * EH, w2 = EW * .48 * Math.sqrt(Math.max(0, 1 - Math.pow((yy - EH * .46) / (EH * .5), 2))); const xx = EW / 2 + Math.sin(u0 * Math.PI / 2) * w2; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
    for (let i = 30; i >= 0; i--) { const yy = i / 30 * EH, w2 = EW * .48 * Math.sqrt(Math.max(0, 1 - Math.pow((yy - EH * .46) / (EH * .5), 2))); x.lineTo(EW / 2 + Math.sin(u1 * Math.PI / 2) * w2, yy); } x.closePath(); }
  x.clip(); x.drawImage(cream, 0, 0); x.restore();
  starburst(x, EW / 2 + 18, EH * .42, 46, { rays: 10, color: "#D97757", inner: .4, outline: false, rot: .1 });
  x.save(); poly(x, P); stroke(x, 3, "rgba(42,15,46,.85)"); x.restore();
  return c;
}
function balloon(ctx, x, y, tilt, t, S, burn) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  // burner glow lights the envelope from inside
  if (burn > 0) { const g = ctx.createRadialGradient(0, 40, 10, 0, -60, 260); g.addColorStop(0, `rgba(255,200,110,${.55 * burn})`); g.addColorStop(1, "rgba(255,200,110,0)"); ctx.fillStyle = g; ctx.fillRect(-300, -380, 600, 600); }
  ctx.drawImage(S.env, -EW / 2, -EH - 60);
  if (burn > 0) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .35 * burn; ctx.drawImage(S.env, -EW / 2, -EH - 60); ctx.restore(); }
  // ropes
  for (const [ax, bx] of [[-58, -48], [-22, -18], [22, 18], [58, 48]]) line(ctx, [[ax, -70], [bx, 64]], 2, "rgba(42,15,46,.9)");
  // burner + flame
  poly(ctx, rrect(-16, 30, 32, 18, 4)); fill(ctx, "#6A6A72"); stroke(ctx, 2);
  if (burn > 0) { const fl = 1 + .2 * Math.sin(t * 40); ctx.save(); ctx.globalAlpha = burn; ctx.beginPath(); ctx.moveTo(-12, 32); ctx.quadraticCurveTo(-14, -10 * fl, 0, -46 * fl); ctx.quadraticCurveTo(14, -10 * fl, 12, 32); ctx.closePath();
    const fg = ctx.createLinearGradient(0, 32, 0, -46); fg.addColorStop(0, "#FFF2B0"); fg.addColorStop(.5, "#FFB24A"); fg.addColorStop(1, "rgba(255,90,40,.2)"); ctx.fillStyle = fg; ctx.fill(); ctx.restore(); }
  // Claude in the basket: body first, basket front over its legs
  const look = Math.sin(t * .8) * .5 + .5, blink = (t % 3.7) < .12, wave = ss(11.6, 12.1, t) * (1 - ss(14.4, 14.9, t));
  critter(ctx, 0, 86, .62, { t, face: blink ? "blink" : wave > .5 ? "happy" : "normal", flip: look < .15, arms: wave > .5 ? "up" : "rest", sq: 1 + .02 * Math.sin(t * 3) });
  const B = rrect(-60, 64, 120, 70, 10); poly(ctx, B); const bg = ctx.createLinearGradient(0, 64, 0, 134); bg.addColorStop(0, "#C8905A"); bg.addColorStop(1, "#7A4A2A"); ctx.fillStyle = bg; ctx.fill();
  ctx.save(); poly(ctx, B); ctx.clip(); hatch(ctx, () => poly(ctx, B), rad(60), 9, "#5A3218", 1.6, .5, [-60, 60, 60, 140]); hatch(ctx, () => poly(ctx, B), rad(-60), 9, "#E8B880", 1.2, .35, [-60, 60, 60, 140]); ctx.restore();
  poly(ctx, rrect(-66, 58, 132, 14, 6)); fill(ctx, "#A8703E"); stroke(ctx, 2.6); poly(ctx, B); stroke(ctx, 3);
  // a pennant trailing from the basket
  const fw = Math.sin(t * 4); ctx.beginPath(); ctx.moveTo(-60, 70); ctx.quadraticCurveTo(-110, 78 + fw * 6, -150, 74 + fw * 10); ctx.lineTo(-104, 92 + fw * 4); ctx.closePath(); fill(ctx, "#FFF4E6"); stroke(ctx, 2);
  ctx.restore();
}
// ---------------------------------------------------------------- birds
function bird(ctx, x, y, s, flap) {
  const up = Math.sin(flap) * 14; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-26, -up); ctx.quadraticCurveTo(-12, -8 - up * .4, 0, 0); ctx.quadraticCurveTo(12, -8 - up * .4, 26, -up); ctx.quadraticCurveTo(12, -2, 0, 5); ctx.quadraticCurveTo(-12, -2, -26, -up); ctx.closePath(); fill(ctx, "#3A1A40"); ctx.restore();
}

// ---------------------------------------------------------------- frame
const BURNS = [3.0, 9.4, 16.2, 22.6, 28.4];
const burnAt = (t) => Math.max(0, ...BURNS.map((b) => { const d = t - b; return d < 0 || d > 1.1 ? 0 : Math.min(1, d / .08) * (1 - ss(.7, 1.1, d)); }));
function frame(ctx, t, S) {
  ctx.drawImage(S.W.sky, 0, 0);
  // sun rays turning slowly
  ctx.save(); ctx.translate(1250, 600); ctx.rotate(t * TAU / 60); ctx.globalAlpha = .06; for (let i = 0; i < 14; i++) { ctx.rotate(TAU / 14); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -70); ctx.lineTo(1400, 70); ctx.closePath(); ctx.fillStyle = "#FFE7B8"; ctx.fill(); } ctx.restore();
  // clouds: far ones slow, near ones faster; each wraps exactly once or twice per 30 s
  [[0, 180, 1, .75], [1, 120, 2, .55], [2, 250, 1, 1], [3, 300, 2, .8]].forEach(([i, y, laps, a]) => { const c = S.W.clouds[i], span = W + c.width, x = W - ((loop(t, DUR / laps) * span + i * 530) % span);
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(c, x, y); ctx.restore(); });
  ctx.drawImage(S.W.far, 0, 0); ctx.drawImage(S.W.mid, 0, 0); ctx.drawImage(S.W.mesas, 0, 0); ctx.drawImage(S.W.floor, 0, 0); ctx.drawImage(S.W.river, 0, 0);
  // river shimmer: short light dashes sliding downstream
  ctx.save(); const r = rng(4); for (let i = 0; i < 26; i++) { const u = (loop(t, 6) + r()) % 1, bx = lerp(940, 1060, r()), y = 875 + u * 200, x = bx + (y - 875) * (bx < 1000 ? -.9 : .9), w = 14 + r() * 26;
    ctx.globalAlpha = .5 * Math.sin(u * Math.PI); line(ctx, [[x - w / 2, y], [x + w / 2, y]], 3, "#EAF2FA"); } ctx.restore();
  // birds: a loose V crossing right to left, twice per loop
  for (let k = 0; k < 2; k++) { const u = loop(t + k * 15, 15), bx = lerp(W + 200, -300, u), by = 300 + 40 * Math.sin(u * 5);
    [[0, 0], [60, 26], [60, -22], [120, 50], [120, -44]].forEach(([dx, dy], i) => bird(ctx, bx + dx, by + dy + Math.sin(t * 3 + i) * 5, .9 - i * .05, t * 11 + i * .9)); }
  // the balloon drifts across once per loop (enters left, exits right)
  const u = loop(t, DUR), bx = lerp(-320, W + 320, u), by = 590 + 30 * Math.sin(u * TAU * 3) - 70 * Math.sin(u * Math.PI), tilt = .03 * Math.cos(u * TAU * 3);
  ctx.save(); ctx.translate(bx, by); ctx.scale(1.2, 1.2); balloon(ctx, 0, 0, tilt, t, S, burnAt(t)); ctx.restore();
  ctx.drawImage(S.W.cliffs, 0, 0);
  // a few embers of light drifting up from the canyon floor
  ctx.save(); const r2 = rng(9); for (let i = 0; i < 18; i++) { const u2 = (loop(t, 10) + r2()) % 1, x = 500 + r2() * 950 + Math.sin(u2 * 8 + i) * 20, y = 900 - u2 * 520; ctx.globalAlpha = .6 * Math.sin(u2 * Math.PI);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, "#FFE7B8"); g.addColorStop(1, "rgba(255,231,184,0)"); ctx.fillStyle = g; ctx.fillRect(x - 7, y - 7, 14, 14); } ctx.restore();
  ctx.save(); ctx.font = "22px IMed"; ctx.fillStyle = "rgba(255,240,230,.75)"; ctx.textAlign = "center"; ctx.fillText("made with code · claude-animation", 960, 1052); ctx.restore();
  S.finish(ctx, Math.round(t * FPS));
}
function cues() {
  const Q = []; BURNS.forEach((b) => Q.push({ sfx: "burner", t: b - .03, vol: .5, dur: 1.1 }));
  for (let k = 0; k < 2; k++) { const t0 = 15 * k; [3.2, 3.5, 5.1, 5.3, 8.4, 11.8, 12.0].forEach((d, i) => Q.push({ sfx: "chirp", t: t0 + d, vol: .22, pitch: .9 + (i % 3) * .12, pan: .6 - d / 10 })); }
  return Q;
}
if (process.argv[2] === "cues") { fs.writeFileSync(path.join(HERE, "cues.json"), JSON.stringify(cues())); console.log("wrote cues.json"); process.exit(0); }
run({ name: "claude-balloon", W, H, fps: FPS, dur: DUR, out: path.join(HERE, "out"),
  setup() { return { W: buildWorld(), env: buildEnvelope(), finish: filmFinish(W, H, { grain: .06, flicker: 0, vignette: .12 }) }; },
  frame: (ctx, t, i, S) => frame(ctx, t, S) });
