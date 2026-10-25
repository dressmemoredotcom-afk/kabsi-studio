import React from "react";
import { OffthreadVideo, Sequence } from "remotion";
import { clampRange } from "../../../core/anim";
import { FRAME } from "../../../core/frame";
import { FPS } from "../storyboard";
import type { MediaAsset } from "../assets";
import { PlaceholderBackdrop } from "./primitives";

/**
 * A muted clip filling the whole frame, starting `startAtSecond` into the source. It gets its own Sequence, so its
 * clock starts at zero when the scene does. If the clip is too short to play that long from the requested start, the
 * start moves earlier so it never runs out. `playbackRate` below 1 slows a short shot so it can fill its scene.
 *
 * The real picture (without any black bars burned into the file, see `content`) is scaled until it covers the
 * frame. Horizontal footage keeps the part at `focusX` (0 left, 50 centre, 100 right) and pushes in slowly.
 */
export const VideoClip: React.FC<{
  src: string | null;
  frame: number;
  from: number;
  frames: number;
  startAtSecond: number;
  playbackRate?: number;
  /** Where horizontal footage is cropped, in percent from the left. */
  focusX?: number;
  /** Source length in seconds, when known. */
  durationS: number;
  /** Source size in pixels, and the picture inside it when it has black bars. */
  width?: number;
  height?: number;
  content?: MediaAsset["content"];
  index: number;
}> = ({ src, frame, from, frames, startAtSecond, playbackRate = 1, focusX = 50, durationS, width = 0, height = 0, content, index }) => {
  if (!src) return <PlaceholderBackdrop frame={frame} variant={index % 3} />;
  const needed = (frames / FPS) * playbackRate;
  const start = durationS > 0 ? Math.max(0, Math.min(startAtSecond, durationS - needed)) : startAtSecond;
  const push = clampRange(frame, from, from + frames, 1, 1.04);

  // Where the whole source file sits so that its picture covers the frame.
  const pic = content ?? { x: 0, y: 0, width, height };
  const known = width > 0 && height > 0;
  const scale = known ? Math.max(FRAME.height / pic.height, FRAME.width / pic.width) : 1;
  const left = -pic.x * scale - (pic.width * scale - FRAME.width) * (focusX / 100);
  const top = -pic.y * scale - (pic.height * scale - FRAME.height) / 2;
  const placed: React.CSSProperties = known
    ? { position: "absolute", left, top, width: width * scale, height: height * scale, objectFit: "fill", transformOrigin: `${FRAME.width * (focusX / 100) - left}px ${FRAME.height / 2 - top}px` }
    : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focusX}% 50%`, transformOrigin: `${focusX}% 50%` };

  return (
    <Sequence from={from} durationInFrames={frames}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <OffthreadVideo
          src={src}
          trimBefore={Math.round(start * FPS)}
          durationInFrames={frames}
          playbackRate={playbackRate}
          muted
          volume={0}
          style={{ ...placed, transform: `scale(${push})` }}
        />
      </div>
    </Sequence>
  );
};
