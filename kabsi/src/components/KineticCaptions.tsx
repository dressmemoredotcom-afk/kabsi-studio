import React from "react";
import { alpha, colors, FRAME, fonts, radii, SAFE } from "../tokens";
import { lerp, pop } from "../../../engine/src/anim";
import type { CaptionChunk } from "../../../engine/src/timeline";

const POP = { damping: 11, stiffness: 380, mass: 0.5 };
const IN = { damping: 15, stiffness: 340, mass: 0.5 };

/**
 * TikTok and Reels style captions. One phrase at a time on a soft black box, and the word being
 * spoken lights up in Kabsi yellow with a small scale pop. Sits just above the bottom safe line.
 */
export const KineticCaptions: React.FC<{ frame: number; chunks: CaptionChunk[]; fontSize?: number }> = ({
  frame,
  chunks,
  fontSize = 50,
}) => {
  const chunk = chunks.find((c) => frame >= c.startF && frame < c.endF);
  if (!chunk) return null;
  const enter = pop(frame, chunk.startF / FRAME.fps, IN);
  const active = chunk.words.reduce((idx, w, i) => (frame >= w.startF ? i : idx), 0);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: FRAME.width - SAFE.right,
        bottom: FRAME.height - SAFE.bottom + 20,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, enter * 3),
        transform: `scale(${lerp(enter, 0.82, 1)})`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          maxWidth: SAFE.right - SAFE.left,
          color: colors.white,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize,
          lineHeight: `${Math.round(fontSize * 1.56)}px`,
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
          {chunk.words.map((w, i) => {
            const isActive = i === active;
            const p = isActive ? pop(frame, w.startF / FRAME.fps, POP) : 1;
            // Lands big, settles slightly above normal while the word is being spoken.
            const scale = isActive ? 1.04 + 0.1 * (1 - Math.min(p, 1)) : 1;
            return (
              <span key={i}>
                <span
                  style={{
                    display: "inline-block",
                    // Fixed side margins, so a word that pops bigger never runs into its neighbours.
                    margin: "0 0.07em",
                    color: isActive ? colors.yellow : colors.white,
                    transform: `scale(${scale})`,
                    transformOrigin: "50% 70%",
                  }}
                >
                  {w.text}
                </span>
                {i < chunk.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
};
