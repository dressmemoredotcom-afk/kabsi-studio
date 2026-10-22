import voice from "./generated/voice.json";
import { FRAME } from "./tokens";
import { SCENES, VOICE_LINES, VO_OFFSET_S } from "./script";

export const FPS = FRAME.fps;
export const sec = (s: number) => Math.round(s * FPS);

export const scenes = SCENES.map((s) => ({ ...s, fromF: sec(s.from), toF: sec(s.to) }));
export const TOTAL_FRAMES = scenes[scenes.length - 1].toF;

const durations = voice.durations as Record<string, number>;

/** Each line: when it starts (seconds, frames) and how long its measured audio runs. */
export const lines = VOICE_LINES.map((line) => {
  const scene = SCENES.find((s) => s.id === line.id);
  if (!scene) throw new Error(`No scene for voice line ${line.id}`);
  const start = scene.from + VO_OFFSET_S;
  const dur = durations[line.id];
  if (dur === undefined) throw new Error(`No measured duration for ${line.id}. Run npm run voice.`);
  return { ...line, start, dur, end: start + dur, startF: sec(start), durF: Math.ceil(dur * FPS) };
});

export const lineById = (id: string) => {
  const line = lines.find((l) => l.id === id);
  if (!line) throw new Error(`Unknown line ${id}`);
  return line;
};

/** Estimated time (seconds) a word is spoken, by its share of the line's characters. */
export const wordTime = (lineId: string, word: string): number => {
  const line = lineById(lineId);
  const idx = line.vo.toLowerCase().indexOf(word.toLowerCase());
  if (idx < 0) throw new Error(`"${word}" is not in line ${lineId}`);
  return line.start + (idx / line.vo.length) * line.dur;
};

/** Caption chunks with start and end times, spread over the line's measured audio by characters. */
export const captionChunks = lines.flatMap((line) => {
  const total = line.captions.reduce((n, c) => n + c.length, 0);
  let used = 0;
  return line.captions.map((text, i) => {
    const start = line.start + (used / total) * line.dur;
    used += text.length;
    const last = i === line.captions.length - 1;
    const end = last ? line.end + 0.3 : line.start + (used / total) * line.dur;
    return { text, startF: sec(start), endF: sec(end) };
  });
});
