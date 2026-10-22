// Generates one WAV per voice-over line with Kokoro TTS and records each line's measured duration.
//   node scripts/voice.mjs [01|02]                          uses the video's voice id from kabsi.config.json
//   node scripts/voice.mjs [01|02] --compare a,b,c [--speed 1.15]   writes sample lines to out/voice-test<id>/
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KokoroTTS } from "kokoro-js";
import { pickVideo } from "./videos.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "kabsi.config.json"), "utf8"));
const args = process.argv.slice(2);
const video = pickVideo(args);
const { VOICE_LINES } = await import(video.scriptFile);
const compareIdx = args.indexOf("--compare");
const speedIdx = args.indexOf("--speed");
const speed = speedIdx >= 0 ? Number(args[speedIdx + 1]) : config[video.speedKey];

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
  const dir = join(root, "out", video.id === "01" ? "voice-test" : `voice-test-${video.id}`);
  mkdirSync(dir, { recursive: true });
  const samples = [VOICE_LINES[0], VOICE_LINES[VOICE_LINES.length - 1]];
  for (const voice of args[compareIdx + 1].split(",")) {
    for (const line of samples) {
      const audio = await tts.generate(line.vo, { voice, speed });
      const trimmed = trim(audio.audio, audio.sampling_rate);
      writeFileSync(join(dir, `${voice}-${line.id}.wav`), toWav(trimmed, audio.sampling_rate));
      console.log(`${voice} ${line.id}: ${(trimmed.length / audio.sampling_rate).toFixed(3)} s`);
    }
  }
  process.exit(0);
}

const voice = config[video.voiceKey];
const outDir = join(root, "assets", video.voiceDir);
mkdirSync(outDir, { recursive: true });
const durations = {};
for (const line of VOICE_LINES) {
  const audio = await tts.generate(line.vo, { voice, speed });
  const samples = trim(audio.audio, audio.sampling_rate);
  writeFileSync(join(outDir, `${line.id}.wav`), toWav(samples, audio.sampling_rate));
  durations[line.id] = Number((samples.length / audio.sampling_rate).toFixed(3));
  console.log(`${line.id}: ${durations[line.id]} s`);
}
mkdirSync(join(root, "src", "generated"), { recursive: true });
writeFileSync(
  join(root, "src", "generated", video.voiceJson),
  JSON.stringify({ voice, speed, durations }, null, 2) + "\n",
);
console.log(`voice ${voice}, ${Object.keys(durations).length} lines written`);
