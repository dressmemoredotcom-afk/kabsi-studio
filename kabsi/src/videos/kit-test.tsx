import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import "../fonts";
import { colors } from "../tokens";
import { pop, lerp } from "../../../engine/src/anim";
import { sec } from "../../../engine/src/timeline";
import { Bubble, ChatScreen, DayChip, PublishedBubble, S, UndoButton, u } from "../components/chat";
import { EndCard } from "../components/EndCard";
import { ExampleBadge } from "../components/ExampleBadge";
import { KabsiFrame, type VoiceFile } from "../components/Frame";
import { PHONE_SCREEN, PhoneMockup } from "../components/PhoneMockup";
import { TapRing } from "../components/TapRing";
import voice from "../generated/voice/kit-test.json";
import { COPY } from "./kit-test.copy";

const T = COPY.screen as {
  clock: string;
  today: string;
  header: { name: string; note: string };
  review: { business: string; intro: string; quote: string; ready: string; draft: string; cta: string };
  buttons: string[];
  yes: string;
  approved: string;
  undo: string;
  published: string;
};

/** Seconds, on the clock of the whole video. The demo runs for 7 seconds, then the end card. */
const AT = { review: 0.2, tap: 4.6, pressedUntil: 4.9, yes: 4.9, read: 5.3, approved: 5.3, published: 6.2, demoEnd: 7 };
/** The chat ends 46 px above the caption slot. Everything below it on the phone screen is plain paper. */
const CHAT_BOTTOM = 1290 - PHONE_SCREEN.y;
/**
 * Where the Yes button sits when the review is the only bubble: the chat stacks from the bottom, so the button row is
 * at the foot of the chat. Its first cell is 86 percent of the width, less the margin, divided by three.
 */
const ROW_H = u(32);
const CELL_W = (PHONE_SCREEN.w * 0.86 - u(8) - 2 * u(4)) / 3 + 0;
const TAP = { x: PHONE_SCREEN.x + u(8) + CELL_W / 2, y: PHONE_SCREEN.y + CHAT_BOTTOM - u(8) - ROW_H / 2, atS: AT.tap };

const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number) => frame >= sec(s);
  const shown = (s: number): React.CSSProperties => {
    const p = pop(frame, s);
    return { opacity: Math.min(1, p * 3), transform: `translateY(${lerp(p, 6 * S, 0)}px) scale(${lerp(p, 0.96, 1)})` };
  };
  return (
    <AbsoluteFill style={{ background: colors.night }}>
      <PhoneMockup>
        <ChatScreen clock={T.clock} name={T.header.name} note={T.header.note} tag={<ExampleBadge quiet scale={S} />} bottom={CHAT_BOTTOM}>
          {at(AT.review) && <DayChip label={T.today} />}
          {at(AT.review) && (
            <Bubble buttons={T.buttons} pressed={at(AT.tap) && !at(AT.pressedUntil) ? T.yes : undefined} style={shown(AT.review)}>
              <span style={{ fontWeight: 700 }}>{T.review.business}</span> {T.review.intro} <span style={{ fontStyle: "italic" }}>{T.review.quote}</span>
              <span style={{ display: "block", marginTop: u(4) }}>
                {T.review.ready} {T.review.draft} {T.review.cta}
              </span>
            </Bubble>
          )}
          {at(AT.yes) && (
            <Bubble out read={at(AT.read)} style={shown(AT.yes)}>
              {T.yes}
            </Bubble>
          )}
          {at(AT.approved) && (
            <Bubble style={shown(AT.approved)}>
              {T.approved}
              <div>
                <UndoButton label={T.undo} />
              </div>
            </Bubble>
          )}
          {at(AT.published) && <PublishedBubble text={T.published} style={shown(AT.published)} />}
        </ChatScreen>
      </PhoneMockup>
    </AbsoluteFill>
  );
};

/**
 * The kit test: a 10 second social video that uses every part of the kit once. The design studio's chat for an
 * Example business (review, reply ready with Yes, Edit and Skip, the owner's Yes with its tap ring, Approved with Undo,
 * Published), burned-in captions from the voice lines, and the 3 second end card with the mark and wordmark.
 */
export const KitTest: React.FC<{ safeZoneDebug?: boolean }> = ({ safeZoneDebug = false }) => (
  <KabsiFrame copy={COPY} voice={voice as VoiceFile} taps={[TAP]} safeZoneDebug={safeZoneDebug}>
    <Sequence durationInFrames={sec(AT.demoEnd)}>
      <Demo />
      <TapRing x={TAP.x} y={TAP.y} atS={TAP.atS} size={110} />
    </Sequence>
    <EndCard totalS={COPY.seconds} smallPrint />
  </KabsiFrame>
);
