import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { bgmLinear, type LinearDuck, type Span } from "../../audio/mix";
import { SCENES } from "../../scriptRoomy";
import { TR } from "../../timelineRoomy";
import { ASSETS, BGM_FILE } from "./assets";

/** 18% under the voice, 55% in the pauses and the outro, soft fades at both ends. */
export const DUCK: LinearDuck = {
  open: 0.55,
  ducked: 0.18,
  outroDucked: 0.18,
  outroFromS: SCENES[SCENES.length - 1].from,
  attackS: 0.25,
  releaseS: 0.7,
  fadeInS: 0.5,
  fadeOutS: 0.9,
  totalS: TR.TOTAL_FRAMES / 30,
};

/** When the voice is speaking. With one ready-made voiceover.mp3 the line windows of the brief stand in for it. */
const voiceSpans = (): Span[] =>
  ASSETS.voiceover
    ? SCENES.map((s) => ({ fromS: s.from + 0.1, toS: s.to - 0.4 }))
    : TR.lines.map((l) => ({ fromS: l.start, toS: l.end }));

/** Voice (your voiceover.mp3, or one Kokoro clip per line) and the background music that ducks under it. */
export const RoomyAudio: React.FC = () => {
  const spans = voiceSpans();
  return (
    <>
      {BGM_FILE && <Audio src={staticFile(BGM_FILE)} loop volume={(f) => bgmLinear(f / 30, spans, DUCK)} />}
      {ASSETS.voiceover ? (
        <Audio src={staticFile(ASSETS.voiceover)} />
      ) : (
        TR.lines.map((l) => {
          if (!l.file) throw new Error(`No voice file for ${l.id}. Run: node scripts/voice.mjs 04`);
          return (
            <Sequence key={l.id} from={l.startF} durationInFrames={l.durF + 2}>
              <Audio src={staticFile(l.file)} />
            </Sequence>
          );
        })
      )}
    </>
  );
};
