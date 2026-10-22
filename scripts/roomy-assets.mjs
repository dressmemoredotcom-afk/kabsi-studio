// Records which Roomy assets exist, in src/generated/roomy-assets.json. The composition reads that file,
// so a missing photo, video, logo or track falls back to a designed placeholder instead of failing the render.
// Photos and the logo are found as .jpg, .jpeg or .png. Runs automatically before `npm run render:roomy`
// and `npm run studio`.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const has = (rel) => existsSync(join(root, "assets", rel));
/** The first existing file among the given extensions, as a path under assets/, or null. */
const find = (stem, exts) => exts.map((e) => `${stem}${e}`).find(has) ?? null;

const IMG = [".jpg", ".jpeg", ".png", ".webp"];
const manifest = {
  logo: find("roomy/roomy-logo", [".png", ".webp", ".jpg", ".jpeg"]),
  terrace: find("roomy/terrace-ruins", IMG),
  walkthrough: find("roomy/apartment-walkthrough", [".mp4", ".mov", ".webm"]),
  library: find("roomy/living-room-library", IMG),
  bedroom: find("roomy/master-bedroom", IMG),
  // Your track, if you have added one.
  bgm: find("audio/bgm/luxury-house", [".mp3", ".wav", ".m4a"]),
  // A generated ambient track stands in for luxury-house.mp3 until you add yours.
  bgmStandin: find("audio/bgm/roomy-ambient-standin", [".mp3"]),
  // Optional ready-made voice-over for the whole reel, instead of the Kokoro lines.
  voiceover: find("roomy/voiceover", [".mp3", ".wav", ".m4a"]),
};

mkdirSync(join(root, "src", "generated"), { recursive: true });
writeFileSync(join(root, "src", "generated", "roomy-assets.json"), JSON.stringify(manifest, null, 2) + "\n");

const wanted = {
  logo: "assets/roomy/roomy-logo.png",
  terrace: "assets/roomy/terrace-ruins.jpg",
  walkthrough: "assets/roomy/apartment-walkthrough.mp4",
  library: "assets/roomy/living-room-library.jpg",
  bedroom: "assets/roomy/master-bedroom.jpg",
  bgm: "assets/audio/bgm/luxury-house.mp3",
};
const missing = Object.entries(wanted).filter(([k]) => !manifest[k]);
for (const [k, file] of Object.entries(manifest)) if (file) console.log(`roomy assets: ${k.padEnd(11)} ${file}`);
if (missing.length) {
  console.warn(`roomy assets: ${missing.length} missing, placeholders are used for them:`);
  for (const [k, file] of missing) console.warn(`  - ${file}${k === "bgm" && manifest.bgmStandin ? "  (generated ambient stand-in plays instead)" : ""}`);
}
