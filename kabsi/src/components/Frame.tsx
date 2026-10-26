import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FPS, sec } from "../../../engine/src/timeline";
import { burnsCaptions, FORMATS } from "../formats";
import { buildCues, type VoiceTimes } from "../captions";
import type { VideoCopy } from "../videos/types";
import { Captions, type TapPoint } from "./Captions";
import { SafeZone } from "./SafeZone";

/** What src/generated/voice/<ID>.json holds. */
export type VoiceFile = VoiceTimes & { voice: string; speed: number; files: Record<string, string> };

/**
 * Every Kabsi video sits in this: the voice track, the burned-in captions when the format burns them in (website
 * loops and explainers get none; their WebVTT file comes from the same source), and the safe-zone debug overlay,
 * which is off unless asked for in Studio.
 */
export const KabsiFrame: React.FC<{
  copy: VideoCopy;
  voice: VoiceFile;
  taps?: readonly TapPoint[];
  safeZoneDebug?: boolean;
  children: React.ReactNode;
}> = ({ copy, voice, taps, safeZoneDebug = false, children }) => {
  const format = FORMATS[copy.format];
  const cues = buildCues(copy.voiceLines, voice, copy.highlight);
  return (
    <AbsoluteFill>
      {children}
      {copy.voiceLines.map((line) => (
        <Sequence key={line.id} from={sec(voice.starts[line.id])} durationInFrames={Math.ceil(voice.durations[line.id] * FPS) + 2}>
          <Audio src={staticFile(voice.files[line.id])} />
        </Sequence>
      ))}
      {burnsCaptions(format) && <Captions cues={cues} taps={taps} />}
      {safeZoneDebug && <SafeZone debug />}
    </AbsoluteFill>
  );
};
