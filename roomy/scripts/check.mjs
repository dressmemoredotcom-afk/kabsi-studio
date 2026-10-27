// Fails (exit 1) if a Roomy listing or the Roomy source breaks a rule.
//   node roomy/scripts/check.mjs          every listing in roomy/listings/
//   node roomy/scripts/check.mjs <id>     one listing
// Each listing must match the schema and carry its own file name as id; on-screen copy has no dashes used as
// punctuation and no exclamation marks; the voice-over has no digits and no overclaims; a stored voice must belong to
// the listing's current script and end before the reel does. Colours come only from roomy/src/tokens.ts.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { RoomyListingSchema } from "../src/schema.ts";
import { FPS, outroFrom, planListing, resolveVoScript, sceneCopy, totalFrames, voiceSignature } from "../src/storyboard.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const summaries = [];

// Claims a listing reel does not make.
const banned = [
  [/\bguarantee(d|s)?\b/i, "guaranteed"],
  [/\bbest\b/i, "best"],
  [/\bnumber (one|1)\b|#\s?1\b|\bno\.? ?1\b/i, "number one"],
  [/\d\s?%|\bpercent\b|\bper ?cent\b/i, "statistic (percent)"],
  [/\b(studies|research|survey|surveys) (show|says|found)\b/i, "statistic (study)"],
];

const listingsDir = join(root, "listings");
const known = readdirSync(listingsDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const only = process.argv[2];
if (only && !known.includes(only)) {
  console.error(`roomy check: no listing "${only}". Available: ${known.join(", ")}`);
  process.exit(1);
}
const voices = existsSync(join(root, "src", "generated", "voice.json")) ? JSON.parse(readFileSync(join(root, "src", "generated", "voice.json"), "utf8")) : {};

for (const id of known) {
  if (only && id !== only) continue;
  const fail = (where, msg) => failures.push(`[${id}] ${where}: ${msg}`);
  let raw;
  try {
    raw = JSON.parse(readFileSync(join(listingsDir, `${id}.json`), "utf8"));
  } catch (e) {
    fail("file", `not valid JSON: ${e.message}`);
    continue;
  }
  const parsed = RoomyListingSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fail(`listing.${issue.path.join(".")}`, issue.message);
    continue;
  }
  const listing = parsed.data;
  if (listing.id !== id) fail("id", `is "${listing.id}", must be the file name "${id}"`);
  const script = resolveVoScript(listing);
  const total = totalFrames(listing);
  const copy = sceneCopy(listing);
  const strings = [
    ["neighborhood", listing.neighborhood],
    ["propertyTitle", listing.propertyTitle],
    ["price", listing.price],
    ["whatsappContact", listing.whatsappContact],
    ["instagram", listing.instagram],
    ...listing.specs.map((t, i) => [`specs[${i}]`, t]),
    ...listing.media.flatMap((m, i) => [[`media[${i}].headline`, m.headline], [`media[${i}].subline`, m.subline]]),
    ...copy.flatMap((c, i) => [[`scene ${i} badge`, c.topBadge], ...(c.bar ?? []).flat().map((t) => [`scene ${i} bar`, t])]),
  ].filter(([, t]) => typeof t === "string" && t);
  for (const [where, text] of strings) {
    if (/[‒–—―−]/.test(text)) fail(where, `dash character in "${text}"`);
    if (/\s-{1,2}\s|--/.test(text)) fail(where, `dash used as punctuation in "${text}"`);
    if (/[!！¡]/.test(text)) fail(where, `exclamation mark in "${text}"`);
  }
  script.forEach((text, i) => {
    if (!text) return;
    const where = `voice-over[${i}]`;
    if (/\d/.test(text)) fail(where, `digits in voice-over, write numbers as words: "${text}"`);
    if (/[‒–—―−!]/.test(text) || /\s-{1,2}\s|--/.test(text)) fail(where, `dash or exclamation mark in "${text}"`);
    for (const [re, name] of banned) if (re.test(text)) fail(where, `"${name}" in "${text}"`);
  });
  for (const [i, m] of listing.media.entries()) {
    const text = [m.headline, m.subline].filter(Boolean).join(" ");
    for (const [re, name] of banned) if (re.test(text)) fail(`media[${i}]`, `"${name}" in "${text}"`);
  }
  // The stored voice must belong to this listing's script and end before the outro fades.
  const v = voices[id];
  let voiceNote = "voice not generated";
  if (v) {
    if (v.signature !== voiceSignature(script, listing.durationSeconds)) fail("voice", `the stored voice does not match this listing's script. Run: npm run roomy:voice -- ${id}`);
    else {
      let prevEnd = -Infinity;
      for (const l of v.lines) {
        if (l.startS < prevEnd + 0.5) fail(`voice scene ${l.scene}`, `starts at ${l.startS}s, too close to the line before (ends ${prevEnd.toFixed(2)}s)`);
        prevEnd = l.startS + l.durS;
      }
      if (prevEnd > total / FPS - 0.4) fail("voice", `the last line ends at ${prevEnd.toFixed(2)}s, too late for a ${total / FPS} s reel`);
      voiceNote = v.lines.length ? `voice ${v.voice} at ${v.speed}x ends at ${prevEnd.toFixed(2)} s` : "your voiceover file";
    }
  }
  const scenes = planListing(listing);
  const sum = scenes.reduce((n, sc) => n + sc.frames, 0) + (total - outroFrom(total));
  scenes.forEach((sc) => { if (sc.frames < FPS) fail("timeline", `scene ${sc.index} is only ${sc.frames} frames, the fixed lengths leave too little time`); });
  if (sum !== total) fail("timeline", `scenes add up to ${sum} frames, expected ${total}`);
  summaries.push(`[${id}] ${listing.media.length} media item${listing.media.length === 1 ? "" : "s"}, ${total / FPS} s (${(scenes[0].frames / FPS).toFixed(1)} s first scene), ${strings.length} strings, ${voiceNote}`);
}

// Source rules: colours only from tokens.ts, no en or em dashes in the source.
const files = [];
(function list(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) list(p);
    else if (/\.(ts|tsx)$/.test(name)) files.push(p);
  }
})(join(root, "src"));
for (const f of files) {
  const rel = relative(root, f);
  const src = readFileSync(f, "utf8");
  if (/[–—]/.test(src)) failures.push(`${rel}: en or em dash in source`);
  if (rel !== join("src", "tokens.ts")) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(src)) failures.push(`${rel}: hex colour outside src/tokens.ts`);
    if (/\b(rgb|rgba|hsl|hsla)\(/i.test(src)) failures.push(`${rel}: raw colour function outside src/tokens.ts`);
  }
}

if (failures.length) {
  console.error(`roomy check FAIL (${failures.length})`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`roomy check PASS: ${summaries.length} listing${summaries.length === 1 ? "" : "s"}, ${files.length} source files`);
summaries.forEach((s) => console.log(`  ${s}`));
