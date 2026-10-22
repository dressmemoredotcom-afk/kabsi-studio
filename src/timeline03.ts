import voice from "./generated/voice03.json";
import { createTimeline } from "./lib/timeline";
import { SCENES, VOICE_LINES } from "./script03";

export const T3 = createTimeline(VOICE_LINES, SCENES, voice);
