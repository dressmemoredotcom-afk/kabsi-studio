import React from "react";
import { SCREEN as COPY } from "./script";
import { colors, fonts, radii, shadows } from "./tokens";
import { clampRange, lerp, pop } from "./anim";

export const EndCard: React.FC<{ frame: number; startS: number }> = ({ frame, startS }) => {
  const mark = pop(frame, startS, { damping: 16, stiffness: 120, mass: 0.8 });
  const tag = pop(frame, startS + 0.5);
  const button = pop(frame, startS + 1.0, { damping: 14, stiffness: 150, mass: 0.7 });
  const url = pop(frame, startS + 1.3);
  const small = pop(frame, startS + 1.6);
  const fade = (p: number) => clampRange(p, 0, 0.5);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 150,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: fonts.title,
          fontSize: 300,
          lineHeight: "310px",
          color: colors.yellow,
          opacity: fade(mark),
          transform: `scale(${lerp(mark, 0.82, 1)})`,
        }}
      >
        {COPY.end.wordmark}
      </div>
      <div
        style={{
          marginTop: 6,
          width: 800,
          textAlign: "center",
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 58,
          lineHeight: "74px",
          color: colors.white,
          opacity: fade(tag),
          transform: `translateY(${lerp(1 - tag, 0, 40)}px)`,
        }}
      >
        {COPY.end.tagline}
      </div>
      <div
        style={{
          marginTop: 44,
          padding: "0 64px",
          height: 128,
          display: "flex",
          alignItems: "center",
          borderRadius: radii.pill,
          background: colors.yellow,
          boxShadow: shadows.lifted,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 44,
          color: colors.black,
          opacity: fade(button),
          transform: `scale(${lerp(button, 0.8, 1)})`,
        }}
      >
        {COPY.end.button}
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: fonts.body,
          fontWeight: 500,
          fontSize: 46,
          color: colors.white,
          opacity: fade(url),
        }}
      >
        {COPY.end.url}
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: fonts.body,
          fontWeight: 400,
          fontSize: 28,
          color: colors.stoneOnDark,
          opacity: fade(small),
        }}
      >
        {COPY.end.small}
      </div>
    </div>
  );
};
