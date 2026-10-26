import { staticFile } from "remotion";

/** Sound-effect files in assets/audio/sfx. Overwrite a file to swap the sound; keep the name. */
export const SFX_FILES = {
  pop: "audio/sfx/sfx-pop.mp3",
  whoosh: "audio/sfx/sfx-whoosh.mp3",
  ping: "audio/sfx/sfx-whatsapp-ping.mp3",
  click: "audio/sfx/sfx-click.mp3",
  success: "audio/sfx/sfx-success.mp3",
  star: "audio/sfx/sfx-star.mp3",
} as const;

export type SfxName = keyof typeof SFX_FILES;

/** One sound effect placed on the timeline. */
export type SfxCue = {
  name: SfxName;
  /** Frame the sound starts on. */
  atFrame: number;
  /** Level in dB, 0 is the file as is. */
  db?: number;
  /** Playback speed, to pitch a run of the same sound up. */
  rate?: number;
};

export const sfxSrc = (name: SfxName) => staticFile(SFX_FILES[name]);
