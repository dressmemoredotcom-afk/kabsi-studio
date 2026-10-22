import voice from "../generated/voice02.json";
import { createTimeline } from "../lib/timeline";
import { SCENES, VOICE_LINES } from "../script02";

export { FPS, sec } from "../lib/timeline";
export const { scenes, TOTAL_FRAMES, scene, lines, lineById, wordTime, captionChunks } = createTimeline(
  VOICE_LINES,
  SCENES,
  voice,
);
