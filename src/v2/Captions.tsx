import React from "react";
import { alpha, colors, FRAME, fonts, radii, SAFE } from "../tokens";
import { lerp, pop } from "../anim";
import { SNAP } from "./spring";
import { captionChunks } from "./timeline";

/** Burned-in captions: Readex Pro SemiBold on a soft black box, the word being spoken in yellow. */
export const Captions: React.FC<{ frame: number }> = ({ frame }) => {
  const chunk = captionChunks.find((c) => frame >= c.startF && frame < c.endF);
  if (!chunk) return null;
  const p = pop(frame, chunk.startF / FRAME.fps, SNAP);
  const current = chunk.words.reduce((idx, w, i) => (frame >= w.startF ? i : idx), 0);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: FRAME.width - SAFE.right,
        bottom: FRAME.height - SAFE.bottom + 20,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, p * 3),
        transform: `scale(${lerp(p, 0.82, 1)})`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          maxWidth: SAFE.right - SAFE.left,
          color: colors.white,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: "78px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            background: alpha(colors.black, 0.74),
            borderRadius: radii.card,
            padding: "8px 26px",
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          {chunk.words.map((w, i) => (
            <span key={i} style={{ color: i === current ? colors.yellow : colors.white }}>
              {w.text}
              {i < chunk.words.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
