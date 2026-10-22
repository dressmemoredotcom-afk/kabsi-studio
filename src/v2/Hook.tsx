import React from "react";
import { SCREEN as COPY } from "../script02";
import { colors, fonts } from "../tokens";
import { clampRange, lerp, pop } from "../anim";
import { BOUNCE, SLAM } from "./spring";
import { wordTime } from "./timeline";

type W = { text: string; color: string; size: number; at: number };

/** Big Lalezar hook. Each word slams in on the beat of the voice. */
export const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const rows: W[][] = [
    [
      { text: "Is", color: colors.white, size: 128, at: wordTime("hook", "Is") },
      { text: "Google", color: colors.white, size: 128, at: wordTime("hook", "Google") },
      { text: "Maps", color: colors.white, size: 128, at: wordTime("hook", "Maps") },
    ],
    [
      { text: "Costing", color: colors.yellow, size: 150, at: wordTime("hook", "costing") },
      { text: "You", color: colors.yellow, size: 150, at: wordTime("hook", "you customers") },
    ],
    [{ text: "Customers?", color: colors.yellow, size: 150, at: wordTime("hook", "customers") }],
  ];
  // The strings come from the script, so a rewrite shows up here.
  const expected = [COPY.hook.white, ...COPY.hook.yellow].join(" ");
  if (rows.flat().map((w) => w.text).join(" ") !== expected) throw new Error("Hook words differ from script02");

  return (
    <div
      style={{
        position: "absolute",
        left: 65,
        right: 65,
        top: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: fonts.title,
        textAlign: "center",
        transform: `rotate(${Math.sin(t * 5) * 0.8}deg) scale(${1 + Math.sin(t * 7) * 0.008})`,
      }}
    >
      {rows.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: row[0].size * 0.24, whiteSpace: "nowrap", lineHeight: `${row[0].size * 1.02}px` }}>
          {row.map((w) => {
            const p = pop(frame, w.at - 0.05, w.color === colors.yellow ? SLAM : BOUNCE);
            return (
              <span
                key={w.text}
                style={{
                  display: "inline-block",
                  fontSize: w.size,
                  color: w.color,
                  opacity: clampRange(p, 0, 0.3),
                  transform: `translateY(${lerp(p, 90, 0)}px) rotate(${lerp(p, -9, 0)}deg) scale(${lerp(p, 0.3, 1)})`,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
