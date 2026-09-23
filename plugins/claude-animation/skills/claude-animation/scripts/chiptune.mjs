// chiptune.mjs — an original video-game soundtrack synthesised in code: pulse-wave lead and arpeggio,
// triangle bass, noise hats/snare, a pitch-drop kick. Sections are placed on absolute times so the music
// can turn with the picture (level → alarm → boss → fanfare → outro).
//
//   node chiptune.mjs out.wav --dur 30 --bpm 150 --sections "level:0-13.5,alarm:13.5-15,boss:15-24,fanfare:24-26.6,outro:26.6-30"
//
// section kinds: level (major, bouncy), alarm (pulsing low bass + siren blip), boss (minor, driving 16ths),
// fanfare (rising arpeggio to a held chord), outro (soft arpeggio, ends on a chord), silence
import fs from "node:fs";

const A = process.argv, opt = (k, d) => A.includes(k) ? A[A.indexOf(k) + 1] : d;
const OUT = A[2] && !A[2].startsWith("--") ? A[2] : "chiptune.wav";
const SR = 44100, DUR = parseFloat(opt("--dur", "30")), BPM = parseFloat(opt("--bpm", "150")), B = 60 / BPM, BAR = B * 4, E8 = B / 2, S16 = B / 4;
const SECTIONS = opt("--sections", `level:0-${DUR}`).split(",").map((s) => { const [k, r] = s.split(":"); const [a, b] = r.split("-").map(Number); return { k, a, b }; });
const N = Math.floor(SR * DUR), L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan) * .5; R[i] += v * (1 + pan) * .5; } };

function pulse(t0, dur, midi, amp, duty = .25, pan = 0, vib = 0) { const f = hz(midi), s0 = Math.round(t0 * SR), n = Math.round(dur * SR); let ph = 0;
  for (let i = 0; i < n; i++) { const tt = i / SR, env = Math.min(1, i / 60) * (tt < dur * .7 ? 1 : 1 - (tt - dur * .7) / (dur * .3)) * (1 - .25 * Math.min(1, tt / .12)); ph += f * (1 + vib * Math.sin(tt * 34) * Math.min(1, tt / .2)) / SR; add(s0 + i, ((ph % 1) < duty ? 1 : -1) * amp * env, pan); } }
function tri(t0, dur, midi, amp) { const f = hz(midi), s0 = Math.round(t0 * SR), n = Math.round(dur * SR); let ph = 0;
  for (let i = 0; i < n; i++) { ph += f / SR; const x = ph % 1, v = x < .5 ? 4 * x - 1 : 3 - 4 * x, env = Math.min(1, i / 40) * Math.min(1, (n - i) / 400); add(s0 + i, v * amp * env); } }
let seed = 7; const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
function hat(t0, amp = .12, len = .04) { const s0 = Math.round(t0 * SR), n = Math.round(len * SR); let prev = 0; for (let i = 0; i < n; i++) { const w = noise(), hp = w - prev; prev = w; add(s0 + i, hp * amp * (1 - i / n), .2); } }
function snare(t0, amp = .3) { const s0 = Math.round(t0 * SR), n = Math.round(.14 * SR); for (let i = 0; i < n; i++) add(s0 + i, (noise() * .8 + Math.sin(2 * Math.PI * 190 * i / SR) * .4) * amp * Math.exp(-i / SR * 22)); }
function kick(t0, amp = .6) { const s0 = Math.round(t0 * SR), n = Math.round(.2 * SR); let ph = 0; for (let i = 0; i < n; i++) { const tt = i / SR; ph += (48 + 110 * Math.exp(-tt * 35)) / SR; add(s0 + i, Math.sin(ph * 2 * Math.PI) * amp * Math.exp(-tt * 14)); } }

// C major level loop: C G Am F. Melody in 8th-note slots (null = rest, "-" = hold previous)
const LEVEL_CH = [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]];
const LEVEL_MEL = [[76, "-", 79, "-", 84, "-", 83, 81], [79, "-", 74, "-", 79, 81, 83, "-"], [81, "-", 76, "-", 84, "-", 83, 81], [77, 79, 81, "-", 84, "-", 81, null]];
const BOSS_CH = [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]];   // Am F G E
const BOSS_MEL = [[69, 72, 76, 72, 81, 76, 72, 76], [65, 69, 72, 69, 77, 72, 69, 72], [67, 71, 74, 71, 79, 74, 71, 74], [68, 71, 76, 71, 80, 76, 71, 76]];

function level(a, b) {
  for (let bar = 0; a + bar * BAR < b; bar++) { const t0 = a + bar * BAR, ch = LEVEL_CH[bar % 4], mel = LEVEL_MEL[bar % 4];
    for (let q = 0; q < 4; q++) { const t = t0 + q * B; if (t >= b) break; tri(t, B * .9, ch[0] - 12 + (q % 2 ? 7 : 0), .32); kick(t, q % 2 ? 0 : .5); if (q % 2) snare(t, .22); hat(t + E8, .1); hat(t, .06); }
    for (let k = 0; k < 16; k++) { const t = t0 + k * S16; if (t >= b) break; pulse(t, S16 * .9, ch[k % 3] + 24 + (k >= 8 ? 12 : 0), .045, .125, -.3); }
    let held = null; for (let k = 0; k < 8; k++) { const t = t0 + k * E8, m = mel[k]; if (t >= b) break; if (m === "-") continue; if (m === null) continue;
      let len = 1; while (k + len < 8 && mel[k + len] === "-") len++; pulse(t, E8 * len * .95, m, .1, .25, .15, .006); } }
}
function boss(a, b) {
  for (let bar = 0; a + bar * BAR < b; bar++) { const t0 = a + bar * BAR, ch = BOSS_CH[bar % 4], mel = BOSS_MEL[bar % 4];
    for (let k = 0; k < 8; k++) { const t = t0 + k * E8; if (t >= b) break; tri(t, E8 * .85, ch[0] - 12 + (k % 2 ? 12 : 0), .34); if (k % 2 === 0) kick(t, .55); hat(t + S16, .09); }
    snare(t0 + B, .3); snare(t0 + 3 * B, .3); if (bar % 2) snare(t0 + 3.5 * B, .2);
    for (let k = 0; k < 16; k++) { const t = t0 + k * S16; if (t >= b) break; pulse(t, S16 * .85, mel[k % 8] + (bar % 2 ? 12 : 0), .07, .25, .1); }
    for (let q = 0; q < 2; q++) { const t = t0 + q * 2 * B; if (t < b) pulse(t, 2 * B * .9, ch[1] + 12, .035, .5, -.3); } }
}
function alarm(a, b) { for (let t = a; t < b; t += B) { tri(t, B * .8, 33, .4); kick(t, .45); pulse(t, B * .45, 81, .05, .5, 0); pulse(t + B * .5, B * .45, 76, .05, .5, 0); } }
function fanfare(a, b) { const run = [60, 64, 67, 72, 76, 79, 84]; run.forEach((m, i) => pulse(a + i * S16 * 1.3, S16 * 1.2, m, .1, .25)); const h = a + run.length * S16 * 1.3;
  for (const m of [72, 76, 79, 84]) pulse(h, Math.max(.2, b - h - .1), m, .06, .5); tri(h, b - h, 36, .35); kick(a, .6); kick(h, .6); snare(h, .3); for (let t = h; t < b; t += E8) hat(t, .08); }
function outro(a, b) { const ch = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];
  for (let bar = 0; a + bar * BAR < b - 1.2; bar++) { const t0 = a + bar * BAR, c = ch[bar % 4]; for (let k = 0; k < 8; k++) { const t = t0 + k * E8; if (t < b - 1.2) pulse(t, E8 * .9, c[k % 4] + 12, .05, .125, (k % 2 ? .3 : -.3)); } tri(t0, BAR * .95, c[0] - 24, .25); }
  for (const m of [60, 64, 67, 72]) pulse(b - 1.2, 1.1, m, .06, .5); tri(b - 1.2, 1.1, 36, .3); }
for (const { k, a, b } of SECTIONS) ({ level, boss, alarm, fanfare, outro, silence: () => {} })[k]?.(a, b);

let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = .89 / (pk || 1), buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const f = i > N - SR * .6 ? (N - i) / (SR * .6) : 1; buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * f * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * f * 32767), 46 + i * 4); }
fs.writeFileSync(OUT, buf); console.log("chiptune", DUR, "s,", SECTIONS.map((s) => s.k).join(" → "));
