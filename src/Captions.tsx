import React from "react";
import { colors, fonts, radii, alpha, SAFE, FRAME } from "./tokens";
import { clampRange } from "./anim";
import { captionChunks } from "./timeline";

/** Burned-in captions: white Readex Pro SemiBold on a soft black box, just above the bottom safe line. */
export const Captions: React.FC<{ frame: number }> = ({ frame }) => {
  const chunk = captionChunks.find((c) => frame >= c.startF && frame < c.endF);
  if (!chunk) return null;
  const opacity = Math.min(clampRange(frame, chunk.startF, chunk.startF + 4), clampRange(frame, chunk.endF - 4, chunk.endF, 1, 0));
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: FRAME.width - SAFE.right,
        bottom: FRAME.height - SAFE.bottom + 20,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: SAFE.right - SAFE.left,
          boxSizing: "border-box",
          color: colors.white,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: "76px",
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        <span
          style={{
            background: alpha(colors.black, 0.72),
            borderRadius: radii.card,
            padding: "8px 24px",
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          {chunk.text}
        </span>
      </div>
    </div>
  );
};
