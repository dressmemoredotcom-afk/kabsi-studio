import React from "react";
import { alpha, colors, fonts, radii } from "../tokens";
import { PHONE_SCREEN } from "./PhoneMockup";
import { LogoMark } from "./Logo";

// The chat follows the design studio's demo chat (kabsi/docs/whatsapp.tsx and its two screenshots): status bar, header
// with the mark, a dotted ground that stacks from the bottom, an incoming bubble with a tail and a row of three buttons,
// the owner's Yes as an outgoing bubble with ticks, Approved with Undo, then Published. Sizes are the studio's phone
// sizes times S, so the proportions match. Colours are the kit's nine, and the shapes are Kabsi's own to the studio's
// drawing: no WhatsApp green, no WhatsApp blue, no WhatsApp glyph.

/** The studio draws its phone chat at 310 px of screen width; ours is 836 px. */
export const S = 2.7;
export const u = (n: number) => n * S;

/** The phone clock and every chat time agree. */
export const CLOCK = "11:40";

/** Secondary text on the paper chat: ink at 62 percent, the studio's grey time stamp. */
export const SUBTLE = alpha(colors.ink, 0.62);
const BUBBLE_SHADOW = `0 ${u(1)}px ${u(0.5)}px ${alpha(colors.ink, 0.13)}`;
/** Manrope's alternates the website body uses. */
const BODY_FEATURES = '"ss01", "cv11"';

const Icon: React.FC<{ size: number; color: string; strokeWidth?: number; children: React.ReactNode }> = ({ size, color, strokeWidth = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/** The phone's status bar: clock on the left, signal bars and battery on the right. */
export const ChatStatusBar: React.FC<{ clock: string }> = ({ clock }) => (
  <div
    style={{
      height: u(41.6),
      flexShrink: 0,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      boxSizing: "border-box",
      padding: `0 11% ${u(4)}px`,
      fontFamily: fonts.body,
      fontWeight: 700,
      fontSize: u(11),
      lineHeight: 1,
      color: colors.ink,
    }}
  >
    <span>{clock}</span>
    <span style={{ display: "flex", alignItems: "center", gap: u(4) }}>
      <span style={{ display: "flex", alignItems: "flex-end", gap: u(2) }}>
        {[4, 6, 8, 10].map((h) => (
          <span key={h} style={{ width: u(3), height: u(h), borderRadius: u(1), background: colors.ink }} />
        ))}
      </span>
      <span style={{ marginLeft: u(4), width: u(18), height: u(9), boxSizing: "border-box", borderRadius: u(3), border: `${u(1)}px solid ${colors.ink}`, padding: u(1) }}>
        <span style={{ display: "block", height: "100%", width: "75%", borderRadius: u(1), background: colors.ink }} />
      </span>
    </span>
  </div>
);

/** Chat header: back chevron, the mark (32 px in the studio), name, a line under it, and a tag (the Example badge) at the right. */
export const ChatHeader: React.FC<{ name: string; note: string; tag: React.ReactNode }> = ({ name, note, tag }) => (
  <div
    style={{
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: u(8),
      boxSizing: "border-box",
      padding: `0 ${u(8)}px ${u(8)}px`,
      borderBottom: `${u(1)}px solid ${alpha(colors.ink, 0.1)}`,
      fontFamily: fonts.body,
      color: colors.ink,
    }}
  >
    <Icon size={u(24)} color={colors.ink}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
    <LogoMark height={u(32)} ring={false} />
    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
      <div style={{ fontWeight: 700, fontSize: u(14) }}>{name}</div>
      <div style={{ fontWeight: 500, fontSize: u(11), color: SUBTLE }}>{note}</div>
    </div>
    {tag}
  </div>
);

/**
 * The whole chat screen: status bar, header, then the ground, which stacks its messages from the bottom up and clips
 * what scrolls past the header, as the studio's does. `bottom` is where the chat ends, in pixels from the top of the
 * phone screen; below it the screen is plain paper, which is where captions sit.
 */
export const ChatScreen: React.FC<{
  clock: string;
  name: string;
  note: string;
  tag: React.ReactNode;
  bottom: number;
  children: React.ReactNode;
}> = ({ clock, name, note, tag, bottom, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_SCREEN.w, height: bottom, display: "flex", flexDirection: "column", background: colors.paper, fontFeatureSettings: BODY_FEATURES }}>
    <ChatStatusBar clock={clock} />
    <ChatHeader name={name} note={note} tag={tag} />
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: u(6),
        overflow: "hidden",
        padding: `${u(8)}px 0`,
        backgroundColor: colors.paper,
        backgroundImage: `radial-gradient(${alpha(colors.ink, 0.07)} ${u(1)}px, transparent ${u(1.2)}px), linear-gradient(${alpha(colors.ink, 0.045)}, ${alpha(colors.ink, 0.045)})`,
        backgroundSize: `${u(14)}px ${u(14)}px, auto`,
      }}
    >
      {children}
    </div>
    {/* The screen under the chat is the same paper, so the chat does not end in a hard edge. */}
    <div style={{ position: "absolute", left: 0, top: bottom, width: PHONE_SCREEN.w, height: 2100, background: colors.paper }} />
  </div>
);

/** The "Today" chip at the top of the conversation. */
export const DayChip: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      alignSelf: "center",
      marginBottom: u(4),
      padding: `${u(2)}px ${u(8)}px`,
      borderRadius: u(10),
      background: alpha(colors.paper, 0.9),
      boxShadow: BUBBLE_SHADOW,
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: u(11),
      lineHeight: 1.35,
      color: SUBTLE,
    }}
  >
    {label}
  </div>
);

/** Two ticks: read (full ink) or only delivered (soft). */
export const Ticks: React.FC<{ read: boolean; color: string }> = ({ read, color }) => (
  <Icon size={u(16)} color={read ? color : alpha(color, 0.62)}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </Icon>
);

/**
 * A chat bubble the studio's way: an 8 px corner radius with the corner nearest the sender square and a small tail on
 * it, the time at the bottom right (with ticks on the owner's), and an optional row of three buttons under it.
 * Incoming bubbles are paper, the owner's are yellow. Animation comes from the caller through `style`.
 */
export const Bubble: React.FC<{
  out?: boolean;
  time?: string;
  read?: boolean;
  buttons?: readonly string[];
  /** The button that shows pressed. */
  pressed?: string;
  /** Widest the bubble grows, as a share of the screen. The studio's is 86 percent. */
  maxWidth?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ out = false, time = CLOCK, read = false, buttons, pressed, maxWidth = "86%", style, children }) => {
  const bg = out ? colors.yellow : colors.paper;
  const timeColor = out ? alpha(colors.ink, 0.7) : SUBTLE;
  return (
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", flexShrink: 0, ...style }}>
      <div style={{ position: "relative", maxWidth, marginLeft: out ? 0 : u(8), marginRight: out ? u(8) : 0 }}>
        <span
          style={{
            position: "absolute",
            top: 0,
            width: u(10),
            height: u(10),
            background: bg,
            ...(out ? { right: -u(8), clipPath: "polygon(0 0, 100% 0, 0 100%)" } : { left: -u(8), clipPath: "polygon(0 0, 100% 0, 100% 100%)" }),
          }}
        />
        <div
          style={{
            position: "relative",
            boxSizing: "border-box",
            padding: `${u(6)}px ${u(8)}px ${u(4)}px`,
            borderRadius: u(8),
            ...(out ? { borderTopRightRadius: 0 } : { borderTopLeftRadius: 0 }),
            background: bg,
            boxShadow: BUBBLE_SHADOW,
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: u(14),
            lineHeight: 1.4,
            color: colors.ink,
          }}
        >
          {children}
          <span style={{ float: "right", marginLeft: u(8), marginTop: u(4), transform: `translateY(${u(2)}px)`, display: "inline-flex", alignItems: "center", gap: u(2), fontSize: u(11), lineHeight: 1, color: timeColor }}>
            {time}
            {out && <Ticks read={read} color={colors.ink} />}
          </span>
          <span style={{ display: "block", clear: "both" }} />
        </div>
        {buttons && (
          <div style={{ marginTop: u(4), display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: u(4) }}>
            {buttons.map((label) => (
              <span
                key={label}
                style={{
                  display: "grid",
                  placeItems: "center",
                  height: u(32),
                  borderRadius: u(8),
                  backgroundColor: colors.paper,
                  backgroundImage: pressed === label ? `linear-gradient(${alpha(colors.ink, 0.12)}, ${alpha(colors.ink, 0.12)})` : undefined,
                  boxShadow: BUBBLE_SHADOW,
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: u(14),
                  color: colors.ink,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/** The Undo button inside the Approved bubble: an outlined button with the rotate-back icon, as in the studio's second screenshot. */
export const UndoButton: React.FC<{ label: string }> = ({ label }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: u(6),
      marginTop: u(8),
      height: u(32),
      boxSizing: "border-box",
      padding: `0 ${u(12)}px`,
      borderRadius: u(8),
      border: `${u(1)}px solid ${alpha(colors.ink, 0.15)}`,
      backgroundColor: colors.paper,
      fontWeight: 600,
      fontSize: u(14),
    }}
  >
    <Icon size={u(16)} color={colors.ink}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </Icon>
    {label}
  </span>
);

/** "Published on your Google profile." with the green check, the design studio's published bubble. */
export const PublishedBubble: React.FC<{ text: string; time?: string; style?: React.CSSProperties }> = ({ text, time, style }) => (
  <Bubble time={time} style={style}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: u(6) }}>
      <span style={{ display: "grid", placeItems: "center", width: u(16), height: u(16), flexShrink: 0, borderRadius: radii.pill, background: colors.green }}>
        <Icon size={u(12)} color={colors.paper} strokeWidth={3.5}>
          <path d="M20 6 9 17l-5-5" />
        </Icon>
      </span>
      {text}
    </span>
  </Bubble>
);

/**
 * A notification banner on frosted glass, as on the studio's lock screen: the mark, "Kabsi:" and the first words, and
 * "now" at the right. Position and animation come from the caller.
 */
export const NotificationBanner: React.FC<{
  width: number;
  sender: string;
  text: string;
  time: string;
  style?: React.CSSProperties;
}> = ({ width, sender, text, time, style }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      gap: u(8),
      padding: u(10),
      borderRadius: u(17.6),
      background: alpha(colors.paper, 0.9),
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: `0 ${u(8)}px ${u(24)}px ${alpha(colors.night, 0.25)}`,
      fontFamily: fonts.body,
      color: colors.ink,
      ...style,
    }}
  >
    <LogoMark height={u(32)} ring={false} />
    <p style={{ margin: 0, flex: 1, minWidth: 0, fontWeight: 500, fontSize: u(14), lineHeight: 1.375 }}>
      <span style={{ fontWeight: 700 }}>{sender}</span> {text}
    </p>
    <span style={{ alignSelf: "flex-start", fontSize: u(11), color: SUBTLE }}>{time}</span>
  </div>
);
