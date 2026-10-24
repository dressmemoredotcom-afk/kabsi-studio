// Makes the voice-over for assets/roomy/listing.json with Kokoro and places each line on the storyboard.
//   node scripts/roomy-voice.mjs
// Lines come from "voScript" in the listing, or are written from the neighborhood, title and specs (see
// resolveVoScript in src/brands/roomy/storyboard.ts). Each line starts after its scene cuts in, never before the line
// before it has finished plus a pause. If the lines do not fit in the reel the voice speeds up a little, and as a
// last resort the lines in the middle are dropped. The result goes to src/brands/roomy/generated/roomy-voice.json.
// A ready-made assets/roomy/voiceover.mp3 skips all of this.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RoomyListingSchema } from "../src/brands/roomy/schema.ts";
import { FPS, outroFrom, planScenes, resolveVoScript, totalFrames, voiceSignature } from "../src/brands/roomy/storyboard.ts";
import { makeTts, probeDuration, toWav, trim } from "./lib/tts.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "kabsi.config.json"), "utf8"));
const listing = RoomyListingSchema.parse(JSON.parse(readFileSync(join(root, "assets", "roomy", "listing.json"), "utf8")));

const LEAD = 0.8; // seconds after a scene cuts in before its line starts
const OUTRO_LEAD = 1.0;
const GAP = 1.0; // pause between lines
const total = totalFrames(listing);
const MAX_END = total / FPS - 0.5; // the last line must be done half a second before the reel ends
const voice = config["roomy-voice"];
const baseSpeed = config["roomy-voice-speed"];
const outFile = join(root, "src", "brands", "roomy", "generated", "roomy-voice.json");
mkdirSync(dirname(outFile), { recursive: true });

const script = resolveVoScript(listing);
const signature = voiceSignature(script, listing.durationSeconds);

if (["mp3", "wav", "m4a"].some((e) => existsSync(join(root, "assets", "roomy", `voiceover.${e}`)))) {
  writeFileSync(outFile, JSON.stringify({ voice: "your voiceover file", speed: 1, signature, lines: [] }, null, 2) + "\n");
  console.log("roomy voice: assets/roomy/voiceover is present, it is used instead of Kokoro");
  process.exit(0);
}

const plan = planScenes(listing.media.length, total);
const sceneStart = (scene) => (scene === listing.media.length ? outroFrom(total) : plan[scene].from) / FPS;
const outDir = join(root, "assets", "roomy", "voice");
mkdirSync(outDir, { recursive: true });
const getTts = makeTts(config);

/** One line spoken at one speed. A line made from the same text, voice and speed is reused. */
const speak = async (scene, text, speed) => {
  const wav = join(outDir, `vo-${scene}.wav`);
  const stamp = join(outDir, `vo-${scene}.txt`);
  const signatureText = `${voice}|${speed}|${text}`;
  if (existsSync(wav) && existsSync(stamp) && readFileSync(stamp, "utf8") === signatureText) return { file: `roomy/voice/vo-${scene}.wav`, durS: probeDuration(wav) };
  const tts = await getTts();
  const audio = await tts.generate(text, { voice, speed });
  const samples = trim(audio.audio, audio.sampling_rate);
  writeFileSync(wav, toWav(samples, audio.sampling_rate));
  writeFileSync(stamp, signatureText);
  return { file: `roomy/voice/vo-${scene}.wav`, durS: Number((samples.length / audio.sampling_rate).toFixed(3)) };
};

/** Places the lines in order: at the scene start plus a lead, or after the line before and a pause. */
const schedule = (spoken) => {
  let prevEnd = -Infinity;
  return spoken.map((l) => {
    const nominal = sceneStart(l.scene) + (l.scene === listing.media.length ? OUTRO_LEAD : LEAD);
    const startS = Number(Math.max(nominal, prevEnd + GAP).toFixed(3));
    prevEnd = startS + l.durS;
    return { ...l, startS };
  });
};

let lines = script.map((text, scene) => ({ scene, text })).filter((l) => l.text);
const dropped = [];
let speed = baseSpeed;
let placed = [];
for (;;) {
  for (let sp = baseSpeed; sp <= 1.1001; sp += 0.03) {
    speed = Number(sp.toFixed(2));
    const spoken = [];
    for (const l of lines) spoken.push({ ...l, ...(await speak(l.scene, l.text, speed)) });
    placed = schedule(spoken);
    const end = placed.length ? placed[placed.length - 1].startS + placed[placed.length - 1].durS : 0;
    if (end <= MAX_END) break;
    if (sp + 0.03 > 1.1001) placed = [];
    else console.log(`speed ${speed}: last line ends at ${end.toFixed(2)} s, over ${MAX_END} s`);
  }
  if (placed.length) break;
  // Still too long at the top speed: drop the latest line that sits in a middle scene.
  const middle = lines.filter((l) => l.scene > 0 && l.scene < listing.media.length);
  if (!middle.length) throw new Error(`The first and last voice lines alone do not fit in ${(total / FPS).toFixed(0)} seconds. Shorten voScript.`);
  const drop = middle[middle.length - 1];
  dropped.push(drop.scene);
  console.log(`dropping the line for scene ${drop.scene} to fit: "${drop.text}"`);
  lines = lines.filter((l) => l !== drop);
}

writeFileSync(outFile, JSON.stringify({ voice, speed, signature, ...(dropped.length ? { dropped } : {}), lines: placed.map(({ scene, text, file, startS, durS }) => ({ scene, text, file, startS, durS })) }, null, 2) + "\n");
const first = placed[0];
const last = placed[placed.length - 1];
console.log(`roomy voice: ${voice} at ${speed}x, ${placed.length} line${placed.length === 1 ? "" : "s"}, from ${first.startS.toFixed(2)} s to ${(last.startS + last.durS).toFixed(2)} s`);
for (const l of placed) console.log(`  scene ${l.scene} at ${l.startS.toFixed(2)} s (${l.durS.toFixed(2)} s): ${l.text}`);
