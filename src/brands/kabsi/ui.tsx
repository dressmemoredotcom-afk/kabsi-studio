import React from "react";
import { colors, fonts, radii, shadows } from "./tokens";

export const Stars: React.FC<{ filled: number; size?: number }> = ({ filled, size = 40 }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.5l-5.9 3.3 1.3-6.7-4.9-4.6 6.6-.8z"
          fill={i < filled ? colors.ink : colors.hairline}
        />
      </svg>
    ))}
  </div>
);

export const Check: React.FC<{ size?: number; color?: string; stroke?: string }> = ({
  size = 40,
  color = colors.green,
  stroke = colors.white,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill={color} />
    <path
      d="M6.8 12.6l3.5 3.5 6.9-7.4"
      fill="none"
      stroke={stroke}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Shield: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2l8 3v6.3c0 5-3.3 8.7-8 10.7-4.7-2-8-5.7-8-10.7V5z" fill={colors.amber} />
    <path
      d="M12 7.2v5.4M12 15.6v.2"
      stroke={colors.amberSoft}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/** The small corner tag every product screen carries. */
export const ExampleTag: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontFamily: fonts.body,
      fontWeight: 500,
      fontSize: 24,
      lineHeight: "30px",
      color: colors.stone,
      background: colors.white,
      border: `2px solid ${colors.hairline}`,
      borderRadius: radii.pill,
      padding: "4px 16px",
    }}
  >
    {text}
  </div>
);

export const Pill: React.FC<{
  text: string;
  bg: string;
  color: string;
  icon?: React.ReactNode;
}> = ({ text, bg, color, icon }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: 26,
      lineHeight: "32px",
      color,
      background: bg,
      borderRadius: radii.pill,
      padding: "6px 20px",
    }}
  >
    {icon}
    {text}
  </div>
);

export const cardBase: React.CSSProperties = {
  position: "absolute",
  left: 28,
  width: 788,
  boxSizing: "border-box",
  borderRadius: radii.card,
  background: colors.white,
  border: `2px solid ${colors.hairline}`,
  boxShadow: shadows.card,
  fontFamily: fonts.body,
  color: colors.ink,
};

/** Dark dot that stands in for a fingertip. */
export const FingerDot: React.FC<{ x: number; y: number; scale: number; opacity: number; ripple: number }> = ({
  x,
  y,
  scale,
  opacity,
  ripple,
}) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: -45,
        top: -45,
        width: 90,
        height: 90,
        borderRadius: radii.pill,
        border: `5px solid ${colors.ink}`,
        opacity: ripple > 0 ? 1 - ripple : 0,
        transform: `scale(${0.8 + ripple * 1.1})`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -36,
        top: -36,
        width: 72,
        height: 72,
        borderRadius: radii.pill,
        background: colors.ink,
        border: `5px solid ${colors.white}`,
        boxShadow: shadows.lifted,
        transform: `scale(${scale})`,
      }}
    />
  </div>
);
