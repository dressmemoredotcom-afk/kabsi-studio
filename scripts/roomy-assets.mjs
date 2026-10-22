// Records what exists for the Roomy reel, in src/brands/roomy/generated/roomy-assets.json: every media file in
// assets/roomy/listing.json (with its size and, for clips, its length), the logo, the music and an optional ready-made
// voice-over. The composition reads that file, so a missing photo, clip, logo or track falls back to a designed
// placeholder instead of failing the render. Files are found by name with or without a different image extension
// (.jpg, .jpeg, .png, .webp). Runs before `npm run render:roomy` and `npm run studio`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { RoomyListingSchema } from "../src/brands/roomy/schema.ts";
import { mediaAssetPath } from "../src/brands/roomy/storyboard.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const has = (rel) => existsSync(join(root, "assets", rel));

const listing = RoomyListingSchema.parse(JSON.parse(readFileSync(join(root, "assets", "roomy", "listing.json"), "utf8")));

const IMG = [".jpg", ".jpeg", ".png", ".webp"];
const VID = [".mp4", ".mov", ".webm"];
/** The requested file, or the same name with another extension of the same kind. */
const resolve = (rel, alternates) => {
  if (has(rel)) return rel;
  const stem = rel.replace(/\.[^.]+$/, "");
  return alternates.map((e) => `${stem}${e}`).find(has) ?? null;
};

const probe = (rel) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", join(root, "assets", rel)], { encoding: "utf8" });
  try {
    const j = JSON.parse(r.stdout);
    return { width: j.streams?.[0]?.width ?? 0, height: j.streams?.[0]?.height ?? 0, durationS: Number(j.format?.duration) || 0 };
  } catch {
    return { width: 0, height: 0, durationS: 0 };
  }
};

/**
 * Looks for a tagline under the artwork of a logo: a band of ink that follows a thin rule after a clear gap.
 * Returns the row to crop at, or null when the logo has no such band.
 */
const taglineCropY = (rel, height) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", join(root, "assets", rel), "-vf", `alphaextract,scale=1:${height}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 24 });
  if (r.status !== 0 || r.stdout.length < height) return null;
  const bands = [];
  let start = -1;
  for (let y = 0; y <= height; y++) {
    const inked = y < height && r.stdout[y] > 3;
    if (inked && start < 0) start = y;
    if (!inked && start >= 0) {
      bands.push([start, y - 1]);
      start = -1;
    }
  }
  if (bands.length < 3) return null;
  const [tagStart, tagEnd] = bands[bands.length - 1];
  const [ruleStart, ruleEnd] = bands[bands.length - 2];
  const tagH = tagEnd - tagStart;
  const ruleH = ruleEnd - ruleStart;
  const gap = tagStart - ruleEnd;
  // Text about 2 to 5% of the height, under a rule under 1.5%, with a gap of 1 to 4%.
  if (tagH > height * 0.02 && tagH < height * 0.05 && ruleH < height * 0.015 && gap > height * 0.01 && gap < height * 0.04) return Math.round(ruleEnd + gap / 2);
  return null;
};

const media = {};
for (const item of listing.media) {
  if (media[item.src]) continue;
  const file = resolve(mediaAssetPath(item.src), item.type === "photo" ? IMG : VID);
  media[item.src] = { file, kind: item.type, ...(file ? probe(file) : { width: 0, height: 0, durationS: 0 }) };
}

// The logo may be called roomy-logo.* or Transparent.png.
const logoFile = ["roomy/roomy-logo.png", "roomy/roomy-logo.webp", "roomy/Transparent.png", "roomy/transparent.png"].find(has) ?? null;
let logo = null;
if (logoFile) {
  const size = probe(logoFile);
  logo = { file: logoFile, width: size.width, height: size.height, taglineCropY: taglineCropY(logoFile, size.height) };
}

const manifest = {
  logo,
  // Your track, if you have added one.
  bgm: ["audio/bgm/luxury-house.mp3", "audio/bgm/luxury-house.wav", "audio/bgm/luxury-house.m4a"].find(has) ?? null,
  // A generated ambient track stands in for luxury-house.mp3 until you add yours.
  bgmStandin: has("audio/bgm/roomy-ambient-standin.mp3") ? "audio/bgm/roomy-ambient-standin.mp3" : null,
  // Optional ready-made voice-over for the whole reel, instead of the Kokoro lines.
  voiceover: ["roomy/voiceover.mp3", "roomy/voiceover.wav", "roomy/voiceover.m4a"].find(has) ?? null,
  media,
};

const out = join(root, "src", "brands", "roomy", "generated");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "roomy-assets.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`roomy assets: listing "${listing.id}", ${listing.media.length} media item${listing.media.length === 1 ? "" : "s"}`);
for (const [src, m] of Object.entries(media)) console.log(`  ${m.file ? "ok     " : "MISSING"} ${src}${m.file && m.file !== mediaAssetPath(src) ? `  (found as ${m.file})` : ""}${m.file ? `  ${m.width}x${m.height}${m.durationS ? `, ${m.durationS.toFixed(1)} s` : ""}` : "  (a placeholder is used)"}`);
console.log(`  ${logo ? "ok     " : "MISSING"} logo${logo ? `  ${logo.file}${logo.taglineCropY ? `  (tagline found, cropped below row ${logo.taglineCropY} of ${logo.height})` : ""}` : "  (a typographic wordmark is used)"}`);
console.log(`  music: ${manifest.bgm ?? (manifest.bgmStandin ? "generated ambient stand-in (add assets/audio/bgm/luxury-house.mp3 to replace it)" : "none")}`);
if (manifest.voiceover) console.log(`  voice-over: your file ${manifest.voiceover}`);
