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
 * Upright footage fills the frame. Horizontal footage plays in an arched window (the shape of the old houses it is
 * usually shot in) at a size where it stays sharp, over a background drawn from the brand colours and tinted by the
 * shot itself, with the copy on clean ground beneath it. `focusX` (0 left, 50 centre, 100 right) picks which part of
 * the wide picture stays in view. Black bars burned into a file (see `content`) are left out.
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

  const A = T.layout.arch;
  const left = (FRAME.width - A.width) / 2;
  const radius = `${A.width / 2}px ${A.width / 2}px ${T.radii.large}px ${T.radii.large}px`;
  const halo = (grow: number, opacity: number) => (
    <div
      key={grow}
      style={{
        position: "absolute",
        left: left - grow,
        top: A.top - grow,
        width: A.width + grow * 2,
        height: A.height + grow,
        borderRadius: `${(A.width + grow * 2) / 2}px ${(A.width + grow * 2) / 2}px 0 0`,
        border: `1.5px solid ${alpha(T.turquoise, opacity)}`,
        borderBottom: "none",
      }}
    />
  );

  return (
    <Sequence from={from} durationInFrames={frames}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.charcoal }}>
        {/* The shot, blown up and blurred, gives the ground its colour; teal and charcoal keep it rich, not murky. */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.9 }}>{clip(place(FRAME.width, FRAME.height, { transform: "scale(1.3)", filter: "blur(60px) saturate(1.25)" }))}</div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${alpha(T.deepTeal, 0.72)} 0%, ${alpha(T.deepTeal, 0.62)} 40%, ${alpha(T.charcoal, 0.9)} 72%, ${alpha(T.charcoal, 0.97)} 100%)` }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 75% 34% at 50% ${((A.top + A.height / 2) / FRAME.height) * 100}%, ${alpha(T.turquoise, 0.26)}, transparent 72%)` }} />
        {halo(46, 0.2)}
        {halo(22, 0.42)}
        <div style={{ position: "absolute", left, top: A.top, width: A.width, height: A.height, borderRadius: radius, overflow: "hidden", boxShadow: `0 36px 90px ${alpha(T.charcoal, 0.65)}, 0 0 120px ${alpha(T.turquoise, 0.16)}`, WebkitBoxReflect: `below 10px linear-gradient(to bottom, transparent 70%, ${alpha(T.white, 0.14)} 100%)` }}>
          {clip(place(A.width, A.height, { transform: `scale(${push})`, filter: "saturate(1.07) contrast(1.04)" }))}
          <div style={{ position: "absolute", inset: 0, borderRadius: radius, border: `2px solid ${alpha(T.turquoise, 0.85)}` }} />
        </div>
      </div>
    </Sequence>
  );
};
