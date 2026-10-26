import type { VoiceLineDef } from "../../../engine/src/timeline";

/**
 * One Kabsi video's words: its composition id, a short name for file names, its length, every on-screen string and its
 * voice-over lines. The rule check, the voice script and the render all read this.
 */
export type VideoCopy = {
  /** Composition id: a catalogue ID from docs/VIDEO-PLAN.md section 4, or KabsiKitTest. */
  id: string;
  /** Short name for output files: kabsi-<id>-<name>-1080x1920.mp4. */
  name: string;
  seconds: number;
  /** Every on-screen string, in any shape of objects and arrays. */
  screen: Record<string, unknown>;
  voiceLines: VoiceLineDef[];
};
