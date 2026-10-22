import React from "react";
import { SCREEN as COPY } from "./script";
import { colors, fonts } from "./tokens";
import { clampRange, lerp, pop } from "../../core/anim";

const FONT_SIZE = 168;

export const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  let n = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 65,
        right: 65,
        top: 330,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: fonts.title,
        fontSize: FONT_SIZE,
        lineHeight: "176px",
        color: colors.white,
        textAlign: "center",
      }}
    >
      {COPY.hook.lines.map((line) => (
        <div key={line} style={{ display: "flex", gap: 40, whiteSpace: "nowrap" }}>
          {line.split(" ").map((word) => {
            const p = pop(frame, 0.08 + n++ * 0.13);
            return (
              <span
                key={word}
                style={{
                  display: "inline-block",
                  color: word === COPY.hook.keyWord ? colors.yellow : colors.white,
                  opacity: clampRange(p, 0, 0.5),
                  transform: `translateY(${lerp(1 - p, 0, 60)}px) scale(${lerp(p, 0.92, 1)})`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
