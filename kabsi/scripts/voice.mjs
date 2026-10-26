// Makes the voice for one Kabsi video and records each line's measured duration and start.
//   node kabsi/scripts/voice.mjs <ID>                  kabsi/config.json picks the Kokoro voice and speed
//   node kabsi/scripts/voice.mjs <ID> --use bf_emma    one-off voice override
//   node kabsi/scripts/voice.mjs <ID> --speed 1.1      one-off speed override
// Lines come from the video's kabsi/src/videos/*.copy.ts. For each line, a file named after the line id in
// kabsi/public/voice/<ID>/ (mp3, wav or m4a) is used as is, so a recorded take can be dropped in. A line with no such
// file gets a Kokoro placeholder, <line>.placeholder.wav. Optional <line>.words.json gives real word times:
//   [{ "text": "Your", "start": 0.0, "end": 0.21 }, ...]   seconds from the start of that audio file.
// Each line starts at its offset (seconds from the start of the video), or GAP seconds after the line before.
// The result goes to kabsi/src/generated/voice/<ID>.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeTts, probeDuration, speak, toWav, trim } from "../../engine/scripts/tts.mjs";
import { loadCopies } from "./check.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "config.json"), "utf8"));
const args = process.argv.slice(2);
const id = args[0];
const copies = await loadCopies();
const copy = copies.find((c) => c.id === id);
if (!copy) {
  console.error(`kabsi voice: name a video. Known: ${copies.map((c) => c.id).join(", ")}`);
  process.exit(1);
}
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const voice = flag("--use") ?? config.voice;
const speed = Number(flag("--speed") ?? config["voice-speed"]);
const GAP = 0.3;

if (!copy.voiceLines.length) {
  console.log(`kabsi voice: ${copy.id} has no voice-over lines, nothing to make`);
  process.exit(0);
}

const outDir = join(root, "public", "voice", copy.id);
mkdirSync(outDir, { recursive: true });
const getTts = makeTts();
const durations = {};
const files = {};
const words = {};

for (const line of copy.voiceLines) {
  const real = [".mp3", ".wav", ".m4a"].map((e) => join(outDir, `${line.id}${e}`)).find(existsSync);
  if (real) {
    durations[line.id] = probeDuration(real);
    files[line.id] = `voice/${copy.id}/${real.slice(outDir.length + 1)}`;
    const wordsFile = join(outDir, `${line.id}.words.json`);
    if (existsSync(wordsFile)) words[line.id] = JSON.parse(readFileSync(wordsFile, "utf8"));
    console.log(`${line.id}: ${durations[line.id]} s  (your file${words[line.id] ? ", with word times" : ""})`);
    continue;
  }
  const name = `${line.id}.placeholder.wav`;
  const stamp = join(outDir, `${line.id}.placeholder.txt`);
  const signature = `${voice}|${speed}|${line.vo}`;
  files[line.id] = `voice/${copy.id}/${name}`;
  // A placeholder made from the same text, voice and speed is reused, so renders do not wait on Kokoro.
  if (existsSync(join(outDir, name)) && existsSync(stamp) && readFileSync(stamp, "utf8") === signature) {
    durations[line.id] = probeDuration(join(outDir, name));
    console.log(`${line.id}: ${durations[line.id]} s  (Kokoro placeholder, unchanged)`);
    continue;
  }
  const audio = await speak(await getTts(), line.vo, { voice, speed });
  const samples = trim(audio.audio, audio.sampling_rate);
  writeFileSync(join(outDir, name), toWav(samples, audio.sampling_rate));
  writeFileSync(stamp, signature);
  durations[line.id] = Number((samples.length / audio.sampling_rate).toFixed(3));
  console.log(`${line.id}: ${durations[line.id]} s  (Kokoro placeholder)`);
}

// Each line starts at its offset from the start of the video, or after the line before and a short gap.
const starts = {};
let prevEnd = -Infinity;
for (const line of copy.voiceLines) {
  const start = Math.max(line.offset ?? 0.1, prevEnd + GAP);
  starts[line.id] = Number(start.toFixed(3));
  prevEnd = start + durations[line.id];
}

const outFile = join(root, "src", "generated", "voice", `${copy.id}.json`);
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify({ voice, speed, durations, files, starts, ...(Object.keys(words).length ? { words } : {}) }, null, 2) + "\n");
console.log(`kabsi voice: ${copy.id}, ${voice} at ${speed}x, ${copy.voiceLines.length} lines, last line ends at ${prevEnd.toFixed(2)} s of ${copy.seconds} s`);
