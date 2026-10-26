// One Kabsi video from start to finish.
//   node kabsi/scripts/render.mjs <ID>      e.g. KabsiKitTest
// Checks the rules, makes the voice, renders with Remotion, masters the audio to -14 LUFS, and writes kabsi/out/<ID>/:
// kabsi-<id>-<name>-1080x1920.mp4, the poster PNG, the contact sheets (2 frames a second) and, when the video has a
// voice-over, script.txt with its lines.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderReel } from "../../engine/scripts/render-core.mjs";
import { contactSheet } from "../../engine/scripts/contact-sheet.mjs";
import { loadCopies } from "./check.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
const copies = await loadCopies();
const copy = copies.find((c) => c.id === id);
if (!copy) {
  console.error(`kabsi render: name a video. Known: ${copies.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const run = (script) => {
  const r = spawnSync("node", [join(root, "scripts", script), copy.id], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run("check.mjs");
if (copy.voiceLines.length) {
  run("voice.mjs");
  run("check.mjs");
}

const outDir = join(root, "out", copy.id);
mkdirSync(outDir, { recursive: true });
const base = `kabsi-${copy.id.toLowerCase()}-${copy.name}-1080x1920`;
const result = await renderReel({
  entry: join(root, "src", "index.ts"),
  publicDir: join(root, "public"),
  composition: copy.id,
  outFile: join(outDir, `${base}.mp4`),
  posterFile: join(outDir, `${base}-poster.png`),
});
contactSheet(join(outDir, `${base}.mp4`), outDir);
if (copy.voiceLines.length) writeFileSync(join(outDir, "script.txt"), copy.voiceLines.map((l) => l.vo).join("\n") + "\n");
console.log(`kabsi: ${copy.id} done in kabsi/out/${copy.id}/ (${result.frames} frames, ${result.durationS} s)`);
