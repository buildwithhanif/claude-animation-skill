// film.mjs — "HANIF & CLAUDE: The Money Quest", 30 s, 16:9. Hanif (lib/rigs/chibi.mjs + the HANIF look) and
// Claude (lib/rigs/critter.mjs) go from an empty wallet to a treasure chest.
//   node film.mjs sheet 1,3,5.5,9,14.5,20,24,28.5 | verify | cues | render
//
// STYLE BIBLE: textured storybook (paper grain, light bands, gradients, ink outlines, hatching), warm palette.
// Hanif: bushy black hair, square black glasses, cream shirt, yellow pocket + red pen, black pants, sneakers.
// Claude: the orange block critter. Every scene has one gag with a clear end state.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = process.env.CLAUDE_ANIMATION_LIB || path.join(HERE, "../../plugins/claude-animation/skills/claude-animation/lib");
const { clamp, lerp, ss, eOut, eIn, eIO, eBack, popS, at, line, ellipse, stroke, fill, poly, smooth, hatch, burst, speedLines, rrect, rng, rad, hash, createCanvas, INK } = await import(path.join(LIB, "core.mjs"));
const { paper, lightBands, sun, moon, star4, grass } = await import(path.join(LIB, "textures.mjs"));
const { burstParticles, landDust, ring, comicText, floatText, starburst } = await import(path.join(LIB, "fx.mjs"));
const { critter } = await import(path.join(LIB, "rigs/critter.mjs"));
const { chibi } = await import(path.join(LIB, "rigs/chibi.mjs"));
const { bug } = await import(path.join(LIB, "rigs/bug.mjs"));
const { run } = await import(path.join(LIB, "film.mjs"));
const { GlobalFonts } = await import(path.join(LIB, "../node_modules/@napi-rs/canvas/index.js"));
const FD = process.env.FONT_DIR || path.join(process.env.HOME, ".claude/skills/tesseract-edit/assets/fonts");
const reg = (f, n) => { if (fs.existsSync(f)) GlobalFonts.registerFromPath(f, n); };
reg(path.join(FD, "Montserrat/Montserrat-Black.ttf"), "MBlack"); reg(path.join(FD, "Inter/Inter_28pt-SemiBold.ttf"), "ISemi");

const W = 1920, H = 1080, FPS = 24, DUR = 30, GOLD = "#F5B81E", ORANGE = "#D97757";
const HANIF = { skin: "#FBDDB0", shirt: "#FBF4E2", pants: "#23232A", shoes: "#23232A", hair: "#1A1A1E", pocket: "#E8B040", pen: "#D8342E" };
const S_ = { room: 0, map: 4.2, forest: 6.8, canyon: 12.0, mountain: 17.5, treasure: 22.5, sunset: 27.2 };

// ---------------------------------------------------------------- shared props
function outlined(ctx, str, x, y, size, col = "#fff", font = "MBlack", align = "center") { ctx.save(); ctx.font = `${size}px "${font}"`; ctx.textAlign = align; ctx.lineJoin = "round"; ctx.lineWidth = size * .2; ctx.strokeStyle = INK; ctx.strokeText(str, x, y); ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore(); }
function coin(ctx, x, y, r, spin = 0) { const sx = Math.max(.15, Math.abs(Math.cos(spin))); ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); ellipse(ctx, 0, 0, r, r); const g = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); g.addColorStop(0, "#FFE58A"); g.addColorStop(1, "#E0A01A"); ctx.fillStyle = g; ctx.fill(); stroke(ctx, 2.6); ellipse(ctx, 0, 0, r * .66, r * .66); stroke(ctx, 1.8, "#B8801A");
  ctx.font = `${r}px "MBlack"`; ctx.fillStyle = "#B8801A"; ctx.textAlign = "center"; ctx.fillText("$", 0, r * .36); ctx.restore(); }
function note(ctx, x, y, s, rot) { at(ctx, x, y, s, rot, () => { poly(ctx, rrect(-34, -18, 68, 36, 4)); fill(ctx, "#8CCB7A"); stroke(ctx, 2.4); ellipse(ctx, 0, 0, 10, 10); stroke(ctx, 2, "#3E7A3A"); line(ctx, [[-26, -10], [-18, -10]], 2, "#3E7A3A"); }); }
function wallet(ctx, open = 0) { poly(ctx, rrect(-34, -24, 68, 48, 8)); fill(ctx, "#7A4A2A"); stroke(ctx, 3); if (open > 0) { ctx.save(); ctx.translate(0, -24); ctx.scale(1, -open); poly(ctx, rrect(-34, 0, 68, 30, 8)); fill(ctx, "#94603A"); stroke(ctx, 3); ctx.restore(); poly(ctx, rrect(-28, -20, 56, 16, 3)); fill(ctx, "#3A2214"); } else line(ctx, [[-34, -6], [34, -6]], 2, "rgba(0,0,0,.4)"); }
function moth(ctx, x, y, t) { const f = Math.sin(t * 40) * .7; at(ctx, x, y, 1, 0, () => { for (const sg of [-1, 1]) { ctx.save(); ctx.scale(sg, 1); ctx.rotate(f * .6); ellipse(ctx, 14, -4, 16, 10, -.4); fill(ctx, "#C8BCA8"); stroke(ctx, 2); ctx.restore(); } ellipse(ctx, 0, 0, 5, 10); fill(ctx, "#8A7A64"); stroke(ctx, 2); }); }
function bulb(ctx, lit) { if (lit > 0) { const g = ctx.createRadialGradient(0, -10, 4, 0, -10, 80); g.addColorStop(0, `rgba(255,236,150,${.8 * lit})`); g.addColorStop(1, "rgba(255,236,150,0)"); ctx.fillStyle = g; ctx.fillRect(-80, -90, 160, 160); }
  ellipse(ctx, 0, -12, 20, 22); fill(ctx, lit > .5 ? "#FFF3B0" : "#E8EEF0"); stroke(ctx, 2.8); poly(ctx, rrect(-9, 6, 18, 14, 3)); fill(ctx, "#9AA0A8"); stroke(ctx, 2.2); line(ctx, [[-6, -6], [0, -16], [6, -6]], 1.8, lit > .5 ? "#E8A020" : "#9AA0A8"); }
function scroll(ctx, w = 70) { poly(ctx, rrect(-w / 2, -26, w, 52, 4)); fill(ctx, "#F2E2B8"); stroke(ctx, 2.6); for (const sx of [-w / 2, w / 2]) { ellipse(ctx, sx, 0, 8, 28); fill(ctx, "#D8C090"); stroke(ctx, 2.4); } line(ctx, [[-20, -8], [18, 8]], 2, "#C0392B", [5, 4]); ctx.font = "20px MBlack"; ctx.fillStyle = "#C0392B"; ctx.fillText("X", 12, 16); }
function bag(ctx, s = 1) { at(ctx, 0, 24, s, 0, () => { ctx.beginPath(); ctx.moveTo(-10, -30); ctx.quadraticCurveTo(-44, -10, -38, 20); ctx.quadraticCurveTo(0, 40, 38, 20); ctx.quadraticCurveTo(44, -10, 10, -30); ctx.closePath(); fill(ctx, "#C8A06A"); stroke(ctx, 3);
  line(ctx, [[-14, -30], [14, -30]], 6, "#8A5A2A"); ctx.font = "30px MBlack"; ctx.fillStyle = "#6A4A1A"; ctx.textAlign = "center"; ctx.fillText("$", 0, 16); }); }

// ================================================================ 1. ROOM (0 – 4.2)
function room(ctx, t, S) {
  ctx.drawImage(S.room, 0, 0);
  const glow = ss(2.1, 2.5, t); if (glow > 0) { const g = ctx.createRadialGradient(1150, 560, 30, 1150, 560, 700); g.addColorStop(0, `rgba(255,220,160,${.45 * glow})`); g.addColorStop(1, "rgba(255,220,160,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  // laptop on the desk
  at(ctx, 1150, 690, 1, 0, () => { poly(ctx, rrect(-150, -190, 300, 190, 12)); fill(ctx, "#4A4E58"); stroke(ctx, 3.4); poly(ctx, rrect(-136, -176, 272, 162, 6)); fill(ctx, glow > 0 ? `rgb(${lerp(40, 255, glow)},${lerp(48, 232, glow)},${lerp(60, 190, glow)})` : "#28303C");
    if (t < 2.1) { for (let i = 0; i < 5; i++) line(ctx, [[-110, -150 + i * 22], [-110 + 60 + (i * 37) % 120, -150 + i * 22]], 4, "rgba(150,170,200,.5)"); }
    poly(ctx, [[-180, 0], [180, 0], [160, 18], [-160, 18]]); fill(ctx, "#8A8E98"); stroke(ctx, 3); });
  if (t > 2.4 && t < 3.4) burstParticles(ctx, t, 2.45, 1150, 560, { n: 18, speed: 500, life: .5, seed: 3, colors: ["#FFE7B8", "#FFFFFF", "#F2A07A"] });
  // Claude pops out of the screen, lands on the desk, holds up the map
  if (t > 2.45) { const k = clamp((t - 2.45) / .5), cx = lerp(1150, 1400, eOut(k)), cy = lerp(600, 700, k) - 220 * 4 * k * (1 - k);
    const land = t > 2.95 && t < 3.15 ? 1.3 : 1; critter(ctx, cx, cy, .8, { t, air: k < 1, sq: k < 1 ? .85 : land, face: t > 3.2 ? "happy" : "surprised", arms: t > 3.3 ? "up" : "rest" });
    if (t > 3.3) at(ctx, cx, cy - 150 + Math.sin(t * 6) * 4, popS(t, 3.3, .3), -.1, () => scroll(ctx, 90)); }
  // Hanif at the desk: the empty wallet, a moth, a sigh, then surprise, then stars
  const face = t < .6 ? { eyes: "neutral", mouth: "rest" } : t < 2.2 ? { eyes: "neutral", brows: "worried", mouth: "frown", sweat: ss(1.2, 1.5, t) } : t < 3.6 ? { eyes: "wide", brows: "raised", mouth: "O" } : { eyes: "star", mouth: "smile", blush: 1 };
  const wOpen = ss(.6, .8, t);
  chibi(ctx, 700, 990, 1.35, { t, ...face, arms: t < 2.2 ? "carry" : t < 3.6 ? "shrug" : "cheer", holdR: t < 2.3 ? (c) => at(c, 10, -10, 1, 0, () => wallet(c, wOpen)) : undefined, headTilt: t > .9 && t < 2.2 ? -.08 : 0 }, HANIF);
  if (t > .75 && t < 2.6) { const k = (t - .75) / 1.8; moth(ctx, 720 + 60 * Math.sin(k * 9) + k * 120, 780 - k * 420, t); }
  if (t > 1.6 && t < 2.2) { ctx.save(); ctx.globalAlpha = 1 - ss(1.9, 2.2, t); ctx.font = "44px ISemi"; ctx.fillStyle = "#EDE6F0"; ctx.fillText("...", 780, 520 - (t - 1.6) * 40); ctx.restore(); }
  if (t > 3.6 && t < 4.2) comicText(ctx, t, 3.6, 700, 420, "LET'S GO!", { size: 74, font: "MBlack", dur: .7 });
}
function buildRoom() {
  const c = createCanvas(W, H), x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#2E2A4A"); g.addColorStop(1, "#4A3A5A"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = "multiply"; x.globalAlpha = .4; x.drawImage(paper(W, H, "#E8E0F0", .5), 0, 0); x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
  // window with night sky and moon
  poly(x, rrect(160, 150, 380, 420, 14)); const sk = x.createLinearGradient(0, 150, 0, 570); sk.addColorStop(0, "#1C2458"); sk.addColorStop(1, "#4A4A8A"); x.fillStyle = sk; x.fill();
  x.save(); poly(x, rrect(160, 150, 380, 420, 14)); x.clip(); const r = rng(4); for (let i = 0; i < 24; i++) star4(x, 170 + r() * 360, 160 + r() * 300, 3 + r() * 5); moon(x, 440, 250, 44); x.restore();
  poly(x, rrect(160, 150, 380, 420, 14)); stroke(x, 10, "#E8E0D0"); line(x, [[350, 150], [350, 570]], 8, "#E8E0D0"); line(x, [[160, 360], [540, 360]], 8, "#E8E0D0"); poly(x, rrect(152, 142, 396, 436, 16)); stroke(x, 3);
  // wall poster, shelf
  poly(x, rrect(1500, 170, 240, 170, 8)); fill(x, "#F2E6D0"); stroke(x, 3); x.font = "34px MBlack"; x.fillStyle = "#C0392B"; x.textAlign = "center"; x.fillText("DREAM", 1620, 250); x.fillText("BIG", 1620, 292);
  // desk
  poly(x, rrect(840, 690, 760, 36, 6)); fill(x, "#B98A5C"); stroke(x, 3.4); hatch(x, () => poly(x, rrect(840, 690, 760, 36, 6)), rad(-8), 8, "#8A5E3B", 1, .4, [840, 690, 1600, 730]);
  for (const lx of [880, 1540]) { poly(x, rrect(lx, 726, 26, 300, 4)); fill(x, "#8A5E3B"); stroke(x, 3); }
  poly(x, rrect(900, 640, 90, 50, 10)); fill(x, "#E8E0D0"); stroke(x, 3); for (let i = 0; i < 3; i++) line(x, [[920 + i * 20, 630], [915 + i * 20, 600]], 2, "rgba(230,220,210,.6)");    // mug
  x.fillStyle = "#3A2E48"; x.fillRect(0, 990, W, 90); line(x, [[0, 990], [W, 990]], 3);
  return c;
}

// ================================================================ 2. MAP (4.2 – 6.8)
const MAP_PATH = [[330, 780], [520, 700], [640, 560], [840, 520], [960, 620], [1100, 700], [1260, 600], [1380, 420], [1560, 360], [1640, 300]];
const STOPS = [[330, 780, "HOME"], [700, 500, "IDEA FOREST"], [1040, 690, "BUG CANYON"], [1420, 390, "CONTENT MTN"], [1640, 300, ""]];
function map(ctx, t, S) {
  ctx.fillStyle = "#3A2E48"; ctx.fillRect(0, 0, W, H);
  const u = ss(4.2, 4.6, t), w = 1600 * eOut(u);
  ctx.save(); ctx.beginPath(); ctx.rect(960 - w / 2, 110, w, 860); ctx.clip(); ctx.drawImage(S.map, 0, 0);
  const p = ss(4.7, 6.2, t), n = Math.max(2, Math.round(MAP_PATH.length * 12 * p)); const D = []; for (let i = 0; i < MAP_PATH.length - 1; i++) for (let k = 0; k < 12; k++) D.push([lerp(MAP_PATH[i][0], MAP_PATH[i + 1][0], k / 12), lerp(MAP_PATH[i][1], MAP_PATH[i + 1][1], k / 12)]);
  ctx.save(); ctx.setLineDash([16, 12]); ctx.beginPath(); D.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); stroke(ctx, 6, "#C0392B"); ctx.restore();
  const tip = D[Math.min(n, D.length) - 1];
  at(ctx, tip[0] - 26, tip[1] - 30, .45, 0, () => chibi(ctx, 0, 0, 1, { t, eyes: "happy", mouth: "smile", air: true }, HANIF)); at(ctx, tip[0] + 36, tip[1] - 6, .4, 0, () => critter(ctx, 0, 0, 1, { t, face: "happy", air: true }));
  if (p > .96) { outlined(ctx, "X", 1640, 318, 90, "#C0392B"); ring(ctx, t, 6.2, 1640, 290, 90, { color: "#C0392B" }); }
  ctx.restore();
  const k = popS(t, 4.55, .35, 2.2); if (k > 0) at(ctx, 960, 220, k, -.04, () => { outlined(ctx, "HANIF & CLAUDE", 0, -40, 64, "#FFFFFF"); outlined(ctx, "THE MONEY QUEST", 0, 50, 104, GOLD); });
}
function buildMap() {
  const c = createCanvas(W, H), x = c.getContext("2d"); x.drawImage(paper(W, H, "#EAD7A8", .5), 0, 0);
  const v = x.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1000); v.addColorStop(0, "rgba(120,80,30,0)"); v.addColorStop(1, "rgba(120,80,30,.45)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
  // forest blobs, canyon, mountain, sea
  for (let i = 0; i < 9; i++) { const tx = 600 + (i % 3) * 60 + hash(i) * 30, ty = 470 + Math.floor(i / 3) * 40; line(x, [[tx, ty + 20], [tx, ty + 40]], 4, "#6A4A2A"); ellipse(x, tx, ty, 26, 24); fill(x, "#6FA45A"); stroke(x, 2.4); }
  x.beginPath(); x.moveTo(960, 720); x.lineTo(1000, 650); x.lineTo(1040, 730); x.lineTo(1080, 660); x.lineTo(1120, 720); stroke(x, 4, "#8A4A2A");
  poly(x, [[1300, 470], [1420, 300], [1540, 470]]); fill(x, "#B8A080"); stroke(x, 3); poly(x, [[1390, 340], [1420, 300], [1450, 340], [1430, 330], [1420, 345], [1405, 332]]); fill(x, "#FFFFFF");
  x.font = "34px MBlack"; x.fillStyle = "#6A3A1A"; x.textAlign = "center"; for (const [sx, sy, name] of STOPS) if (name) x.fillText(name, sx, sy + 70);
  at(x, 330, 760, 1, 0, () => { poly(x, [[-34, 0], [0, -30], [34, 0], [34, 30], [-34, 30]]); fill(x, "#E8C090"); stroke(x, 3); });
  x.font = "32px MBlack"; x.fillText("N", 1720, 880); line(x, [[1720, 890], [1720, 950]], 3, "#6A3A1A"); poly(x, [[1706, 900], [1720, 870], [1734, 900]]); fill(x, "#C0392B");
  return c;
}

// ================================================================ 3–5. THE JOURNEY (one long side-scrolling world)
const G = 870, WORLD = 7200;
function buildJourney() {
  const c = createCanvas(WORLD, H), x = c.getContext("2d");
  // ground spans with a canyon gap at 3000–3320
  const ground = (x0, x1, top = G) => { const gg = x.createLinearGradient(0, top, 0, H); gg.addColorStop(0, "#A2744C"); gg.addColorStop(1, "#6A4428"); x.fillStyle = gg; x.fillRect(x0, top, x1 - x0, H - top); hatch(x, () => { x.beginPath(); x.rect(x0, top, x1 - x0, H - top); }, rad(-30), 8, "#4E321C", 1, .3, [x0, top, x1, H]);
    x.fillStyle = "#6FB25A"; x.fillRect(x0, top - 4, x1 - x0, 22); line(x, [[x0, top - 4], [x1, top - 4]], 3); line(x, [[x0, top + 18], [x1, top + 18]], 2.4); line(x, [[x0, top - 4], [x0, H]], 3); line(x, [[x1, top - 4], [x1, H]], 3); grass(x, top - 4, x0, x1, 18, 3); };
  ground(-10, 3000); ground(3320, WORLD + 10);
  // canyon walls going down
  const cw = x.createLinearGradient(0, G, 0, H); cw.addColorStop(0, "#5A3A2A"); cw.addColorStop(1, "#2A1A14"); x.fillStyle = cw; x.fillRect(3000, G + 20, 320, H); hatch(x, () => { x.beginPath(); x.rect(3000, G + 20, 320, H); }, rad(-60), 7, "#1A100A", 1.2, .4, [3000, G, 3320, H]);
  // idea forest: trees with bulbs (bulbs drawn live), 0–2900
  for (let i = 0; i < 12; i++) { const tx = 260 + i * 230, th = 280 + hash(i) * 80; line(x, [[tx, G], [tx, G - th]], 22, "#6B4A2E"); line(x, [[tx, G], [tx, G - th]], 12, "#8A6240");
    for (const [dx, dy, r] of [[0, -th - 40, 110], [-70, -th + 10, 80], [70, -th + 5, 85]]) { ellipse(x, tx + dx, G + dy, r, r * .85); const tg = x.createRadialGradient(tx + dx - 30, G + dy - 30, 5, tx + dx, G + dy, r); tg.addColorStop(0, "#9CCB7C"); tg.addColorStop(1, "#4E8A42"); x.fillStyle = tg; x.fill(); x.lineWidth = 3.4; x.strokeStyle = INK; x.stroke(); } }
  // content mountain: a stair of giant cards, 3800 → 5600 rising
  for (let i = 0; i < 7; i++) { const x0 = 3900 + i * 240, top = G - 110 * (i + 1), cols = ["#FFFFFF", "#FFF4D6", "#E6F0FF", "#FFE6E0", "#E8F6E0", "#F4E6FF", "#FFFFFF"];
    poly(x, rrect(x0, top, 260, G - top + 20, 16)); fill(x, cols[i]); stroke(x, 4); poly(x, rrect(x0 + 20, top + 20, 220, 70, 8)); fill(x, ["#D97757", "#6A8FD8", "#5EAA6A", "#E0A01A", "#B06AC8", "#D85A6A", "#3A3A48"][i]);
    for (let k = 0; k < 3; k++) line(x, [[x0 + 24, top + 116 + k * 26], [x0 + 24 + 150 - k * 30, top + 116 + k * 26]], 8, "rgba(40,40,50,.25)"); x.font = "28px MBlack"; x.fillStyle = "#FFFFFF"; x.fillText(`${i + 1}/7`, x0 + 36, top + 64); }
  // summit plateau
  poly(x, rrect(5580, G - 880, 900, 900, 20)); const sg = x.createLinearGradient(0, G - 880, 0, H); sg.addColorStop(0, "#C89060"); sg.addColorStop(1, "#6A4428"); x.fillStyle = sg; x.fill(); stroke(x, 4); x.fillStyle = "#6FB25A"; x.fillRect(5580, G - 884, 900, 22); line(x, [[5580, G - 884], [6480, G - 884]], 3);
  line(x, [[6300, G - 884], [6300, G - 1060]], 8, "#6B4A2E"); poly(x, [[6300, G - 1060], [6400, G - 1030], [6300, G - 1000]]); fill(x, "#D8342E"); stroke(x, 3);
  return c;
}
// the pair's journey path in world coordinates (x, groundY) by time
const J = [
  [6.8, 200, G], [11.6, 2900, G],                     // run through the forest to the canyon edge
  [12.2, 2930, G], [13.5, 2930, G],                   // stop, look down
  [15.6, 3440, G],                                    // cross (Hanif over the Claude-bridge)
  [16.2, 3440, G], [17.5, 3850, G],                   // run to the mountain
];
function hanifAt(t) {
  if (t < 11.6) return { x: lerp(200, 2900, ss(6.8, 11.6, t) * .98 + (t - 6.8) / 4.8 * .02), y: G, run: true };
  if (t < 14.25) return { x: lerp(2900, 2940, ss(11.6, 12.2, t)), y: G, run: false };
  if (t < 15.6) { const k = eIO((t - 14.25) / 1.35); return { x: lerp(2940, 3400, k), y: G - 26 * Math.sin(k * Math.PI) - (k > .08 && k < .92 ? 14 : 0), run: true, slow: true }; }
  if (t < 17.5) return { x: lerp(3400, 3780, ss(16.1, 17.5, t)), y: G, run: t > 16.1 };
  // the card staircase: hop up one card every .62 s
  const k = (t - 17.5) / .62, i = Math.floor(k), f = k - i; if (i >= 7) { const top = G - 880; const w = clamp((t - 17.5 - 7 * .62) / .5); return { x: lerp(3900 + 6 * 240 + 130, 5900, w), y: top, run: w < 1 }; }
  const x0 = 3780 + i * 240, x1 = 3780 + (i + 1) * 240 + (i === 0 ? 0 : 0), y0 = i === 0 ? G : G - 110 * i, y1 = G - 110 * (i + 1);
  return { x: lerp(x0, x1, f) + 30, y: lerp(y0, y1, f) - 170 * 4 * f * (1 - f) * .6, air: f > .05 && f < .95 };
}
function claudeAt(t) {
  if (t < 11.6) { const h = hanifAt(t); return { x: h.x + 190, y: G - Math.abs(Math.sin(t * 7)) * 60, hop: true }; }
  if (t < 13.4) return { x: lerp(3100, 3090, ss(11.6, 12.2, t)) , y: G, stand: true, think: t > 12.4 };
  if (t < 13.75) { const k = (t - 13.4) / .35; return { x: lerp(3090, 3160, k), y: G - 180 * 4 * k * (1 - k), air: true }; }
  if (t < 15.8) return { x: 3160, y: G + 2, plank: ss(13.75, 13.9, t) };
  if (t < 16.25) { const k = (t - 15.8) / .45; return { x: lerp(3160, 3500, k), y: G + 2 - 240 * 4 * k * (1 - k), air: true, pop: true }; }
  const h = hanifAt(t); return { x: h.x + 170, y: h.y - Math.abs(Math.sin(t * 7)) * 50, hop: true };
}
function journey(ctx, t, S) {
  const h = hanifAt(t), Z = 1.5, camX = clamp(h.x - W / Z * .38, 0, WORLD - W / Z), camY = t < 17.5 ? 0 : Math.min(0, h.y - G) * .92;
  // sky: morning in the forest, midday canyon, golden on the mountain
  const gold = ss(17, 22, t), sk = ctx.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, gold > .5 ? "#F2C890" : "#BEDDEB"); sk.addColorStop(1, "#F6EEDC"); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
  sun(ctx, 1500 - camX * .03, 200 + camY * .1, 80); lightBands(ctx, W, H, t, { alpha: .35 });
  for (let i = 0; i < 5; i++) { const cx = ((i * 640 - camX * .2) % 3200 + 3200) % 3200 - 400, cy = 160 + (i % 3) * 70 - camY * .3; ellipse(ctx, cx, cy, 120, 40); fill(ctx, "rgba(250,248,240,.95)"); ellipse(ctx, cx - 50, cy - 20, 60, 36); fill(ctx, "rgba(250,248,240,.95)"); ellipse(ctx, cx + 50, cy - 16, 56, 30); fill(ctx, "rgba(250,248,240,.95)"); }
  ctx.save(); ctx.translate(0, 930); ctx.scale(Z, Z); ctx.translate(-camX, -G - camY); ctx.drawImage(S.journey, 0, 0);
  // bulbs hanging in the forest; the grabbed one lights
  for (let i = 0; i < 12; i++) { const tx = 260 + i * 230, th = 280 + hash(i) * 80, bx = tx + 40, by = G - th + 30 + Math.sin(t * 2 + i) * 4; if (i === 7 && t > 9.05) continue; line(ctx, [[bx, by - 50], [bx, by - 30]], 2); at(ctx, bx, by, .8, 0, () => bulb(ctx, 0)); }
  // bugs in the canyon
  for (let i = 0; i < 4; i++) { const bx = 3040 + ((t * 60 * (i % 2 ? 1 : -1) + i * 90) % 240 + 240) % 240, jump = t > 13.75 && t < 16 ? Math.abs(Math.sin(t * 8 + i)) * 40 : 0; bug(ctx, bx, H - 20 - jump, .55, { t, gait: t * 12, flip: i % 2 === 1, angry: true, jaw: jump > 20 ? 1 : 0 }); }
  // Claude
  const c = claudeAt(t);
  if (c.plank > 0) { // Claude stretches into a bridge across the gap
    const k = c.plank; critter(ctx, c.x, c.y, 1, { t, sq: lerp(1, 6.2, k), face: t > 14.25 ? "focus" : "surprised", air: false }); }
  else critter(ctx, c.x, c.y, .9, { t, air: c.air || (c.hop && c.y < G - 2), face: c.think ? "focus" : c.pop ? "happy" : "happy", sq: c.hop && c.y > G - 6 ? 1.2 : c.air ? .85 : 1, rot: c.pop ? -Math.PI * 2 * ss(15.8, 16.25, t) : 0 });
  if (t > 12.5 && t < 13.35) outlined(ctx, "?", c.x + 20, c.y - 150, 80, "#6A8FD8");
  // Hanif
  const face = t < 9.05 ? { eyes: "neutral", mouth: "smile" } : t < 11.6 ? { eyes: "happy", mouth: "smile", blush: .6 } : t < 13.6 ? { eyes: "wide", brows: "worried", mouth: "O", sweat: 1 } : t < 15.6 ? { eyes: "side", brows: "worried", mouth: "flat", sweat: .6 } : { eyes: "happy", mouth: "smile" };
  const holdingBulb = t > 9.05 && t < 11.8;
  chibi(ctx, h.x, h.y, .95, { t, ...face, gait: (h.run || h.slow) ? t * (h.slow ? 8 : 16) : undefined, run: h.run && !h.slow, air: h.air || (t > 8.7 && t < 9.4),
    arms: t > 8.8 && t < 9.2 ? "up" : holdingBulb ? undefined : t > 12.2 && t < 13.6 ? "shrug" : undefined, armR: holdingBulb ? [160, 10] : undefined, holdR: holdingBulb ? (cc) => at(cc, 0, -30, 1, 0, () => bulb(cc, ss(9.05, 9.3, t))) : undefined,
    headTilt: t > 12.3 && t < 13.5 ? .18 : 0 }, HANIF);
  if (t > 8.7 && t < 9.4) { /* the jump for the bulb */ }
  if (t > 9.05 && t < 10) { ring(ctx, t, 9.08, h.x + 60, h.y - 400, 120, { color: "#FFE58A" }); comicText(ctx, t, 9.1, h.x + 60, h.y - 470, "IDEA!", { size: 70, font: "MBlack", dur: .8 }); }
  if (t > 15.8 && t < 16.4) comicText(ctx, t, 15.82, 3200, G - 200, "BOING!", { size: 64, font: "MBlack", dur: .6 });
  ctx.restore();
}

// ================================================================ 6. TREASURE (22.5 – 27.2)
function treasure(ctx, t, S) {
  ctx.drawImage(S.summit, 0, 0);
  const open = ss(22.9, 23.15, t), cx = 960, cy = 820;
  if (open > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 876); ctx.clip(); ctx.translate(cx, cy - 90); ctx.rotate(t * .4); ctx.globalAlpha = .35 * open; for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1200, -60); ctx.lineTo(1200, 60); ctx.closePath(); ctx.fillStyle = "#FFF1B8"; ctx.fill(); } ctx.restore(); }
  // chest
  at(ctx, cx, cy, 1.2, 0, () => { poly(ctx, rrect(-140, -110, 280, 120, 12)); const g = ctx.createLinearGradient(0, -110, 0, 10); g.addColorStop(0, "#B8783E"); g.addColorStop(1, "#7A4A22"); ctx.fillStyle = g; ctx.fill(); stroke(ctx, 4);
    for (const bx of [-100, 100]) { poly(ctx, rrect(bx - 12, -110, 24, 120, 3)); fill(ctx, "#E0A01A"); stroke(ctx, 2.6); } poly(ctx, rrect(-22, -84, 44, 40, 6)); fill(ctx, "#E0A01A"); stroke(ctx, 3);
    if (open > .2) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, -110, 130, 28, 0, Math.PI, 0); ctx.fillStyle = "#FFD86A"; ctx.fill(); ctx.restore(); for (let i = 0; i < 9; i++) coin(ctx, -100 + i * 25, -116 - (i % 2) * 8, 14, t * 3 + i); }
    ctx.save(); ctx.translate(0, -110); ctx.scale(1, lerp(1, -1.1, open)); poly(ctx, [[-140, 0], [-130, -60], [0, -84], [130, -60], [140, 0]]); fill(ctx, open > .5 ? "#6A3A1A" : "#A8703E"); stroke(ctx, 4); ctx.restore(); });
  // the eruption: coins, notes, sparkles
  if (t > 22.95) { burstParticles(ctx, t, 22.95, cx, cy - 150, { n: 50, speed: 1100, life: 1.6, gravity: 1300, kind: "confetti", colors: [GOLD, "#FFE58A", "#8CCB7A"], size: 22, dir: -Math.PI / 2, spread: 1.8, seed: 5 });
    const r = rng(7); for (let i = 0; i < 26; i++) { const d = t - 23.2 - (i % 13) * .12; if (d < 0) continue; const x = 200 + r() * 1520, y = -60 + d * d * 700 + d * 100; if (y > H + 60) { r(); continue; } coin(ctx, x, y, 22, d * 8 + i); }
    const r2 = rng(9); for (let i = 0; i < 12; i++) { const d = t - 23.5 - i * .15; if (d < 0) continue; const x = 300 + r2() * 1320 + Math.sin(d * 3 + i) * 60, y = -60 + d * 260; if (y > H + 60) continue; note(ctx, x, y, 1, Math.sin(d * 4 + i) * .6); } }
  // Claude spins on the lid, Hanif cheers with the bag
  const hop = t > 23.3 ? Math.abs(Math.sin((t - 23.3) * 6)) * 90 : 0;
  critter(ctx, cx + 320, cy - hop, 1, { t, face: t > 23 ? "happy" : "surprised", arms: t > 23.3 ? "up" : "rest", air: hop > 5, rot: t > 24.4 && t < 25 ? -Math.PI * 2 * ss(24.4, 25, t) : 0 });
  const hh = t > 23.4 ? Math.abs(Math.sin((t - 23.4) * 6 + 1)) * 80 : 0;
  chibi(ctx, cx - 380, cy + 60 - hh, 1.35, { t, eyes: t > 23 ? "star" : "wide", brows: "raised", mouth: t > 23 ? "smile" : "O", blush: t > 23 ? 1 : 0, air: hh > 5, arms: t > 23.4 ? "cheer" : "shrug", holdR: t > 24 ? (c) => bag(c, 1) : undefined }, HANIF);
  if (t > 22.9) { ring(ctx, t, 22.92, cx, cy - 120, 500, { w: 18, color: "#FFF1B8", dur: .6 }); comicText(ctx, t, 22.95, cx, 300, "JACKPOT!", { size: 120, font: "MBlack", dur: 1.4, star: "#FF8A5A" }); }
  const count = Math.round(999 * eOut((t - 23.6) / 2)); if (t > 23.6) at(ctx, 960, 170, popS(t, 23.6, .3, 2), 0, () => { coin(ctx, -110, -20, 34, t * 3); outlined(ctx, `x ${count}`, 40, 0, 70, GOLD); });
}
function buildSummit() {
  const c = createCanvas(W, H), x = c.getContext("2d"); const sk = x.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, "#F2A86A"); sk.addColorStop(1, "#FBE0B0"); x.fillStyle = sk; x.fillRect(0, 0, W, H);
  for (const [b, col] of [[640, "#D8A07A"], [720, "#C8886A"]]) { x.beginPath(); x.moveTo(0, H); for (let px = 0; px <= W; px += 30) x.lineTo(px, b - 80 * Math.sin(px * .003 + b) - 30 * Math.sin(px * .011)); x.lineTo(W, H); x.closePath(); x.fillStyle = col; x.fill(); x.strokeStyle = "rgba(30,22,18,.3)"; x.lineWidth = 2; x.stroke(); }
  poly(x, rrect(-20, 880, W + 40, 240, 0)); const gg = x.createLinearGradient(0, 880, 0, H); gg.addColorStop(0, "#C89060"); gg.addColorStop(1, "#8A5E3B"); x.fillStyle = gg; x.fill(); x.fillStyle = "#6FB25A"; x.fillRect(0, 876, W, 22); line(x, [[0, 876], [W, 876]], 3); grass(x, 876, 0, W, 20, 5);
  return c;
}

// ================================================================ 7. SUNSET (27.2 – 30)
function sunset(ctx, t, S) {
  const sk = ctx.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, "#3B2150"); sk.addColorStop(.55, "#D8667A"); sk.addColorStop(1, "#FBD3A0"); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
  sun(ctx, 960, 700, 150, { rayColor: "#FFD08A", len: [1.2, 1.9] }); lightBands(ctx, W, H, t, { alpha: .3 });
  ctx.save(); ctx.fillStyle = "#3A1E3A"; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 860); ctx.quadraticCurveTo(700, 780, 1300, 820); ctx.quadraticCurveTo(1650, 840, W, 800); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.restore();
  const k = eOut((t - 27.2) / .6);
  ctx.save(); ctx.globalAlpha = .95; chibi(ctx, 820, 850, 1.1, { t, eyes: "happy", mouth: "smile", arms: t > 27.9 ? "wave" : "rest", holdL: (c) => bag(c, .8), blush: .6 }, HANIF);
  critter(ctx, 1080, 845 - Math.abs(Math.sin(t * 5)) * 30, .85, { t, face: "happy", arms: "up", air: Math.abs(Math.sin(t * 5)) > .15 }); ctx.restore();
  ctx.save(); ctx.globalAlpha = k; outlined(ctx, "to be continued...", 960, 200, 70, "#FFFFFF"); ctx.font = "30px ISemi"; ctx.fillStyle = "rgba(255,240,230,.85)"; ctx.textAlign = "center"; ctx.fillText("@hanifproduktif · made with code", 960, 1040); ctx.restore();
}

// ================================================================ frame
function frame(ctx, t, S) {
  if (t < S_.map) room(ctx, t, S.A); else if (t < S_.forest) map(ctx, t, S.A); else if (t < S_.treasure) journey(ctx, t, S.A); else if (t < S_.sunset) treasure(ctx, t, S.A); else sunset(ctx, t, S.A);
  // quick white wipes on the cuts
  for (const c of [S_.map, S_.forest, S_.treasure, S_.sunset]) { const d = t - c; if (d > -.08 && d < .14) { ctx.save(); ctx.globalAlpha = 1 - Math.abs(d) / .14; ctx.fillStyle = "#FFFBEE"; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  S.finish(ctx, Math.round(t * FPS));
}
function cues() {
  const Q = [], add = (sfx, t, vol = .45, o = {}) => Q.push({ sfx, t: +(t - .03).toFixed(3), vol, ...o });
  add("click", .62, .5, { pitch: .7 }); add("whoosh", .8, .3, { pitch: 1.4, dur: .3 }); add("fall", 1.3, .4, { pitch: .7 }); add("drip", 1.5, .35);
  add("riser", 1.7, .3, { dur: .7 }); add("pop", 2.45, .6); add("sparkle", 2.47, .5); add("boing", 2.5, .35, { pitch: 1.3 }); add("thump", 2.95, .4); add("pop", 3.3, .4, { pitch: 1.3 }); add("chime", 3.6, .45);
  add("whoosh", 4.15, .5); add("thump", 4.55, .6); for (let i = 0; i < 16; i++) add("tick", 4.7 + i * .095, .22, { pitch: 1 + (i % 4) * .1 }); add("pop", 6.2, .45);
  add("whoosh", 6.75, .45); for (let t = 6.9; t < 11.6; t += .12) add("step", t, .16); for (let t = 6.9; t < 11.6; t += 60 / 420) add("boing", t, .08, { pitch: 1.6 });
  add("boing", 8.72, .4, { pitch: 1.3 }); add("chime", 9.08, .55); add("sparkle", 9.1, .4); add("thump", 9.4, .3);
  add("fall", 12.25, .35, { pitch: 1.2 }); add("buzz", 12.4, .35, { pitch: .7, dur: .5 }); add("tick", 12.5, .35); add("boing", 13.4, .4); add("boing", 13.8, .6, { pitch: .6, dur: .6 });
  for (let t = 14.3; t < 15.6; t += .18) add("step", t, .25, { pitch: .8 }); add("pop", 15.82, .6); add("boing", 15.85, .5, { pitch: 1.4 });
  for (let t = 16.2; t < 17.5; t += .12) add("step", t, .16); for (let i = 0; i < 7; i++) { add("boing", 17.5 + i * .62, .3, { pitch: 1.1 + i * .06 }); add("tick", 17.8 + i * .62, .3, { pitch: 1 + i * .1 }); }
  add("whoosh", 22.45, .45); add("scratch", 22.7, .45); add("thump", 22.93, .7, { pitch: .7 }); add("sparkle", 22.95, .6); add("chime", 23.0, .5);
  for (let i = 0; i < 40; i++) add("tick", 23.2 + i * .07, .16, { pitch: 1 + (i % 5) * .15 }); add("boing", 24.4, .35, { pitch: 1.3 });
  add("whoosh", 27.15, .35); add("chime", 28.8, .45);
  return Q;
}
if (process.argv[2] === "cues") { fs.writeFileSync(path.join(HERE, "cues.json"), JSON.stringify(cues())); console.log("wrote cues.json", cues().length); process.exit(0); }
const { filmFinish } = await import(path.join(LIB, "textures.mjs"));
run({ name: "money-quest", W, H, fps: FPS, dur: DUR, out: path.join(HERE, "out"),
  setup() { return { A: { room: buildRoom(), map: buildMap(), journey: buildJourney(), summit: buildSummit() }, finish: filmFinish(W, H, { grain: .07, flicker: .01, vignette: .14 }) }; },
  frame: (ctx, t, i, S) => frame(ctx, t, S) });
