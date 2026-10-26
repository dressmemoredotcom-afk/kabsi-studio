import React from "react";
import { alpha, colors, fonts, radii, shadows } from "../tokens";
import { WhatsAppGlyph } from "./WhatsAppGlyph";

/** Secondary text on the paper chat screen: ink at 62 percent, so it stays readable. */
export const SUBTLE = alpha(colors.ink, 0.62);

/**
 * An iOS-style notification banner on frosted glass: the WhatsApp glyph, app name, "now", sender, and a two-line
 * preview. Position and animation come from the caller; the glyph itself is never animated.
 */
export const NotificationBanner: React.FC<{
  width: number;
  app: string;
  title: string;
  time: string;
  body: string;
  style?: React.CSSProperties;
}> = ({ width, app, title, time, body, style }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      padding: "20px 26px 24px",
      borderRadius: 52,
      background: alpha(colors.paper, 0.82),
      backdropFilter: "blur(30px) saturate(1.7)",
      WebkitBackdropFilter: "blur(30px) saturate(1.7)",
      border: `2px solid ${alpha(colors.paper, 0.6)}`,
      boxShadow: shadows.glass,
      fontFamily: fonts.body,
      color: colors.ink,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: colors.night,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WhatsAppGlyph size={30} />
      </div>
      <div style={{ flex: 1, fontWeight: 600, fontSize: 24, letterSpacing: 1.2, color: SUBTLE, textTransform: "uppercase" }}>
        {app}
      </div>
      <div style={{ fontWeight: 500, fontSize: 24, color: SUBTLE }}>{time}</div>
    </div>
    <div style={{ marginTop: 12, fontWeight: 700, fontSize: 34, lineHeight: "42px" }}>{title}</div>
    <div style={{ fontWeight: 500, fontSize: 31, lineHeight: "41px" }}>{body}</div>
  </div>
);

/** Chat header on frosted glass: avatar (the real mark), name, a line under it, and a tag (the Example badge) in the corner. */
export const ChatHeaderBar: React.FC<{
  width: number;
  avatar: React.ReactNode;
  name: string;
  note: string;
  tag: React.ReactNode;
}> = ({ width, avatar, name, note, tag }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 78,
      width,
      height: 118,
      boxSizing: "border-box",
      padding: "0 26px",
      display: "flex",
      alignItems: "center",
      gap: 18,
      background: alpha(colors.paper, 0.9),
      backdropFilter: "blur(24px) saturate(1.5)",
      WebkitBackdropFilter: "blur(24px) saturate(1.5)",
      borderBottom: `2px solid ${alpha(colors.ink, 0.1)}`,
      fontFamily: fonts.body,
      zIndex: 10,
    }}
  >
    {avatar}
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: 36, lineHeight: "42px", color: colors.ink }}>{name}</div>
      <div style={{ fontWeight: 500, fontSize: 24, lineHeight: "30px", color: SUBTLE }}>{note}</div>
    </div>
    {tag}
  </div>
);

/** Chat background: paper with a faint dotted pattern. */
export const ChatWallpaper: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: colors.paper,
      backgroundImage: `radial-gradient(${alpha(colors.ink, 0.07)} 2.5px, transparent 3px)`,
      backgroundSize: "44px 44px",
    }}
  />
);

export const Ticks: React.FC<{ color?: string }> = ({ color = SUBTLE }) => (
  <svg width="34" height="22" viewBox="0 0 30 20">
    <path d="M1.5 10.5l5 5L16 4M10.5 14.5l1.5 1.5L21.5 4" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A chat bubble with a tail corner and a small time stamp. Animation comes from the caller via style. */
export const ChatBubble: React.FC<{
  side?: "left" | "right";
  bg: string;
  /** Text colour; ink unless the bubble is dark. */
  color?: string;
  width: number;
  time?: string;
  ticks?: boolean;
  border?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ side = "left", bg, color = colors.ink, width, time, ticks, border, style, children }) => {
  const left = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        left: left ? 26 : undefined,
        right: left ? undefined : 26,
        width,
        boxSizing: "border-box",
        padding: "22px 26px 16px",
        background: bg,
        border: border ? `3px solid ${border}` : "none",
        borderRadius: left ? `${radii.large + 4}px ${radii.large + 4}px ${radii.large + 4}px 6px` : `${radii.large + 4}px ${radii.large + 4}px 6px ${radii.large + 4}px`,
        boxShadow: shadows.card,
        fontFamily: fonts.body,
        color,
        transformOrigin: left ? "0% 100%" : "100% 100%",
        ...style,
      }}
    >
      {children}
      {time && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 6, fontWeight: 500, fontSize: 22, color: alpha(color, 0.62) }}>
          {time}
          {ticks && <Ticks color={alpha(color, 0.62)} />}
        </div>
      )}
    </div>
  );
};
