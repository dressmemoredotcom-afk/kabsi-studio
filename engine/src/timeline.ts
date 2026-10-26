import { FRAME } from "./frame";

export type VoiceLineDef = {
  id: string;
  vo: string;
  /** Optional: reels without burned-in captions leave this out. */
  captions?: string[];
  /** Seconds after the scene cuts in that the voice starts. */
  offset?: number;
};
export type SceneDef = { id: string; from: number; to: number };
export type WordStamp = { text: string; start: number; end: number };
/** What a brand's voice script writes: measured lengths, which file each line plays, optional word timestamps. */
export type VoiceData = {
  voice: string;
  speed: number;
  durations: Record<string, number>;
  files?: Record<string, string>;
  /** Scheduled start of each line, in seconds, when lines are chained so they never overlap. */
  starts?: Record<string, number>;
  words?: Record<string, WordStamp[]>;
};
export type CaptionWord = { text: string; startF: number; endF: number };
export type CaptionChunk = { text: string; startF: number; endF: number; words: CaptionWord[] };

export const FPS = FRAME.fps;
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Turns a script (voice lines and scene windows) plus measured voice data into frames.
 * Word times come from real timestamps when the voice data has them, otherwise from each
 * word's share of the line's characters.
 */
export const createTimeline = (
  voiceLines: readonly VoiceLineDef[],
  sceneDefs: readonly SceneDef[],
  voice: VoiceData,
) => {
  const scenes = sceneDefs.map((s) => ({ ...s, fromF: sec(s.from), toF: sec(s.to) }));
  const TOTAL_FRAMES = scenes[scenes.length - 1].toF;

  const scene = (id: string) => {
    const found = scenes.find((s) => s.id === id);
    if (!found) throw new Error(`Unknown scene ${id}`);
    return found;
  };

  const lines = voiceLines.map((line) => {
    const sc = sceneDefs.find((s) => s.id === line.id);
    if (!sc) throw new Error(`No scene for voice line ${line.id}`);
    const dur = voice.durations[line.id];
    if (dur === undefined) throw new Error(`No measured duration for ${line.id}. Run the voice script.`);
    const start = voice.starts?.[line.id] ?? sc.from + (line.offset ?? 0.1);
    return {
      ...line,
      file: voice.files?.[line.id],
      start,
      dur,
      end: start + dur,
      startF: sec(start),
      durF: Math.ceil(dur * FPS),
    };
  });

  const lineById = (id: string) => {
    const line = lines.find((l) => l.id === id);
    if (!line) throw new Error(`Unknown line ${id}`);
    return line;
  };

  /** Time in seconds a phrase is spoken: real word stamps if present, else its share of the characters. */
  const wordTime = (lineId: string, phrase: string): number => {
    const line = lineById(lineId);
    const idx = line.vo.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx < 0) throw new Error(`"${phrase}" is not in line ${lineId}`);
    const stamps = voice.words?.[lineId];
    const wordIndex = line.vo.slice(0, idx).split(" ").length - 1;
    if (stamps && stamps[wordIndex] && stamps.length === line.vo.split(" ").length) {
      return line.start + stamps[wordIndex].start;
    }
    return line.start + (idx / line.vo.length) * line.dur;
  };

  const captionChunks: CaptionChunk[] = lines.flatMap((line) => {
    const captions = line.captions ?? [];
    const total = captions.reduce((n, c) => n + c.length, 0);
    const stamps = voice.words?.[line.id];
    const stampsUsable = stamps && stamps.length === line.vo.split(" ").length;
    let used = 0;
    let wordCursor = 0;
    return captions.map((text, i) => {
      const parts = text.split(" ");
      const last = i === captions.length - 1;
      let start = line.start + (used / total) * line.dur;
      used += text.length;
      let audioEnd = line.start + (used / total) * line.dur;
      let words: CaptionWord[];
      if (stampsUsable) {
        const slice = stamps.slice(wordCursor, wordCursor + parts.length);
        wordCursor += parts.length;
        start = line.start + slice[0].start;
        audioEnd = line.start + slice[slice.length - 1].end;
        words = slice.map((w, k) => ({
          text: parts[k],
          startF: sec(line.start + w.start),
          endF: sec(line.start + w.end),
        }));
      } else {
        let seen = 0;
        words = parts.map((w, k) => {
          const wStart = start + (seen / text.length) * (audioEnd - start);
          seen += w.length + 1;
          const wEnd = start + (Math.min(seen, text.length) / text.length) * (audioEnd - start);
          return { text: parts[k], startF: sec(wStart), endF: sec(wEnd) };
        });
      }
      const end = last ? line.end + 0.25 : audioEnd;
      return { text, startF: sec(start), endF: sec(end), words };
    });
  });

  return { scenes, TOTAL_FRAMES, scene, lines, lineById, wordTime, captionChunks };
};
