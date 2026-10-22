// Fails (exit 1) if any video's script, on-screen strings or source break a Kabsi rule.
// Reads each video's script file, so the VO, captions and every on-screen string are checked in one place.
//   node scripts/check-script.mjs          checks every video
//   node scripts/check-script.mjs 02       checks one
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEOS } from "./videos.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const banned = [
  [/\bautomatic(ally)?\b/i, "automatically"],
  [/\breal[- ]?time\b/i, "real-time"],
  [/24\s*\/\s*7|24 ?hours? a day/i, "24/7"],
  [/\brank(s|ed|ing)? higher\b|\bhigher rank/i, "rank higher"],
  [/\bnumber (one|1)\b|#\s?1\b|\bno\.? ?1\b/i, "number one"],
  [/\bmore reviews\b|\bmore (real |genuine |new )?reviews\b/i, "more reviews"],
  [/\bmore customers\b/i, "more customers"],
  [/\bguarantee(d|s)?\b/i, "guaranteed"],
  [/\bbest\b/i, "best"],
  [/\beasiest\b/i, "easiest"],
  [/\bin (just )?(a few )?seconds?\b/i, "in seconds"],
  [/\bone[- ]tap\b|\bin one (tap|click)\b/i, "one tap"],
  [/official google partner/i, "official Google partner"],
  [/approved by google/i, "approved by Google"],
  // statistics
  [/\d\s?%|\bpercent\b|\bper ?cent\b/i, "statistic (percent)"],
  [/\b\d+(\.\d+)?\s?x\b|\b\d+ times (more|faster|as)\b|\b(double|triple)s?\b/i, "statistic (multiplier)"],
  [/\b(studies|research|survey|surveys) (show|says|found)\b|\b\d+ (out of|in) \d+\b/i, "statistic (study or ratio)"],
  [/\b(average|on average)\b/i, "statistic (average)"],
  // prices
  [/[$£€¥]|\bpric(e|es|ing)\b|\bper (month|year)\b|\/\s?mo\b|\b(dollars?|pounds?|euros?)\b|\bcosts?\b/i, "price"],
  // review-asking rules
  [/leave (us |me |a )*(5|five)[- ]?stars?|\b(give|rate) us (a )?(5|five)\b/i, "leave 5 stars"],
  [/\b(review|reviewed)\s+(from|by)\s+[A-Z][a-z]+/, "review attributed to a named person"],
  [/\bonly (ask|happy)|happy customers?\b/i, "asking only happy customers"],
  [/\breward(s|ed|ing)?\b|\bincentiv|\bdiscount for\b|\bfree (coffee|gift)\b/i, "rewards for reviews"],
  // stricter than the brief: "instantly" is the same claim as real-time
  [/\binstantly\b|\bin an instant\b|\bimmediately\b/i, "instantly (real-time claim)"],
];

const collect = (mod) => {
  const strings = [];
  mod.VOICE_LINES.forEach((l) => {
    strings.push({ where: `vo:${l.id}`, text: l.vo, vo: true });
    l.captions.forEach((c, i) => strings.push({ where: `caption:${l.id}#${i + 1}`, text: c }));
  });
  (function walk(node, path) {
    if (typeof node === "string") strings.push({ where: `screen:${path}`, text: node });
    else if (Array.isArray(node)) node.forEach((n, i) => walk(n, `${path}[${i}]`));
    else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
  })(mod.SCREEN, "");
  return strings;
};

const summaries = [];
const onlyId = process.argv.slice(2).find((a) => /^\d\d$/.test(a));

for (const [id, video] of Object.entries(VIDEOS)) {
  if (onlyId && onlyId !== id) continue;
  const mod = await import(video.scriptFile);
  const { VOICE_LINES, SCENES, SCREEN } = mod;
  const fail = (where, msg) => failures.push(`[${id}] ${where}: ${msg}`);
  const strings = collect(mod);

  for (const { where, text, vo } of strings) {
    if (/[‒–—―−]/.test(text)) fail(where, `dash character in "${text}"`);
    if (/\s-{1,2}\s|--/.test(text)) fail(where, `dash used as punctuation in "${text}"`);
    if (/[!！¡]/.test(text)) fail(where, `exclamation mark in "${text}"`);
    for (const [re, name] of banned) if (re.test(text)) fail(where, `banned "${name}" in "${text}"`);
    if (vo && /\d/.test(text)) fail(where, `digits in voice-over, write numbers as words: "${text}"`);
    if (/\bgoogle\b/i.test(text) && /\b(logo|pin)\b/i.test(text)) fail(where, "mentions Google branding or a Maps pin");
  }

  // Captions must be the voice-over, split. Chunks stay short enough for two lines at most.
  for (const l of VOICE_LINES) {
    if (l.captions.join(" ") !== l.vo) fail(`caption:${l.id}`, "captions joined do not equal the voice-over line");
    if (l.captions.some((c) => c.length > 60)) fail(`caption:${l.id}`, "caption chunk over 60 characters (two lines max)");
  }
  for (const s of SCENES) if (!VOICE_LINES.some((l) => l.id === s.id)) fail(`scene:${s.id}`, "scene has no voice line");

  // Content rules, both videos.
  if (SCREEN.app.example !== "Example") fail("screen:app.example", 'screens must carry the "Example" tag');
  if (SCREEN.end.tagline !== "Your reviews and listing. Taken care of.") fail("screen:end.tagline", "brand line changed");
  if (!/Not affiliated with Google\./i.test(SCREEN.end.small) || !/^Early access\./.test(SCREEN.end.small)) fail("screen:end.small", "small print must say early access and not affiliated with Google");
  if (!strings.some((s) => s.vo && /Taken care of/.test(s.text))) fail("vo", "brand line missing from the voice-over");
  // Video 01 shows its hook verbatim; video 02 splits it across colours and drops "your" and "listing".
  if (id === "03") {
    const hook = SCREEN.hook.lines.join(" ");
    if (!hook.includes(SCREEN.hook.keyWord)) fail("screen:hook", "key word not in the hook");
    if (!/Google/.test(hook)) fail("screen:hook", "hook must name Google in words");
    if (SCREEN.app.business !== "Harbour Lane Coffee") fail("screen:app.business", "business must be Harbour Lane Coffee");
    if (!/kabsi\.co/i.test(SCREEN.end.cta)) fail("screen:end.cta", "call to action must point to kabsi.co");
  } else if (id === "01") {
    if (SCREEN.hook.lines.join(" ") !== VOICE_LINES[0].vo) fail("screen:hook", "hook text differs from the hook voice-over");
    if (!SCREEN.hook.lines.join(" ").includes(SCREEN.hook.keyWord)) fail("screen:hook", "key word not in the hook");
    if (SCREEN.app.business !== "Harbour Lane Coffee") fail("screen:app.business", "business must be Harbour Lane Coffee");
  } else {
    const hook = [SCREEN.hook.white, ...SCREEN.hook.yellow].join(" ");
    if (!/Google Maps/.test(hook)) fail("screen:hook", "hook must name Google Maps in words");
    if (SCREEN.app.business !== "Harbour Lane Coffee") fail("screen:app.business", "business must be Harbour Lane Coffee");
  }

  // Timing, when the voice has been generated.
  const voicePath = join(root, "src", "generated", video.voiceJson);
  let timing = "voice not generated yet, timing not checked";
  if (existsSync(voicePath)) {
    const { durations } = JSON.parse(readFileSync(voicePath, "utf8"));
    const total = SCENES[SCENES.length - 1].to;
    if (total < video.minS || total > video.maxS) fail("timeline", `total ${total}s is outside ${video.minS} to ${video.maxS} s`);
    for (const l of VOICE_LINES) {
      const scene = SCENES.find((s) => s.id === l.id);
      const end = scene.from + (l.offset ?? 0.2) + durations[l.id];
      if (durations[l.id] === undefined) fail(`voice:${l.id}`, "no measured duration");
      else if (end > scene.to + 0.01) fail(`voice:${l.id}`, `ends at ${end.toFixed(2)}s, after its scene ends at ${scene.to}s`);
    }
    timing = `${total} s total, every line fits its scene`;
  }
  summaries.push(
    `[${id}] ${strings.length} strings (${strings.filter((s) => s.vo).length} voice-over lines), ${timing}`,
  );
}

// Source rules, once: colours only from tokens.ts, no dashes anywhere in src.
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
  if (!rel.endsWith("tokens.ts")) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(src)) failures.push(`${rel}: hex colour outside src/tokens.ts`);
    if (/\b(rgb|rgba|hsl|hsla)\(/i.test(src)) failures.push(`${rel}: raw colour function outside src/tokens.ts`);
  }
}

if (failures.length) {
  console.error(`check-script FAIL (${failures.length})`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`check-script PASS: ${banned.length} banned-phrase rules, ${files.length} source files`);
summaries.forEach((s) => console.log(`  ${s}`));
