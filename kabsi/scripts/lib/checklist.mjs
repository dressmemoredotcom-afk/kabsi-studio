// checklist.md for a review package: every rule of docs/VIDEO-PLAN.md section 1, then the brand kit and format rules of
// sections 2 and 3, each answered yes or no with a note. Code fills what code can check. For the visual rules, the
// reviewer looks at the contact sheet and records the answers in visual-review.json beside it; an answer only counts
// while the contact sheet is the one it was made from. Anything not answered says "lane R to confirm".
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { root, outFolder } from "./copies.mjs";
import { checkSource, checkVideo, logoMissing } from "./rules.mjs";
import { loudness, verifyPreset } from "./package.mjs";
import { FORMATS, burnsCaptions, captionFile } from "../../src/formats.ts";
import { LOGO, STRINGS } from "../../src/kit.ts";

export const CONFIRM = "lane R to confirm";

/** The visual rules: the reviewer answers these from the contact sheet. id, rule. */
export const VISUAL_RULES = [
  ["frame-arabic", "No Arabic anywhere in frame (logos, map and street labels, contact names, keyboards, tabs, signs)"],
  ["frame-hidden", "Always hidden in recordings: Google logo and colours, account photos, emails, phone numbers, contact suggestions, other people's photos, notifications, the recorder's toolbar"],
  ["frame-google", "Google's name only as plain words: no Google logo, colours or look, nothing suggesting Google approves or partners"],
  ["frame-proof", "No invented proof on screen: no testimonials, star ratings, user counts or logos"],
  ["frame-people", "No actors or AI-made people shown as owners or customers; faces only with written consent"],
  ["frame-example", "The Example badge is on screen for as long as an invented business is"],
  ["frame-yes", "The owner's Yes is shown in every demo of the work"],
  ["safe-zone", "All text is inside the safe zone (1080 x 1920: not the top 220 px, the bottom 420 px or the right 120 px)"],
  ["captions-clear", "Captions never cover the thing being tapped or the thing being shown"],
  ["tap-rings", "A soft dark tap ring shows on each tap or click"],
  ["end-card", "End card: the mark, the line and the call to action, for the last 3 seconds"],
  ["hook", "The hook is in the first 2 seconds"],
  ["sound-off", "The picture works with the sound off"],
];

const sheetFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => /^contact-sheet-\d+\.png$/.test(f)).sort() : []);
/** Fingerprint of the contact sheets, so a visual review is tied to the frames it looked at. */
export const sheetHash = (dir) => {
  const h = createHash("sha256");
  for (const f of sheetFiles(dir)) h.update(readFileSync(join(dir, f)));
  return h.digest("hex");
};

const readVisual = (dir) => {
  const p = join(dir, "visual-review.json");
  if (!existsSync(p)) return { rows: {}, state: "none" };
  const j = JSON.parse(readFileSync(p, "utf8"));
  return { rows: j.rows ?? {}, state: j.contactSheet === sheetHash(dir) ? "current" : "stale" };
};

const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

export const buildChecklist = async (copy) => {
  const dir = join(root, "out", outFolder(copy));
  const format = FORMATS[copy.format];
  const video = checkVideo(copy);
  const source = checkSource({ copies: [copy] });
  const failed = (...rules) => [...video.failures, ...source.failures].filter((f) => rules.includes(f.rule));
  const code = (rules, yesNote) => {
    const f = failed(...rules);
    return f.length ? { answer: "no", note: f.map((x) => `${x.where}: ${x.msg}`).join("; ") } : { answer: "yes", note: yesNote };
  };
  const visual = readVisual(dir);
  const sheets = sheetFiles(dir);
  const seen = (id, codeNote) => {
    const v = visual.state === "current" ? visual.rows[id] : null;
    if (v) return { answer: v.answer, note: [codeNote, v.note].filter(Boolean).join(". ") };
    return { answer: CONFIRM, note: [codeNote, visual.state === "stale" ? "the contact sheet changed since the last visual review" : "not looked at yet"].filter(Boolean).join(". ") };
  };
  const hasFootage = !!copy.footage?.length;
  // Measure each size's file.
  const files = [];
  for (const size of copy.sizes) {
    const file = join(dir, `kabsi-${copy.id.toLowerCase()}-${copy.name}-${size}.mp4`);
    if (!existsSync(file)) {
      files.push({ size, missing: true });
      continue;
    }
    const preset = verifyPreset(copy, size, file);
    files.push({ size, file, preset, sound: preset.probe.hasAudio ? loudness(file) : null });
  }
  const nWords = video.strings.length;

  const sec1 = [
    ["Plain English for owners: no em dashes, en dashes or exclamation marks", code(["dashes"], `${nWords} voice, caption and screen strings read`)],
    ['Never "spot", "grid", "pin", "listing", "visibility", or "app" for Kabsi', code(["words"], "word list checked in every string")],
    ["Every claim is in https://kabsi.co/llms-full.txt", { answer: CONFIRM, note: "code cannot read the claims; compare the script with llms-full.txt" }],
    ["Never says or shows: top of Google, more customers or bookings, guaranteed results, fully automatic, set and forget, Google-approved or partner, removing bad reviews", code(["claims"], "claim list checked in every string")],
    ["Kabsi publishes nothing without the owner's yes: every demo shows the Yes", copy.demo ? (() => { const c = code(["demo-yes"], 'the string "Yes" is in the copy'); return c.answer === "no" ? c : seen("frame-yes", c.note); })() : { answer: "yes", note: "not a demo of the work" }],
    ["No Arabic in frame, voice or captions", failed("arabic").length ? code(["arabic"], "") : hasFootage ? seen("frame-arabic", "no Arabic in the voice, captions or on-screen strings") : { answer: "yes", note: "no recordings in this video, and no Arabic in any string or in kabsi/ text" }],
    ["Always hidden in recordings: Google logo and colours, account photos, emails, phone numbers, contact suggestions, other people's photos, notifications, the recorder's toolbar", hasFootage ? seen("frame-hidden", `footage: ${copy.footage.join(", ")}`) : { answer: "yes", note: "no recordings in this video" }],
    ["Google's name only as plain words; no Google logo, colours or approval", failed("claims").some((f) => /branding/.test(f.msg)) ? code(["claims"], "") : seen("frame-google", "the name appears only in text")],
    ["Small print on ads and explainers: Kabsi is independent and not affiliated with Google", format.id === "web-explainer" || format.id === "meta-feed" ? code(["small-print"], `shown: "${STRINGS.smallPrint}"`) : { answer: "yes", note: copy.smallPrint ? "shown" : `not required for a ${format.label.toLowerCase()}` }],
    ["WhatsApp: the glyph only from simple-icons, unaltered, only where it means WhatsApp, never animated", code(["whatsapp"], "the glyph only comes through components/WhatsAppGlyph.tsx, which takes no style or animation")],
    ["No invented proof: no testimonials, star ratings, user counts or logos", failed("proof").length ? code(["proof"], "") : seen("frame-proof", "no such words in any string")],
    ["No actors or AI-made people presented as owners or customers", copy.faces || hasFootage ? seen("frame-people", "") : { answer: "yes", note: "no people in this video" }],
    ["Invented example businesses carry the Example badge", copy.businesses.length ? (() => { const c = code(["example-badge"], `<ExampleBadge /> drawn for ${copy.businesses.join(", ")}`); return c.answer === "no" ? c : seen("frame-example", c.note); })() : { answer: "yes", note: "no invented business" }],
    ["Real owners appear only from the Founding 25, with written consent, saying their own words", copy.faces ? { answer: CONFIRM, note: "a face is shown: needs the written consent on file" } : { answer: "yes", note: "no real owner in this video" }],
    ["Faces: only people who agreed in writing", copy.faces ? { answer: CONFIRM, note: "needs the written consent on file" } : { answer: "yes", note: "no faces in this video" }],
    ["Stock clips: a licence that allows ads, link kept in the folder", copy.stock?.length ? { answer: copy.stock.every((s) => /^https?:\/\//.test(s.licence)) ? "yes" : "no", note: "links are in licences.txt" } : { answer: "yes", note: "no stock clips" }],
    ["Voice: one voice for every product video, calm, adult, neutral British English, never a clone", (() => {
      const c = code(["voice"], "");
      if (c.answer === "no") return c;
      const own = existsSync(join(root, "public", "voice", copy.id)) && readdirSync(join(root, "public", "voice", copy.id)).some((f) => /\.(mp3|wav|m4a)$/.test(f) && !/\.placeholder\./.test(f));
      const config = JSON.parse(readFileSync(join(root, "config.json"), "utf8"));
      if (!copy.voiceLines.length) return { answer: "yes", note: "no voice in this video" };
      return own ? { answer: CONFIRM, note: "uses recorded voice files: lane R confirms it is Rashid's own voice" } : { answer: "yes", note: `Kokoro voice ${config.voice}, from the allowed five` };
    })()],
    ["Voice is AI, so the platform's AI label goes on where it asks (TikTok, YouTube)", copy.voiceLines.length ? { answer: CONFIRM, note: "Rashid turns the label on when posting, unless the voice is his own recording" } : { answer: "yes", note: "no voice" }],
    ["Music only with a licence for commercial use, about -20 LUFS under the voice; voice at -14 LUFS", (() => {
      const f = files.find((x) => x.sound);
      const level = f ? `voice mix measures ${f.sound.lufs} LUFS` : "no sound";
      if (!copy.music) return { answer: "yes", note: `no music. ${level}` };
      return { answer: copy.music.licence.startsWith("http") ? "yes" : "no", note: `${copy.music.file}, licence in licences.txt. ${level}` };
    })()],
  ];
  const kit = [
    ["Colours: only the nine of section 2, all from src/tokens.ts, no WhatsApp green", code(["colours"], "tokens.ts holds exactly the nine; no other colour in source")],
    ["Type: Bricolage Grotesque for titles, Manrope for captions and body", code(["fonts"], "both fonts with their OFL licences in public/brand/fonts/; no other font in source")],
    ["Logo: the real ring mark and wordmark, never redrawn or recoloured", logoMissing().length ? { answer: "no", note: `missing ${logoMissing().map((m) => m.replace(`${root}/`, "kabsi/")).join(", ")}: Hussein uploads them unchanged from kabsi-design-studio public/` } : { answer: "yes", note: `${Object.values(LOGO).join(" and ")} present` }],
    ["Captions: Manrope SemiBold, white on night at 80 percent, 2 lines of 32 characters at most, one yellow word at most, clear of the tap", copy.voiceLines.length ? (() => { const c = code(["captions", "highlight", "caption-source"], "one source: the voice lines' captions"); return c.answer === "no" ? c : seen("captions-clear", c.note); })() : { answer: "yes", note: "no spoken words, so no captions" }],
    ["Captions as the format asks", (() => {
      const burn = burnsCaptions(format);
      const ext = captionFile(format);
      const names = ext && copy.voiceLines.length ? [`kabsi-${copy.id.toLowerCase()}-${copy.name}.${ext}`] : [];
      const missing = names.filter((n) => !existsSync(join(dir, n)));
      const how = `${format.label}: ${burn ? "burned in" : "none in the picture"}${ext ? `, ${ext.toUpperCase()} file` : ""}`;
      return missing.length ? { answer: "no", note: `${how}; missing ${missing.join(", ")}` } : { answer: "yes", note: how + (copy.voiceLines.length ? "" : "; no spoken words, so no caption file") };
    })()],
    ["Safe zone: text out of the top 220 px, bottom 420 px and right 120 px (1080 x 1920)", seen("safe-zone", "")],
    ["Tap rings: #111827 at 30 percent for half a second on each tap", seen("tap-rings", "")],
    ["End card, 3 seconds: the mark, the line, the call to action", copy.endCard ? (() => { const c = code(["end-card"], `"${STRINGS.endLine}" and "${STRINGS.endCta}"`); return c.answer === "no" ? c : seen("end-card", c.note); })() : { answer: "yes", note: "this video has no end card" }],
    ["The hook is in the first 2 seconds", seen("hook", "")],
    ["Format: size, 30 fps, length, sound and file size as the preset", (() => {
      const bad = files.filter((f) => f.missing || !f.preset.ok);
      if (bad.length) return { answer: "no", note: bad.map((f) => (f.missing ? `${f.size}: no file` : `${f.size}: ${f.preset.checks.filter((c) => !c.ok).map((c) => `${c.name} ${c.note}`).join(", ")}`)).join("; ") };
      return { answer: "yes", note: files.map((f) => `${f.size}: ${f.preset.checks.map((c) => `${c.name} ${c.note}`).join("; ")}`).join(" | ") };
    })()],
    ["Voice level at -14 LUFS", (() => {
      const f = files.find((x) => x.sound);
      if (!f) return { answer: "yes", note: "no sound" };
      const ok = f.sound.lufs !== null && Math.abs(f.sound.lufs + 14) <= 1;
      return { answer: ok ? "yes" : "no", note: `${f.sound.lufs} LUFS, true peak ${f.sound.truePeak} dBFS` };
    })()],
    ["Works with the sound off", format.id === "social" || format.id === "meta-feed" ? seen("sound-off", "captions are burned in") : { answer: "yes", note: `not a burned-in caption format (${format.label})` }],
  ];

  const table = (list) =>
    ["| Rule | Answer | Note |", "| --- | --- | --- |", ...list.map(([rule, r]) => `| ${esc(rule)} | ${r.answer} | ${esc(r.note || "")} |`)].join("\n");
  const all = [...sec1, ...kit];
  const counts = { yes: all.filter(([, r]) => r.answer === "yes").length, no: all.filter(([, r]) => r.answer === "no").length, confirm: all.filter(([, r]) => r.answer === CONFIRM).length };
  const md = [
    `# Checklist: ${copy.id} (${copy.name})`,
    "",
    `Format: ${format.label}. Sizes: ${copy.sizes.join(", ")}. Contact sheet: ${sheets.length ? sheets.join(", ") : "none"}.`,
    `Visual review: ${visual.state === "current" ? "recorded for these contact sheets" : visual.state === "stale" ? "out of date, the contact sheets changed" : "not recorded yet"}.`,
    `Result: ${counts.yes} yes, ${counts.no} no, ${counts.confirm} for lane R to confirm.`,
    "",
    "## Section 1: rules every video follows",
    "",
    table(sec1),
    "",
    "## Sections 2 and 3: brand kit and format",
    "",
    table(kit),
    "",
  ].join("\n");
  return { md, counts, all };
};

export const writeChecklist = async (copy) => {
  const { md, counts } = await buildChecklist(copy);
  const dir = join(root, "out", outFolder(copy));
  writeFileSync(join(dir, "checklist.md"), md);
  return counts;
};
