// Makes one Roomy listing reel from start to finish.
//   node scripts/roomy-reel.mjs sursock-580sqm        render and master out/roomy-sursock-580sqm.mp4
//   node scripts/roomy-reel.mjs                       the same for the listing that is currently active
//   node scripts/roomy-reel.mjs --use sursock-580sqm  only make that listing the active one (Studio shows it)
// Listings live in assets/roomy/listings/<id>.json. The active one is copied to assets/roomy/listing.json, which is
// what Studio, the asset scan, the voice and the render read. Edit the file in listings/, never listing.json.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const listingsDir = join(root, "assets", "roomy", "listings");
const active = join(root, "assets", "roomy", "listing.json");
const args = process.argv.slice(2);
const useOnly = args.includes("--use");
const id = args.find((a) => !a.startsWith("--"));

const known = existsSync(listingsDir) ? readdirSync(listingsDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)) : [];
if (id) {
  if (!known.includes(id)) {
    console.error(`No listing "${id}". Available: ${known.join(", ") || "none"} (assets/roomy/listings/<id>.json)`);
    process.exit(1);
  }
  copyFileSync(join(listingsDir, `${id}.json`), active);
  console.log(`roomy: active listing is now "${id}"`);
}
const activeId = JSON.parse(readFileSync(active, "utf8")).id;
if (useOnly) process.exit(0);

const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const out = `out/roomy-${activeId}.mp4`;
run("npx", ["tsc", "-p", "."]);
run("node", ["scripts/roomy-assets.mjs"]);
run("node", ["scripts/roomy-voice.mjs"]);
run("node", ["scripts/check-script.mjs"]);
run("npx", ["remotion", "render", "src/index.ts", "RoomyDynamicReel", out]);
run("node", ["scripts/master-audio.mjs", out]);
console.log(`roomy: ${out} is ready`);
