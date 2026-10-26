// Captions: one source per video, the `captions` of its voice lines in its copy file. The burned-in Captions component,
// the SRT and the WebVTT file all come from buildCues, so they cannot disagree. Pure code with no imports, so the
// render script and the rule check (Node) read it too.

/** Section 2: at most 2 lines and 32 characters a line, at most one yellow word. */
export const CAPTION_LIMITS = { maxLines: 2, maxChars: 32 } as const;
/** A caption stays on screen this long after its last word, as long as the next one has not started. */
const HOLD_S = 0.25;
const MIN_S = 0.7;

export type CaptionSource = { id: string; vo: string; captions?: string[] };
export type WordStamp = { text: string; start: number; end: number };
/** What the voice script writes into src/generated/voice/<ID>.json. */
export type VoiceTimes = {
  starts: Record<string, number>;
  durations: Record<string, number>;
  words?: Record<string, WordStamp[]>;
};
export type Cue = {
  lineId: string;
  startS: number;
  endS: number;
  text: string;
  lines: string[];
  /** The one word shown in yellow, if any. */
  yellow?: string;
};

/** Greedy wrap into lines of at most 32 characters. A word longer than that is left on a line of its own. */
export const wrapCaption = (text: string): string[] => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= CAPTION_LIMITS.maxChars) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/** Why a caption breaks the 2 x 32 rule, or null when it is fine. */
export const captionProblem = (text: string): string | null => {
  const lines = wrapCaption(text);
  if (lines.length > CAPTION_LIMITS.maxLines) return `${lines.length} lines (at most ${CAPTION_LIMITS.maxLines} of ${CAPTION_LIMITS.maxChars} characters)`;
  const long = lines.find((l) => l.length > CAPTION_LIMITS.maxChars);
  return long ? `the line "${long}" is over ${CAPTION_LIMITS.maxChars} characters` : null;
};

/** Every caption of every voice line, with the time it shows. `highlight` maps "<line id>#<n>" (n from 1) to its yellow word. */
export const buildCues = (sources: readonly CaptionSource[], voice: VoiceTimes, highlight: Record<string, string> = {}): Cue[] => {
  const cues: Cue[] = [];
  for (const line of sources) {
    const captions = line.captions ?? [];
    const lineStart = voice.starts[line.id];
    const dur = voice.durations[line.id];
    if (!captions.length || lineStart === undefined || dur === undefined) continue;
    const stamps = voice.words?.[line.id];
    const stamped = stamps && stamps.length === line.vo.split(" ").length ? stamps : null;
    const total = captions.reduce((n, c) => n + c.length, 0);
    let used = 0;
    let wordAt = 0;
    captions.forEach((text, i) => {
      let startS: number;
      let endS: number;
      if (stamped) {
        const slice = stamped.slice(wordAt, wordAt + text.split(" ").length);
        wordAt += slice.length;
        startS = lineStart + slice[0].start;
        endS = lineStart + slice[slice.length - 1].end;
      } else {
        startS = lineStart + (used / total) * dur;
        endS = lineStart + ((used + text.length) / total) * dur;
      }
      used += text.length;
      cues.push({ lineId: line.id, startS, endS, text, lines: wrapCaption(text), yellow: highlight[`${line.id}#${i + 1}`] });
    });
    cues[cues.length - 1].endS = Math.max(cues[cues.length - 1].endS, lineStart + dur);
  }
  cues.sort((a, b) => a.startS - b.startS);
  // Hold each caption a little, never into the next one, and never shorter than MIN_S unless the next one starts.
  cues.forEach((c, i) => {
    const next = cues[i + 1]?.startS ?? Infinity;
    c.endS = Math.min(Math.max(c.endS + HOLD_S, c.startS + MIN_S), next);
  });
  return cues;
};

const pad = (n: number, w: number) => String(n).padStart(w, "0");
const stamp = (s: number, sep: "," | ".") => {
  const ms = Math.round(s * 1000);
  return `${pad(Math.floor(ms / 3_600_000), 2)}:${pad(Math.floor(ms / 60_000) % 60, 2)}:${pad(Math.floor(ms / 1000) % 60, 2)}${sep}${pad(ms % 1000, 3)}`;
};

/** The caption file text. Lines break where the burned-in captions break. */
export const cuesToSrt = (cues: readonly Cue[]): string =>
  cues.map((c, i) => `${i + 1}\n${stamp(c.startS, ",")} --> ${stamp(c.endS, ",")}\n${c.lines.join("\n")}\n`).join("\n");
export const cuesToVtt = (cues: readonly Cue[]): string =>
  `WEBVTT\n\n${cues.map((c) => `${stamp(c.startS, ".")} --> ${stamp(c.endS, ".")}\n${c.lines.join("\n")}\n`).join("\n")}`;

export type Disc = { x: number; y: number; r: number };
export type SafeBox = { left: number; right: number; top: number; bottom: number };

/**
 * Top edge of a caption box, so it stays clear of every tap point. The box sits at the bottom of the safe area; if a
 * tap disc touches it, the box moves up to sit just above that tap. The box is treated as the full safe width, so the
 * answer does not depend on how wide the text is.
 */
export const captionTop = (boxHeight: number, safe: SafeBox, taps: readonly Disc[], gap = 24): number => {
  const clear = (top: number) => taps.every((t) => t.y + t.r + gap <= top || t.y - t.r - gap >= top + boxHeight);
  const bottomTop = safe.bottom - boxHeight - 20;
  if (clear(bottomTop)) return bottomTop;
  const candidates = taps.flatMap((t) => [t.y - t.r - gap - boxHeight, t.y + t.r + gap]);
  const fits = candidates.filter((top) => top >= safe.top && top + boxHeight <= safe.bottom && clear(top));
  // The slot closest to the usual place wins.
  return fits.sort((a, b) => Math.abs(a - bottomTop) - Math.abs(b - bottomTop))[0] ?? bottomTop;
};
