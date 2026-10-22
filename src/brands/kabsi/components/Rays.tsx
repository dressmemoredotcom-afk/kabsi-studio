import React from "react";
import { colors } from "../tokens";

/** Yellow field with slowly turning rays: movement behind everything. */
export const Rays: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      position: "absolute",
      inset: -400,
      background: `repeating-conic-gradient(from ${frame * 0.7}deg at 50% 50%, ${colors.yellow} 0deg 12deg, ${colors.yellowPressed} 12deg 24deg)`,
    }}
  />
);
