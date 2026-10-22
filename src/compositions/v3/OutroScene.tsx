import React from "react";
import { SCREEN as COPY } from "../../script03";
import { colors, fonts, radii, shadows } from "../../tokens";
import { clampRange, lerp, pop } from "../../anim";
import { BOUNCE, SLAM, SNAP } from "../../v2/spring";
import { EV } from "./events";

/** A short hop that repeats, so the logo keeps moving while the card holds. */
const hop = (t: number, startS: number, everyS: number) => {
  const local = t - startS;
  if (local < 0) return 0;
  const phase = local % everyS;
  return phase < 0.55 ? Math.sin((phase / 0.55) * Math.PI) : 0;
};

/** Scene 4: Kabsi wordmark, the brand line, a pulsing call to action, and the small print. */
export const OutroScene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const { markAt, tagAt, careAt, ctaAt, smallAt } = EV.end;
  const mark = pop(frame, markAt, SLAM);
  const cta = pop(frame, ctaAt, BOUNCE);
  const small = pop(frame, smallAt, SNAP);
  const bounce = hop(t, ctaAt + 0.8, 1.4);
  const pulse = 1 + Math.max(0, Math.sin((t - ctaAt - 0.6) * 4)) * 0.035;
  const [first, second] = COPY.end.tagline.split(". ").map((x, i) => (i === 0 ? `${x}.` : x));
  const lineA = pop(frame, tagAt, SNAP);
  const lineB = pop(frame, careAt, SNAP);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 170, boxSizing: "border-box" }}>
      <div
        style={{
          fontFamily: fonts.title,
          fontSize: 300,
          lineHeight: "310px",
          color: colors.yellow,
          opacity: clampRange(mark, 0, 0.25),
          transform: `translateY(${-hop(t, markAt + 1.2, 1.4) * 22}px) scale(${lerp(mark, 0.2, 1)}) rotate(${lerp(mark, -10, 0)}deg)`,
        }}
      >
        {COPY.end.wordmark}
      </div>
      <div style={{ marginTop: 8, fontFamily: fonts.body, fontWeight: 600, fontSize: 60, lineHeight: "76px", color: colors.white, textAlign: "center" }}>
        <div style={{ opacity: clampRange(lineA, 0, 0.3), transform: `translateY(${lerp(lineA, 40, 0)}px) scale(${lerp(lineA, 0.8, 1)})` }}>{first}</div>
        <div style={{ opacity: clampRange(lineB, 0, 0.3), transform: `translateY(${lerp(lineB, 40, 0)}px) scale(${lerp(lineB, 0.8, 1)})` }}>{second}</div>
      </div>
      <div
        style={{
          marginTop: 56,
          padding: "0 60px",
          height: 132,
          display: "flex",
          alignItems: "center",
          borderRadius: radii.pill,
          background: colors.yellow,
          boxShadow: shadows.lifted,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 46,
          color: colors.black,
          opacity: clampRange(cta, 0, 0.25),
          transform: `translateY(${-bounce * 10}px) scale(${lerp(cta, 0.5, 1) * pulse})`,
        }}
      >
        {COPY.end.cta}
      </div>
      <div style={{ marginTop: 36, fontFamily: fonts.body, fontWeight: 400, fontSize: 28, color: colors.stoneOnDark, opacity: clampRange(small, 0, 0.3) }}>
        {COPY.end.small}
      </div>
    </div>
  );
};
