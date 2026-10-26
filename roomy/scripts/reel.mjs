// Makes one Roomy listing reel from start to finish.
//   node roomy/scripts/reel.mjs <id>             render roomy/listings/<id>.json into roomy/out/<id>/
//   node roomy/scripts/reel.mjs --studio [id]    open Remotion Studio on that listing (sursock-580sqm-v3 without one)
// The listing is passed to the composition as input props; nothing is copied. A render writes roomy/out/<id>/:
// roomy-<id>.mp4 (mastered to -14 LUFS, true peak under -1 dB), roomy-<id>-poster.png, the contact sheets
// (2 frames a second) and script.txt (the voice lines).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderReel } from "../../engine/scripts/render-core.mjs";
import { contactSheet } from "../../engine/scripts/contact-sheet.mjs";
import { RoomyListingSchema } from "../src/schema.ts";
import { resolveVoScript } from "../src/storyboard.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(root, "..");
const args = process.argv.slice(2);
const studio = args.includes("--studio");
const id = args.find((a) => !a.startsWith("--"));
const known = readdirSync(join(root, "listings")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
if ((!id && !studio) || (id && !known.includes(id))) {
  console.error(`roomy: name a listing. Available: ${known.join(", ")} (roomy/listings/<id>.json)`);
  process.exit(1);
}

const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: repo, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

if (studio) {
  run("node", ["roomy/scripts/assets.mjs"]);
  const props = [];
  if (id) {
    run("node", ["roomy/scripts/voice.mjs", id]);
    const file = join(mkdtempSync(join(tmpdir(), "roomy-studio-")), "props.json");
    writeFileSync(file, JSON.stringify({ listing: JSON.parse(readFileSync(join(root, "listings", `${id}.json`), "utf8")) }));
    props.push(`--props=${file}`);
  }
  run("npx", ["remotion", "studio", "roomy/src/index.ts", "--public-dir=roomy/public", ...props]);
  process.exit(0);
}

run("npx", ["tsc", "-p", "."]);
run("node", ["roomy/scripts/assets.mjs", id]);
run("node", ["roomy/scripts/voice.mjs", id]);
run("node", ["roomy/scripts/check.mjs", id]);

const listing = RoomyListingSchema.parse(JSON.parse(readFileSync(join(root, "listings", `${id}.json`), "utf8")));
const outDir = join(root, "out", id);
mkdirSync(outDir, { recursive: true });
const reel = join(outDir, `roomy-${id}.mp4`);
const result = await renderReel({
  entry: join(root, "src", "index.ts"),
  publicDir: join(root, "public"),
  composition: "RoomyDynamicReel",
  inputProps: { listing },
  outFile: reel,
  posterFile: join(outDir, `roomy-${id}-poster.png`),
  // The first scene with its badge and headline in place.
  posterAtS: 2.5,
});
contactSheet(reel, outDir);
const voice = JSON.parse(readFileSync(join(root, "src", "generated", "voice.json"), "utf8"))[id];
const spoken = voice && voice.lines.length ? voice.lines.map((l) => l.text) : resolveVoScript(listing).filter(Boolean);
writeFileSync(join(outDir, "script.txt"), spoken.join("\n") + "\n");
if (!existsSync(reel)) process.exit(1);
console.log(`roomy: roomy/out/${id}/ is ready (${result.frames} frames, ${result.durationS} s)`);
