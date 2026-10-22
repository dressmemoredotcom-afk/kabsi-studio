import React from "react";
import { SCREEN as COPY } from "../script02";
import { alpha, colors, fonts, radii } from "../tokens";
import { clampRange, lerp, pop } from "../../../core/anim";
import { Check, FingerDot } from "../ui";
import { Bubble, ChatHeader, Composer } from "./Chat";
import { BOUNCE, SLAM } from "./spring";
import { wordTime } from "./timeline";

export const protectTapAt = () => wordTime("protect", "so you can") + 0.1;

const row = (label: string, value: string, bad: boolean, shake = 0): React.ReactNode => (
  <div
    style={{
      transform: `translateX(${shake}px)`,
      height: 72,
      boxSizing: "border-box",
      borderRadius: radii.card,
      background: colors.white,
      border: `2px solid ${bad ? colors.red : colors.hairline}`,
      display: "flex",
      alignItems: "center",
      gap: 22,
      padding: "0 22px",
      fontFamily: fonts.body,
    }}
  >
    <div style={{ width: 90, fontWeight: 500, fontSize: 28, color: colors.stone }}>{label}</div>
    <div style={{ fontWeight: 600, fontSize: 34, color: bad ? colors.red : colors.ink }}>{value}</div>
  </div>
);

/** Scene 4: soft red alert in the chat, finger taps Revert Change, the screen turns green. */
export const ProtectScene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const alertAt = 16.2;
  const tapAt = protectTapAt();
  const fingerT = pop(frame, tapAt - 0.8, { damping: 16, stiffness: 150, mass: 0.8 });
  const fingerOut = clampRange(t, tapAt + 0.25, tapAt + 0.5);
  const press = clampRange(t, tapAt, tapAt + 0.08) - clampRange(t, tapAt + 0.08, tapAt + 0.22);
  const ripple = clampRange(t, tapAt, tapAt + 0.4);
  const target = { x: 620, y: 614 };

  // Two quick red flashes after the alert lands.
  const sinceAlert = t - alertAt;
  const catchAt = wordTime("protect", "unauthorized");
  const sinceCatch = t - catchAt;
  const flash =
    sinceAlert > 0 && sinceAlert < 1.2
      ? Math.max(0, Math.sin(sinceAlert * Math.PI * 2.5))
      : sinceCatch > 0 && sinceCatch < 0.8
        ? Math.max(0, Math.sin(sinceCatch * Math.PI * 3.75))
        : 0;
  const shake = sinceCatch > 0 && sinceCatch < 0.7 ? Math.sin(sinceCatch * 60) * 14 * (1 - sinceCatch / 0.7) : 0;

  const wash = pop(frame, tapAt + 0.05, { damping: 18, stiffness: 120, mass: 1 });
  const check = pop(frame, tapAt + 0.25, SLAM);
  const text = pop(frame, tapAt + 0.4, BOUNCE);
  const [alertLabel, ...alertRest] = COPY.protect.alert.split(": ");

  return (
    <>
      <Bubble
        frame={frame}
        at={alertAt}
        top={240}
        width={760}
        bg={`${alpha(colors.red, 0.1 + flash * 0.2)}`}
        border={colors.red}
      >
        <div style={{ height: 112, fontWeight: 600, fontSize: 44, lineHeight: "56px" }}>
          <span style={{ color: colors.red }}>{alertLabel}:</span> {alertRest.join(": ")}
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {row(COPY.protect.wasLabel, COPY.protect.wasValue, false)}
          {row(COPY.protect.nowLabel, COPY.protect.nowValue, true, shake)}
        </div>
        <div
          style={{
            marginTop: 20,
            height: 92,
            borderRadius: radii.card,
            background: colors.black,
            color: colors.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 40,
            transform: `scale(${1 - 0.05 * press})`,
          }}
        >
          {COPY.protect.button}
        </div>
      </Bubble>

      <FingerDot
        x={target.x + lerp(1 - fingerT, 0, 260)}
        y={target.y + lerp(1 - fingerT, 0, 220)}
        scale={1 - 0.2 * press}
        opacity={clampRange(fingerT, 0, 0.3) * (1 - fingerOut)}
        ripple={ripple}
      />

      {wash > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 197,
            width: 844,
            height: 2000,
            background: colors.green,
            clipPath: `circle(${wash * 2200}px at ${target.x}px ${target.y - 197}px)`,
            zIndex: 3,
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", color: colors.white }}>
            <div style={{ opacity: clampRange(check, 0, 0.3), transform: `scale(${lerp(check, 0.2, 1)}) rotate(${lerp(check, -20, 0)}deg)` }}>
              <Check size={220} color={colors.white} stroke={colors.green} />
            </div>
            <div
              style={{
                marginTop: 26,
                fontFamily: fonts.title,
                fontSize: 128,
                lineHeight: "130px",
                opacity: clampRange(text, 0, 0.3),
                transform: `translateY(${lerp(text, 60, 0)}px) scale(${lerp(text, 0.6, 1)})`,
              }}
            >
              {COPY.protect.doneTitle}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: 42,
                opacity: clampRange(text, 0, 0.3),
              }}
            >
              {COPY.protect.doneNote}
            </div>
          </div>
        </div>
      )}
      <ChatHeader />
      <Composer />
    </>
  );
};

export const protectBeats = () => [16.2, wordTime("protect", "unauthorized"), protectTapAt() + 0.05];
