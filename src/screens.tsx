import React from "react";
import { interpolateColors } from "remotion";
import { SCREEN as COPY } from "./script";
import { colors, fonts, radii } from "./tokens";
import { clampRange, lerp, pop, soft } from "./anim";
import { sec, wordTime } from "./timeline";
import { Check, ExampleTag, FingerDot, Pill, Shield, Stars, cardBase } from "./ui";

const T = (frame: number) => frame / 30;

/** Fades and slides a screen in on its cut, and out just before the next one. */
export const ScreenSwap: React.FC<{
  frame: number;
  fromF: number;
  toF: number;
  outro?: boolean;
  children: React.ReactNode;
}> = ({ frame, fromF, toF, outro = true, children }) => {
  if (frame < fromF || frame >= toF) return null;
  const inT = pop(frame, fromF / 30);
  const outT = outro ? clampRange(frame, toF - 5, toF - 1) : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(clampRange(inT, 0, 0.6), 1 - outT),
        transform: `translateX(${lerp(1 - inT, 0, 60) - outT * 50}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Business name left, Example tag in the corner. Present on every screen. */
export const AppHeader: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 28,
      top: 104,
      width: 788,
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: fonts.body,
    }}
  >
    <div style={{ fontWeight: 600, fontSize: 34, color: colors.ink }}>{COPY.app.business}</div>
    <ExampleTag text={COPY.app.example} />
  </div>
);

const label: React.CSSProperties = {
  fontFamily: fonts.body,
  fontWeight: 500,
  fontSize: 26,
  lineHeight: "36px",
  color: colors.stone,
};

/** Screen 1 and 2: new review, drafted reply, finger approves, card turns Published. */
export const ReviewFlow: React.FC<{ frame: number }> = ({ frame }) => {
  const t = T(frame);
  const reviewIn = 3.2;
  const replyIn = wordTime("draft", "reply");
  const pillIn = replyIn + 0.45;
  const tapAt = wordTime("approve", "approve");
  const publishAt = tapAt + 0.2;

  const review = pop(frame, reviewIn);
  const reply = pop(frame, replyIn);
  const pill = pop(frame, pillIn, { damping: 14, stiffness: 170, mass: 0.6 });
  const published = soft(frame, publishAt);
  const press = clampRange(t, tapAt, tapAt + 0.12) - clampRange(t, tapAt + 0.12, tapAt + 0.3);

  // Finger travels in from the lower right, taps, then fades.
  const target = { x: 676, y: 758 };
  const fingerT = pop(frame, tapAt - 0.9, { damping: 22, stiffness: 90, mass: 1 });
  const fingerOut = clampRange(t, tapAt + 0.5, tapAt + 0.9);
  const fingerScale = 1 - 0.18 * press;
  const ripple = clampRange(t, tapAt, tapAt + 0.45);

  return (
    <>
      <div
        style={{
          ...cardBase,
          top: 190,
          height: 236,
          padding: 28,
          opacity: clampRange(review, 0, 0.5),
          transform: `translateY(${lerp(1 - review, 0, 50)}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={label}>{COPY.review.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Stars filled={COPY.review.stars} />
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: "52px",
            letterSpacing: -0.2,
            textWrap: "balance",
          }}
        >
          {COPY.review.text}
        </div>
      </div>

      <div
        style={{
          ...cardBase,
          top: 454,
          height: 362,
          padding: 28,
          borderColor: interpolateColors(published, [0, 1], [colors.yellow, colors.green]),
          borderWidth: 3,
          opacity: clampRange(reply, 0, 0.5),
          transform: `translateY(${lerp(1 - reply, 0, 90)}px)`,
        }}
      >
        <div style={{ height: 44, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={label}>{COPY.review.replyLabel}</div>
          <div style={{ position: "relative", height: 44, width: 190 }}>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 4,
                opacity: pill * (1 - published),
                transform: `scale(${lerp(pill, 0.7, 1)})`,
                transformOrigin: "right center",
              }}
            >
              <Pill text={COPY.review.draftPill} bg={colors.yellow} color={colors.ink} />
            </div>
            <div style={{ position: "absolute", right: 0, top: 4, opacity: published }}>
              <Pill
                text={COPY.review.publishedPill}
                bg={colors.green}
                color={colors.white}
                icon={<Check size={26} color={colors.white} stroke={colors.green} />}
              />
            </div>
          </div>
        </div>
        <div style={{ height: 138, marginTop: 16, fontWeight: 400, fontSize: 33, lineHeight: "46px" }}>
          {COPY.review.reply}
        </div>
        <div style={{ position: "relative", marginTop: 24, height: 84 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", gap: 20, opacity: 1 - published }}>
            <div
              style={{
                width: 220,
                height: 84,
                boxSizing: "border-box",
                border: `2px solid ${colors.hairline}`,
                borderRadius: radii.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 34,
                color: colors.ink,
              }}
            >
              {COPY.review.edit}
            </div>
            <div
              style={{
                flex: 1,
                height: 84,
                borderRadius: radii.card,
                background: interpolateColors(press, [0, 1], [colors.yellow, colors.yellowPressed]),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 36,
                color: colors.ink,
                transform: `scale(${1 - 0.03 * press})`,
              }}
            >
              {COPY.review.approve}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: published,
              borderRadius: radii.card,
              background: colors.white,
            }}
          >
            <Check size={56} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 36, lineHeight: "42px", color: colors.green }}>
                {COPY.review.published}
              </div>
              <div style={{ fontWeight: 400, fontSize: 26, lineHeight: "34px", color: colors.stone }}>
                {COPY.review.publishedNote}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FingerDot
        x={target.x + lerp(1 - fingerT, 0, 230)}
        y={target.y + lerp(1 - fingerT, 0, 210)}
        scale={fingerScale}
        opacity={clampRange(fingerT, 0, 0.3) * (1 - fingerOut)}
        ripple={ripple}
      />
    </>
  );
};

/** Screen 3: Google Protection card in amber, before and after rows, keep button, green confirmation. */
export const Protection: React.FC<{ frame: number }> = ({ frame }) => {
  const t = T(frame);
  const start = 15.0;
  const card = pop(frame, start);
  const rowA = pop(frame, start + 0.9);
  const rowB = pop(frame, start + 1.5);
  const button = pop(frame, start + 2.1);
  const tapAt = wordTime("protect", "changes") + 0.2;
  const confirmAt = tapAt + 0.2;
  const confirm = soft(frame, confirmAt);
  const press = clampRange(t, tapAt, tapAt + 0.12) - clampRange(t, tapAt + 0.12, tapAt + 0.3);

  const target = { x: 735, y: 700 };
  const fingerT = pop(frame, tapAt - 0.9, { damping: 22, stiffness: 90, mass: 1 });
  const fingerOut = clampRange(t, tapAt + 0.5, tapAt + 0.9);
  const ripple = clampRange(t, tapAt, tapAt + 0.45);

  const row = (labelText: string, value: string, bad: boolean, show: number): React.ReactNode => (
    <div
      style={{
        height: 96,
        boxSizing: "border-box",
        borderRadius: radii.card,
        background: colors.white,
        border: `2px solid ${bad ? colors.red : colors.hairline}`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 24,
        opacity: clampRange(show, 0, 0.5),
        transform: `translateY(${lerp(1 - show, 0, 40)}px)`,
      }}
    >
      <div style={{ ...label, width: 110, fontSize: 28 }}>{labelText}</div>
      <div style={{ fontWeight: 600, fontSize: 34, color: bad ? colors.red : colors.ink }}>{value}</div>
    </div>
  );

  return (
    <>
      <div
        style={{
          ...cardBase,
          top: 190,
          height: 580,
          padding: 28,
          background: colors.amberSoft,
          borderColor: colors.amber,
          opacity: clampRange(card, 0, 0.5),
          transform: `translateY(${lerp(1 - card, 0, 60)}px)`,
        }}
      >
        <div style={{ height: 40, display: "flex", alignItems: "center", gap: 14 }}>
          <Shield size={40} />
          <div style={{ fontWeight: 600, fontSize: 30, color: colors.amber }}>{COPY.protection.label}</div>
        </div>
        <div style={{ marginTop: 14, height: 108, fontWeight: 600, fontSize: 43, lineHeight: "52px", textWrap: "balance" }}>
          {COPY.protection.title}
        </div>
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {row(COPY.protection.beforeLabel, COPY.protection.beforeValue, false, rowA)}
          {row(COPY.protection.afterLabel, COPY.protection.afterValue, true, rowB)}
        </div>
        <div style={{ position: "relative", marginTop: 26, height: 104 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radii.card,
              background: colors.black,
              color: colors.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 37,
              opacity: clampRange(button, 0, 0.5) * (1 - confirm),
              transform: `scale(${(1 - 0.03 * press) * lerp(button, 0.96, 1)})`,
            }}
          >
            {COPY.protection.button}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radii.card,
              background: colors.green,
              color: colors.white,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 28px",
              opacity: confirm,
              transform: `scale(${lerp(confirm, 0.97, 1)})`,
            }}
          >
            <Check size={54} color={colors.white} stroke={colors.green} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 37, lineHeight: "44px" }}>{COPY.protection.confirmTitle}</div>
              <div style={{ fontWeight: 400, fontSize: 28, lineHeight: "36px" }}>{COPY.protection.confirmNote}</div>
            </div>
          </div>
        </div>
      </div>
      <FingerDot
        x={target.x + lerp(1 - fingerT, 0, 230)}
        y={target.y + lerp(1 - fingerT, 0, 210)}
        scale={1 - 0.18 * press}
        opacity={clampRange(fingerT, 0, 0.3) * (1 - fingerOut)}
        ripple={ripple}
      />
    </>
  );
};

/** Screen 4: Weekly Care Report. */
export const Report: React.FC<{ frame: number }> = ({ frame }) => {
  const start = 21.0;
  const card = pop(frame, start);
  const title = soft(frame, start + 0.25);
  const [six, ...rest] = COPY.report.title.split("6");
  return (
    <div
      style={{
        ...cardBase,
        top: 190,
        height: 560,
        padding: 32,
        opacity: clampRange(card, 0, 0.5),
        transform: `translateY(${lerp(1 - card, 0, 60)}px)`,
      }}
    >
      <div style={{ height: 36, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 18, height: 18, borderRadius: 5, background: colors.yellow }} />
        <div style={{ ...label, fontWeight: 600 }}>{COPY.report.label}</div>
      </div>
      <div
        style={{
          marginTop: 16,
          height: 140,
          fontWeight: 600,
          fontSize: 54,
          lineHeight: "70px",
          letterSpacing: -0.4,
          opacity: title,
        }}
      >
        {six}
        <span
          style={{
            background: colors.yellow,
            borderRadius: radii.card,
            padding: "0 16px",
            margin: "0 2px",
          }}
        >
          6
        </span>
        {rest.join("6")}
      </div>
      <div style={{ marginTop: 22, borderTop: `2px solid ${colors.hairline}` }}>
        {COPY.report.items.map((item, i) => {
          const p = pop(frame, start + 0.9 + i * 0.5);
          return (
            <div
              key={item}
              style={{
                height: 96,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 22,
                borderBottom: i < 2 ? `2px solid ${colors.hairline}` : "none",
                opacity: clampRange(p, 0, 0.5),
                transform: `translateX(${lerp(1 - p, 0, 50)}px)`,
              }}
            >
              <Check size={44} />
              <div style={{ fontWeight: 500, fontSize: 34 }}>{item}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
