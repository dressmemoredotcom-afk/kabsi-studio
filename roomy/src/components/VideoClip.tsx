import React from "react";
import { OffthreadVideo, Sequence } from "remotion";
import { alpha, FRAME } from "../../../core/frame";
import { clampRange } from "../../../core/anim";
import { FPS } from "../storyboard";
import type { MediaAsset } from "../assets";
import { roomyTokens as T } from "../tokens";
import { PlaceholderBackdrop } from "./primitives";

/** Horizontal footage: too wide to fill a vertical frame without being enlarged until it turns soft. */
export const isLandscape = (width: number, height: number): boolean => width > height * 1.15;

/**
 * A muted clip, starting `startAtSecond` into the source. It gets its own Sequence, so its clock starts at zero when
 * the scene does. If the clip is too short to play that long from the requested start, the start moves earlier so it
 * never runs out. `playbackRate` below 1 slows a short shot so it can fill its scene.
 *
 * Upright footage fills the frame. Horizontal footage plays in a full-width window in the middle of the frame, at a
 * size where it stays sharp. Its own picture, blown up and blurred, is the background, with a glow around the window
 * and the copy on the soft ground beneath it. `focusX` (0 left, 50 centre, 100 right) picks which part of the wide
 * picture stays in view. Black bars burned into a file (see `content`) are left out.
 */
export const VideoClip: React.FC<{
  src: string | null;
  frame: number;
  from: number;
  frames: number;
  startAtSecond: number;
  playbackRate?: number;
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
  const known = width > 0 && height > 0;
  const pic = content ?? { x: 0, y: 0, width, height };

  /** The whole source file, placed so its picture covers a box of this size, `focusX` deciding the sideways crop. */
  const place = (boxW: number, boxH: number, extra: React.CSSProperties = {}): React.CSSProperties => {
    if (!known) return { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focusX}% 50%`, ...extra };
    const scale = Math.max(boxH / pic.height, boxW / pic.width);
    const left = -pic.x * scale - (pic.width * scale - boxW) * (focusX / 100);
    const top = -pic.y * scale - (pic.height * scale - boxH) / 2;
    return { position: "absolute", left, top, width: width * scale, height: height * scale, objectFit: "fill", transformOrigin: `${boxW * (focusX / 100) - left}px ${boxH / 2 - top}px`, ...extra };
  };
  const clip = (style: React.CSSProperties) => (
    <OffthreadVideo src={src} trimBefore={Math.round(start * FPS)} durationInFrames={frames} playbackRate={playbackRate} muted volume={0} style={style} />
  );

  if (!isLandscape(width, height)) {
    return (
      <Sequence from={from} durationInFrames={frames}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{clip(place(FRAME.width, FRAME.height, { transform: `scale(${push})` }))}</div>
      </Sequence>
    );
  }

  const W = T.layout.window;
  return (
    <Sequence from={from} durationInFrames={frames}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.charcoal }}>
        {/* The shot's own shadow: the picture enlarged and blurred fills the frame. */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {clip(place(FRAME.width, FRAME.height, { transform: "scale(1.35)", filter: "blur(110px) brightness(0.82) saturate(1.8)" }))}
        </div>
        {/* A brighter glow right around the window. */}
        <div style={{ position: "absolute", left: 0, top: W.top, width: FRAME.width, height: W.height, transform: "scale(1.06, 1.38)", filter: "blur(52px) saturate(1.5)", opacity: 0.9 }}>
          {clip(place(FRAME.width, W.height))}
        </div>
        {/* Darker at the top and bottom, where the badge and the copy sit; a trace of brand teal ties it together. */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${alpha(T.charcoal, 0.42)} 0%, ${alpha(T.charcoal, 0)} 24%, ${alpha(T.charcoal, 0)} 56%, ${alpha(T.charcoal, 0.55)} 80%, ${alpha(T.charcoal, 0.74)} 100%)` }} />
        <div style={{ position: "absolute", inset: 0, background: alpha(T.deepTeal, 0.07) }} />
        <div style={{ position: "absolute", left: 0, top: W.top, width: FRAME.width, height: W.height, overflow: "hidden", boxShadow: `0 28px 80px ${alpha(T.charcoal, 0.6)}` }}>
          {clip(place(FRAME.width, W.height, { transform: `scale(${push})`, filter: "saturate(1.06) contrast(1.04)" }))}
        </div>
      </div>
    </Sequence>
  );
};
