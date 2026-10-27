// One Kabsi video from start to finish, ending in its review package.
//   node kabsi/scripts/render.mjs <ID>      e.g. kit-test, W1
// Checks the rules, makes the voice, renders every size with Remotion, masters the audio to -14 LUFS, fits each file to
// its format preset (and fails if it still breaks it), and writes kabsi/out/<ID>/:
//   kabsi-<id>-<name>-<size>.mp4       the videos
//   kabsi-<id>-<name>.vtt or .srt      captions, from the one caption source (website: WebVTT, no captions in the
//                                      picture; social: burned in plus SRT; the format table says which)
//   ...-poster.png and ...-poster.webp the poster frame
//   contact-sheet-NN.png               2 frames a second
//   script.txt, licences.txt, checklist.md
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderReel } from "../../engine/scripts/render-core.mjs";
import { contactSheet } from "../../engine/scripts/contact-sheet.mjs";
import { runCheck } from "./check.mjs";
import { compositionId, loadCopies, outFolder, root } from "./lib/copies.mjs";
import { voiceJsonPath } from "./lib/rules.mjs";
import { fitToFormat, verifyPreset, webpPoster } from "./lib/package.mjs";
import { writeChecklist } from "./lib/checklist.mjs";
import { FORMATS, captionFile } from "../src/formats.ts";
import { buildCues, cuesToSrt, cuesToVtt } from "../src/captions.ts";

const id = process.argv[2];
const copies = await loadCopies();
const copy = copies.find((c) => c.id === id);
if (!copy) {
  console.error(`kabsi render: name a video. Known: ${copies.map((c) => c.id).join(", ")}`);
  process.exit(1);
}
const format = FORMATS[copy.format];

const check = async () => {
  const { failures } = await runCheck(copy.id);
  if (failures.length) {
    console.error(`kabsi check FAIL (${failures.length})`);
    failures.forEach((f) => console.error(`  - ${f.where}: ${f.msg}`));
    process.exit(1);
  }
};
await check();
if (copy.voiceLines.length) {
  const r = spawnSync("node", [join(root, "scripts", "voice.mjs"), copy.id], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  await check();
}

const outDir = join(root, "out", outFolder(copy));
mkdirSync(outDir, { recursive: true });
const stem = `kabsi-${copy.id.toLowerCase()}-${copy.name}`;
const videos = [];
for (const size of copy.sizes) {
  const base = `${stem}-${size}`;
  const file = join(outDir, `${base}.mp4`);
  const result = await renderReel({
    entry: join(root, "src", "index.ts"),
    publicDir: join(root, "public"),
    composition: compositionId(copy, size),
    outFile: file,
    posterFile: join(outDir, `${base}-poster.png`),
    posterAtS: copy.posterS,
  });
  console.log(`${size}: ${fitToFormat(copy, file)}`);
  webpPoster(join(outDir, `${base}-poster.png`), join(outDir, `${base}-poster.webp`));
  const preset = verifyPreset(copy, size, file);
  preset.checks.forEach((c) => console.log(`  ${c.ok ? "ok  " : "FAIL"} ${c.name}: ${c.note}`));
  if (!preset.ok) {
    console.error(`kabsi render: ${base}.mp4 breaks the ${format.label} preset`);
    process.exit(1);
  }
  videos.push({ size, file, frames: result.frames, durationS: result.durationS });
}

// Captions: one source, written as the format asks.
const ext = captionFile(format);
if (ext && copy.voiceLines.length) {
  const cues = buildCues(copy.voiceLines, JSON.parse(readFileSync(voiceJsonPath(copy.id), "utf8")), copy.highlight);
  writeFileSync(join(outDir, `${stem}.${ext}`), ext === "srt" ? cuesToSrt(cues) : cuesToVtt(cues));
  console.log(`captions: ${stem}.${ext}, ${cues.length} cues`);
}
for (const f of readdirSync(outDir)) {
  const other = ext === "srt" ? "vtt" : "srt";
  if (f === `${stem}.${other}` || (!ext && (f === `${stem}.vtt` || f === `${stem}.srt`))) {
    console.warn(`kabsi render: ${f} is left over from an older render, delete it`);
  }
}

// Contact sheets at 2 frames a second: the first size in the package folder, the others in their own folders.
videos.forEach((v, i) => contactSheet(v.file, i === 0 ? outDir : join(outDir, `sheets-${v.size}`)));

writeFileSync(join(outDir, "script.txt"), copy.voiceLines.length ? copy.voiceLines.map((l) => l.vo).join("\n") + "\n" : "(no voice-over in this video)\n");

const config = JSON.parse(readFileSync(join(root, "config.json"), "utf8"));
const componentSrc = readFileSync(join(root, "src", "videos", `${copy.id}.tsx`), "utf8");
const ownVoice = existsSync(join(root, "public", "voice", copy.id)) && readdirSync(join(root, "public", "voice", copy.id)).some((f) => /\.(mp3|wav|m4a)$/.test(f) && !/\.placeholder\./.test(f));
writeFileSync(
  join(outDir, "licences.txt"),
  [
    `Licences for ${stem}`,
    "",
    "Fonts: Bricolage Grotesque and Manrope, SIL Open Font License 1.1, from the google/fonts repository.",
    "  Licence texts: kabsi/public/brand/fonts/OFL-BricolageGrotesque.txt and OFL-Manrope.txt",
    copy.voiceLines.length ? `Voice: ${ownVoice ? "recorded voice files (own voice)" : `Kokoro-82M, voice ${config.voice}, Apache 2.0. AI voice: turn on the platform's AI label where it asks`}.` : "Voice: none.",
    /WhatsAppGlyph|NotificationBanner/.test(componentSrc) ? "WhatsApp glyph: simple-icons, CC0 1.0, unaltered." : "WhatsApp glyph: not used.",
    copy.music ? `Music: ${copy.music.file}, ${copy.music.licence}` : "Music: none.",
    copy.stock?.length ? `Stock clips:\n${copy.stock.map((s) => `  ${s.file}: ${s.licence}`).join("\n")}` : "Stock clips: none.",
    copy.footage?.length ? `Recordings: ${copy.footage.join(", ")} (Rashid's own, lane R checks the frames).` : "Recordings: none.",
    "Kit parts (components, tokens): written for this repository.",
    "",
  ].join("\n"),
);

const counts = await writeChecklist(copy);
console.log(`kabsi: ${copy.id} done in kabsi/out/${outFolder(copy)}/ (${videos.map((v) => `${v.size}: ${v.frames} frames, ${v.durationS} s`).join("; ")}). Checklist: ${counts.yes} yes, ${counts.no} no, ${counts.confirm} for lane R to confirm.`);
