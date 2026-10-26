import React from "react";
import { alpha, colors, fonts, radii, shadows } from "../tokens";

/** A generic chat-bubble glyph. Drawn from scratch: not any messaging app's own logo. */
export const ChatGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = colors.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 3.2c-4.9 0-8.8 3.6-8.8 8.1 0 1.7.6 3.3 1.6 4.6L3.6 20.8l5.2-1.4c1 .4 2 .6 3.2.6 4.9 0 8.8-3.6 8.8-8.1S16.9 3.2 12 3.2z"
      fill={color}
    />
  </svg>
);

/**
 * An iOS-style notification banner on frosted glass: app icon, app name, "now", sender, and a
 * two-line preview. Position and animation come from the caller.
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
      background: alpha(colors.white, 0.74),
      backdropFilter: "blur(30px) saturate(1.7)",
      WebkitBackdropFilter: "blur(30px) saturate(1.7)",
      border: `2px solid ${alpha(colors.white, 0.6)}`,
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
          background: colors.chatGreen,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChatGlyph size={30} />
      </div>
      <div style={{ flex: 1, fontWeight: 500, fontSize: 24, letterSpacing: 1.2, color: colors.stone, textTransform: "uppercase" }}>
        {app}
      </div>
      <div style={{ fontWeight: 400, fontSize: 24, color: colors.stone }}>{time}</div>
    </div>
    <div style={{ marginTop: 12, fontWeight: 600, fontSize: 34, lineHeight: "42px" }}>{title}</div>
    <div style={{ fontWeight: 400, fontSize: 31, lineHeight: "41px" }}>{body}</div>
  </div>
);

/** Chat header on frosted glass: avatar, name, a line under it, and the Example tag in the corner. */
export const ChatHeaderBar: React.FC<{
  width: number;
  initial: string;
  name: string;
  note: string;
  tag: React.ReactNode;
}> = ({ width, initial, name, note, tag }) => (
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
      background: alpha(colors.white, 0.82),
      backdropFilter: "blur(24px) saturate(1.5)",
      WebkitBackdropFilter: "blur(24px) saturate(1.5)",
      borderBottom: `2px solid ${colors.hairline}`,
      fontFamily: fonts.body,
      zIndex: 10,
    }}
  >
    <svg width="22" height="36" viewBox="0 0 22 36">
      <path d="M18 3L5 18l13 15" fill="none" stroke={colors.stone} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: radii.pill,
        background: colors.yellow,
        color: colors.ink,
        fontFamily: fonts.title,
        fontSize: 48,
        lineHeight: "78px",
        textAlign: "center",
      }}
    >
      {initial}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, fontSize: 36, lineHeight: "42px", color: colors.ink }}>{name}</div>
      <div style={{ fontWeight: 400, fontSize: 24, lineHeight: "30px", color: colors.stone }}>{note}</div>
    </div>
    {tag}
  </div>
);

/** Chat background: sand with a faint dotted pattern, like a chat wallpaper. */
export const ChatWallpaper: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: colors.sand,
      backgroundImage: `radial-gradient(${colors.hairline} 2.5px, transparent 3px)`,
      backgroundSize: "44px 44px",
    }}
  />
);

export const Ticks: React.FC<{ color?: string }> = ({ color = colors.chatGreen }) => (
  <svg width="34" height="22" viewBox="0 0 30 20">
    <path d="M1.5 10.5l5 5L16 4M10.5 14.5l1.5 1.5L21.5 4" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A chat bubble with a tail corner and a small time stamp. Animation comes from the caller via style. */
export const ChatBubble: React.FC<{
  side?: "left" | "right";
  bg: string;
  width: number;
  time?: string;
  ticks?: boolean;
  border?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ side = "left", bg, width, time, ticks, border, style, children }) => {
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
        color: colors.ink,
        transformOrigin: left ? "0% 100%" : "100% 100%",
        ...style,
      }}
    >
      {children}
      {time && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 6, fontWeight: 400, fontSize: 22, color: colors.stone }}>
          {time}
          {ticks && <Ticks />}
        </div>
      )}
    </div>
  );
};
