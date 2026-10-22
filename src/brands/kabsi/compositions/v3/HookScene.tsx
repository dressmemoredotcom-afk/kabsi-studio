import React from "react";
import { Easing, interpolate } from "remotion";
import { SCREEN as COPY } from "../../script03";
import { colors, fonts } from "../../tokens";
import { clampRange, lerp, pop } from "../../../../core/anim";
import { BOUNCE, SLAM } from "../../v2/spring";
import { EV } from "./events";

const FONT_SIZE = 150;

/** Scene 1: the pain point in big kinetic type, with a slow push in on the whole frame. */
export const HookScene: React.FC<{ frame: number; fromF: number; toF: number }> = ({ frame, fromF, toF }) => {
  const t = frame / 30;
  const zoom = interpolate(frame, [fromF, toF], [1, 1.08], { easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(frame, [fromF, toF], [0, -14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // The key word lands with a short shake.
  const keyAt = EV.hook.words[3];
  const since = t - keyAt;
  const shake = since > 0 && since < 0.45 ? Math.sin(since * 70) * 10 * (1 - since / 0.45) : 0;

  let n = 0;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${drift}px) scale(${zoom})`, transformOrigin: "50% 50%" }}>
      <div
        style={{
          position: "absolute",
          left: 65,
          right: 65,
          top: 430,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: fonts.title,
          fontSize: FONT_SIZE,
          lineHeight: `${FONT_SIZE * 1.03}px`,
          textAlign: "center",
        }}
      >
        {COPY.hook.lines.map((line) => (
          <div key={line} style={{ display: "flex", gap: FONT_SIZE * 0.24, whiteSpace: "nowrap" }}>
            {line.split(" ").map((word) => {
              const isKey = word === COPY.hook.keyWord;
              const at = EV.hook.words[n++] ?? 0;
              const p = pop(frame, at - 0.04, isKey ? SLAM : BOUNCE);
              return (
                <span
                  key={word}
                  style={{
                    display: "inline-block",
                    color: isKey ? colors.yellow : colors.white,
                    opacity: clampRange(p, 0, 0.3),
                    transform: `translateY(${lerp(p, 100, 0)}px) rotate(${lerp(p, isKey ? 10 : -8, 0)}deg) scale(${lerp(p, 0.3, 1)})`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
