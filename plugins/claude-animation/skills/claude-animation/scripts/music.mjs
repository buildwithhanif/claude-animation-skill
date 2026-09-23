// music.mjs — an original, playful bed synthesised in code (no samples, nothing to license):
// Karplus-Strong ukulele strums on C-G-Am-F, a pentatonic bell motif, shaker and a soft kick.
//   node music.mjs out.wav --dur 10.6 --bpm 108 --quiet 18.3-21.2,36.9-40.3 --end 10.2
// --quiet windows hold one soft chord (use for sad or serious beats); --end lands a final strum + bell.
import fs from "node:fs";

const A = process.argv, opt = (k, d) => A.includes(k) ? A[A.indexOf(k) + 1] : d;
const SR = 44100, DUR = parseFloat(opt("--dur", "30")), N = Math.floor(SR * DUR), END = parseFloat(opt("--end", String(DUR - 1.2)));
const L = new Float32Array(N), R = new Float32Array(N);
const BPM = parseFloat(opt("--bpm", "108")), BEAT = 60 / BPM, BAR = BEAT * 4;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// quiet windows (seconds): the music steps back for the dark chapters
const QUIET = (opt("--quiet", "") || "").split(",").filter(Boolean).map((w) => w.split("-").map(Number));
const quiet = (t) => QUIET.some(([a, b]) => t >= a && t < b);
const intro = (t) => t < BAR;                     // first bar: strum only

function add(buf, i, v) { if (i >= 0 && i < N) buf[i] += v; }

function pluck(t, midi, amp, pan = 0, decay = 0.9965) {
  const f = hz(midi), P = Math.max(2, Math.round(SR / f));
  const ring = new Float32Array(P);
  let seed = (midi * 9301 + Math.round(t * 1000)) % 233280;
  for (let k = 0; k < P; k++) { seed = (seed * 9301 + 49297) % 233280; ring[k] = seed / 233280 * 2 - 1; }
  const start = Math.round(t * SR), len = Math.round(SR * 1.6);
  let idx = 0;
  for (let n = 0; n < len; n++) {
    const a = ring[idx], b = ring[(idx + 1) % P];
    ring[idx] = decay * 0.5 * (a + b);
    const env = Math.min(1, n / 40);
    add(L, start + n, a * amp * env * (1 - pan) * 0.5);
    add(R, start + n, a * amp * env * (1 + pan) * 0.5);
    idx = (idx + 1) % P;
  }
}
function strum(t, chord, amp, up = false) {
  const notes = up ? [...chord].reverse() : chord;
  notes.forEach((m, k) => pluck(t + k * 0.013, m, amp * (0.85 + 0.15 * (k % 2)), (k - 1.5) * 0.15));
}
function bell(t, midi, amp, pan = 0) {
  const f = hz(midi), start = Math.round(t * SR), len = Math.round(SR * 1.4);
  for (let n = 0; n < len; n++) {
    const s = n / SR, e = Math.exp(-s * 3.2) * Math.min(1, n / 60);
    const v = (Math.sin(2 * Math.PI * f * s) + 0.35 * Math.sin(2 * Math.PI * f * 2.76 * s) * Math.exp(-s * 6)
      + 0.18 * Math.sin(2 * Math.PI * f * 5.4 * s) * Math.exp(-s * 9)) * e * amp;
    add(L, start + n, v * (1 - pan) * 0.5); add(R, start + n, v * (1 + pan) * 0.5);
  }
}
function shaker(t, amp) {
  const start = Math.round(t * SR), len = Math.round(SR * 0.07); let prev = 0, seed = start % 9973;
  for (let n = 0; n < len; n++) {
    seed = (seed * 16807) % 2147483647; const w = seed / 2147483647 * 2 - 1;
    const hp = w - prev; prev = w; const e = Math.sin(Math.PI * n / len) ** 2;
    add(L, start + n, hp * e * amp * 0.45); add(R, start + n, hp * e * amp * 0.55);
  }
}
function kick(t, amp) {
  const start = Math.round(t * SR), len = Math.round(SR * 0.28); let ph = 0;
  for (let n = 0; n < len; n++) {
    const s = n / SR, f = 50 + 70 * Math.exp(-s * 28); ph += 2 * Math.PI * f / SR;
    const v = Math.sin(ph) * Math.exp(-s * 11) * amp; add(L, start + n, v); add(R, start + n, v);
  }
}
function pad(t0, t1, chord, amp) {
  const a = Math.round(t0 * SR), b = Math.round(t1 * SR);
  for (let n = a; n < b && n < N; n++) {
    const s = n / SR, x = (n - a) / (b - a), env = Math.min(1, x * 6, (1 - x) * 6) * amp;
    let v = 0; for (const m of chord) v += Math.sin(2 * Math.PI * hz(m) * s) * (m < 60 ? 1 : 0.5);
    add(L, n, v * env * 0.3); add(R, n, v * env * 0.3);
  }
}

// ukulele-ish voicings (midi): C, G, Am, F
const CH = [[60, 64, 67, 72], [59, 62, 67, 71], [57, 60, 64, 69], [57, 60, 65, 69]];
const MOTIF = [[0, 84], [0.5, 81], [1, 79], [1.5, 81], [2, 76], [3, 79]];  // C6 A5 G5 A5 E5 G5, pentatonic
const PAT = [[0, 1.0, false], [1, 0.7, false], [1.5, 0.55, true], [2.5, 0.6, true], [3, 0.8, false], [3.5, 0.5, true]];

for (let bar = 0; bar * BAR < DUR - 1.2; bar++) {
  const t0 = bar * BAR, chord = CH[bar % 4];
  if (quiet(t0) || quiet(t0 + BAR - 0.01)) continue;
  for (const [b, v, up] of PAT) { const t = t0 + b * BEAT; if (!quiet(t) && t < END) strum(t, chord, 0.34 * v, up); }
  if (intro(t0)) continue;
  for (let e = 0; e < 8; e++) { const t = t0 + e * BEAT / 2; if (!quiet(t) && t < END) shaker(t, e % 2 ? 0.16 : 0.08); }
  for (const b of [0, 2]) { const t = t0 + b * BEAT; if (!quiet(t) && t < END) kick(t, 0.55); }
  if (bar % 2 === 1) for (const [b, m] of MOTIF) { const t = t0 + b * BEAT; if (!quiet(t) && t < END) bell(t, m, 0.16, 0.2); }
}
// the quiet chapters: one held chord, nothing else
QUIET.forEach(([a, b], i) => pad(a, b + .1, i % 2 ? [41, 53, 57, 60] : [45, 57, 60, 64], 0.1));
// the ending: one big strum and a bell on "Merdeka!" then let it ring
strum(END, [60, 64, 67, 72], 0.55); strum(END + 0.28, [60, 64, 67, 72], 0.4, true);
bell(END, 84, 0.24); bell(END + .28, 88, 0.2, -0.2); kick(END, 0.7);

// normalise to -1 dBFS peak, soft-clip safety, write 16-bit stereo WAV
let pk = 0; for (let n = 0; n < N; n++) pk = Math.max(pk, Math.abs(L[n]), Math.abs(R[n]));
const g = 0.89 / pk, buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  const fade = n > N - SR * 1.2 ? (N - n) / (SR * 1.2) : 1;
  buf.writeInt16LE(Math.round(Math.tanh(L[n] * g) * fade * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[n] * g) * fade * 32767), 46 + n * 4);
}
fs.writeFileSync(A[2] && !A[2].startsWith("--") ? A[2] : "music.wav", buf);
console.log("music", DUR, "s, peak gain", g.toFixed(2));
