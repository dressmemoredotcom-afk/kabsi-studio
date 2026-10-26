import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, colors } from "../tokens";
import { TAP_RING_SECONDS } from "../kit";
import { clampRange } from "../../../engine/src/anim";

/**
 * A soft dark ring (the tapRing token, drawn at 30 percent) for half a second on each tap or click, like the access recordings.
 * (x, y) is the centre in frame pixels; `atS` is the second the tap lands.
 */
export const TapRing: React.FC<{ x: number; y: number; atS: number; size?: number }> = ({ x, y, atS, size = 128 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - Math.round(atS * fps)) / (TAP_RING_SECONDS * fps);
  if (t < 0 || t >= 1) return null;
  const grow = clampRange(t, 0, 0.3, 0.55, 1);
  const fade = clampRange(t, 0.7, 1, 1, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        boxSizing: "border-box",
        borderRadius: "50%",
        border: `${Math.round(size * 0.11)}px solid ${alpha(colors.tapRing, 0.3)}`,
        boxShadow: `0 0 ${Math.round(size * 0.2)}px ${alpha(colors.tapRing, 0.18)}`,
        opacity: fade,
        transform: `scale(${grow})`,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
};
