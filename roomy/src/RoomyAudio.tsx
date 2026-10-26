import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { bgmLinear, type LinearDuck, type Span } from "../../core/audio/mix";
import { FPS, outroFrom } from "./storyboard";
import { ASSETS, BGM_FILE } from "./assets";

/** One spoken line placed on the timeline (see scripts/roomy-voice.mjs). */
export type VoiceClip = { scene: number; text: string; file: string; startS: number; durS: number };

/**
 * 15% under the voice, 55% in the pauses, across scene transitions and in the outro, with soft ramps either side
 * of every line and a fade at both ends.
 */
export const duckFor = (total: number): LinearDuck => ({
  open: 0.55,
  ducked: 0.15,
  outroDucked: 0.15,
  outroFromS: outroFrom(total) / FPS,
  attackS: 0.25,
  releaseS: 0.7,
  fadeInS: 0.5,
  fadeOutS: 0.9,
  totalS: total / FPS,
});

/** Background lounge music that ducks under the voice, and the voice itself (your voiceover.mp3, or one clip per line). */
export const RoomyAudio: React.FC<{ clips: VoiceClip[]; total: number }> = ({ clips, total }) => {
  const duck = duckFor(total);
  const spans: Span[] = ASSETS.voiceover
    ? [{ fromS: 0.8, toS: (outroFrom(total) + 90) / FPS }]
    : clips.map((c) => ({ fromS: c.startS, toS: c.startS + c.durS }));
  return (
    <>
      {BGM_FILE && <Audio src={staticFile(BGM_FILE)} loop volume={(f) => bgmLinear(f / FPS, spans, duck)} />}
      {ASSETS.voiceover ? (
        <Audio src={staticFile(ASSETS.voiceover)} />
      ) : (
        clips.map((c) => (
          <Sequence key={c.file} from={Math.round(c.startS * FPS)} durationInFrames={Math.ceil(c.durS * FPS) + 2}>
            <Audio src={staticFile(c.file)} />
          </Sequence>
        ))
      )}
    </>
  );
};
