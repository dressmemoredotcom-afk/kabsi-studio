import type { VoiceLineDef } from "../../../engine/src/timeline";
import type { FormatId } from "../formats";

/**
 * One Kabsi video's words and facts: its composition id, a short name for file names, its format and length, every
 * on-screen string and its voice-over lines. The rule check, the voice script and the render all read this.
 */
export type VideoCopy = {
  /** Composition id and the folder in kabsi/out/: a catalogue ID from docs/VIDEO-PLAN.md section 4, or kit-test. */
  id: string;
  /** Short name for output files: kabsi-<id>-<name>-<size>.mp4. */
  name: string;
  /** One of the five rows of docs/VIDEO-PLAN.md section 3 (src/formats.ts). */
  format: FormatId;
  /** Sizes to render, each one of the format's sizes, as "WIDTHxHEIGHT". */
  sizes: string[];
  seconds: number;
  /** Every on-screen string, in any shape of objects and arrays. */
  screen: Record<string, unknown>;
  /** The voice-over. Its `captions` are the one caption source: burned in, SRT and WebVTT all come from them. */
  voiceLines: VoiceLineDef[];
  /** The one yellow word of a caption: "<line id>#<n>" (n from 1) to the word. */
  highlight?: Record<string, string>;
  /** Names of invented example businesses shown. The video must draw an ExampleBadge. */
  businesses: string[];
  /** The last 3 seconds are the end card. */
  endCard: boolean;
  /** Shows the small print (needed on website explainers and ads). */
  smallPrint: boolean;
  /** Shows the owner's Yes, so the string "Yes" is in `screen`. Every demo of the work does. */
  demo?: boolean;
  /** Recordings and footage under kabsi/public/inputs/<ID>/. Lane R checks their frames. */
  footage?: string[];
  /** Stock clips with the link to the licence that allows ads. */
  stock?: { file: string; licence: string }[];
  /** Music file with its licence. None until a licensed track is saved. */
  music?: { file: string; licence: string };
  /** The video shows a face (only with written consent). */
  faces?: boolean;
  /** A kit test: the length range of its format is waived, nothing else. */
  testOnly?: boolean;
};
