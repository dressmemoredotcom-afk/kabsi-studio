// Makes the voice for a video and records each line's measured duration.
//   node scripts/voice.mjs [01|02|03]      kabsi.config.json picks the Kokoro voice and speed
//   node scripts/voice.mjs [id] --compare a,b,c [--speed 1.15]   writes sample lines to out/voice-test<id>/
//   node scripts/voice.mjs [id] --use bf_emma    one-off voice override
//   node scripts/voice.mjs 04 --fit              raise the speed in 0.05 steps until every line fits (see "chain" in videos.mjs)
//
// Video 03 (realVoice): for each line, a file named after the line id in assets/voice/v3/ (mp3, wav or m4a)
// is used as is, so a studio-quality take can be dropped in. A line with no such file gets a Kokoro
// placeholder, <id>.placeholder.wav. Optional <id>.words.json gives real word times:
//   [{ "text": "Too", "start": 0.0, "end": 0.21 }, ...]   seconds from the start of that audio file.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { pickVideo } from "./videos.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "kabsi.config.json"), "utf8"));
const args = process.argv.slice(2);
const video = pickVideo(args);
const { VOICE_LINES, SCENES } = await import(video.scriptFile);
const compareIdx = args.indexOf("--compare");
const speedIdx = args.indexOf("--speed");
let speed = speedIdx >= 0 ? Number(args[speedIdx + 1]) : config[video.speedKey];
const useIdx = args.indexOf("--use");
const voice = useIdx >= 0 ? args[useIdx + 1] : config[video.voiceKey];
const fit = args.includes("--fit");

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

let ttsPromise = null;
const getTts = () => {
  ttsPromise ??= import("kokoro-js").then(({ KokoroTTS }) =>
    KokoroTTS.from_pretrained(config.model, { dtype: config["model-dtype"], device: "cpu" }),
  );
  return ttsPromise;
};

const probeDuration = (file) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = Number(r.stdout.trim());
  if (r.status !== 0 || !Number.isFinite(d)) throw new Error(`ffprobe could not read ${file}`);
  return Number(d.toFixed(3));
};

if (compareIdx >= 0) {
  const tts = await getTts();
  const dir = join(root, "out", video.id === "01" ? "voice-test" : `voice-test-${video.id}`);
  mkdirSync(dir, { recursive: true });
  const samples = [VOICE_LINES[0], VOICE_LINES[VOICE_LINES.length - 1]];
  for (const v of args[compareIdx + 1].split(",")) {
    for (const line of samples) {
      const audio = await tts.generate(line.vo, { voice: v, speed });
      const trimmed = trim(audio.audio, audio.sampling_rate);
      writeFileSync(join(dir, `${v}-${line.id}.wav`), toWav(trimmed, audio.sampling_rate));
      console.log(`${v} ${line.id}: ${(trimmed.length / audio.sampling_rate).toFixed(3)} s`);
    }
  }
  process.exit(0);
}

const outDir = join(root, "assets", video.voiceDir);
mkdirSync(outDir, { recursive: true });
let durations = {};
let files = {};
let words = {};

/** Makes (or measures) every line at the current speed. */
const generateAll = async () => {
  durations = {};
  files = {};
  words = {};
  for (const line of VOICE_LINES) {
    const real = video.realVoice ? [".mp3", ".wav", ".m4a"].map((e) => join(outDir, `${line.id}${e}`)).find(existsSync) : undefined;
    if (real) {
      durations[line.id] = probeDuration(real);
      files[line.id] = `${video.voiceDir}/${real.slice(outDir.length + 1)}`;
      const wordsFile = join(outDir, `${line.id}.words.json`);
      if (existsSync(wordsFile)) words[line.id] = JSON.parse(readFileSync(wordsFile, "utf8"));
      console.log(`${line.id}: ${durations[line.id]} s  (your file ${files[line.id]}${words[line.id] ? ", with word times" : ""})`);
      continue;
    }
    const name = video.realVoice ? `${line.id}.placeholder.wav` : `${line.id}.wav`;
    const stamp = join(outDir, `${line.id}.placeholder.txt`);
    const signature = `${voice}|${speed}|${line.vo}`;
    files[line.id] = `${video.voiceDir}/${name}`;
    // A placeholder made from the same text, voice and speed is reused, so renders do not wait on Kokoro.
    if ((video.realVoice || video.chain) && existsSync(join(outDir, name)) && existsSync(stamp) && readFileSync(stamp, "utf8") === signature) {
      durations[line.id] = probeDuration(join(outDir, name));
      console.log(`${line.id}: ${durations[line.id]} s  (Kokoro placeholder, unchanged)`);
      continue;
    }
    const tts = await getTts();
    const audio = await tts.generate(line.vo, { voice, speed });
    const samples = trim(audio.audio, audio.sampling_rate);
    writeFileSync(join(outDir, name), toWav(samples, audio.sampling_rate));
    if (video.realVoice || video.chain) writeFileSync(stamp, signature);
    durations[line.id] = Number((samples.length / audio.sampling_rate).toFixed(3));
    console.log(`${line.id}: ${durations[line.id]} s${video.realVoice ? "  (Kokoro placeholder)" : ""}`);
  }
};

/** Start time of each line: its scene start plus offset, or after the previous line has finished. */
const schedule = () => {
  const starts = {};
  let prevEnd = -Infinity;
  for (const line of VOICE_LINES) {
    const scene = SCENES.find((sc) => sc.id === line.id);
    const nominal = scene.from + (line.offset ?? 0.1);
    const start = video.chain ? Math.max(nominal, prevEnd + video.chain.gap) : nominal;
    starts[line.id] = Number(start.toFixed(3));
    prevEnd = start + durations[line.id];
  }
  return { starts, end: prevEnd };
};

if (fit && video.chain) {
  for (let sp = speed; sp <= 1.451; sp += 0.05) {
    speed = Number(sp.toFixed(2));
    await generateAll();
    const { end } = schedule();
    console.log(`speed ${speed}: last line ends at ${end.toFixed(2)} s (limit ${video.chain.maxEnd})`);
    if (end <= video.chain.maxEnd) break;
  }
  console.log(`Fitted speed: ${speed}. Put it in kabsi.config.json as "${video.speedKey}".`);
} else {
  await generateAll();
}

mkdirSync(join(root, "src", "generated"), { recursive: true });
const { starts, end: lastEnd } = schedule();
const data = { voice, speed, durations, files, starts, ...(Object.keys(words).length ? { words } : {}) };
writeFileSync(join(root, "src", "generated", video.voiceJson), JSON.stringify(data, null, 2) + "\n");
console.log(`voice ${voice}, speed ${speed}, ${Object.keys(durations).length} lines written, last line ends at ${lastEnd.toFixed(2)} s`);
if (video.chain && lastEnd > video.chain.maxEnd) console.warn(`WARNING: the voice runs to ${lastEnd.toFixed(2)} s, past the ${video.chain.maxEnd} s limit. Use --fit, or a shorter script.`);
