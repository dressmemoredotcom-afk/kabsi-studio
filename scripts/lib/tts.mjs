// Kokoro text-to-speech helpers shared by the voice scripts.
import { spawnSync } from "node:child_process";

/** Mono 16-bit WAV bytes from float samples. */
export function toWav(samples, rate) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

/** Trim leading and trailing silence, leaving a short pad, so each line's duration is its speech. */
export function trim(samples, rate) {
  const floor = 0.01;
  let a = 0;
  let b = samples.length - 1;
  while (a < b && Math.abs(samples[a]) < floor) a++;
  while (b > a && Math.abs(samples[b]) < floor) b--;
  const pad = Math.round(rate * 0.06);
  const out = samples.slice(Math.max(0, a - pad), Math.min(samples.length, b + pad));
  const fade = Math.round(rate * 0.02);
  for (let i = 0; i < fade && i < out.length; i++) {
    const g = i / fade;
    out[i] *= g;
    out[out.length - 1 - i] *= g;
  }
  return out;
}

/** A lazy loader: the model is only downloaded and started the first time a line is generated. */
export function makeTts(config) {
  let promise = null;
  return () => {
    promise ??= import("kokoro-js").then(({ KokoroTTS }) => KokoroTTS.from_pretrained(config.model, { dtype: config["model-dtype"], device: "cpu" }));
    return promise;
  };
}

export const probeDuration = (file) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = Number(r.stdout.trim());
  if (r.status !== 0 || !Number.isFinite(d)) throw new Error(`ffprobe could not read ${file}`);
  return Number(d.toFixed(3));
};
