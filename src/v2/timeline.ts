import voice from "../generated/voice02.json";
import { FRAME } from "../tokens";
import { SCENES, VOICE_LINES } from "../script02";

export const FPS = FRAME.fps;
export const sec = (s: number) => Math.round(s * FPS);

export const scenes = SCENES.map((s) => ({ ...s, fromF: sec(s.from), toF: sec(s.to) }));
export const TOTAL_FRAMES = scenes[scenes.length - 1].toF;
export const scene = (id: string) => {
  const s = scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

const durations = voice.durations as Record<string, number>;

export const lines = VOICE_LINES.map((line) => {
  const sc = SCENES.find((s) => s.id === line.id);
  if (!sc) throw new Error(`No scene for voice line ${line.id}`);
  const start = sc.from + (line.offset ?? 0.1);
  const dur = durations[line.id];
  if (dur === undefined) throw new Error(`No measured duration for ${line.id}. Run npm run voice:02.`);
  return { ...line, start, dur, end: start + dur, startF: sec(start), durF: Math.ceil(dur * FPS) };
});

export const lineById = (id: string) => {
  const line = lines.find((l) => l.id === id);
  if (!line) throw new Error(`Unknown line ${id}`);
  return line;
};

/** Estimated time (seconds) a phrase is spoken, by its share of the line's characters. */
export const wordTime = (lineId: string, phrase: string): number => {
  const line = lineById(lineId);
  const idx = line.vo.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx < 0) throw new Error(`"${phrase}" is not in line ${lineId}`);
  return line.start + (idx / line.vo.length) * line.dur;
};

/** Caption chunks spread over each line's measured audio by characters, each with per-word times. */
export const captionChunks = lines.flatMap((line) => {
  const total = line.captions.reduce((n, c) => n + c.length, 0);
  let used = 0;
  return line.captions.map((text, i) => {
    const start = line.start + (used / total) * line.dur;
    used += text.length;
    const audioEnd = line.start + (used / total) * line.dur;
    const last = i === line.captions.length - 1;
    const end = last ? line.end + 0.25 : audioEnd;
    let seen = 0;
    const words = text.split(" ").map((w) => {
      const wStart = start + (seen / text.length) * (audioEnd - start);
      seen += w.length + 1;
      return { text: w, startF: sec(wStart) };
    });
    return { text, startF: sec(start), endF: sec(end), words };
  });
});
