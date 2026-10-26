// Contact sheets for review: frames at 2 a second, each stamped with its time, tiled into numbered PNG sheets.
//   node engine/scripts/contact-sheet.mjs <video.mp4> <out-dir>      writes <out-dir>/contact-sheet-01.png, -02, ...
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./render-core.mjs";

const COLS = 5;
const ROWS = 4;

/** Writes the sheets and returns their file names. */
export const contactSheet = (video, outDir) => {
  mkdirSync(outDir, { recursive: true });
  for (const f of readdirSync(outDir)) if (/^contact-sheet-\d+\.png$/.test(f)) rmSync(join(outDir, f));
  const stamp = "drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=17:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=4";
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", video,
    "-vf", `fps=2,scale=216:-2,${stamp},tile=${COLS}x${ROWS}:padding=6:margin=6:color=black`,
    "-start_number", "1", join(outDir, "contact-sheet-%02d.png"),
  ]);
  const sheets = readdirSync(outDir).filter((f) => /^contact-sheet-\d+\.png$/.test(f)).sort();
  console.log(`contact sheet: ${sheets.length} sheet${sheets.length === 1 ? "" : "s"} of ${COLS * ROWS} frames in ${outDir}`);
  return sheets;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [video, outDir] = process.argv.slice(2);
  if (!video || !outDir) {
    console.error("usage: node engine/scripts/contact-sheet.mjs <video.mp4> <out-dir>");
    process.exit(1);
  }
  contactSheet(video, outDir);
}
