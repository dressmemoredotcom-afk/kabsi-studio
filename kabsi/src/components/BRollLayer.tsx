import React from "react";
import { OffthreadVideo, Sequence, staticFile } from "remotion";
import { FPS, sec } from "../../../engine/src/timeline";

/** An external clip from kabsi/public/: footage in inputs/<ID>/, b-roll, a talking head, a screen capture. */
export type BRollClip = {
  /** File under kabsi/public/, e.g. "inputs/W1/demo-chat.mp4". */
  file: string;
  fromS: number;
  toS: number;
  /** How the clip fills the 1080 x 1920 frame. */
  fit?: "cover" | "contain";
  /** Skip this many seconds into the clip. */
  startFromS?: number;
  /** Clip audio level, 0 to 1. Clips are silent by default so the mix stays in charge. */
  volume?: number;
};

/** Draws clips full frame on their own windows. Put it under the UI layers. */
export const BRollLayer: React.FC<{ clips: readonly BRollClip[] }> = ({ clips }) => (
  <>
    {clips.map((c) => (
      <Sequence key={`${c.file}-${c.fromS}`} from={sec(c.fromS)} durationInFrames={Math.max(1, sec(c.toS - c.fromS))}>
        <OffthreadVideo
          src={staticFile(c.file)}
          startFrom={Math.round((c.startFromS ?? 0) * FPS)}
          volume={c.volume ?? 0}
          style={{ width: "100%", height: "100%", objectFit: c.fit ?? "cover" }}
        />
      </Sequence>
    ))}
  </>
);
