// The Kabsi rule check. Reads every voice line, caption and on-screen string of a video (its *.copy.ts plus the words
// the kit puts on screen) and the source, and reports every rule it breaks. Rules are from docs/VIDEO-PLAN.md
// sections 1 to 3. Used by check.mjs, voice.mjs, render.mjs and the checklist.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { root } from "./copies.mjs";
import { END_CARD_SECONDS, STRINGS, VOICES, LOGO } from "../../src/kit.ts";
import { FORMATS, burnsCaptions } from "../../src/formats.ts";
import { captionProblem } from "../../src/captions.ts";

export const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
/** The nine colours of VIDEO-PLAN section 2, and no others. */
export const TOKEN_HEXES = ["#FFD60A", "#0C0C0B", "#161614", "#F5F3EE", "#111111", "#B8B3A8", "#1F8A5B", "#D93025", "#111827"];

// Words and claims. Each is [pattern, name, rule group]. Groups: words, claims, proof, numbers.
const banned = [
  [/\bspots?\b/i, "spot", "words"],
  [/\bgrids?\b/i, "grid", "words"],
  [/\bpins?\b/i, "pin", "words"],
  [/\blistings?\b/i, "listing", "words"],
  [/\bvisibility\b/i, "visibility", "words"],
  // "app" is never what Kabsi is. The Google Maps app, which a how-to may name, is allowed.
  [/(?<!\bMaps )\bapps?\b/i, "app (for Kabsi)", "words"],
  [/\btop of google\b/i, "top of Google", "claims"],
  [/\bmore (customers|bookings|calls)\b/i, "more customers, bookings or calls", "claims"],
  [/\bguarantee(d|s)?\b/i, "guaranteed", "claims"],
  [/\bfully[- ]automatic(ally)?\b/i, "fully automatic", "claims"],
  [/\bset (it )?(and|&) forget\b/i, "set and forget", "claims"],
  [/\bgoogle[- ]approved\b|\bapproved by google\b/i, "Google-approved", "claims"],
  [/\bgoogle partner/i, "Google partner", "claims"],
  [/\b(remove|removes|removing|delete|deletes|take down|takes down) (the |your |all )?(bad|negative|unfair|fake) reviews?\b/i, "remove bad reviews", "claims"],
  [/\breal[- ]?time\b/i, "real-time", "claims"],
  [/24\s*\/\s*7|\b24 hours a day\b/i, "24/7", "claims"],
  [/\brank(s|ed|ing)? higher\b|\bhigher rank/i, "rank higher", "claims"],
  [/\bnumber (one|1)\b|#\s?1\b/i, "number one", "claims"],
  [/\bbest\b/i, "best", "claims"],
  [/\bin (just )?(a few )?seconds?\b/i, "in seconds", "claims"],
  [/\binstantly\b/i, "instantly", "claims"],
  [/\bone[- ]tap\b|\bin one (tap|click)\b/i, "one tap", "claims"],
  // Review-asking rules.
  [/\bonly (ask|asks|asking)\b|\bhappy customers?\b|\bsatisfied customers?\b/i, "asks only happy customers", "proof"],
  [/\b(reward|rewards|rewarded|rewarding|incentive|incentives|incentivise|incentivize|discount for|free (coffee|gift|drink|dessert) (for|with|in exchange))\b/i, "a reward for a review", "proof"],
  [/\b(leave|give|drop) (us |me |a )*(5|five)[- ]?stars?\b|\bfive[- ]star\b|\b5[- ]star\b/i, "leave 5 stars", "proof"],
  // Invented proof: no star ratings, testimonials or counts of users.
  [/[\u2605\u2606\u2B50]|\b\d(\.\d)?\s?(\/\s?5|stars?)\b|\bstar ratings?\b|\btestimonials?\b/i, "star rating or testimonial", "proof"],
  [/\b(trusted|loved) by\b/i, "user count or logo claim", "proof"],
  // Statistics.
  [/\d\s?%|\bpercent\b|\bper ?cent\b/i, "statistic (percent)", "numbers"],
  [/\b\d+(\.\d+)?\s?x\b|\b\d+ times (more|faster|as)\b|\b(double|triple)s?\b/i, "statistic (multiplier)", "numbers"],
  [/\b(studies|research|survey|surveys) (show|says|found)\b|\b\d+ (out of|in) \d+\b|\b(one|two|three|four|five|six|seven|eight|nine|ten) in (two|three|four|five|six|seven|eight|nine|ten)\b/i, "statistic (study or ratio)", "numbers"],
  [/\b(average|on average)\b/i, "statistic (average)", "numbers"],
  [/\b\d[\d,.]*\+?\s+(businesses|owners|customers|users|clients|people|places|shops|reviews|profiles)\b|\b(over|more than|nearly|almost|around|about) (\d|(a |one )?(hundred|thousand|million))/i, "statistic (a count)", "numbers"],
  // Prices.
  [/[$\u00A3\u20AC\u00A5]|\bpric(e|es|ed|ing)\b|\bper (month|year|week)\b|\/\s?mo\b|\b(dollars?|pounds?|euros?)\b|\bcosts?\b|\bUSD\b|\bGBP\b|\bEUR\b/i, "price", "numbers"],
];

/** Every string a video shows or says, with where it came from. The kit's own words count when the video uses them. */
export const collectStrings = (copy) => {
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
  if (copy.endCard) {
    strings.push({ where: "kit:endLine", text: STRINGS.endLine }, { where: "kit:endCta", text: STRINGS.endCta });
  }
  if (copy.smallPrint) strings.push({ where: "kit:smallPrint", text: STRINGS.smallPrint });
  if (copy.businesses.length) strings.push({ where: "kit:exampleBadge", text: STRINGS.exampleBadge });
  return strings;
};

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export const configPath = join(root, "config.json");
export const voiceJsonPath = (id) => join(root, "src", "generated", "voice", `${id}.json`);
export const logoMissing = () => Object.values(LOGO).map((f) => join(root, "public", f)).filter((p) => !existsSync(p));

/**
 * Checks one video. Returns { failures: [{ rule, where, msg }], strings, timing, notes }. Rule names are the checklist's:
 * words, claims, proof, numbers, dashes, arabic, vo-digits, captions, highlight, length, format, example-badge,
 * end-card, small-print, demo-yes, caption-source, voice, timing.
 */
export const checkVideo = (copy) => {
  const failures = [];
  const notes = [];
  const fail = (rule, where, msg) => failures.push({ rule, where, msg });
  const strings = collectStrings(copy);
  const format = FORMATS[copy.format];

  if (!strings.length) fail("words", "copy", "no on-screen strings or voice-over lines");

  for (const { where, text, vo } of strings) {
    if (/[\u2012\u2013\u2014\u2015\u2212]/.test(text)) fail("dashes", where, `dash character in "${text}"`);
    if (/\s-{1,2}\s|--/.test(text)) fail("dashes", where, `dash used as punctuation in "${text}"`);
    if (/[!\uFF01\u00A1]/.test(text)) fail("dashes", where, `exclamation mark in "${text}"`);
    for (const [re, name, rule] of banned) if (re.test(text)) fail(rule, where, `banned "${name}" in "${text}"`);
    if (vo && /\d/.test(text)) fail("vo-digits", where, `digits in voice-over, write numbers as words: "${text}"`);
    if (ARABIC.test(text)) fail("arabic", where, `Arabic script in "${text}" (no Arabic anywhere in frame, voice or captions)`);
    if (/\bgoogle\b/i.test(text) && /\blogo\b/i.test(text)) fail("claims", where, "mentions Google branding");
    if (/taken care of/i.test(text) && (vo || where.startsWith("screen")) && text !== STRINGS.endLine) fail("end-card", where, `the end card line is exactly "${STRINGS.endLine}", not "${text}"`);
  }

  // Format: a known preset, allowed sizes, a length inside its range, sound and captions that suit it.
  if (!format) fail("format", "copy", `unknown format "${copy.format}"`);
  else {
    for (const s of copy.sizes) if (!format.sizes.includes(s)) fail("format", "sizes", `${s} is not a ${format.label} size (${format.sizes.join(", ")})`);
    if (!copy.sizes.length) fail("format", "sizes", "no sizes");
    if (copy.seconds < format.minS || copy.seconds > format.maxS) {
      if (copy.testOnly) notes.push(`length ${copy.seconds} s is outside ${format.minS} to ${format.maxS} s: waived for a kit test`);
      else fail("length", "seconds", `${copy.seconds} s is outside the ${format.label} range of ${format.minS} to ${format.maxS} s`);
    }
    if (format.sound === "none" && (copy.voiceLines.length || copy.music)) fail("format", "sound", `${format.label} has no sound: no voice-over lines and no music`);
    if (format.sound !== "none" && !copy.voiceLines.length) notes.push(`${format.label} normally has a voice-over; this video has none`);
    if (format.id === "web-explainer" || format.id === "meta-feed") if (!copy.smallPrint) fail("small-print", "smallPrint", `${format.label} must show "${STRINGS.smallPrint}"`);
  }

  // Captions: the voice's own words, split, at most 2 lines of 32 characters, at most one yellow word.
  for (const l of copy.voiceLines) {
    if (!l.captions?.length) {
      fail("captions", `caption:${l.id}`, "voice line has no captions: every line is captioned");
      continue;
    }
    if (l.captions.join(" ") !== l.vo) fail("captions", `caption:${l.id}`, "captions joined do not equal the voice-over line");
    l.captions.forEach((c, i) => {
      const problem = captionProblem(c);
      if (problem) fail("captions", `caption:${l.id}#${i + 1}`, problem);
    });
  }
  for (const [key, word] of Object.entries(copy.highlight ?? {})) {
    const m = /^(.+)#(\d+)$/.exec(key);
    const line = m && copy.voiceLines.find((l) => l.id === m[1]);
    const caption = line?.captions?.[Number(m[2]) - 1];
    if (!caption) fail("highlight", key, "names a caption that does not exist");
    else if (/\s/.test(word) || !new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}']|$)`, "u").test(caption)) fail("highlight", key, `"${word}" must be one word of the caption`);
  }
  if (copy.screen && "captions" in copy.screen) fail("caption-source", "screen.captions", "captions come only from the voice lines' captions (one caption source per video)");

  // The video's component: Example badge, end card, small print, one caption source.
  const componentPath = join(root, "src", "videos", `${copy.id}.tsx`);
  const component = existsSync(componentPath) ? readFileSync(componentPath, "utf8") : null;
  if (!component) fail("format", "component", `no src/videos/${copy.id}.tsx`);
  else {
    if (copy.businesses.length && !component.includes("<ExampleBadge")) fail("example-badge", "component", `invented business "${copy.businesses[0]}" needs an <ExampleBadge /> in src/videos/${copy.id}.tsx`);
    if (copy.endCard && !component.includes("<EndCard")) fail("end-card", "component", `endCard is set but src/videos/${copy.id}.tsx draws no <EndCard />`);
    if (copy.smallPrint && !/<SmallPrint|smallPrint/.test(component)) fail("small-print", "component", `smallPrint is set but src/videos/${copy.id}.tsx shows none`);
    if (/<Captions\b/.test(component)) fail("caption-source", "component", "draw captions through KabsiFrame, which reads the voice lines' captions");
  }
  for (const b of copy.businesses) {
    if (!strings.some((s) => s.where.startsWith("screen") && s.text.includes(b))) fail("example-badge", "businesses", `"${b}" is listed but never shown in screen text`);
  }
  if (copy.demo && !strings.some((s) => s.where.startsWith("screen") && s.text === "Yes")) fail("demo-yes", "screen", 'a demo of the work must show the owner\'s "Yes" (a screen string "Yes")');
  if (copy.endCard && copy.seconds < 6) fail("end-card", "seconds", "the end card is 3 seconds; the video needs room before it");

  // Voice: one voice for every product video, from the five Kabsi voices.
  const config = readJson(configPath);
  if (copy.voiceLines.length && !VOICES.includes(config.voice)) fail("voice", "config.json", `voice "${config.voice}" is not one of ${VOICES.join(", ")}`);

  // Timing, when the voice has been generated: every line must end inside the video, none on top of another.
  let timing = copy.voiceLines.length ? "voice not generated yet, timing not checked" : "no voice-over";
  const vp = voiceJsonPath(copy.id);
  if (copy.voiceLines.length && existsSync(vp)) {
    const { durations, starts = {}, voice } = readJson(vp);
    if (voice !== config.voice) fail("voice", vp, `generated with "${voice}" but config.json says "${config.voice}": run npm run kabsi:voice -- ${copy.id}`);
    let prevEnd = -Infinity;
    for (const l of copy.voiceLines) {
      const start = starts[l.id];
      if (start === undefined || durations[l.id] === undefined) {
        fail("timing", `voice:${l.id}`, `no scheduled start or duration, run: npm run kabsi:voice -- ${copy.id}`);
        continue;
      }
      if (start < prevEnd) fail("timing", `voice:${l.id}`, `starts at ${start}s while the line before is still speaking until ${prevEnd.toFixed(2)}s`);
      prevEnd = start + durations[l.id];
      if (prevEnd > copy.seconds) fail("timing", `voice:${l.id}`, `ends at ${prevEnd.toFixed(2)}s, after the video ends at ${copy.seconds}s`);
    }
    if (copy.endCard && burnsCaptions(format) && prevEnd > copy.seconds - END_CARD_SECONDS) fail("timing", "voice", `the voice ends at ${prevEnd.toFixed(2)} s, inside the end card that starts at ${copy.seconds - END_CARD_SECONDS} s: its captions would sit on the card`);
    timing = `voice ends at ${prevEnd.toFixed(2)} s of ${copy.seconds} s`;
  }
  return { failures, strings, timing, notes };
};

const TEXT_FILE = /\.(ts|tsx|mjs|js|cjs|json|md|txt|svg|css|html|yml|yaml|vtt|srt)$/i;
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

/** Source rules, once for all of Kabsi: colours, fonts, voices, dashes, the WhatsApp glyph, Arabic, the logo. */
export const checkSource = ({ copies }) => {
  const failures = [];
  const fail = (rule, where, msg) => failures.push({ rule, where, msg });
  const all = walk(root);
  const sources = all.filter((f) => /\.(ts|tsx)$/.test(f) && f.startsWith(join(root, "src")));
  const tokens = join(root, "src", "tokens.ts");

  for (const f of sources) {
    const rel = relative(root, f);
    const src = readFileSync(f, "utf8");
    if (/[\u2013\u2014]/.test(src)) fail("dashes", rel, "en or em dash in source");
    if (f !== tokens) {
      const hex = src.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hex) fail("colours", rel, `hex colour ${hex[0]} outside src/tokens.ts`);
      if (/\b(rgb|rgba|hsl|hsla|hwb|lab|lch|oklch|oklab|color)\(/i.test(src)) fail("colours", rel, "raw colour function outside src/tokens.ts");
      const named = src.match(/(["'`])(white|black|red|green|blue|yellow|gray|grey|orange|purple|pink|silver|navy|teal|maroon|aqua|lime|fuchsia|olive|brown|gold|beige|ivory)\1|\b(solid|dashed|dotted)\s+(white|black|red|green|blue|yellow|gray|grey)\b/i);
      if (named) fail("colours", rel, `named colour ${named[0]} outside src/tokens.ts`);
    }
    if (/Lalezar|Readex/i.test(src)) fail("fonts", rel, "Lalezar and Readex Pro are not Kabsi fonts");
    if (f.endsWith("WhatsAppGlyph.tsx")) {
      if (/\b(style|transform|opacity|spring|interpolate|useCurrentFrame|rotate|scale)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, ""))) fail("whatsapp", rel, "the WhatsApp glyph must not be styled or animated");
    } else if (/siWhatsapp|simple-icons/.test(src)) fail("whatsapp", rel, "the WhatsApp glyph comes only through components/WhatsAppGlyph.tsx");
  }

  // tokens.ts holds exactly the nine colours and nothing else.
  const tsrc = readFileSync(tokens, "utf8");
  const found = [...new Set((tsrc.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((h) => h.toUpperCase()))];
  for (const h of found) if (!TOKEN_HEXES.includes(h)) fail("colours", "src/tokens.ts", `${h} is not one of the nine colours of VIDEO-PLAN section 2`);
  for (const h of TOKEN_HEXES) if (!found.includes(h)) fail("colours", "src/tokens.ts", `${h} is missing`);
  if (/\b(rgb|rgba|hsl|hsla)\(/i.test(tsrc)) fail("colours", "src/tokens.ts", "build transparent colours with alpha(), not rgba()");
  if (/#25D366/i.test(tsrc)) fail("colours", "src/tokens.ts", "no WhatsApp green");

  // Text anywhere in kabsi/: no Arabic; no old voices.
  for (const f of all.filter((p) => TEXT_FILE.test(p))) {
    const rel = relative(root, f);
    const text = readFileSync(f, "utf8");
    if (ARABIC.test(text)) fail("arabic", rel, "Arabic character in kabsi/ text");
    if (rel !== join("scripts", "lib", "rules.mjs") && /\baf_\w+|upbeat/i.test(text)) fail("voice", rel, "an old American voice or an upbeat key");
  }

  const config = readJson(configPath);
  if (!VOICES.includes(config.voice)) fail("voice", "config.json", `voice "${config.voice}" is not one of ${VOICES.join(", ")}`);
  if (Object.keys(config).some((k) => /upbeat/i.test(k))) fail("voice", "config.json", "no upbeat keys");

  // Kit words are exact.
  if (STRINGS.endLine !== "Your business on Google. Taken care of.") fail("end-card", "src/kit.ts", "the end card line is exactly: Your business on Google. Taken care of.");
  if (STRINGS.endCta !== "Free check at kabsi.co") fail("end-card", "src/kit.ts", 'the end card call to action is exactly: Free check at kabsi.co');
  if (STRINGS.smallPrint !== "Kabsi is independent and not affiliated with Google.") fail("small-print", "src/kit.ts", "the small print is exactly: Kabsi is independent and not affiliated with Google.");
  if (STRINGS.exampleBadge !== "Example") fail("example-badge", "src/kit.ts", 'the badge says "Example"');

  // The real logo: any video other than a kit test needs it.
  const missing = logoMissing();
  const real = copies.filter((c) => !c.testOnly);
  if (missing.length && real.length) fail("logo", "public/brand", `missing ${missing.map((m) => relative(root, m)).join(", ")}; upload them from kabsi-design-studio public/ unchanged`);
  return { failures, logoMissing: missing, sourceFiles: sources.length };
};

export const bannedCount = banned.length;
