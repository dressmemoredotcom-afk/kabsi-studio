import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, colors, fonts, radii } from "../tokens";
import { TAP_RING_SECONDS } from "../kit";
import { captionTop, type Cue, type Disc } from "../captions";
import { useSafeBox } from "./SafeZone";

const FONT = 44;
const LINE = Math.round(FONT * 1.32);
const PAD_Y = 14;
/** How long before a tap lands and after its ring ends that captions still keep clear of it. */
const TAP_MARGIN_S = 0.3;

export type TapPoint = { x: number; y: number; atS: number; r?: number };

/**
 * Burned-in captions: Manrope SemiBold, paper (the kit's white) on a night box at 80 percent, at most 2 lines of 32
 * characters, at most one yellow word. The box sits at the bottom of the safe area. `taps` lists every tap or click
 * (frame pixels, second): a caption that would cover one moves up to sit just above it, and stays there for its whole
 * time so it never jumps.
 */
export const Captions: React.FC<{ cues: readonly Cue[]; taps?: readonly TapPoint[] }> = ({ cues, taps = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safe = useSafeBox();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.startS && t < c.endS);
  if (!cue) return null;
  const near: Disc[] = taps
    .filter((p) => p.atS - TAP_MARGIN_S < cue.endS && p.atS + TAP_RING_SECONDS + TAP_MARGIN_S > cue.startS)
    .map((p) => ({ x: p.x, y: p.y, r: p.r ?? 64 }));
  const boxHeight = cue.lines.length * LINE + 2 * PAD_Y;
  const top = captionTop(boxHeight, safe, near);
  return (
    <div style={{ position: "absolute", left: safe.left, width: safe.right - safe.left, top, height: boxHeight, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: alpha(colors.night, 0.8),
          borderRadius: radii.card,
          padding: `${PAD_Y}px 28px`,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: FONT,
          lineHeight: `${LINE}px`,
          color: colors.paper,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {cue.lines.map((line, i) => (
          <div key={i}>
            {line.split(" ").map((word, k, words) => (
              <React.Fragment key={k}>
                <span style={cue.yellow && word.replace(/[^\p{L}\p{N}']/gu, "") === cue.yellow ? { color: colors.yellow } : undefined}>{word}</span>
                {k < words.length - 1 ? " " : ""}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
