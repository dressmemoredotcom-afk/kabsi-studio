// Records what exists for the Roomy reels, in roomy/src/generated/assets.json: the logo and the music, and for each
// listing every media file it lists (with its size and, for clips, its length) and an optional ready-made voice-over.
// The composition reads that file, so a missing photo, clip, logo or track falls back to a designed placeholder
// instead of failing the render. Files are found by name with or without a different image extension
// (.jpg, .jpeg, .png, .webp). Runs before every Roomy render and before Studio.
//   node roomy/scripts/assets.mjs            every listing in roomy/listings/
//   node roomy/scripts/assets.mjs <id>       one listing (the others keep what was recorded)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { RoomyListingSchema } from "../src/schema.ts";
import { mediaAssetPath } from "../src/storyboard.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const has = (rel) => existsSync(join(pub, rel));

const listingsDir = join(root, "listings");
const known = readdirSync(listingsDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const only = process.argv[2];
if (only && !known.includes(only)) {
  console.error(`roomy assets: no listing "${only}". Available: ${known.join(", ")}`);
  process.exit(1);
}

const IMG = [".jpg", ".jpeg", ".png", ".webp"];
const VID = [".mp4", ".mov", ".webm"];
/** The requested file, or the same name with another extension of the same kind. */
const resolve = (rel, alternates) => {
  if (has(rel)) return rel;
  const stem = rel.replace(/\.[^.]+$/, "");
  return alternates.map((e) => `${stem}${e}`).find(has) ?? null;
};

const probe = (rel) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", join(pub, rel)], { encoding: "utf8" });
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
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", join(pub, rel), "-vf", `alphaextract,scale=1:${height}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 24 });
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

/**
 * Black bars burned into a clip (a wide picture on a taller canvas, say) would show as dark stripes once the clip
 * fills the frame. ffmpeg's cropdetect finds the real picture; null when there are no bars worth removing.
 */
const detectContent = (rel, width, height) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-t", "30", "-i", join(pub, rel), "-vf", "cropdetect=limit=24:round=2:reset=0", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
  const counts = {};
  for (const m of (r.stderr ?? "").matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)) counts[m[0]] = (counts[m[0]] ?? 0) + 1;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;
  const [w, h, x, y] = best[0].slice(5).split(":").map(Number);
  const bars = (width - w) / width > 0.02 || (height - h) / height > 0.02;
  if (!bars || w < width * 0.6 || h < height * 0.6) return null;
  return { x, y, width: w, height: h };
};

/** One listing's media files and its optional ready-made voice-over (roomy/public/voice/<id>/voiceover.*). */
const scanListing = (listing) => {
  const media = {};
  for (const item of listing.media) {
    if (media[item.src]) continue;
    const file = resolve(mediaAssetPath(item.src), item.type === "photo" ? IMG : VID);
    const info = file ? probe(file) : { width: 0, height: 0, durationS: 0 };
    const content = file && item.type === "video" ? detectContent(file, info.width, info.height) : null;
    media[item.src] = { file, kind: item.type, ...info, ...(content ? { content } : {}) };
  }
  const voiceover = ["mp3", "wav", "m4a"].map((e) => `voice/${listing.id}/voiceover.${e}`).find(has) ?? null;
  return { voiceover, media };
};

// The logo may be called roomy-logo.* or Transparent.png.
const logoFile = ["brand/roomy-logo.png", "brand/roomy-logo.webp", "brand/Transparent.png", "brand/transparent.png"].find(has) ?? null;
let logo = null;
if (logoFile) {
  const size = probe(logoFile);
  logo = { file: logoFile, width: size.width, height: size.height, taglineCropY: taglineCropY(logoFile, size.height) };
}

const outFile = join(root, "src", "generated", "assets.json");
const previous = existsSync(outFile) ? JSON.parse(readFileSync(outFile, "utf8")) : {};
const listings = {};
for (const id of known) {
  if (only && id !== only) {
    if (previous.listings?.[id]) listings[id] = previous.listings[id];
    continue;
  }
  const listing = RoomyListingSchema.parse(JSON.parse(readFileSync(join(listingsDir, `${id}.json`), "utf8")));
  if (listing.id !== id) throw new Error(`roomy/listings/${id}.json has id "${listing.id}"; the id must match the file name`);
  listings[id] = scanListing(listing);
  const found = listings[id];
  console.log(`roomy assets: listing "${id}", ${listing.media.length} media item${listing.media.length === 1 ? "" : "s"}`);
  for (const [src, m] of Object.entries(found.media)) console.log(`  ${m.file ? "ok     " : "MISSING"} ${src}${m.file && m.file !== mediaAssetPath(src) ? `  (found as ${m.file})` : ""}${m.file ? `  ${m.width}x${m.height}${m.durationS ? `, ${m.durationS.toFixed(1)} s` : ""}${m.content ? `, black bars cropped to ${m.content.width}x${m.content.height}` : ""}` : "  (a placeholder is used)"}`);
  if (found.voiceover) console.log(`  voice-over: your file ${found.voiceover}`);
}

const manifest = {
  logo,
  // Your track, if you have added one.
  bgm: ["audio/luxury-house.mp3", "audio/luxury-house.wav", "audio/luxury-house.m4a"].find(has) ?? null,
  // A generated ambient loop stands in for luxury-house.mp3 until you add yours.
  bgmStandin: has("audio/ambient-loop.mp3") ? "audio/ambient-loop.mp3" : null,
  listings,
};
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");

console.log(`  ${logo ? "ok     " : "MISSING"} logo${logo ? `  ${logo.file}${logo.taglineCropY ? `  (tagline found, cropped below row ${logo.taglineCropY} of ${logo.height})` : ""}` : "  (a typographic wordmark is used)"}`);
console.log(`  music: ${manifest.bgm ?? (manifest.bgmStandin ? "generated ambient stand-in (add roomy/public/audio/luxury-house.mp3 to replace it)" : "none")}`);
