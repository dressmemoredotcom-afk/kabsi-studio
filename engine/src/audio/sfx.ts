import { staticFile } from "remotion";

/** One sound effect placed on the timeline. */
export type SfxCue = {
  /** File under the brand's public dir, e.g. "audio/sfx/sfx-pop.mp3". */
  src: string;
  /** Frame the sound starts on. */
  atFrame: number;
  /** Level in dB, 0 is the file as is. */
  db?: number;
  /** Playback speed, to pitch a run of the same sound up. */
  rate?: number;
};

export const sfxSrc = (cue: SfxCue) => staticFile(cue.src);
