// Synthesises the stock sound design: one background-music loop and the UI sound effects.
// Everything is generated from scratch (sine, saw and filtered noise), so there is nothing to license.
// To use licensed or hand-made audio instead, overwrite the files in assets/audio/ with the same names.
//   npm run audio
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SR = 44100;
const TAU = Math.PI * 2;

// Deterministic noise, so a regenerated file is identical.
let seed = 20260607;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const midi = (m) => 440 * 2 ** ((m - 69) / 12);

/** Builds a mono signal by calling fn(t) for each sample. */
const signal = (dur, fn) => {
  const out = new Float32Array(Math.ceil(dur * SR));
  for (let i = 0; i < out.length; i++) out[i] = fn(i / SR);
  return out;
};
const attack = (t, a = 0.002) => (t < a ? t / a : 1);

class Stereo {
  constructor(seconds) {
    this.n = Math.ceil(seconds * SR);
    this.l = new Float32Array(this.n);
    this.r = new Float32Array(this.n);
  }
  /** Mixes a mono signal in at startS. With wrap, the tail runs round to the start so a loop is seamless. */
  add(startS, sig, { pan = 0, gain = 1, wrap = false } = {}) {
    const s0 = Math.round(startS * SR);
    const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < sig.length; i++) {
      let idx = s0 + i;
      if (idx >= this.n) {
        if (!wrap) break;
        idx %= this.n;
      }
      this.l[idx] += sig[i] * gl;
      this.r[idx] += sig[i] * gr;
    }
  }
  normalize(peak) {
    let m = 0;
    for (let i = 0; i < this.n; i++) m = Math.max(m, Math.abs(this.l[i]), Math.abs(this.r[i]));
    const g = peak / (m || 1);
    for (let i = 0; i < this.n; i++) {
      this.l[i] *= g;
      this.r[i] *= g;
    }
  }
  fadeEdges(inS, outS) {
    for (let i = 0; i < this.n; i++) {
      const g = Math.min(1, i / (inS * SR || 1), (this.n - i) / (outS * SR || 1));
      this.l[i] *= g;
      this.r[i] *= g;
    }
  }
}

const wav = (buf) => {
  const data = Buffer.alloc(44 + buf.n * 4);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + buf.n * 4, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(buf.n * 4, 40);
  for (let i = 0; i < buf.n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf.l[i])) * 32767), 44 + i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf.r[i])) * 32767), 46 + i * 4);
  }
  return data;
};

const tmp = join(root, "out", ".tmp-audio");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const sfxDir = join(root, "assets", "audio", "sfx");
const bgmDir = join(root, "assets", "audio", "bgm");
mkdirSync(sfxDir, { recursive: true });
mkdirSync(bgmDir, { recursive: true });

const encode = (buf, dir, name, quality = 2) => {
  const w = join(tmp, `${name}.wav`);
  writeFileSync(w, wav(buf));
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", w, "-codec:a", "libmp3lame", "-q:a", String(quality), join(dir, `${name}.mp3`)]);
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${name}: ${r.stderr}`);
  console.log(`${name}.mp3  ${(buf.n / SR).toFixed(2)} s`);
};

// ---------- Sound effects ----------

/** Soft bubble pop: a quick upward sine sweep with a tiny click. */
const pop = () => {
  const b = new Stereo(0.22);
  let ph = 0;
  b.add(0, signal(0.22, (t) => {
    ph += (TAU * (320 + 780 * (1 - Math.exp(-t * 55)))) / SR;
    return Math.sin(ph) * Math.exp(-t * 30) * attack(t, 0.0015) + noise() * Math.exp(-t * 400) * 0.25;
  }));
  b.normalize(0.9);
  return b;
};

/** Whoosh: band-passed noise sweeping upward, panned left to right. */
const whoosh = () => {
  const dur = 0.65;
  const b = new Stereo(dur);
  let lp = 0;
  let hp = 0;
  const n = Math.ceil(dur * SR);
  const l = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const k = t / dur;
    const env = Math.sin(Math.PI * k) ** 2;
    const cutoff = 400 + 4200 * k ** 1.6;
    const a = 1 - Math.exp((-TAU * cutoff) / SR);
    lp += a * (noise() - lp);
    hp += 0.02 * (lp - hp);
    l[i] = (lp - hp) * env * 2.2;
  }
  for (let i = 0; i < n; i++) {
    const pan = (i / n) * 1.4 - 0.7;
    b.l[i] = l[i] * Math.cos(((pan + 1) * Math.PI) / 4);
    b.r[i] = l[i] * Math.sin(((pan + 1) * Math.PI) / 4);
  }
  b.normalize(0.8);
  return b;
};

/** Two-note chime for an incoming message. A generic ping, not any app's own tone. */
const ping = () => {
  const b = new Stereo(1.0);
  const note = (f, start, gain) =>
    b.add(start, signal(0.9, (t) => (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 2 * t) * Math.exp(-t * 14) + 0.12 * Math.sin(TAU * f * 3.01 * t) * Math.exp(-t * 20)) * Math.exp(-t * 5.5) * attack(t, 0.004)), { gain, pan: start > 0 ? 0.15 : -0.15 });
  note(1318.5, 0, 1);
  note(1760, 0.12, 0.85);
  b.normalize(0.85);
  return b;
};

/** Tap: a dry, short tick. */
const click = () => {
  const b = new Stereo(0.1);
  let prev = 0;
  b.add(0, signal(0.1, (t) => {
    const n = noise();
    const hp = n - prev * 0.9;
    prev = n;
    return hp * Math.exp(-t * 700) * 0.7 + Math.sin(TAU * 1900 * t) * Math.exp(-t * 160) * 0.55;
  }));
  b.normalize(0.85);
  return b;
};

/** Success: three rising notes. */
const success = () => {
  const b = new Stereo(0.8);
  [72, 76, 79].forEach((m, i) => {
    const f = midi(m);
    b.add(i * 0.075, signal(0.6, (t) => (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)) * Math.exp(-t * 7) * attack(t, 0.003)), { pan: (i - 1) * 0.25 });
  });
  b.normalize(0.85);
  return b;
};

/** Star: a short bright sparkle. Played at rising speeds for a run of stars. */
const star = () => {
  const b = new Stereo(0.4);
  b.add(0, signal(0.4, (t) => (Math.sin(TAU * 2093 * t + 2 * Math.sin(TAU * 9 * t)) + 0.5 * Math.sin(TAU * 3136 * t)) * Math.exp(-t * 15) * attack(t, 0.002)));
  b.normalize(0.8);
  return b;
};

encode(pop(), sfxDir, "sfx-pop");
encode(whoosh(), sfxDir, "sfx-whoosh");
encode(ping(), sfxDir, "sfx-whatsapp-ping");
encode(click(), sfxDir, "sfx-click");
encode(success(), sfxDir, "sfx-success");
encode(star(), sfxDir, "sfx-star");

// ---------- Background music: 16 bars at 124 BPM (two passes of Am F C G), built to loop ----------

const BPM = 124;
const beat = 60 / BPM;
const bar = beat * 4;
const BARS = 16;
const LEN = bar * BARS;
const bgm = new Stereo(LEN);
const add = (t, sig, o) => bgm.add(t, sig, { wrap: true, ...o });

const kick = () => {
  let ph = 0;
  return signal(0.34, (t) => {
    ph += (TAU * (46 + 120 * Math.exp(-t * 26))) / SR;
    return Math.sin(ph) * Math.exp(-t * 9) * attack(t, 0.001) + noise() * Math.exp(-t * 500) * 0.15;
  });
};
const clap = () => {
  let lp = 0;
  return signal(0.2, (t) => {
    lp += 0.35 * (noise() - lp);
    const burst = Math.exp(-((t % 0.011) * 90)) * (t < 0.033 ? 1 : 0);
    return lp * (burst * 0.8 + Math.exp(-t * 26) * 0.7);
  });
};
const hat = (open) => {
  let prev = 0;
  return signal(open ? 0.16 : 0.06, (t) => {
    const n = noise();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * (open ? 22 : 90));
  });
};
const bass = (m) => {
  let ph = 0;
  let y = 0;
  const f = midi(m);
  return signal(0.24, (t) => {
    ph += (f / SR) % 1;
    ph %= 1;
    y += 0.085 * ((2 * ph - 1) - y);
    return (y + Math.sin(TAU * f * t) * 0.5) * Math.exp(-t * 7) * attack(t, 0.003);
  });
};
const pluck = (m, dur = 0.38) => {
  const f = midi(m);
  let p1 = 0;
  let p2 = 0;
  let y = 0;
  return signal(dur, (t) => {
    p1 = (p1 + (f * 1.004) / SR) % 1;
    p2 = (p2 + (f * 0.996) / SR) % 1;
    y += (0.03 + 0.32 * Math.exp(-t * 13)) * ((p1 + p2 - 1) * 2 - y);
    return y * Math.exp(-t * 8) * attack(t, 0.003);
  });
};

const progression = [
  { root: 33, tones: [57, 60, 64] }, // Am
  { root: 29, tones: [53, 57, 60] }, // F
  { root: 36, tones: [60, 64, 67] }, // C
  { root: 31, tones: [55, 59, 62] }, // G
];
const bassSteps = [1, 0, 1, 1, 1, 0, 1, 1];
const stabSteps = [0, 3, 6, 10, 12];

for (let b = 0; b < BARS; b++) {
  const chord = progression[Math.floor(b / 2) % 4];
  const t0 = b * bar;
  for (let k = 0; k < 4; k++) {
    const t = t0 + k * beat;
    add(t, kick(), { gain: 0.95 });
    if (k === 1 || k === 3) add(t, clap(), { gain: 0.42, pan: 0.05 });
    add(t + beat / 2, hat(false), { gain: 0.2, pan: k % 2 ? 0.35 : -0.35 });
    add(t + beat * 0.75, hat(false), { gain: 0.07, pan: 0.2 });
  }
  add(t0 + beat * 3.5, hat(true), { gain: 0.16, pan: -0.2 });
  bassSteps.forEach((on, p) => {
    if (on) add(t0 + p * (beat / 2), bass(chord.root + (p === 3 || p === 7 ? 12 : 0)), { gain: 0.5 });
  });
  stabSteps.forEach((s, si) => {
    chord.tones.forEach((m, ti) => add(t0 + s * (beat / 4), pluck(m), { gain: 0.13, pan: ((si + ti) % 2 ? 1 : -1) * 0.3 }));
  });
  if (b >= 4) {
    for (let p = 0; p < 8; p++) {
      const m = chord.tones[p % 3] + 12 + (p === 7 ? 12 : 0);
      add(t0 + p * (beat / 2) + beat / 4, pluck(m, 0.22), { gain: 0.07, pan: p % 2 ? 0.55 : -0.55 });
    }
  }
}
bgm.normalize(0.89);
encode(bgm, bgmDir, "kabsi-upbeat-loop", 3);

rmSync(tmp, { recursive: true, force: true });
