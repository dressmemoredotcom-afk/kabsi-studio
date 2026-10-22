import React from "react";
import { colors } from "../tokens";
import { scenes } from "./timeline";

/** A three-frame white flash on each cut after the first: the "hit" that makes a cut feel quick. */
export const Flash: React.FC<{ frame: number }> = ({ frame }) => {
  const cut = scenes.slice(1).find((s) => frame >= s.fromF && frame < s.fromF + 3);
  if (!cut) return null;
  const k = 1 - (frame - cut.fromF) / 3;
  return <div style={{ position: "absolute", inset: 0, background: colors.white, opacity: 0.55 * k, pointerEvents: "none" }} />;
};
