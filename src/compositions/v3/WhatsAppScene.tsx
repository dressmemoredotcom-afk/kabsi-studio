import React from "react";
import { interpolateColors } from "remotion";
import { SCREEN as COPY } from "../../script03";
import { alpha, colors, fonts, radii } from "../../tokens";
import { clampRange, lerp, pop } from "../../anim";
import { ChatBubble, ChatHeaderBar, ChatWallpaper, NotificationBanner } from "../../components/whatsapp";
import { PHONE_SCREEN } from "../../components/PhoneMockup";
import { Check, ExampleTag, FingerDot, Pill, Stars } from "../../ui";
import { BOUNCE, SNAP } from "../../v2/spring";
import { EV } from "./events";

const W = PHONE_SCREEN.w;
const SLIDE = { damping: 13, stiffness: 300, mass: 0.6 };

/** Beats the phone punches on, in seconds. */
export const waBeats = [EV.wa.bannerAt, EV.wa.openAt + 0.12, EV.wa.replyAt, EV.wa.tapAt, EV.wa.publishAt];

/** Lock screen with a glass notification banner, then the chat: review in, draft reply in, tap Approve, Published. */
export const WhatsAppScene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const { bannerAt, openAt, replyAt, tapAt, publishAt } = EV.wa;

  // Lock screen
  const banner = pop(frame, bannerAt, { damping: 14, stiffness: 280, mass: 0.7 });
  const lockOut = clampRange(t, openAt, openAt + 0.22);

  // Chat
  const chatIn = pop(frame, openAt, SNAP);
  const bubbleA = pop(frame, openAt + 0.12, SLIDE);
  const bubbleB = pop(frame, replyAt, SLIDE);
  const pill = pop(frame, replyAt + 0.3, { damping: 12, stiffness: 320, mass: 0.5 });
  const published = pop(frame, publishAt, BOUNCE);
  const press = clampRange(t, tapAt, tapAt + 0.07) - clampRange(t, tapAt + 0.07, tapAt + 0.2);

  const target = { x: 560, y: 749 };
  const fingerT = pop(frame, tapAt - 0.75, { damping: 16, stiffness: 150, mass: 0.8 });
  const fingerOut = clampRange(t, tapAt + 0.3, tapAt + 0.55);
  const ripple = clampRange(t, tapAt, tapAt + 0.4);

  return (
    <>
      {/* Lock screen */}
      {lockOut < 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - lockOut,
            transform: `scale(${1 + lockOut * 0.08})`,
            background: `radial-gradient(circle at 28% 16%, ${alpha(colors.yellow, 0.5)}, transparent 52%), radial-gradient(circle at 85% 70%, ${alpha(colors.yellowPressed, 0.25)}, transparent 50%), linear-gradient(180deg, ${colors.ink}, ${colors.black})`,
          }}
        >
          <div style={{ position: "absolute", right: 30, top: 94 }}>
            <ExampleTag text={COPY.app.example} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 130,
              textAlign: "center",
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 190,
              lineHeight: "200px",
              color: alpha(colors.white, 0.94),
              letterSpacing: -4,
            }}
          >
            {COPY.lock.time}
          </div>
          <NotificationBanner
            width={W - 56}
            app={COPY.banner.app}
            title={COPY.banner.title}
            time={COPY.banner.time}
            body={COPY.banner.body}
            style={{
              position: "absolute",
              left: 28,
              top: 380,
              opacity: clampRange(banner, 0, 0.3),
              transform: `translateY(${lerp(banner, -420, 0)}px) scale(${lerp(banner, 0.92, 1)})`,
            }}
          />
        </div>
      )}

      {/* Chat */}
      {chatIn > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: clampRange(chatIn, 0, 0.5),
            transform: `scale(${lerp(chatIn, 0.93, 1)})`,
            transformOrigin: "50% 25%",
          }}
        >
          <ChatWallpaper />
          <ChatHeaderBar
            width={W}
            initial={COPY.app.initial}
            name={COPY.app.chatName}
            note={COPY.app.chatNote}
            tag={<ExampleTag text={COPY.app.example} />}
          />

          <ChatBubble
            bg={colors.chatGreen}
            width={640}
            time={COPY.chat.time}
            style={{ top: 238, opacity: clampRange(bubbleA, 0, 0.3), transform: `translateX(${lerp(bubbleA, -160, 0)}px) scale(${lerp(bubbleA, 0.7, 1)})` }}
          >
            <div style={{ fontWeight: 600, fontSize: 36, lineHeight: "44px" }}>{COPY.chat.reviewTitle}</div>
            <div style={{ margin: "8px 0 10px" }}>
              <Stars filled={5} size={38} />
            </div>
            <div style={{ fontWeight: 500, fontSize: 32, lineHeight: "42px", textWrap: "balance" } as React.CSSProperties}>
              {COPY.chat.reviewText}
            </div>
          </ChatBubble>

          <ChatBubble
            bg={colors.white}
            width={720}
            time={COPY.chat.time}
            border={interpolateColors(published, [0, 1], [colors.white, colors.green])}
            style={{
              top: 534,
              opacity: clampRange(bubbleB, 0, 0.3),
              transform: `translateX(${lerp(bubbleB, -160, 0)}px) scale(${lerp(bubbleB, 0.7, 1)})`,
            }}
          >
            <div style={{ position: "relative", height: 38 }}>
              <div style={{ position: "absolute", left: 0, top: 0, opacity: pill * (1 - published), transform: `scale(${lerp(pill, 0.6, 1)})`, transformOrigin: "left center" }}>
                <Pill text={COPY.chat.draftPill} bg={colors.yellow} color={colors.ink} />
              </div>
              <div style={{ position: "absolute", left: 0, top: 0, opacity: published }}>
                <Pill text={COPY.chat.published} bg={colors.green} color={colors.white} icon={<Check size={26} color={colors.white} stroke={colors.green} />} />
              </div>
            </div>
            <div style={{ marginTop: 12, height: 88, fontWeight: 400, fontSize: 32, lineHeight: "44px" }}>{COPY.chat.draftText}</div>
            <div style={{ position: "relative", marginTop: 16, height: 78 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radii.card,
                  background: press > 0.5 ? colors.yellowPressed : colors.yellow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 38,
                  opacity: 1 - published,
                  transform: `scale(${1 - 0.05 * press})`,
                }}
              >
                {COPY.chat.approve}
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: published,
                  transform: `scale(${lerp(published, 0.9, 1)})`,
                  transformOrigin: "left center",
                  fontWeight: 600,
                  fontSize: 32,
                  color: colors.green,
                }}
              >
                <Check size={52} />
                {COPY.chat.publishedNote}
              </div>
            </div>
          </ChatBubble>

          <FingerDot
            x={target.x + lerp(1 - fingerT, 0, 260)}
            y={target.y + lerp(1 - fingerT, 0, 220)}
            scale={1 - 0.2 * press}
            opacity={clampRange(fingerT, 0, 0.3) * (1 - fingerOut)}
            ripple={ripple}
          />
        </div>
      )}
    </>
  );
};
