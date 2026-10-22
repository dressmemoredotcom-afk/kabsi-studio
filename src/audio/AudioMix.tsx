import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { bgmDb, dbToGain, type DuckConfig, type Span } from "./mix";
import { sfxSrc, type SfxCue } from "./sfx";
import { FPS } from "../lib/timeline";

export type VoiceClip = { src: string; startF: number; durF: number };

/** Three tracks: voice-over, background music that ducks under it, and sound effects on exact frames. */
export const AudioMix: React.FC<{
  voice: VoiceClip[];
  /** File under assets/, e.g. "audio/bgm/kabsi-upbeat-loop.mp3". */
  bgm: string;
  duck: DuckConfig;
  sfx: SfxCue[];
}> = ({ voice, bgm, duck, sfx }) => {
  const spans: Span[] = voice.map((v) => ({ fromS: v.startF / FPS, toS: (v.startF + v.durF) / FPS }));
  return (
    <>
      <Audio src={staticFile(bgm)} loop volume={(f) => dbToGain(bgmDb(f / FPS, spans, duck))} />
      {voice.map((v) => (
        <Sequence key={v.src} from={v.startF} durationInFrames={v.durF + 2}>
          <Audio src={staticFile(v.src)} />
        </Sequence>
      ))}
      {sfx.map((cue, i) => (
        <Sequence key={`${cue.name}-${i}`} from={cue.atFrame} durationInFrames={Math.ceil(FPS * 1.6)}>
          <Audio src={sfxSrc(cue.name)} volume={dbToGain(cue.db ?? 0)} playbackRate={cue.rate ?? 1} />
        </Sequence>
      ))}
    </>
  );
};
