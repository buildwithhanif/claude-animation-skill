// rig-sheet.mjs — the test sheet every rig must pass before it goes into a film:
// four walk phases, the special poses, flipped, plus a 2x crop of one pose.
//   node rig-sheet.mjs out.png
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const LIB = path.join(path.dirname(fileURLToPath(import.meta.url)), "../lib");
const { createCanvas } = await import(path.join(LIB, "core.mjs"));
const { ant, seed } = await import(path.join(LIB, "rigs/ant.mjs"));
const out = process.argv[2] || "rig-sheet.png";
const c = createCanvas(1800, 1000), x = c.getContext("2d"); x.fillStyle = "#F3EEDD"; x.fillRect(0, 0, 1800, 1000);
const G1 = 420, G2 = 900; x.fillStyle = "#9A6A45"; x.fillRect(0, G1, 1800, 30); x.fillRect(0, G2, 1800, 100);
[0, 1.2, 2.4, 3.6].forEach((ph, i) => ant(x, 180 + i * 330, G1, 1, { gait: ph, ant: Math.sin(i) }));
ant(x, 260, G2, 1.25, { rear: 1, overhead: (cc) => seed(cc, 1.5) });
ant(x, 700, G2, 1.25, { headDip: 18, ant: .8, jaw: .6, sweat: 1 });
ant(x, 1180, G2, 1.25, { carry: (cc) => seed(cc, .9), gait: .8, dust: 1 });
ant(x, 1640, G2, 1.25, { flip: true, blink: true });
fs.writeFileSync(out, c.toBuffer("image/png"));
const z = createCanvas(900, 600), zx = z.getContext("2d"); zx.drawImage(c, 560, 620, 450, 300, 0, 0, 900, 600);
fs.writeFileSync(out.replace(/\.png$/, "-zoom.png"), z.toBuffer("image/png")); console.log("wrote", out);
