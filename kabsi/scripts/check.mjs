// Fails (exit 1) if a Kabsi video's words or source break a Kabsi rule.
// Reads every kabsi/src/videos/*.copy.ts, so the VO, captions and every on-screen string are checked in one place.
//   node kabsi/scripts/check.mjs                  checks every video
//   node kabsi/scripts/check.mjs KabsiKitTest     checks one
// The rules for the new catalogue are in kabsi/docs/VIDEO-PLAN.md sections 1 to 3.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

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

/** Every video's words: one COPY per kabsi/src/videos/*.copy.ts. */
export const loadCopies = async () => {
  const dir = join(root, "src", "videos");
  const files = readdirSync(dir).filter((f) => f.endsWith(".copy.ts")).sort();
  return Promise.all(files.map(async (f) => (await import(join(dir, f))).COPY));
};

const collect = (copy) => {
  const strings = [];
  copy.voiceLines.forEach((l) => {
    strings.push({ where: `vo:${l.id}`, text: l.vo, vo: true });
    (l.captions ?? []).forEach((c, i) => strings.push({ where: `caption:${l.id}#${i + 1}`, text: c }));
  });
  (function walk(node, path) {
    if (typeof node === "string") strings.push({ where: `screen:${path}`, text: node });
    else if (Array.isArray(node)) node.forEach((n, i) => walk(n, `${path}[${i}]`));
    else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
  })(copy.screen, "");
  return strings;
};

const isMain = process.argv[1] && join(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const only = process.argv[2];
  const copies = await loadCopies();
  if (only && !copies.some((c) => c.id === only)) {
    console.error(`kabsi check: no video "${only}". Known: ${copies.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }
  const summaries = [];
  for (const copy of copies) {
    if (only && copy.id !== only) continue;
    const fail = (where, msg) => failures.push(`[${copy.id}] ${where}: ${msg}`);
    const strings = collect(copy);
    if (!strings.length) fail("copy", "no on-screen strings or voice-over lines");

    for (const { where, text, vo } of strings) {
      if (/[\u2012\u2013\u2014\u2015\u2212]/.test(text)) fail(where, `dash character in "${text}"`);
      if (/\s-{1,2}\s|--/.test(text)) fail(where, `dash used as punctuation in "${text}"`);
      if (/[!\uFF01\u00A1]/.test(text)) fail(where, `exclamation mark in "${text}"`);
      for (const [re, name] of banned) if (re.test(text)) fail(where, `banned "${name}" in "${text}"`);
      if (vo && /\d/.test(text)) fail(where, `digits in voice-over, write numbers as words: "${text}"`);
      if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) fail(where, `Arabic script in "${text}" (no Arabic anywhere in frame, voice or captions)`);
      if (/\bgoogle\b/i.test(text) && /\b(logo|pin)\b/i.test(text)) fail(where, "mentions Google branding or a Maps pin");
    }

    // Captions must be the voice-over, split. Chunks stay short enough for two lines at most.
    for (const l of copy.voiceLines) {
      if (!l.captions) continue;
      if (l.captions.join(" ") !== l.vo) fail(`caption:${l.id}`, "captions joined do not equal the voice-over line");
      if (l.captions.some((c) => c.length > 64)) fail(`caption:${l.id}`, "caption chunk over 64 characters (two lines of 32 at most)");
    }

    // Timing, when the voice has been generated: every line must end inside the video.
    const voicePath = join(root, "src", "generated", "voice", `${copy.id}.json`);
    let timing = copy.voiceLines.length ? "voice not generated yet, timing not checked" : "no voice-over";
    if (copy.voiceLines.length && existsSync(voicePath)) {
      const { durations, starts = {} } = JSON.parse(readFileSync(voicePath, "utf8"));
      let prevEnd = -Infinity;
      for (const l of copy.voiceLines) {
        const start = starts[l.id];
        if (start === undefined || durations[l.id] === undefined) {
          fail(`voice:${l.id}`, "no scheduled start or duration, run: npm run kabsi:voice -- " + copy.id);
          continue;
        }
        if (start < prevEnd) fail(`voice:${l.id}`, `starts at ${start}s while the line before is still speaking until ${prevEnd.toFixed(2)}s`);
        prevEnd = start + durations[l.id];
        if (prevEnd > copy.seconds) fail(`voice:${l.id}`, `ends at ${prevEnd.toFixed(2)}s, after the video ends at ${copy.seconds}s`);
      }
      timing = `voice ends at ${prevEnd.toFixed(2)} s of ${copy.seconds} s`;
    }
    summaries.push(`[${copy.id}] ${strings.length} strings (${strings.filter((s) => s.vo).length} voice-over lines), ${timing}`);
  }

  // Source rules, once: colours only from tokens.ts, no dashes anywhere in kabsi/src.
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
    if (/[\u2013\u2014]/.test(src)) failures.push(`${rel}: en or em dash in source`);
    if (rel !== join("src", "tokens.ts")) {
      if (/#[0-9a-fA-F]{3,8}\b/.test(src)) failures.push(`${rel}: hex colour outside src/tokens.ts`);
      if (/\b(rgb|rgba|hsl|hsla)\(/i.test(src)) failures.push(`${rel}: raw colour function outside src/tokens.ts`);
    }
  }

  if (failures.length) {
    console.error(`kabsi check FAIL (${failures.length})`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log(`kabsi check PASS: ${banned.length} banned-phrase rules, ${files.length} source files`);
  summaries.forEach((s) => console.log(`  ${s}`));
}
