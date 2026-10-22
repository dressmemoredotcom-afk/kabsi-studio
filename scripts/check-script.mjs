// Fails (exit 1) if the script, the on-screen strings or the source break a Kabsi rule.
// Reads src/script.ts, so the VO, captions and every on-screen string are checked in one place.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, SCREEN, VOICE_LINES } from "../src/script.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

// Collect every string with a label saying where it comes from.
const strings = [];
VOICE_LINES.forEach((l) => {
  strings.push({ where: `vo:${l.id}`, text: l.vo, vo: true });
  l.captions.forEach((c, i) => strings.push({ where: `caption:${l.id}#${i + 1}`, text: c }));
});
(function walk(node, path) {
  if (typeof node === "string") strings.push({ where: `screen:${path}`, text: node });
  else if (Array.isArray(node)) node.forEach((n, i) => walk(n, `${path}[${i}]`));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
})(SCREEN, "");

const banned = [
  [/\bautomatic(ally)?\b/i, "automatically"],
  [/\breal[- ]?time\b/i, "real-time"],
  [/24\s*\/\s*7|24 ?hours? a day/i, "24/7"],
  [/\brank(s|ed|ing)? higher\b|\bhigher rank/i, "rank higher"],
  [/\bnumber (one|1)\b|#\s?1\b|\bno\.? ?1\b/i, "number one"],
  [/\bmore reviews\b/i, "more reviews"],
  [/\bmore customers\b/i, "more customers"],
  [/\bguarantee(d|s)?\b/i, "guaranteed"],
  [/\bbest\b/i, "best"],
  [/\beasiest\b/i, "easiest"],
  [/\bin (just )?(a few )?seconds?\b/i, "in seconds"],
  [/\bone[- ]tap\b/i, "one tap"],
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
  [/leave (us )?(a )?(5|five)[- ]?stars?/i, "leave 5 stars"],
  [/\b(5|five)[- ]stars?\b/i, "five-star language"],
  [/\bonly (ask|happy)|happy customers?\b/i, "asking only happy customers"],
  [/\breward(s|ed|ing)?\b|\bincentiv|\bdiscount for\b|\bfree (coffee|gift)\b/i, "rewards for reviews"],
];

for (const { where, text, vo } of strings) {
  if (/[‒–—―−]/.test(text)) fail(where, `dash character in "${text}"`);
  if (/\s-{1,2}\s|--/.test(text)) fail(where, `dash used as punctuation in "${text}"`);
  if (/[!！¡]/.test(text)) fail(where, `exclamation mark in "${text}"`);
  for (const [re, name] of banned) if (re.test(text)) fail(where, `banned "${name}" in "${text}"`);
  if (vo && /\d/.test(text)) fail(where, `digits in voice-over, write numbers as words: "${text}"`);
}

// Captions must be the voice-over, split.
for (const l of VOICE_LINES) {
  if (l.captions.join(" ") !== l.vo) fail(`caption:${l.id}`, "captions joined do not equal the voice-over line");
  if (l.captions.some((c) => c.length > 60)) fail(`caption:${l.id}`, "caption chunk over 60 characters (two lines max)");
}

// Content rules.
if (SCREEN.app.example !== "Example") fail("screen:app.example", 'screens must carry the "Example" tag');
if (SCREEN.app.business !== "Harbour Lane Coffee") fail("screen:app.business", "business must be Harbour Lane Coffee");
if (SCREEN.end.tagline !== "Your reviews and listing. Taken care of.") fail("screen:end.tagline", "brand line changed");
if (!SCREEN.hook.lines.join(" ").includes(SCREEN.hook.keyWord)) fail("screen:hook", "key word not in the hook");
if (SCREEN.hook.lines.join(" ") !== VOICE_LINES[0].vo) fail("screen:hook", "hook text differs from the hook voice-over");
for (const s of strings) {
  if (/\bgoogle\b/i.test(s.text) && /\b(logo|pin|maps)\b/i.test(s.text)) fail(s.where, "mentions Google branding or Maps");
}

// Source rules: colours only from tokens.ts, no dashes anywhere in src.
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
  if (/[–—]/.test(src)) fail(rel, "en or em dash in source");
  if (!rel.endsWith("tokens.ts")) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(src.replace(/<\?xml[^>]*>/, ""))) fail(rel, "hex colour outside src/tokens.ts");
    if (/\b(rgb|rgba|hsl|hsla)\(/i.test(src)) fail(rel, "raw colour function outside src/tokens.ts");
  }
}

// Timing rules, when the voice has been generated.
const voicePath = join(root, "src", "generated", "voice.json");
let timing = "voice not generated yet, timing not checked";
if (existsSync(voicePath)) {
  const { durations } = JSON.parse(readFileSync(voicePath, "utf8"));
  const total = SCENES[SCENES.length - 1].to;
  if (total < 28 || total > 30) fail("timeline", `total ${total}s is outside 28 to 30 s`);
  for (const l of VOICE_LINES) {
    const scene = SCENES.find((s) => s.id === l.id);
    const end = scene.from + 0.2 + durations[l.id];
    if (durations[l.id] === undefined) fail(`voice:${l.id}`, "no measured duration");
    else if (end > scene.to + 0.01) fail(`voice:${l.id}`, `ends at ${end.toFixed(2)}s, after its scene ends at ${scene.to}s`);
  }
  timing = `${total} s total, every line fits its scene`;
}

const vo = strings.filter((s) => s.vo).length;
if (failures.length) {
  console.error(`check-script FAIL (${failures.length})`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(
  `check-script PASS: ${strings.length} strings (${vo} voice-over lines, ${strings.length - vo} captions and on-screen), ` +
    `${files.length} source files, ${banned.length} banned-phrase rules, ${timing}`,
);
