import voice from "./generated/voice04.json";
import { createTimeline } from "./lib/timeline";
import { SCENES, VOICE_LINES } from "./scriptRoomy";

export const TR = createTimeline(VOICE_LINES, SCENES, voice);
