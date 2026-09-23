// ambient.mjs — an original ambient bed synthesised in code: slow detuned pads (Dmaj9 → Bm7 → Gmaj7 → A6sus),
// a sparse pentatonic bell line, and filtered wind. For loops and "art" pieces: no drums, no hook.
//   node ambient.mjs out.wav --dur 30 --bar 7.5 --wind .25
// The last bar resolves back to the first chord so a 30 s file with --bar 7.5 loops cleanly.
import fs from "node:fs";
const A = process.argv, opt = (k, d) => A.includes(k) ? A[A.indexOf(k) + 1] : d;
const OUT = A[2] && !A[2].startsWith("--") ? A[2] : "ambient.wav";
const SR = 44100, DUR = parseFloat(opt("--dur", "30")), BAR = parseFloat(opt("--bar", "7.5")), WIND = parseFloat(opt("--wind", ".25"));
const N = Math.floor(SR * DUR), L = new Float32Array(N), R = new Float32Array(N), hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CH = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 66], [43, 50, 54, 59, 62], [45, 52, 57, 59, 64]];
for (let b = 0; b * BAR < DUR; b++) { const t0 = b * BAR, c = CH[b % 4];
  c.forEach((m, k) => { const f = hz(m), s0 = Math.round(t0 * SR), n = Math.round((BAR + 2) * SR), det = [1, 1.004, .996];
    for (let i = 0; i < n && s0 + i < N; i++) { const t = i / SR, env = Math.min(1, t / 2.2) * Math.min(1, (BAR + 2 - t) / 2.5); let v = 0;
      for (const d of det) v += Math.sin(2 * Math.PI * f * d * t + k) + .3 * Math.sin(4 * Math.PI * f * d * t);
      v *= env * (k === 0 ? .06 : .035); const p = (k - 2) * .15; L[s0 + i] += v * (1 - p); R[s0 + i] += v * (1 + p); } }); }
const PENT = [74, 76, 78, 81, 83, 86, 88]; let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let t = 1.2; t < DUR - 1.5; t += 1.3 + rnd() * 1.6) { const m = PENT[Math.floor(rnd() * PENT.length)], f = hz(m), s0 = Math.round(t * SR), n = Math.round(2.4 * SR), pan = rnd() - .5;
  for (let i = 0; i < n && s0 + i < N; i++) { const tt = i / SR, v = (Math.sin(2 * Math.PI * f * tt) + .35 * Math.sin(2 * Math.PI * f * 2.76 * tt) * Math.exp(-tt * 5)) * Math.exp(-tt * 1.8) * Math.min(1, i / 80) * .07; L[s0 + i] += v * (1 - pan); R[s0 + i] += v * (1 + pan); } }
let lp = 0, lp2 = 0, ns = 9; for (let i = 0; i < N; i++) { ns = (ns * 1103515245 + 12345) & 0x7fffffff; const w = ns / 0x7fffffff * 2 - 1, t = i / SR, cut = .012 + .01 * (1 + Math.sin(t * .7) * Math.sin(t * .23));
  lp += cut * (w - lp); lp2 += cut * (lp - lp2); const v = lp2 * WIND * 4 * (.6 + .4 * Math.sin(t * .5)); L[i] += v; R[i] += v * .9; }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const g = .8 / (pk || 1), buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32767), 46 + i * 4); }
fs.writeFileSync(OUT, buf); console.log("ambient", DUR, "s");
