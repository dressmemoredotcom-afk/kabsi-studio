import React from "react";
import { colors, fonts, radii, SAFE } from "../tokens";
import { STRINGS } from "../kit";

/**
 * The "Example" badge every invented business carries (docs/VIDEO-PLAN.md section 1). Place it yourself, or pass
 * `corner` to put it at the top left of the safe area. Carbon pill with paper text: no yellow, so the screen keeps its
 * one highlight.
 */
export const ExampleBadge: React.FC<{ corner?: boolean; style?: React.CSSProperties }> = ({ corner = false, style }) => (
  <div
    style={{
      position: corner ? "absolute" : "relative",
      left: corner ? SAFE.left : undefined,
      top: corner ? SAFE.top : undefined,
      display: "inline-block",
      padding: "6px 22px 7px",
      borderRadius: radii.pill,
      background: colors.carbon,
      border: `2px solid ${colors.mute}`,
      color: colors.paper,
      fontFamily: fonts.body,
      fontWeight: 700,
      fontSize: 28,
      lineHeight: "34px",
      letterSpacing: 0.6,
      ...style,
    }}
  >
    {STRINGS.exampleBadge}
  </div>
);
