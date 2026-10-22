import React from "react";
import { SCREEN as COPY } from "../script02";
import { colors, fonts, radii, shadows } from "../tokens";
import { clampRange, lerp, pop } from "../../../core/anim";
import { Check, ExampleTag, FingerDot, Pill, Stars } from "../ui";
import { BOUNCE, SLAM, SNAP } from "./spring";
import { wordTime } from "./timeline";

/** Chat header: Kabsi avatar and name on the left, Example tag in the corner. Sits above the scrolling chat. */
export const ChatHeader: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 80,
      width: 844,
      height: 116,
      boxSizing: "border-box",
      padding: "0 28px",
      display: "flex",
      alignItems: "center",
      gap: 20,
      background: colors.white,
      borderBottom: `2px solid ${colors.hairline}`,
      fontFamily: fonts.body,
      zIndex: 4,
    }}
  >
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: radii.pill,
        background: colors.yellow,
        color: colors.ink,
        fontFamily: fonts.title,
        fontSize: 48,
        lineHeight: "76px",
        textAlign: "center",
      }}
    >
      {COPY.app.initial}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, fontSize: 36, lineHeight: "42px", color: colors.ink }}>{COPY.app.chatName}</div>
      <div style={{ fontWeight: 400, fontSize: 24, lineHeight: "30px", color: colors.stone }}>{COPY.app.chatNote}</div>
    </div>
    <ExampleTag text={COPY.app.example} />
  </div>
);

/** Message box at the bottom of the chat. Drawn shapes only, no text. */
export const Composer: React.FC = () => (
  <div style={{ position: "absolute", left: 28, top: 1130, width: 788, height: 84, display: "flex", gap: 16 }}>
    <div style={{ flex: 1, borderRadius: radii.pill, background: colors.white, border: `2px solid ${colors.hairline}`, display: "flex", alignItems: "center", padding: "0 32px" }}>
      <div style={{ width: 240, height: 18, borderRadius: radii.pill, background: colors.hairline }} />
    </div>
    <div style={{ width: 84, height: 84, borderRadius: radii.pill, background: colors.chatGreen, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path d="M3 12l17-8-6 17-3-7z" fill={colors.ink} />
      </svg>
    </div>
  </div>
);

type BubbleProps = {
  frame: number;
  at: number;
  top: number;
  width: number;
  side?: "left" | "right";
  bg: string;
  border?: string;
  children: React.ReactNode;
  pad?: number;
};

/** A chat bubble that pops in from its tail corner. */
export const Bubble: React.FC<BubbleProps> = ({ frame, at, top, width, side = "left", bg, border, children, pad = 24 }) => {
  const p = pop(frame, at, BOUNCE);
  if (p <= 0) return null;
  const left = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: left ? 28 : undefined,
        right: left ? undefined : 28,
        width,
        boxSizing: "border-box",
        padding: pad,
        background: bg,
        border: border ? `3px solid ${border}` : "none",
        borderRadius: left ? `${radii.large}px ${radii.large}px ${radii.large}px 6px` : `${radii.large}px ${radii.large}px 6px ${radii.large}px`,
        boxShadow: shadows.card,
        fontFamily: fonts.body,
        color: colors.ink,
        opacity: clampRange(p, 0, 0.35),
        transform: `translateY(${lerp(p, 50, 0)}px) scale(${lerp(p, 0.5, 1)})`,
        transformOrigin: left ? "0% 100%" : "100% 100%",
      }}
    >
      {children}
    </div>
  );
};

const sticker: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  zIndex: 6,
  pointerEvents: "none",
};

/** Scene 2: the whole job happens in a chat. Review alert, drafted reply, finger approves, no dashboards. */
export const WhatsappScene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const aAt = 3.5;
  const bAt = 4.5;
  const tapAt = 6.0;
  const scrollAt = tapAt + 0.25;
  const cAt = tapAt + 0.2;
  const dAt = tapAt + 0.7;
  const s1At = wordTime("whatsapp", "No dashboards");
  const s2At = wordTime("whatsapp", "No logins");

  const scroll = lerp(pop(frame, scrollAt, SNAP), 0, 280);
  const press = clampRange(t, tapAt, tapAt + 0.08) - clampRange(t, tapAt + 0.08, tapAt + 0.22);
  const target = { x: 560, y: 709 };
  const fingerT = pop(frame, tapAt - 0.7, { damping: 16, stiffness: 150, mass: 0.8 });
  const fingerOut = clampRange(t, tapAt + 0.3, tapAt + 0.55);
  const ripple = clampRange(t, tapAt, tapAt + 0.4);

  const stickerEl = (text: string, at: number, y: number, tilt: number) => {
    const p = pop(frame, at, SLAM);
    if (p <= 0) return null;
    return (
      <div style={{ ...sticker, top: y }}>
        <div
          style={{
            padding: "10px 36px 14px",
            borderRadius: radii.large,
            background: colors.yellow,
            color: colors.ink,
            border: `5px solid ${colors.ink}`,
            boxShadow: shadows.lifted,
            fontFamily: fonts.title,
            fontSize: 74,
            lineHeight: "84px",
            opacity: clampRange(p, 0, 0.3),
            transform: `rotate(${lerp(p, tilt * 4, tilt)}deg) scale(${lerp(p, 0.2, 1)})`,
          }}
        >
          {text}
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(196px 0 0 0)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll}px)` }}>
        <Bubble frame={frame} at={aAt} top={240} width={640} bg={colors.chatGreen}>
          <div style={{ fontWeight: 600, fontSize: 36, lineHeight: "44px" }}>{COPY.chat.reviewTitle}</div>
          <div style={{ margin: "8px 0 10px" }}>
            <Stars filled={5} size={38} />
          </div>
          <div style={{ fontWeight: 500, fontSize: 32, lineHeight: "42px", textWrap: "balance" } as React.CSSProperties}>
            {COPY.chat.reviewText}
          </div>
        </Bubble>

        <Bubble frame={frame} at={bAt} top={496} width={720} bg={colors.white}>
          <div style={{ height: 38, display: "flex" }}>
            <Pill text={COPY.chat.draftPill} bg={colors.yellow} color={colors.ink} />
          </div>
          <div style={{ marginTop: 12, height: 88, fontWeight: 400, fontSize: 32, lineHeight: "44px" }}>{COPY.chat.draftText}</div>
          <div
            style={{
              marginTop: 16,
              height: 78,
              borderRadius: radii.card,
              background: press > 0.5 ? colors.yellowPressed : colors.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 38,
              transform: `scale(${1 - 0.05 * press})`,
            }}
          >
            {COPY.chat.approve}
          </div>
        </Bubble>

        <Bubble frame={frame} at={cAt} top={794} width={290} side="right" bg={colors.chatGreen} pad={20}>
          <div style={{ fontWeight: 600, fontSize: 34, lineHeight: "40px", textAlign: "center" }}>{COPY.chat.sent}</div>
        </Bubble>

        <Bubble frame={frame} at={dAt} top={888} width={560} bg={colors.white} pad={20}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 600, fontSize: 32, lineHeight: "40px" }}>
            <Check size={44} />
            {COPY.chat.done}
          </div>
        </Bubble>

        <FingerDot
          x={target.x + lerp(1 - fingerT, 0, 260)}
          y={target.y + lerp(1 - fingerT, 0, 220)}
          scale={1 - 0.2 * press}
          opacity={clampRange(fingerT, 0, 0.3) * (1 - fingerOut)}
          ripple={ripple}
        />
      </div>
      </div>
      <ChatHeader />
      <Composer />
      {stickerEl(COPY.chat.stickers[0], s1At, 330, -5)}
      {stickerEl(COPY.chat.stickers[1], s2At, 470, 4)}
    </>
  );
};

export const whatsappBeats = [3.5, 4.5, 6.0 + 0.2, 6.0 + 0.7, wordTime("whatsapp", "No dashboards"), wordTime("whatsapp", "No logins")];
