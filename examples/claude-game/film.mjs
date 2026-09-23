// film.mjs — "CLAUDE vs THE BUGS": a 30 s, 16:9 video-game short made with the claude-animation skill.
//   node film.mjs sheet 1,4.8,7.8,12.9,19.5,23.3 | strip 7.6 12 | verify | cues | render
//
// STYLE BIBLE: textured storybook art (paper grain, hatching, gradients, ink outlines) + video-game grammar
// (HUD, hit-stop, screen shake, sparks, comic words, damage numbers, combo counter, boss bar, K.O., LEVEL CLEAR).
// Hero: an orange block critter (lib/rigs/critter.mjs). Enemies: bugs (lib/rigs/bug.mjs). Palette: warm cream,
// hero orange #D97757, bug purples/greens, gold #FFD35A for impacts, red #E5484D for danger/hearts.
//
// All choreography is written in GAME time g. Hit-stop (lib/fx.mjs timeWarp) freezes g for a few frames on
// every contact while effects keep running in real time t — that freeze is what makes hits feel heavy.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = process.env.CLAUDE_ANIMATION_LIB || path.join(HERE, "../../plugins/claude-animation/skills/claude-animation/lib");
const { clamp, lerp, ss, eOut, eIn, eIO, eBack, popS, at, line, ellipse, stroke, fill, poly, smooth, hatch, speedLines, rrect, rng, rad, hash, createCanvas, INK } = await import(path.join(LIB, "core.mjs"));
const { paper, lightBands, sun, grass, filmFinish } = await import(path.join(LIB, "textures.mjs"));
const { blossom } = await import(path.join(LIB, "nature.mjs"));
const { timeWarp, shake, burstParticles, landDust, ring, flashAlpha, comicText, floatText, afterimages, starburst, heart } = await import(path.join(LIB, "fx.mjs"));
const { critter } = await import(path.join(LIB, "rigs/critter.mjs"));
const { bug } = await import(path.join(LIB, "rigs/bug.mjs"));
const { run } = await import(path.join(LIB, "film.mjs"));
const { GlobalFonts } = await import(path.join(LIB, "../node_modules/@napi-rs/canvas/index.js"));
const FD = process.env.FONT_DIR || path.join(process.env.HOME, ".claude/skills/tesseract-edit/assets/fonts");
const reg = (f, n) => { if (fs.existsSync(f)) GlobalFonts.registerFromPath(f, n); };
reg(path.join(FD, "Montserrat/Montserrat-Black.ttf"), "MBlack"); reg(path.join(FD, "Inter/Inter_28pt-Bold.ttf"), "IBold"); reg(path.join(FD, "Inter/Inter_28pt-SemiBold.ttf"), "ISemi"); reg("/System/Library/Fonts/Menlo.ttc", "Mono");

const W = 1920, H = 1080, FPS = 24, DUR = 30, G = 880, WORLD = 5000;
const ORANGE = "#D97757", GOLD = "#FFD35A", RED = "#E5484D";

// ---------------------------------------------------------------- hit-stop
const STOPS = [[7.72, .083], [8.42, .083], [9.45, .083], [12.82, .125], [19.2, .083], [19.45, .083], [19.7, .083], [19.95, .083], [20.25, .125], [23.15, .3]];
const TW = timeWarp(STOPS), R = (g) => TW.real(g);
const END_T = 27.2;                                            // real time the end card starts

// ---------------------------------------------------------------- the hero's choreography (game time)
const SEG = [
  { a: 0, b: .3, k: "hide" },
  { a: .3, b: 1.0, k: "fall", p0: [420, -260], p1: [420, G] },
  { a: 1.0, b: 2.5, k: "idle", p: [420, G] },
  { a: 2.5, b: 3.4, k: "run", p0: [420, G], p1: [1180, G] },
  { a: 3.4, b: 4.05, k: "jump", p0: [1180, G], p1: [1400, 700], h: 230 },
  { a: 4.05, b: 4.55, k: "run", p0: [1400, 700], p1: [1560, 700] },
  { a: 4.55, b: 5.35, k: "jump", p0: [1560, 700], p1: [1880, 560], h: 260, flip: true },
  { a: 5.35, b: 5.85, k: "run", p0: [1880, 560], p1: [2080, 560] },
  { a: 5.85, b: 6.6, k: "jump", p0: [2080, 560], p1: [2420, G], h: 120 },
  { a: 6.6, b: 7.35, k: "idle", p: [2420, G], face: (g) => g > 6.85 ? "surprised" : "normal" },
  { a: 7.35, b: 7.65, k: "dash", p0: [2420, G], p1: [2700, G] },
  { a: 7.65, b: 8.35, k: "punch", p: [2700, G], hits: [7.72] },
  { a: 8.35, b: 8.8, k: "kick", p: [2700, G], hits: [8.42] },
  { a: 8.8, b: 9.45, k: "jump", p0: [2700, G], p1: [2960, G - 62], h: 300 },
  { a: 9.45, b: 10.05, k: "jump", p0: [2960, G - 62], p1: [3080, G], h: 180 },
  { a: 10.05, b: 11.3, k: "idle", p: [3080, G], face: () => "happy", arms: "up" },
  { a: 11.3, b: 11.9, k: "knock", p0: [3080, G], p1: [2880, G], h: 90 },
  { a: 11.9, b: 12.45, k: "idle", p: [2880, G], face: (g) => g < 12.15 ? "hurt" : "angry" },
  { a: 12.45, b: 13.1, k: "punch", p: [2880, G], hits: [12.82] },
  { a: 13.1, b: 16.82, k: "idle", p: [2880, G], face: (g) => g > 14.5 && g < 15.6 ? "surprised" : g > 15.6 ? "focus" : "normal", arms: (g) => g > 15.6 ? "guard" : "rest" },
  { a: 16.82, b: 17.3, k: "jump", p0: [2880, G], p1: [2960, G], h: 200 },
  { a: 17.3, b: 17.52, k: "idle", p: [2960, G], face: () => "focus", arms: "guard" },
  { a: 17.52, b: 18.0, k: "jump", p0: [2960, G], p1: [3040, G], h: 200 },
  { a: 18.0, b: 18.22, k: "idle", p: [3040, G], face: () => "focus", arms: "guard" },
  { a: 18.22, b: 18.7, k: "jump", p0: [3040, G], p1: [3120, G], h: 200 },
  { a: 18.7, b: 18.75, k: "idle", p: [3120, G], face: () => "angry" },
  { a: 18.75, b: 19.1, k: "dash", p0: [3120, G], p1: [3520, G] },
  { a: 19.1, b: 20.45, k: "combo", p: [3520, G], hits: [19.2, 19.45, 19.7, 19.95, 20.25] },
  { a: 20.45, b: 20.6, k: "idle", p: [3520, G], face: () => "surprised" },
  { a: 20.6, b: 21.2, k: "knock", p0: [3520, G], p1: [3200, G], h: 150 },
  { a: 21.2, b: 22.6, k: "charge", p: [3200, G] },
  { a: 22.6, b: 22.9, k: "jump", p0: [3200, G], p1: [3260, 690], h: 80, throw: true },
  { a: 22.9, b: 23.25, k: "jump", p0: [3260, 690], p1: [3300, G], h: 30 },
  { a: 23.25, b: 24.3, k: "idle", p: [3300, G], face: (g) => g > 23.95 ? "happy" : "focus" },
  { a: 24.3, b: 24.7, k: "jump", p0: [3300, G], p1: [3300, G], h: 170, cheer: true },
  { a: 24.7, b: 24.9, k: "idle", p: [3300, G], face: () => "happy", arms: "up" },
  { a: 24.9, b: 25.3, k: "jump", p0: [3300, G], p1: [3300, G], h: 170, cheer: true, flip: true },
  { a: 25.3, b: 99, k: "idle", p: [3300, G], face: () => "happy", arms: "up" },
];
const LANDS = SEG.filter((s) => ["fall", "jump", "knock"].includes(s.k) && s.p1[1] >= G - 70).map((s) => s.b);
const JUMP_STARTS = SEG.filter((s) => s.k === "jump").map((s) => s.a);
const segAt = (g) => SEG.find((s) => g >= s.a && g < s.b) || SEG[SEG.length - 1];
const hitProfile = (g, h, up = .07, hold = .1, down = .2) => ss(h - up, h, g) * (1 - ss(h + hold, h + hold + down, g));
function hero(g) {
  const s = segAt(g), k = clamp((g - s.a) / (s.b - s.a)), o = { x: 0, y: G, pose: { t: g } };
  const P = o.pose;
  if (s.k === "hide") { o.hide = true; return o; }
  if (s.k === "fall") { o.x = s.p0[0]; o.y = lerp(s.p0[1], s.p1[1], eIn(k)); P.sq = .78; P.air = true; P.face = "surprised"; }
  else if (s.k === "idle" || s.k === "charge") { [o.x, o.y] = s.p; P.sq = 1 + .03 * Math.sin(g * 5); P.face = s.face ? s.face(g) : ((g % 3.1) < .1 ? "blink" : "normal"); P.arms = typeof s.arms === "function" ? s.arms(g) : s.arms;
    if (s.k === "charge") { P.crouch = .6 * ss(0, .2, k); P.aura = ss(0, .8, k); P.face = "focus"; o.x += Math.sin(g * 70) * 2.5 * P.aura; } }
  else if (s.k === "run") { o.x = lerp(s.p0[0], s.p1[0], k); o.y = s.p0[1]; P.gait = g * 18; P.sq = 1 + .05 * Math.sin(g * 36); }
  else if (s.k === "jump" || s.k === "knock") { o.x = lerp(s.p0[0], s.p1[0], s.k === "knock" ? eOut(k) : k); o.y = lerp(s.p0[1], s.p1[1], k) - s.h * 4 * k * (1 - k); P.air = true;
    P.sq = k < .35 ? .8 : k > .8 ? .9 : 1; if (s.flip) P.rot = -Math.PI * 2 * eIO(k); if (s.cheer) { P.arms = "up"; P.face = "happy"; }
    if (s.k === "knock") { P.face = "hurt"; P.rot = -.5 * Math.sin(k * Math.PI); P.flash = 1 - ss(0, .25, k); }
    if (s.throw) { P.arms = "up"; P.face = "angry"; } }
  else if (s.k === "dash") { o.x = lerp(s.p0[0], s.p1[0], eOut(k)); o.y = s.p0[1]; P.sq = .72; P.rot = .12; P.face = "angry"; P.gait = g * 30; o.dash = true; }
  else if (s.k === "punch" || s.k === "kick") { [o.x, o.y] = s.p; P.face = "angry"; const h = s.hits[0], pr = hitProfile(g, h);
    if (s.k === "punch") { P.punch = pr; P.rot = .1 * pr; } else { P.kick = pr; P.rot = -.08 * pr; } P.sq = 1 - .08 * pr; }
  else if (s.k === "combo") { [o.x, o.y] = s.p; P.face = "angry"; s.hits.forEach((h, i) => { const pr = hitProfile(g, h, .06, .06, .12); if (i === 4) { P.punch = Math.max(P.punch || 0, pr); o.y -= 50 * pr; P.rot = -.2 * pr; } else if (i % 2) P.punchBack = Math.max(P.punchBack || 0, pr); else P.punch = Math.max(P.punch || 0, pr); }); P.rot = (P.rot || 0) + .06 * Math.sin(g * 40); }
  // landing squash and take-off anticipation
  for (const L of LANDS) { const d = g - L; if (d >= 0 && d < .18) P.sq = lerp(1.35, 1, eOut(d / .18)); }
  for (const J of JUMP_STARTS) { const d = J - g; if (d > 0 && d < .09) P.sq = 1.22; }
  return o;
}
// invulnerability flicker after taking a hit
const flicker = (g) => ((g > 11.3 && g < 12.45) || (g > 20.6 && g < 21.3)) && Math.floor(g * 16) % 2 === 0;

// ---------------------------------------------------------------- enemies (game time)
const BS = .8;
function walkX(g, t0, x0) { return x0 - 250 * Math.max(0, g - t0); }
function enemies(g) {
  const L = [];
  // bug 1: walks in, punched into the sky, poof
  if (g >= 6.2 && g < 8.3) { if (g < 7.72) L.push({ x: walkX(g, 6.2, 3330), y: G, p: { gait: g * 14 } }); else { const k = (g - 7.72) / .6; L.push({ x: 2950 + 760 * k, y: G - 560 * k + 420 * k * k, p: { rot: g * 14, hurt: true, flash: flashAlpha(g, 7.72, .15) } }); } }
  // bug 2: kicked low and fast
  if (g >= 6.5 && g < 8.95) { if (g < 8.42) L.push({ x: walkX(g, 6.5, 3380), y: G, p: { gait: g * 14 } }); else { const k = (g - 8.42) / .55; L.push({ x: 2900 + 980 * k, y: G - 300 * 4 * k * (1 - k), p: { rot: -g * 12, hurt: true, flash: flashAlpha(g, 8.42, .15) } }); } }
  // bug 3: stomped flat
  if (g >= 6.8 && g < 9.95) { if (g < 9.45) L.push({ x: Math.max(2960, walkX(g, 6.8, 3620)), y: G, p: { gait: g * 14 } }); else L.push({ x: 2960, y: G, p: { squash: 1, hurt: true, flash: flashAlpha(g, 9.45, .15) }, stars: true }); }
  // bug 4: drops on the hero's head, bounces off, creeps back, gets a big punch
  if (g >= 10.9 && g < 13.4) { if (g < 11.3) L.push({ x: 3080, y: lerp(-200, G - 118, eIn((g - 10.9) / .4)), p: { angry: true } });
    else if (g < 11.6) { const k = (g - 11.3) / .3; L.push({ x: lerp(3080, 3170, k), y: lerp(G - 118, G, k) - 120 * 4 * k * (1 - k), p: { angry: true, rot: k * 2 } }); }
    else if (g < 12.82) L.push({ x: lerp(3170, 3130, clamp((g - 11.6) / 1.1)), y: G, p: { gait: g * 12, angry: true, jaw: .5 + .5 * Math.sin(g * 20) } });
    else { const k = (g - 12.82) / .58; L.push({ x: 3130 + 1100 * k, y: G - 600 * k + 300 * k * k, p: { rot: g * 16, hurt: true, flash: flashAlpha(g, 12.82, .2) } }); } }
  return L;
}
// the boss
const BOSS_X = 3900;
const BOSS_HITS = [19.2, 19.45, 19.7, 19.95, 20.25], BOSS_DMG = [12, 12, 12, 12, 14];
function bossHP(g) { let hp = 100; BOSS_HITS.forEach((h, i) => { if (g >= h) hp -= BOSS_DMG[i]; }); if (g >= 23.15) hp = lerp(hp, 0, ss(23.15, 23.8, g)); return hp; }
function boss(g) {
  if (g < 14.6 || g >= 24.05) return null;
  const o = { x: BOSS_X, y: G, p: { horns: true, angry: true, shell: "#3E6B4A", t: g } };
  if (g < 15.0) o.y = lerp(-520, G, eIn((g - 14.6) / .4));
  o.p.squash = g >= 15.0 && g < 15.2 ? .35 * (1 - (g - 15.0) / .2) : 0;
  if (g > 15.4 && g < 16.0) o.p.jaw = ss(15.4, 15.55, g) * (1 - ss(15.85, 16.0, g));
  for (const f of [16.2, 16.9, 17.6]) if (g > f - .15 && g < f + .15) o.p.jaw = Math.max(o.p.jaw || 0, 1 - Math.abs(g - f) / .15);
  BOSS_HITS.forEach((h) => { const d = g - h; if (d >= 0 && d < .25) { o.x += 24 * (1 - d / .25); o.p.flash = Math.max(o.p.flash || 0, 1 - d / .12); } });
  if (g > 20.4 && g < 20.8) { const k = Math.sin((g - 20.4) / .4 * Math.PI); o.x -= 120 * k; o.p.jaw = k; }
  if (g >= 23.15) { o.p.flash = Math.max(o.p.flash || 0, .5 + .5 * Math.sin(g * 60)); o.p.hurt = true; o.x += Math.sin(g * 90) * 8; }
  if (g >= 23.6) { const k = (g - 23.6) / .45; o.p.squash = k; }
  return o;
}
const SHOTS = [16.2, 16.9, 17.6], SHOT_V = 930;
const TOKENS = [2.85, 3.15, 3.72, 4.3, 4.95, 5.6];
const KILLS = [[8.3, 500], [8.95, 500], [9.95, 500], [13.4, 500], [23.95, 5000]];
function score(g) { let s = 0; TOKENS.forEach((c) => { if (g > c) s += 100 * eOut((g - c) / .35); }); KILLS.forEach(([c, v]) => { if (g > c) s += v * eOut((g - c) / (v > 1000 ? 1.2 : .4)); }); return Math.round(s); }
const hearts = (g) => g < 11.3 ? 3 : g < 20.6 ? 2 : 1;

// ---------------------------------------------------------------- the level (built once)
function buildLevel() {
  const far = createCanvas(3000, H), f = far.getContext("2d");
  for (const [base, col, amp] of [[560, "#C9DDB8", 70], [640, "#B2D29A", 55]]) { f.beginPath(); f.moveTo(0, H); for (let x = 0; x <= 3000; x += 30) f.lineTo(x, base - amp * Math.sin(x * .0023 + base) - 30 * Math.sin(x * .008)); f.lineTo(3000, H); f.closePath(); f.fillStyle = col; f.fill(); f.strokeStyle = "rgba(30,22,18,.3)"; f.lineWidth = 2; f.stroke(); }
  hatch(f, () => { f.beginPath(); f.rect(0, 520, 3000, 560); }, rad(-30), 10, "#88AE72", 1, .25, [0, 500, 3000, H]);
  const mid = createCanvas(4000, H), m = mid.getContext("2d"), r = rng(4);
  for (let i = 0; i < 34; i++) { const x = 60 + i * 118 + r() * 50, h2 = 150 + r() * 120, y = 790; line(m, [[x, y], [x, y - h2]], 10, "#6B4A2E"); line(m, [[x, y], [x, y - h2]], 5, "#8A6240");
    ellipse(m, x, y - h2 - 40, 62 + r() * 20, 70 + r() * 20); const tg = m.createRadialGradient(x - 20, y - h2 - 70, 5, x, y - h2 - 40, 90); tg.addColorStop(0, "#9CCB7C"); tg.addColorStop(1, "#5E9A4E"); m.fillStyle = tg; m.fill(); m.lineWidth = 3; m.strokeStyle = "rgba(30,22,18,.6)"; m.stroke(); }
  const wc = createCanvas(WORLD, H), w = wc.getContext("2d"), r2 = rng(9);
  const groundSpan = (x0, x1) => { const gg = w.createLinearGradient(0, G, 0, H); gg.addColorStop(0, "#A2744C"); gg.addColorStop(1, "#6A4428"); w.fillStyle = gg; w.fillRect(x0, G, x1 - x0, H - G);
    hatch(w, () => { w.beginPath(); w.rect(x0, G, x1 - x0, H - G); }, rad(-30), 7, "#4E321C", 1, .3, [x0, G, x1, H]);
    for (let bx = x0; bx < x1; bx += 100) { w.strokeStyle = "rgba(60,35,18,.5)"; w.lineWidth = 2; w.strokeRect(bx, G + 26, 100, 90); w.strokeRect(bx + 50, G + 116, 100, 90); }
    w.fillStyle = "#6FB25A"; w.fillRect(x0, G - 4, x1 - x0, 26); line(w, [[x0, G + 22], [x1, G + 22]], 3); line(w, [[x0, G - 4], [x1, G - 4]], 3);
    for (let x = x0 + 10; x < x1; x += 22) { ctxBlade(w, x, G - 2); } line(w, [[x0, G - 4], [x0, H]], 3); line(w, [[x1, G - 4], [x1, H]], 3); };
  const ctxBlade = (c, x, y) => { c.beginPath(); c.moveTo(x - 6, y); c.quadraticCurveTo(x, y - 14 - hash(x) * 10, x + 4, y - 18 - hash(x) * 10); c.quadraticCurveTo(x + 2, y - 6, x + 8, y); c.fillStyle = "#5E9A4E"; c.fill(); };
  groundSpan(-10, 1500); groundSpan(1760, WORLD + 10);
  // floating brick platforms
  for (const [x0, x1, y] of [[1300, 1620, 700], [1800, 2120, 560]]) { const P = rrect(x0, y, x1 - x0, 64, 8); poly(w, P); const pg = w.createLinearGradient(0, y, 0, y + 64); pg.addColorStop(0, "#D8925E"); pg.addColorStop(1, "#A8633A"); w.fillStyle = pg; w.fill();
    for (let bx = x0; bx < x1; bx += 53) { w.strokeStyle = "rgba(60,25,10,.55)"; w.lineWidth = 2; w.strokeRect(bx, y, 53, 32); w.strokeRect(bx + 26, y + 32, 53, 32); }
    hatch(w, () => poly(w, P), rad(-40), 6, "#6A3418", 1, .3, [x0, y, x1, y + 64]); w.fillStyle = "#6FB25A"; w.fillRect(x0, y - 6, x1 - x0, 14); poly(w, P); stroke(w, 3.4); line(w, [[x0, y - 6], [x1, y - 6]], 3); }
  // props: sign, flowers, mushrooms, rocks; the arena gets cracked stones
  w.save(); line(w, [[240, G - 4], [240, G - 150]], 10, "#6B4A2E"); poly(w, rrect(150, G - 250, 190, 110, 12)); fill(w, "#E9D2A6"); stroke(w, 3.4); w.font = "40px MBlack"; w.fillStyle = INK; w.textAlign = "center"; w.fillText("1-1", 245, G - 180); w.font = "26px ISemi"; w.fillText("→ bugs ahead", 245, G - 150); w.restore();
  for (let i = 0; i < 18; i++) { const x = 120 + i * 270 + r2() * 90; if (x > 1450 && x < 1800) continue; if (x > 2750) break; line(w, [[x, G - 2], [x + 4, G - 70]], 4, "#4E8A3A"); at(w, x + 4, G - 72, .32, 0, () => blossom(w, 1, r2() > .5 ? GOLD : "#F4F0E6")); }
  for (const x of [700, 2300]) { poly(w, rrect(x - 12, G - 40, 24, 40, 6)); fill(w, "#F2EAD8"); stroke(w, 2.6); ellipse(w, x, G - 44, 40, 24); fill(w, "#E5484D"); stroke(w, 3); for (const dx of [-16, 4, 18]) { ellipse(w, x + dx, G - 50, 5, 4); fill(w, "#fff"); } }
  for (let i = 0; i < 9; i++) { const x = 3300 + i * 180 + r2() * 60; ellipse(w, x, G + 2, 30 + r2() * 20, 18); fill(w, "#8C8478"); stroke(w, 2.6); line(w, [[x - 10, G - 8], [x + 4, G + 2]], 2, "rgba(30,22,18,.6)"); }
  return { far, mid, world: wc };
}
function cloud(ctx, x, y, s, dark = 0) { const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, rr = 1 + .22 * Math.sin(a * 5) + .1 * Math.sin(a * 11); P.push([x + Math.cos(a) * 120 * s * rr, y + Math.sin(a) * 50 * s * rr * (Math.sin(a) > 0 ? .6 : 1)]); }
  smooth(ctx, P); ctx.fillStyle = dark ? `rgba(${lerp(250, 110, dark)},${lerp(248, 100, dark)},${lerp(240, 110, dark)},.95)` : "rgba(250,248,240,.95)"; ctx.fill(); smooth(ctx, P); stroke(ctx, 3, "rgba(30,22,18,.45)"); }

// ---------------------------------------------------------------- HUD + titles (screen space)
function outlined(ctx, str, x, y, size, col = "#FFFFFF", font = "MBlack", align = "left") { ctx.save(); ctx.font = `${size}px "${font}"`; ctx.textAlign = align; ctx.lineJoin = "round"; ctx.lineWidth = size * .2; ctx.strokeStyle = INK; ctx.strokeText(str, x, y); ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore(); }
function hud(ctx, g, t) {
  const a = ss(1.9, 2.4, g) * (1 - ss(END_T - .3, END_T, t)); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const hn = hearts(g); for (let i = 0; i < 3; i++) { const lost = i >= hn, pop = lost ? 1 + .6 * (1 - ss(0, .3, g - (i === 2 ? 11.3 : 20.6))) : 1; at(ctx, 80 + i * 70, 78, pop, 0, () => heart(ctx, 0, 0, 1.6, !lost)); }
  outlined(ctx, "SCORE", 330, 72, 30, "#FFFFFF"); outlined(ctx, String(score(g)).padStart(6, "0"), 330, 118, 50, GOLD, "Mono");
  outlined(ctx, "WORLD 1-1", 1840, 90, 40, "#FFFFFF", "MBlack", "right");
  // boss bar
  const bb = ss(15.2, 15.6, g) * (1 - ss(24.05, 24.4, g));
  if (bb > 0) { ctx.save(); ctx.globalAlpha *= bb; const x0 = 560, w = 800, y = 150, hp = bossHP(g), lag = bossHP(Math.max(15, g - .35));
    outlined(ctx, "BOSS · THE LEGACY BUG", 960, y - 16, 34, "#FFFFFF", "MBlack", "center");
    poly(ctx, rrect(x0 - 6, y - 6, w + 12, 44, 12)); fill(ctx, INK); ctx.fillStyle = "#FFF3C4"; ctx.fillRect(x0, y, w * lag / 100, 32); const hg = ctx.createLinearGradient(0, y, 0, y + 32); hg.addColorStop(0, "#FF7A6A"); hg.addColorStop(1, "#C02A30"); ctx.fillStyle = hg; ctx.fillRect(x0, y, w * hp / 100, 32);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x0, y + 4, w * hp / 100, 6); ctx.restore(); }
  ctx.restore();
}
function title(ctx, g) {
  if (g > 2.6) return; const out = eIn(clamp((g - 2.2) / .35));
  const word = "CLAUDE"; ctx.save(); ctx.translate(0, -out * 700);
  [...word].forEach((ch, i) => { const t0 = .15 + i * .07, k = g < t0 ? 0 : eBack(clamp((g - t0) / .3), 2.4); if (k <= 0) return; const x = 960 + (i - 2.5) * 150, y = 330 + (1 - Math.min(1, k)) * -300;
    at(ctx, x, y, 1, Math.sin(i * 2) * .06, () => outlined(ctx, ch, 0, 0, 190, ORANGE, "MBlack", "center")); });
  const k2 = popS(g, .75, .35, 2); if (k2 > 0) at(ctx, 960, 450, k2, -.04, () => outlined(ctx, "vs THE BUGS", 0, 0, 84, "#FFFFFF", "MBlack", "center"));
  ctx.restore();
}
function warning(ctx, g) {
  if (g < 13.4 || g > 15.1) return; const a = ss(13.4, 13.6, g) * (1 - ss(14.9, 15.1, g)), blink = .6 + .4 * Math.sin(g * 18);
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = `rgba(229,72,77,${.18 * blink})`; ctx.fillRect(0, 0, W, H);
  for (const y of [300, 700]) { ctx.fillStyle = "rgba(20,10,10,.85)"; ctx.fillRect(0, y, W, 90); ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, 90); ctx.clip(); for (let x = -200 + ((g * 300) % 120); x < W + 200; x += 120) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60, y); ctx.lineTo(x + 20, y + 90); ctx.lineTo(x - 40, y + 90); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  ctx.globalAlpha *= blink; outlined(ctx, "WARNING", 960, 580, 170, "#FF5A50", "MBlack", "center"); outlined(ctx, "a big bug approaches", 960, 650, 44, "#FFFFFF", "IBold", "center"); ctx.restore();
}
function levelClear(ctx, g, t) {
  if (g < 24.35 || t > END_T) return; const word = "LEVEL CLEAR!";
  [...word].forEach((ch, i) => { const t0 = 24.35 + i * .045, k = g < t0 ? 0 : eBack(clamp((g - t0) / .3), 2.6); if (k <= 0) return; const x = 960 + (i - 5.5) * 104, y = 360 + Math.sin(g * 6 + i * .7) * 8;
    at(ctx, x, y, k, 0, () => outlined(ctx, ch, 0, 0, 150, i < 5 ? GOLD : "#FFFFFF", "MBlack", "center")); });
  [24.95, 25.15, 25.35].forEach((t0, i) => { const k = popS(g, t0, .35, 2.5); if (k > 0) starburst(ctx, 820 + i * 140, 470 - (i === 1 ? 30 : 0), 52 * k, { rays: 5, color: GOLD, inner: .45, rot: -Math.PI / 2, glow: .6 }); });
}
function endCard(ctx, t) {
  const a = ss(END_T, END_T + .4, t); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = .9 * a; ctx.fillStyle = "#F3EEDD"; ctx.fillRect(0, 0, W, H); ctx.restore();
  lightBands(ctx, W, H, t, { alpha: .45 * a });
  const k1 = popS(t, END_T + .2, .35, 2); if (k1 > 0) at(ctx, 960, 300, k1, 0, () => outlined(ctx, "Every frame is code.", 0, 0, 104, "#FFFFFF", "MBlack", "center"));
  const k2 = popS(t, END_T + .55, .35, 2); if (k2 > 0) at(ctx, 960, 430, k2, 0, () => outlined(ctx, "claude-animation", 0, 0, 80, ORANGE, "MBlack", "center"));
  const k3 = clamp((t - END_T - .9) / .25); if (k3 > 0) { ctx.save(); ctx.globalAlpha *= k3; ctx.font = "34px Mono"; const s = "github.com/buildwithhanif/claude-animation-skill", w = ctx.measureText(s).width + 60; poly(ctx, rrect(960 - w / 2, 505, w, 66, 20)); fill(ctx, INK); ctx.fillStyle = "#F3EEDD"; ctx.textAlign = "center"; ctx.fillText(s, 960, 549); ctx.restore(); }
  const hop = Math.abs(Math.sin((t - END_T) * 7)) * 60; critter(ctx, 960, 900 - hop, 1.1, { t, face: "happy", arms: "up", sq: hop < 6 ? 1.2 : .9, air: hop > 6 });
  ctx.save(); ctx.font = "30px ISemi"; ctx.fillStyle = "rgba(30,22,18,.55)"; ctx.textAlign = "right"; ctx.fillText("@hanifproduktif", 1880, 1050); ctx.restore();
}

// ---------------------------------------------------------------- the frame
function frame(ctx, t, S) {
  const g = TW.game(t), h = hero(g);
  // camera: follow the hero, then settle on the arena
  const Z = 1.32, VW = W / Z, follow = clamp(h.x - VW * .4, 0, WORLD - VW), camX = lerp(follow, 2720, ss(12.9, 14.4, g));
  const [sx, sy] = shake(t, SHAKES);
  const danger = ss(13.4, 15, g) * (1 - ss(23.9, 24.6, g)), glow = ss(23.9, 24.8, g);
  // sky
  const sk = ctx.createLinearGradient(0, 0, 0, G); sk.addColorStop(0, danger > 0 ? `rgb(${lerp(190, 120, danger)},${lerp(222, 70, danger)},${lerp(236, 90, danger)})` : glow > 0 ? "#F4D49A" : "#BEDDEB"); sk.addColorStop(1, danger > 0 ? `rgb(${lerp(246, 200, danger)},${lerp(238, 130, danger)},${lerp(220, 120, danger)})` : "#F6EEDC");
  ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
  sun(ctx, 1540 - camX * .03, 200, 86, { rayColor: danger > .5 ? "#C0392B" : "#D9A035" });
  lightBands(ctx, W, H, t, { alpha: .35 * (1 - danger) + .25 * glow });
  for (let i = 0; i < 6; i++) { const x = ((i * 520 - camX * .15 + t * 18) % 3120 + 3120) % 3120 - 400; cloud(ctx, x, 150 + (i % 3) * 70, .8 + (i % 2) * .3, danger); }
  ctx.save(); ctx.translate(sx, sy);
  ctx.drawImage(S.L.far, -camX * .25, 0); ctx.drawImage(S.L.mid, -camX * .5, 0);
  ctx.save(); ctx.translate(0, G); ctx.scale(Z, Z); ctx.translate(-camX, -G); ctx.drawImage(S.L.world, 0, 0);
  // tokens
  TOKENS.forEach((c, i) => { const hp = hero(c), x = hp.x + 20, y = hp.y - 80;
    if (g < c) { const sc = Math.abs(Math.cos(g * 3 + i)) * .8 + .2; at(ctx, x, y + Math.sin(g * 4 + i) * 6, 1, 0, () => { ctx.save(); ctx.scale(sc, 1); starburst(ctx, 0, 0, 28, { rays: 10, glow: .5, rot: i }); ctx.restore(); }); }
    else { burstParticles(ctx, t, R(c), x, y, { n: 10, speed: 300, life: .4, kind: "spark", seed: i + 1 }); floatText(ctx, t, R(c), x, y - 20, "+100", { size: 38, color: GOLD, font: "MBlack" }); } });
  // enemies
  for (const e of enemies(g)) { bug(ctx, e.x, e.y, BS, { t: g, ...e.p, flash: Math.min(.6, e.p.flash || 0) }); if (e.stars) for (let i = 0; i < 3; i++) { const a = g * 6 + i * 2.1; starburst(ctx, e.x + Math.cos(a) * 60, e.y - 60 + Math.sin(a) * 16, 12, { rays: 5, color: GOLD, inner: .45 }); } }
  const bo = boss(g); if (bo) bug(ctx, bo.x, bo.y, 2, { ...bo.p, flash: Math.min(.55, bo.p.flash || 0) });
  // boss shots: red error blobs rolling along the ground
  SHOTS.forEach((f, i) => { const d = g - f; if (d < 0 || d > 1.3) return; const x = BOSS_X - 250 - SHOT_V * d, y = G - 34; if (x < 2600) return;
    for (let k = 1; k <= 4; k++) { ctx.save(); ctx.globalAlpha *= .25 / k; ellipse(ctx, x + k * 28, y, 30 - k * 3, 30 - k * 3); fill(ctx, RED); ctx.restore(); }
    at(ctx, x, y, 1, -d * 10, () => { ellipse(ctx, 0, 0, 34, 34); const rg = ctx.createRadialGradient(-10, -10, 4, 0, 0, 36); rg.addColorStop(0, "#FF9A8A"); rg.addColorStop(1, "#B82028"); ctx.fillStyle = rg; ctx.fill(); stroke(ctx, 3); });
    outlined(ctx, "ERR", x, y + 10, 26, "#FFFFFF", "MBlack", "center"); });
  // the hero (afterimages while dashing, flicker while invulnerable)
  const drawHero = (c, gg, a = 1) => { const hh = hero(gg); if (hh.hide) return; critter(c, hh.x, hh.y, 1, hh.pose); };
  if (h.dash) { afterimages(ctx, g, (c, gg) => drawHero(c, gg), { n: 4, gap: .03, alpha: .45 }); speedLines(ctx, h.x - 40, h.y - 60, 0, 3, 90, 22, 3); }
  if (!h.hide) { ctx.save(); if (flicker(g)) ctx.globalAlpha *= .3; critter(ctx, h.x, h.y, 1, h.pose); ctx.restore(); }
  // charge: starburst forming above, embers
  if (g > 21.2 && g < 22.8) { const k = ss(21.3, 22.5, g); starburst(ctx, h.x, h.y - 220, 20 + 60 * k, { rays: 10, rot: g * 6, glow: k }); burstParticles(ctx, t, R(21.25), h.x, h.y - 20, { n: 26, speed: 40, life: 1.4, gravity: 300, kind: "ember", colors: ["rgba(255,200,110,.9)", "rgba(255,160,80,.9)"], size: 10, spread: 2, seed: 7 });
    burstParticles(ctx, t, R(21.9), h.x, h.y - 20, { n: 26, speed: 40, life: 1.2, gravity: 300, kind: "ember", colors: ["rgba(255,220,140,.9)"], size: 9, spread: 2, seed: 8 }); }
  // special: the starburst flies
  if (g >= 22.8 && g < 23.15) { const k = (g - 22.8) / .35, x = lerp(3290, BOSS_X - 90, eIn(k)), y = lerp(560, G - 130, k); afterimages(ctx, g, (c, gg) => { const kk = clamp((gg - 22.8) / .35); starburst(c, lerp(3290, BOSS_X - 90, eIn(kk)), lerp(560, G - 130, kk), 80, { rays: 10, rot: gg * 14, outline: false }); }, { n: 5, gap: .025, alpha: .5 });
    starburst(ctx, x, y, 80, { rays: 10, rot: g * 14, glow: 1 }); }
  // contact effects (real time)
  const FX = [[7.72, "POW!", 2860], [8.42, "WHAM!", 2830], [9.45, "STOMP!", 2960], [12.82, "BAM!!", 3060]];
  FX.forEach(([gc, word, x], i) => { const tc = R(gc), y = G - 90; burstParticles(ctx, t, tc, x, y, { n: 18, speed: 700, life: .45, seed: 11 + i }); ring(ctx, t, tc, x, y, 150); comicText(ctx, t, tc, x + 20, y - 170, word, { size: 88, font: "MBlack" }); });
  [8.3, 8.95, 9.95, 13.4].forEach((gc, i) => { const e = [[3406, 390], [3370, 880], [2960, 880], [3770, 580]][i], tc = R(gc);
    burstParticles(ctx, t, tc, e[0], e[1] - 50, { n: 16, speed: 420, life: .5, kind: "dust", colors: ["rgba(200,180,220,.9)", "rgba(255,255,255,.9)"], size: 16, gravity: 200, seed: 21 + i });
    floatText(ctx, t, tc, e[0], e[1] - 110, "+500", { size: 46, color: GOLD, font: "MBlack" }); });
  LANDS.forEach((L) => { const hh = hero(L + .001); landDust(ctx, t, R(L), hh.x, hh.y, 1); });
  BOSS_HITS.forEach((gc, i) => { const tc = R(gc), x = BOSS_X - 230, y = G - 120 - (i === 4 ? 60 : 0); burstParticles(ctx, t, tc, x, y, { n: 14, speed: 650, life: .4, seed: 31 + i }); ring(ctx, t, tc, x, y, 120, { w: 8 });
    floatText(ctx, t, tc, x + 40 + i * 12, y - 90, `-${BOSS_DMG[i]}`, { size: 52, color: "#FF6A5A", font: "MBlack" });
    if (i === 4) comicText(ctx, t, tc, x, y - 230, "UPPERCUT!", { size: 74, font: "MBlack" }); });
  if (g >= 19.2 && g < 20.9) { const n = BOSS_HITS.filter((hh) => g >= hh).length; if (n) at(ctx, 3380, 600, 1 + .25 * (1 - ss(0, .15, g - BOSS_HITS[n - 1])), -.08, () => { outlined(ctx, `x${n}`, 0, 0, 110, GOLD, "MBlack", "center"); outlined(ctx, "COMBO", 0, 50, 40, "#FFFFFF", "MBlack", "center"); }); }
  { const tc = R(15.0); ring(ctx, t, tc, BOSS_X, G, 420, { w: 16, squash: .25, dur: .5 }); burstParticles(ctx, t, tc, BOSS_X, G - 10, { n: 30, speed: 600, life: .7, kind: "debris", colors: ["#8C6A48", "#A2744C", "#6A4428"], size: 12, dir: -Math.PI / 2, spread: 2.2, seed: 41 }); }
  [15.45, 15.65, 15.85].forEach((gc) => ring(ctx, t, R(gc), BOSS_X - 200, G - 60, 380, { w: 12, color: "rgba(255,120,110,.8)", dur: .5 }));
  { const tc = R(23.15); ring(ctx, t, tc, BOSS_X - 90, G - 130, 600, { w: 24, dur: .6 }); ring(ctx, t, tc + .08, BOSS_X - 90, G - 130, 400, { w: 14, dur: .5, color: ORANGE }); burstParticles(ctx, t, tc, BOSS_X - 90, G - 130, { n: 40, speed: 1100, life: .6, seed: 51 });
    comicText(ctx, t, tc + .05, BOSS_X - 120, G - 430, "CRITICAL!", { size: 110, font: "MBlack", dur: 1.0, star: "#FF8A5A" }); }
  { const tc = R(23.95); burstParticles(ctx, t, tc, BOSS_X, G - 120, { n: 36, speed: 900, life: .8, kind: "debris", colors: ["#3E6B4A", "#5E8F6A", "#2A4A33"], size: 16, seed: 61 }); burstParticles(ctx, t, tc, BOSS_X, G - 160, { n: 60, speed: 800, life: 1.8, kind: "confetti", colors: [GOLD, ORANGE, "#FFFFFF", "#6FB25A"], size: 14, gravity: 700, seed: 62 });
    ring(ctx, t, tc, BOSS_X, G - 120, 700, { w: 20, dur: .6 }); floatText(ctx, t, tc + .3, BOSS_X, G - 250, "+5000", { size: 70, color: GOLD, font: "MBlack", dur: .9 }); }
  ctx.restore(); // world
  ctx.restore(); // shake
  // darken for the charge, flash for the special and the K.O.
  const dim = ss(21.3, 21.8, g) * (1 - ss(22.9, 23.2, g)); if (dim > 0) { ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = `rgba(80,60,90,${.45 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const fl = Math.max(flashAlpha(t, R(23.15), .3), .7 * flashAlpha(t, R(23.95), .25), .5 * flashAlpha(t, R(15.0), .15)); if (fl > 0) { ctx.save(); ctx.globalAlpha = fl; ctx.fillStyle = "#FFFBEE"; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  comicText(ctx, t, R(23.95), 960, 560, "K.O.", { size: 260, font: "MBlack", dur: 1.1, star: "#FF8A5A", rot: -.06 });
  title(ctx, g); warning(ctx, g); hud(ctx, g, t); levelClear(ctx, g, t);
  S.finish(ctx, Math.round(t * FPS));
  endCard(ctx, t);
}
const SHAKES = [[R(1.0), 6], [R(7.72), 12], [R(8.42), 12], [R(9.45), 14], [R(11.3), 16], [R(12.82), 20], [R(15.0), 34], [R(15.45), 12], [R(15.65), 12], [R(15.85), 12],
  ...BOSS_HITS.map((h, i) => [R(h), i === 4 ? 18 : 10]), [R(20.6), 18], [R(23.15), 44], [R(23.95), 30]];

// ---------------------------------------------------------------- sound cues + music sections (real time)
function cues() {
  const Q = [], add = (sfx, t, vol = .45, o = {}) => Q.push({ sfx, t: +(t - .03).toFixed(3), vol, ...o });
  [.15, .22, .29, .36, .43, .5].forEach((t, i) => add("pop", t, .4, { pitch: .8 + i * .08 })); add("thump", .78, .45); add("whoosh", .3, .35, { dur: .6 });
  add("fall", .35, .3); add("thump", R(1.0), .55); add("boing", R(1.0) + .02, .25);
  SEG.filter((s) => s.k === "jump").forEach((s) => add("boing", R(s.a), .35, { pitch: 1.3 + (s.h > 200 ? .15 : 0) }));
  LANDS.forEach((L) => add("step", R(L), .5, { pitch: .6 }));
  SEG.filter((s) => s.k === "run").forEach((s) => { for (let g = s.a; g < s.b; g += .09) add("step", R(g), .18); });
  TOKENS.forEach((c, i) => { add("chime", R(c), .3, { dur: .4, pitch: 1.4 + i * .05 }); add("tick", R(c), .3, { pitch: 1.5 }); });
  add("pop", R(6.9), .4, { pitch: 1.3 });
  for (const [a] of [[7.35], [18.75]]) add("whip", R(a), .5, { dur: .35 });
  for (const gc of [7.72, 8.42, 12.82]) { add("thump", R(gc), .7); add("crack", R(gc), .55); }
  add("thump", R(9.45), .6); add("pop", R(9.45), .5, { pitch: .7 });
  [8.3, 8.95, 9.95, 13.4].forEach((gc) => { add("pop", R(gc), .45, { pitch: 1.2 }); add("sparkle", R(gc) + .05, .25); });
  add("fall", R(10.9), .35); add("thump", R(11.3), .5); add("fall", R(11.32), .45, { pitch: .8 });
  add("riser", R(13.4), .35, { dur: 1.5 });
  add("thump", R(15.0), .9, { pitch: .6 }); add("crack", R(15.0), .6, { pitch: .7 });
  [15.45, 15.65, 15.85].forEach((gc) => add("buzz", R(gc), .45, { dur: .25, pitch: .6 }));
  SHOTS.forEach((f) => add("whip", R(f), .45, { pitch: .8 }));
  BOSS_HITS.forEach((h, i) => { add("thump", R(h), .6, { pitch: 1 + i * .06 }); add("crack", R(h), .45, { pitch: 1 + i * .08 }); });
  add("whoosh", R(20.45), .5); add("thump", R(20.6), .6); add("fall", R(20.62), .4, { pitch: .8 });
  add("riser", R(21.3), .55, { dur: 1.4 }); add("sparkle", R(22.4), .4);
  add("whip", R(22.8), .6, { dur: .4, pitch: .7 }); add("thump", R(23.15), 1.0, { pitch: .5 }); add("crack", R(23.15), .8, { pitch: .6 });
  add("riser", R(23.3), .35, { dur: .6 }); add("thump", R(23.95), .8, { pitch: .55 }); add("crack", R(23.95), .6); add("sparkle", R(24.0), .5); add("chime", R(24.0), .45);
  [24.3, 24.9].forEach((g) => add("boing", R(g), .35, { pitch: 1.4 }));
  [24.95, 25.15, 25.35].forEach((g, i) => add("chime", R(g), .35, { dur: .4, pitch: 1.2 + i * .15 }));
  add("whoosh", END_T, .35); add("pop", END_T + .2, .45); add("pop", END_T + .55, .4, { pitch: 1.2 });
  return Q;
}
if (process.argv[2] === "cues") {
  fs.writeFileSync(path.join(HERE, "cues.json"), JSON.stringify(cues()));
  const sec = `level:0-${R(13.4).toFixed(2)},alarm:${R(13.4).toFixed(2)}-${R(15.0).toFixed(2)},boss:${R(15.0).toFixed(2)}-${R(24.0).toFixed(2)},fanfare:${R(24.0).toFixed(2)}-${(R(24.0) + 2.6).toFixed(2)},outro:${(R(24.0) + 2.6).toFixed(2)}-30`;
  fs.writeFileSync(path.join(HERE, "sections.txt"), sec); console.log("wrote cues.json", cues().length, "cues; sections", sec); process.exit(0);
}

run({ name: "claude-game", W, H, fps: FPS, dur: DUR, out: path.join(HERE, "out"),
  setup() { return { L: buildLevel(), finish: filmFinish(W, H, { grain: .08, flicker: .01, vignette: .16 }) }; },
  frame: (ctx, t, i, S) => frame(ctx, t, S) });
