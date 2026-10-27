import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import "../fonts";
import { colors } from "../tokens";
import { clampRange, lerp, pop } from "../../../engine/src/anim";
import { sec } from "../../../engine/src/timeline";
import { Bubble, ChatScreen, PublishedBubble, S, UndoButton, u } from "../components/chat";
import { ExampleBadge } from "../components/ExampleBadge";
import { KabsiFrame, type VoiceFile } from "../components/Frame";
import { PHONE_SCREEN, PhoneMockup } from "../components/PhoneMockup";
import { TapRing } from "../components/TapRing";
import { COPY } from "./W1.copy";

const T = COPY.screen as {
  clock: string;
  header: { name: string; note: string };
  review: { lead: string; quote: string; suggest: string; draft: string; ask: string };
  buttons: string[];
  yes: string;
  approved: string;
  undo: string;
  published: string;
};

/** A website loop has no voice: KabsiFrame gets an empty voice file. */
const NO_VOICE: VoiceFile = { voice: "none", speed: 1, files: {}, starts: {}, durations: {} };

/** Seconds, the beats of the brief. The chat is empty until the review slides in, and empty again from `gone`. */
const AT = { review: 1.5, tap: 4.5, pressedUntil: 4.8, yes: 4.8, read: 5.2, approved: 5.5, published: 8.0, fadeOut: 11.0, gone: 11.7 };

/** The review is the widest bubble: the long message needs the room at phone width. */
const REVIEW_WIDTH = 0.92;
const ROW_H = u(32);

/**
 * Where the phone sits in each size. The chat is drawn at 1080 x 1920 and, for the wide size, scaled by k about the
 * centre line and moved so the header sits 4 px from the top of the frame, which hides the clock and signal row and the chat runs off its bottom. The status
 * bar and the phone's top edge are cropped off, as the bottom of the phone is. `bottom` is where the chat ends, in
 * pixels from the top of the phone screen, before scaling.
 */
const layoutFor = (width: number, height: number) => {
  if (height > width) return { k: 1, tx: 0, ty: 0, bottom: 1470 - PHONE_SCREEN.y };
  const k = 0.93;
  const headerTop = PHONE_SCREEN.y + u(41.6);
  const ty = 4 - headerTop * k;
  return { k, tx: (width / 2) * (1 - k), ty, bottom: (height - ty) / k - PHONE_SCREEN.y };
};

/**
 * One message in the stack. It grows from nothing to its own height (a grid row going from 0fr to 1fr, which needs no
 * measuring) while it slides up and fades in, so the messages above it scroll away smoothly instead of jumping.
 */
const Row: React.FC<{ atS: number; first?: boolean; children: React.ReactNode }> = ({ atS, first = false, children }) => {
  const frame = useCurrentFrame();
  const g = Easing.out(Easing.cubic)(clampRange(frame, sec(atS), sec(atS + 0.45)));
  const p = pop(frame, atS);
  return (
    <div style={{ display: "grid", gridTemplateRows: `${g}fr`, flexShrink: 0, overflow: g < 1 ? "hidden" : "visible", marginTop: first ? 0 : -(1 - g) * u(6) }}>
      <div style={{ minHeight: 0, opacity: Math.min(1, p * 3), transform: `translateY(${lerp(p, 10 * S, 0)}px)` }}>{children}</div>
    </div>
  );
};

export const W1: React.FC<{ safeZoneDebug?: boolean }> = ({ safeZoneDebug = false }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { k, tx, ty, bottom } = layoutFor(width, height);
  const at = (s: number) => frame >= sec(s);

  // Where the Yes button is, in the drawing's own pixels, then in frame pixels.
  const cell = (PHONE_SCREEN.w * REVIEW_WIDTH - 2 * u(4)) / 3;
  const yes = { x: PHONE_SCREEN.x + u(8) + cell / 2, y: PHONE_SCREEN.y + bottom - u(8) - ROW_H / 2 };
  const ring = { x: tx + yes.x * k, y: ty + yes.y * k };

  /** The whole conversation eases away at the end, so the last frame is the empty chat the video opens on. */
  const out = clampRange(frame, sec(AT.fadeOut), sec(AT.gone));
  const eased = Easing.inOut(Easing.cubic)(out);

  return (
    <KabsiFrame copy={COPY} voice={NO_VOICE} safeZoneDebug={safeZoneDebug}>
      <AbsoluteFill style={{ background: colors.night, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${k})` }}>
          <PhoneMockup>
            <ChatScreen clock={T.clock} name={T.header.name} note={T.header.note} tag={<ExampleBadge quiet scale={S} />} bottom={bottom}>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: u(6), opacity: 1 - eased, transform: `translateY(${-u(10) * eased}px)` }}>
                {at(AT.review) && !at(AT.gone) && (
                  <Row atS={AT.review} first>
                    <Bubble
                      buttons={T.buttons}
                      pressed={at(AT.tap) && !at(AT.pressedUntil) ? T.yes : undefined}
                      maxWidth={`${REVIEW_WIDTH * 100}%`}
                    >
                      <span style={{ display: "block" }}>
                        {T.review.lead} <span style={{ fontWeight: 700 }}>{T.review.quote}</span>
                      </span>
                      <span style={{ display: "block", marginTop: u(4) }}>
                        {T.review.suggest} <span style={{ fontWeight: 700 }}>{T.review.draft}</span> {T.review.ask}
                      </span>
                    </Bubble>
                  </Row>
                )}
                {at(AT.yes) && !at(AT.gone) && (
                  <Row atS={AT.yes}>
                    <Bubble out read={at(AT.read)}>
                      {T.yes}
                    </Bubble>
                  </Row>
                )}
                {at(AT.approved) && !at(AT.gone) && (
                  <Row atS={AT.approved}>
                    <Bubble>
                      {T.approved}
                      <div>
                        <UndoButton label={T.undo} />
                      </div>
                    </Bubble>
                  </Row>
                )}
                {at(AT.published) && !at(AT.gone) && (
                  <Row atS={AT.published}>
                    <PublishedBubble text={T.published} />
                  </Row>
                )}
              </div>
            </ChatScreen>
          </PhoneMockup>
        </div>
        <TapRing x={ring.x} y={ring.y} atS={AT.tap} size={110 * k} />
      </AbsoluteFill>
    </KabsiFrame>
  );
};
