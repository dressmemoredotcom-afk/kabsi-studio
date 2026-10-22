import React from "react";
import { SCREEN as COPY } from "../script02";
import { colors, fonts, radii, shadows } from "../tokens";
import { clampRange, lerp, pop } from "../../../core/anim";
import { BOUNCE, SLAM, SNAP } from "./spring";

const hop = (frame: number, startS: number, everyS: number) => {
  const t = frame / 30 - startS;
  if (t < 0) return 0;
  const phase = t % everyS;
  return Math.max(0, Math.sin((phase / 0.55) * Math.PI)) * (phase < 0.55 ? 1 : 0);
};

/** End card: black, bouncy logo, line, pulsing button. Full frame allowed. */
export const End: React.FC<{ frame: number; startS: number }> = ({ frame, startS }) => {
  const mark = pop(frame, startS + 0.1, SLAM);
  const tagWords = COPY.end.tagline.split(" ");
  const button = pop(frame, startS + 1.5, BOUNCE);
  const url = pop(frame, startS + 1.9, SNAP);
  const small = pop(frame, startS + 2.2, SNAP);
  const bounce = hop(frame, startS + 2.4, 1.4);
  const pulse = 1 + Math.max(0, Math.sin((frame / 30 - startS - 2.6) * 4)) * 0.035;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150, boxSizing: "border-box" }}>
      <div
        style={{
          fontFamily: fonts.title,
          fontSize: 300,
          lineHeight: "310px",
          color: colors.yellow,
          opacity: clampRange(mark, 0, 0.25),
          transform: `translateY(${-bounce * 26}px) scale(${lerp(mark, 0.2, 1) * (1 + bounce * 0.03)}) rotate(${lerp(mark, -10, 0)}deg)`,
        }}
      >
        {COPY.end.wordmark}
      </div>
      <div style={{ marginTop: 6, width: 820, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", fontFamily: fonts.body, fontWeight: 600, fontSize: 58, lineHeight: "74px", color: colors.white }}>
        {tagWords.map((w, i) => {
          const p = pop(frame, startS + 0.55 + i * 0.1, SNAP);
          return (
            <span key={i} style={{ display: "inline-block", opacity: clampRange(p, 0, 0.3), transform: `translateY(${lerp(p, 40, 0)}px) scale(${lerp(p, 0.7, 1)})` }}>
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 44,
          padding: "0 60px",
          height: 128,
          display: "flex",
          alignItems: "center",
          borderRadius: radii.pill,
          background: colors.yellow,
          boxShadow: shadows.lifted,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 46,
          color: colors.black,
          opacity: clampRange(button, 0, 0.25),
          transform: `scale(${lerp(button, 0.5, 1) * pulse})`,
        }}
      >
        {COPY.end.button}
      </div>
      <div style={{ marginTop: 26, fontFamily: fonts.body, fontWeight: 500, fontSize: 46, color: colors.white, opacity: clampRange(url, 0, 0.3), transform: `scale(${lerp(url, 0.8, 1)})` }}>
        {COPY.end.url}
      </div>
      <div style={{ marginTop: 28, fontFamily: fonts.body, fontWeight: 400, fontSize: 28, color: colors.stoneOnDark, opacity: clampRange(small, 0, 0.3) }}>
        {COPY.end.small}
      </div>
    </div>
  );
};
