import React from "react";
import { OffthreadVideo, Sequence } from "remotion";
import { clampRange } from "../../../core/anim";
import { FPS } from "../storyboard";
import { roomyTokens as T } from "../tokens";
import { PlaceholderBackdrop } from "./primitives";

/**
 * A muted clip starting `startAtSecond` into the source. It gets its own Sequence, so its clock starts at zero when
 * the scene does. If the clip is too short to play that long from the requested start, the start moves earlier so it
 * never runs out. `playbackRate` below 1 slows a short shot so it can fill its scene.
 *
 * Upright footage fills the frame (cover, centred). Horizontal footage would be cropped to a third of its width and
 * enlarged four times, so it plays as a wide window over a soft, darkened copy of itself, with feathered edges.
 */
export const VideoClip: React.FC<{
  src: string | null;
  frame: number;
  from: number;
  frames: number;
  startAtSecond: number;
  playbackRate?: number;
  /** Source length in seconds, when known. */
  durationS: number;
  /** Source size in pixels, when known. */
  width?: number;
  height?: number;
  index: number;
}> = ({ src, frame, from, frames, startAtSecond, playbackRate = 1, durationS, width = 0, height = 0, index }) => {
  if (!src) return <PlaceholderBackdrop frame={frame} variant={index % 3} />;
  const needed = (frames / FPS) * playbackRate;
  const start = durationS > 0 ? Math.max(0, Math.min(startAtSecond, durationS - needed)) : startAtSecond;
  const video = (style: React.CSSProperties) => (
    <OffthreadVideo
      src={src}
      trimBefore={Math.round(start * FPS)}
      durationInFrames={frames}
      playbackRate={playbackRate}
      muted
      volume={0}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", ...style }}
    />
  );

  if (width > height * 1.15) {
    const w = T.layout.landscapeWindow;
    const push = clampRange(frame, from, from + frames, 1, 1.05);
    const feather = `linear-gradient(to bottom, transparent 0, black ${w.feather}px, black calc(100% - ${w.feather}px), transparent 100%)`;
    return (
      <Sequence from={from} durationInFrames={frames}>
        {video({ transform: "scale(1.4)", filter: "blur(38px) brightness(0.5) saturate(1.1)" })}
        <div style={{ position: "absolute", left: 0, right: 0, top: w.top, height: w.height, overflow: "hidden", WebkitMaskImage: feather, maskImage: feather }}>
          {video({ transform: `scale(${push})` })}
        </div>
      </Sequence>
    );
  }

  return <Sequence from={from} durationInFrames={frames}>{video({})}</Sequence>;
};
