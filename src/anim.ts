import { interpolate, spring } from "remotion";
import { FPS, sec } from "./timeline";

type Cfg = { damping?: number; stiffness?: number; mass?: number };

const SLIDE: Cfg = { damping: 20, stiffness: 130, mass: 0.8 };
const SOFT: Cfg = { damping: 200, stiffness: 120, mass: 1 };

/** Spring from 0 to 1 starting at `atS` seconds. Zero before it starts. */
export const pop = (frame: number, atS: number, config: Cfg = SLIDE): number => {
  const f = frame - sec(atS);
  if (f <= 0) return 0;
  return spring({ frame: f, fps: FPS, config });
};

/** Smooth, non-bouncing 0 to 1 (fades). */
export const soft = (frame: number, atS: number, config: Cfg = SOFT): number => pop(frame, atS, config);

export const lerp = (t: number, from: number, to: number) => from + (to - from) * t;

export const clampRange = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
