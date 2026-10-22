// Generates one WAV per voice-over line with Kokoro TTS and records each line's measured duration.
//   node scripts/voice.mjs                      uses "kabsi-voice" from kabsi.config.json
//   node scripts/voice.mjs --compare af_heart,bf_emma   writes hook-line samples to out/voice-test/
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KokoroTTS } from "kokoro-js";
import { VOICE_LINES } from "../src/script.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "kabsi.config.json"), "utf8"));
const args = process.argv.slice(2);
const compareIdx = args.indexOf("--compare");

function toWav(samples, rate) {
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
function trim(samples, rate) {
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

const tts = await KokoroTTS.from_pretrained(config.model, {
  dtype: config["model-dtype"],
  device: "cpu",
});

if (compareIdx >= 0) {
  const dir = join(root, "out", "voice-test");
  mkdirSync(dir, { recursive: true });
  for (const voice of args[compareIdx + 1].split(",")) {
    const audio = await tts.generate(VOICE_LINES[0].vo, { voice, speed: config["voice-speed"] });
    const samples = trim(audio.audio, audio.sampling_rate);
    writeFileSync(join(dir, `${voice}.wav`), toWav(samples, audio.sampling_rate));
    console.log(`${voice}: ${(samples.length / audio.sampling_rate).toFixed(3)} s`);
  }
  process.exit(0);
}

const voice = config["kabsi-voice"];
const outDir = join(root, "assets", "voice");
mkdirSync(outDir, { recursive: true });
const durations = {};
for (const line of VOICE_LINES) {
  const audio = await tts.generate(line.vo, { voice, speed: config["voice-speed"] });
  const samples = trim(audio.audio, audio.sampling_rate);
  writeFileSync(join(outDir, `${line.id}.wav`), toWav(samples, audio.sampling_rate));
  durations[line.id] = Number((samples.length / audio.sampling_rate).toFixed(3));
  console.log(`${line.id}: ${durations[line.id]} s`);
}
mkdirSync(join(root, "src", "generated"), { recursive: true });
writeFileSync(
  join(root, "src", "generated", "voice.json"),
  JSON.stringify({ voice, speed: config["voice-speed"], durations }, null, 2) + "\n",
);
console.log(`voice ${voice}, ${Object.keys(durations).length} lines written`);
