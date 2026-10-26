// Writes kabsi/out/voice-test/: two Kabsi lines in each of the five Kokoro voices at speed 1.0, for choosing the one
// voice (calm, adult, British English). One file per voice, all.wav with the five in order and a second of silence
// between them, README.md, and measurements of each voice.
//   node kabsi/scripts/voice-test.mjs
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeTts, speak, toWav, trim } from "../../engine/scripts/tts.mjs";
import { root } from "./lib/copies.mjs";
import { loudness } from "./lib/package.mjs";
import { pace, pitchMovement, pitchTrack } from "./lib/measure.mjs";
import { STRINGS, VOICES } from "../src/kit.ts";

const LINES = [STRINGS.endLine, "A new review came in. The reply is ready for your yes."];
const WORDS = LINES.join(" ").split(/\s+/).length;
const GAP_IN_FILE_S = 0.6;
const GAP_BETWEEN_VOICES_S = 1;
const SPEED = 1.0;
const outDir = join(root, "out", "voice-test");
mkdirSync(outDir, { recursive: true });

const getTts = makeTts();
const tts = await getTts();
const rate = 24000;
const silence = (s) => new Float32Array(Math.round(s * rate));
const join32 = (parts) => {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

const tmp = mkdtempSync(join(tmpdir(), "voice-test-"));
const results = [];
const files = [];
try {
  for (const voice of VOICES) {
    const lines = [];
    for (const text of LINES) {
      const audio = await speak(tts, text, { voice, speed: SPEED });
      if (audio.sampling_rate !== rate) throw new Error(`unexpected sample rate ${audio.sampling_rate}`);
      lines.push(trim(audio.audio, audio.sampling_rate));
    }
    const samples = join32([lines[0], silence(GAP_IN_FILE_S), lines[1]]);
    const file = `${voice}.wav`;
    writeFileSync(join(outDir, file), toWav(samples, rate));
    files.push(samples);
    const speechSeconds = lines.reduce((n, l) => n + l.length / rate, 0);
    const pitch = pitchMovement(pitchTrack(samples, rate));
    const level = loudness(join(outDir, file));
    results.push({ voice, file, seconds: Number((samples.length / rate).toFixed(2)), wpm: pace(WORDS, speechSeconds), pitchStd: pitch.stdSemitones, pitchRange: pitch.rangeSemitones, medianHz: pitch.medianHz, lufs: level.lufs, lra: level.lra, truePeak: level.truePeak });
    console.log(`${voice}: ${results.at(-1).seconds} s, ${results.at(-1).wpm.toFixed(0)} wpm, pitch sd ${pitch.stdSemitones.toFixed(2)} st, ${level.lufs} LUFS, LRA ${level.lra}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
writeFileSync(join(outDir, "all.wav"), toWav(join32(files.flatMap((f, i) => (i ? [silence(GAP_BETWEEN_VOICES_S), f] : [f]))), rate));

// Calmest by the numbers: slower, less pitch movement, steadier loudness. Rank each (1 is calmest), add the ranks.
const rank = (key) => {
  const order = [...results].sort((a, b) => a[key] - b[key]);
  results.forEach((r) => (r[`rank_${key}`] = order.indexOf(r) + 1));
};
["wpm", "pitchStd", "lra"].forEach(rank);
results.forEach((r) => (r.calmScore = r.rank_wpm + r.rank_pitchStd + r.rank_lra));
const calmest = [...results].sort((a, b) => a.calmScore - b.calmScore || a.wpm - b.wpm);

const f1 = (n) => n.toFixed(1);
const table = [
  "| Order | Voice | File | Pace (words a minute) | Pitch movement (semitones, standard deviation) | Pitch range (semitones, 10th to 90th percentile) | Loudness (LUFS) | Loudness range (LU) | Calm score (lower is calmer) |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...results.map((r, i) => `| ${i + 1} | ${r.voice} | ${r.file} | ${f1(r.wpm)} (${r.rank_wpm}) | ${r.pitchStd.toFixed(2)} (${r.rank_pitchStd}) | ${r.pitchRange.toFixed(2)} | ${r.lufs} | ${r.lra} (${r.rank_lra}) | ${r.calmScore} |`),
].join("\n");
writeFileSync(join(outDir, "measurements.json"), JSON.stringify({ speed: SPEED, lines: LINES, results, calmest: calmest.map((r) => r.voice) }, null, 2) + "\n");
writeFileSync(
  join(outDir, "README.md"),
  [
    "# Kabsi voice test",
    "",
    "Two lines, each read by the five Kokoro voices Kabsi may use (calm, adult, British English), at speed 1.0:",
    "",
    ...LINES.map((l) => `- "${l}"`),
    "",
    `Each voice has one file with the two lines, ${GAP_IN_FILE_S} seconds apart. \`all.wav\` has the five files in the order below with ${GAP_BETWEEN_VOICES_S} second of silence between them. Files are 24 kHz mono WAV, as Kokoro makes them, with no loudness change.`,
    "",
    "## Order",
    "",
    ...results.map((r, i) => `${i + 1}. ${r.voice} (${r.file})`),
    "",
    "## Measurements",
    "",
    table,
    "",
    "Numbers in brackets are the voice's rank on that measure among the five, 1 being calmest (slowest, least pitch movement, steadiest loudness). Pace is words a minute over the speech with the silence before, after and between the lines left out. Pitch is found by autocorrelation every 10 ms. Loudness is the EBU R128 integrated level of the whole file; it is shown but not ranked, because every video's voice is set to -14 LUFS anyway.",
    "",
    `**Calmest by these numbers: ${calmest[0].voice}**, then ${calmest.slice(1).map((r) => r.voice).join(", ")}. The numbers do not hear: listen to all.wav before choosing, then set the one voice in kabsi/config.json.`,
    "",
  ].join("\n"),
);
console.log(`voice test: ${outDir}\ncalmest by the numbers: ${calmest.map((r) => `${r.voice} (${r.calmScore})`).join(", ")}`);
