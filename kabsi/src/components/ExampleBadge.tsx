import React from "react";
import { alpha, colors, fonts, radii, SAFE } from "../tokens";
import { STRINGS } from "../kit";

/**
 * The "Example" badge every invented business carries (docs/VIDEO-PLAN.md section 1). Place it yourself, or pass
 * `corner` to put it at the top left of the safe area. Carbon pill with paper text: no yellow, so the screen keeps its
 * one highlight.
 */
export const ExampleBadge: React.FC<{ corner?: boolean; quiet?: boolean; scale?: number; style?: React.CSSProperties }> = ({ corner = false, quiet = false, scale = 1, style }) =>
  quiet ? (
    // The design studio's own: a thin outline in the text colour, 24 px high with 13 px type, never the yellow.
    <div
      style={{
        position: corner ? "absolute" : "relative",
        left: corner ? SAFE.left : undefined,
        top: corner ? SAFE.top : undefined,
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        height: 24 * scale,
        boxSizing: "border-box",
        padding: `0 ${10 * scale}px`,
        borderRadius: radii.pill,
        border: `${Math.max(1, scale)}px solid ${alpha(colors.ink, 0.3)}`,
        color: colors.ink,
        fontFamily: fonts.body,
        fontWeight: 600,
        fontSize: 13 * scale,
        lineHeight: 1.35,
        ...style,
      }}
    >
      {STRINGS.exampleBadge}
    </div>
  ) : (
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
