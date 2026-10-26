import React from "react";
import { colors } from "../tokens";

/** A three-frame paper-coloured flash on each cut: the "hit" that makes a cut feel quick. */
export const CutFlash: React.FC<{ frame: number; cutFrames: readonly number[] }> = ({ frame, cutFrames }) => {
  const cut = cutFrames.find((c) => frame >= c && frame < c + 3);
  if (cut === undefined) return null;
  return <div style={{ position: "absolute", inset: 0, background: colors.paper, opacity: 0.5 * (1 - (frame - cut) / 3), pointerEvents: "none" }} />;
};
