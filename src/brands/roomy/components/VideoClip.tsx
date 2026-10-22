import React from "react";
import { OffthreadVideo, Sequence } from "remotion";
import { FPS } from "../storyboard";
import { PlaceholderBackdrop } from "./primitives";

/**
 * A muted clip filling the frame (object-fit: cover, centred), starting `startAtSecond` into the source. It gets
 * its own Sequence, so its clock starts at zero when the scene does. If the clip is too short to play that long
 * from the requested start, the start moves earlier so it never runs out.
 */
export const VideoClip: React.FC<{
  src: string | null;
  frame: number;
  from: number;
  frames: number;
  startAtSecond: number;
  /** Source length in seconds, when known. */
  durationS: number;
  index: number;
}> = ({ src, frame, from, frames, startAtSecond, durationS, index }) => {
  if (!src) return <PlaceholderBackdrop frame={frame} variant={index % 3} />;
  const needed = frames / FPS;
  const start = durationS > 0 ? Math.max(0, Math.min(startAtSecond, durationS - needed)) : startAtSecond;
  return (
    <Sequence from={from} durationInFrames={frames}>
      <OffthreadVideo
        src={src}
        trimBefore={Math.round(start * FPS)}
        durationInFrames={frames}
        muted
        volume={0}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%" }}
      />
    </Sequence>
  );
};
