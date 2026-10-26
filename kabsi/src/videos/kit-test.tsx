import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import "../fonts";
import { colors, fonts, radii } from "../tokens";
import { pop, lerp, clampRange } from "../../../engine/src/anim";
import { sec } from "../../../engine/src/timeline";
import { ChatBubble, ChatHeaderBar, ChatWallpaper } from "../components/chat";
import { EndCard } from "../components/EndCard";
import { ExampleBadge } from "../components/ExampleBadge";
import { KabsiFrame, type VoiceFile } from "../components/Frame";
import { Logo } from "../components/Logo";
import { PHONE_SCREEN, PhoneMockup } from "../components/PhoneMockup";
import { TapRing } from "../components/TapRing";
import voice from "../generated/voice/kit-test.json";
import { COPY } from "./kit-test.copy";

const S = COPY.screen as {
  header: { name: string; note: string };
  review: { label: string; text: string; time: string };
  reply: { label: string; text: string; time: string };
  yes: string;
  published: string;
};

/** Seconds, on the clock of the whole video. The demo runs for 7 seconds, then the end card. */
const AT = { review: 0.2, reply: 2.2, yesButton: 3.6, tap: 4.9, yesBubble: 5.3, published: 6.1, demoEnd: 7 };
/** The Yes button on the phone screen, and where its tap lands in the frame. */
const BUTTON = { left: 26, top: 780, w: 340, h: 120 };
const TAP = { x: PHONE_SCREEN.x + BUTTON.left + BUTTON.w / 2, y: PHONE_SCREEN.y + BUTTON.top + BUTTON.h / 2, atS: AT.tap };

const label: React.CSSProperties = { fontWeight: 700, fontSize: 26, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 };
const text: React.CSSProperties = { fontWeight: 600, fontSize: 38, lineHeight: "52px" };

const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = (atS: number) => {
    const p = pop(frame, atS);
    return { opacity: Math.min(1, p * 3), transform: `scale(${lerp(p, 0.85, 1)}) translateY(${lerp(p, 24, 0)}px)` };
  };
  const press = clampRange(frame, sec(AT.tap), sec(AT.tap + 0.15), 1, 0.94);
  const buttonGone = frame >= sec(AT.yesBubble);
  return (
    <AbsoluteFill style={{ background: colors.night }}>
      <PhoneMockup>
        <ChatWallpaper />
        <ChatHeaderBar
          width={PHONE_SCREEN.w}
          avatar={
            <div style={{ width: 68, height: 68, borderRadius: radii.pill, background: colors.night, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Logo kind="mark" height={46} allowMissing />
            </div>
          }
          name={S.header.name}
          note={S.header.note}
          tag={<ExampleBadge />}
        />
        <ChatBubble bg={colors.carbon} color={colors.paper} width={680} time={S.review.time} style={{ top: 250, ...shown(AT.review) }}>
          <div style={{ ...label, color: colors.mute }}>{S.review.label}</div>
          <div style={text}>{S.review.text}</div>
        </ChatBubble>
        <ChatBubble bg={colors.carbon} color={colors.paper} width={740} time={S.reply.time} style={{ top: 470, ...shown(AT.reply) }}>
          <div style={{ ...label, color: colors.mute }}>{S.reply.label}</div>
          <div style={text}>{S.reply.text}</div>
        </ChatBubble>
        {!buttonGone && (
          <div
            style={{
              position: "absolute",
              left: BUTTON.left,
              top: BUTTON.top,
              width: BUTTON.w,
              height: BUTTON.h,
              borderRadius: radii.pill,
              background: colors.yellow,
              color: colors.ink,
              fontFamily: fonts.title,
              fontWeight: 700,
              fontSize: 54,
              lineHeight: `${BUTTON.h}px`,
              textAlign: "center",
              ...shown(AT.yesButton),
              transform: `${shown(AT.yesButton).transform} scale(${press})`,
            }}
          >
            {S.yes}
          </div>
        )}
        <ChatBubble side="right" bg={colors.yellow} width={240} style={{ top: BUTTON.top, ...shown(AT.yesBubble) }}>
          <div style={{ ...text, fontFamily: fonts.title, fontWeight: 700, textAlign: "center" }}>{S.yes}</div>
        </ChatBubble>
        <ChatBubble bg={colors.green} color={colors.paper} width={640} style={{ top: BUTTON.top + 170, ...shown(AT.published) }}>
          <div style={{ ...text, fontSize: 36, lineHeight: "48px" }}>{S.published}</div>
        </ChatBubble>
      </PhoneMockup>
    </AbsoluteFill>
  );
};

/**
 * The kit test: a 10 second social video that uses every part of the kit once. A made-up reply for an Example
 * business, the owner's Yes with its tap ring, burned-in captions from the voice lines, and the 3 second end card.
 */
export const KitTest: React.FC<{ safeZoneDebug?: boolean }> = ({ safeZoneDebug = false }) => (
  <KabsiFrame copy={COPY} voice={voice as VoiceFile} taps={[TAP]} safeZoneDebug={safeZoneDebug}>
    <Sequence durationInFrames={sec(AT.demoEnd)}>
      <Demo />
      <TapRing x={TAP.x} y={TAP.y} atS={TAP.atS} />
    </Sequence>
    <EndCard totalS={COPY.seconds} smallPrint allowMissingLogo />
  </KabsiFrame>
);
