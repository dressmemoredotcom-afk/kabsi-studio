// Kokoro text-to-speech helpers for the brands' voice scripts. The model is fixed here; each brand's config.json
// picks only the voice and the speed.
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

/** Kokoro-82M (Apache 2.0), run on the CPU at full precision. */
export const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const MODEL_DTYPE = "fp32";

/** A lazy loader: the model is only downloaded and started the first time a line is generated. */
export function makeTts() {
  let promise = null;
  return () => {
    promise ??= import("kokoro-js").then(({ KokoroTTS }) => KokoroTTS.from_pretrained(MODEL, { dtype: MODEL_DTYPE, device: "cpu" }));
    return promise;
  };
}

const PUNCTUATION = /(\s*[;:,.!?¡¿—…"«»“”(){}[\]]+\s*)+/g;

/**
 * Speaks `text` with the voice. `lexicon` maps words the voice reads wrongly from their spelling to the sounds to say
 * instead (IPA, the symbols the voice model takes), e.g. { word: "wɜːd" }; each brand keeps its own. Text without such
 * a word goes through the voice model's own text handling untouched. Otherwise the text is turned into sounds piece
 * by piece and the lexicon words are put in as given.
 */
export async function speak(tts, text, { voice, speed, lexicon = {} }) {
  const keys = Object.keys(lexicon);
  const words = keys.length ? new RegExp(`\\b(${keys.join("|")})\\b`, "gi") : null;
  if (!words || !words.test(text)) return tts.generate(text, { voice, speed });
  words.lastIndex = 0;
  const { phonemize } = await import("phonemizer");
  const language = voice.startsWith("a") ? "en-us" : "en";
  const sounds = async (chunk) => {
    const parts = [];
    let last = 0;
    for (const m of chunk.matchAll(PUNCTUATION)) {
      if (last < m.index) parts.push(chunk.slice(last, m.index));
      parts.push({ keep: m[0] });
      last = m.index + m[0].length;
    }
    if (last < chunk.length) parts.push(chunk.slice(last));
    const out = await Promise.all(parts.map(async (p) => (typeof p === "string" ? (p.trim() ? (await phonemize(p, language)).join(" ") : p) : p.keep)));
    return out.join("").replace(/ʲ/g, "j").replace(/r/g, "ɹ").replace(/x/g, "k").replace(/ɬ/g, "l");
  };
  let phonemes = "";
  let at = 0;
  for (const m of text.matchAll(words)) {
    if (at < m.index) phonemes += await sounds(text.slice(at, m.index));
    phonemes += lexicon[m[1].toLowerCase()];
    at = m.index + m[0].length;
  }
  if (at < text.length) phonemes += await sounds(text.slice(at));
  const { input_ids } = tts.tokenizer(phonemes.trim(), { truncation: true });
  return tts.generate_from_ids(input_ids, { voice, speed });
}

export const probeDuration = (file) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = Number(r.stdout.trim());
  if (r.status !== 0 || !Number.isFinite(d)) throw new Error(`ffprobe could not read ${file}`);
  return Number(d.toFixed(3));
};
