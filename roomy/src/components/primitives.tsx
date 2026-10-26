import React from "react";
import { alpha } from "../../../core/frame";
import { clampRange, lerp, pop } from "../../../core/anim";
import { roomyTokens as T } from "../tokens";

/** Smooth springs, no bounce: everything arrives slowly and settles. */
export const SOFT = { damping: 24, stiffness: 70, mass: 1.1 };

/**
 * One type scale for the whole brand.
 *   display: Cormorant Garamond uppercase serif, open tracking, for headlines
 *   label:   Jost uppercase, for pills, bars and contact lines
 *   body:    Cormorant Garamond italic, for one line of supporting copy
 */
export const TYPE = {
  display: { fontFamily: T.fonts.display, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: T.white, textShadow: T.textShadow } as React.CSSProperties,
  label: { fontFamily: T.fonts.ui, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 26, textShadow: T.textShadow } as React.CSSProperties,
  body: { fontFamily: T.fonts.display, fontStyle: "italic", fontWeight: 500, fontSize: 40, color: alpha(T.white, 0.92), textShadow: T.textShadow } as React.CSSProperties,
};

/** Translucent glass: charcoal at 55% over a gentle blur, with a turquoise hairline. */
export const glass: React.CSSProperties = {
  background: alpha(T.charcoal, 0.55),
  border: `1px solid ${alpha(T.turquoise, 0.45)}`,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: T.shadows.glass,
};

/** Fades up from slightly below and out of a soft blur. */
export const Reveal: React.FC<{ frame: number; atFrame: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  frame,
  atFrame,
  dy = 26,
  style,
  children,
}) => {
  const p = pop(frame, atFrame / 30, SOFT);
  return (
    <div
      style={{
        opacity: clampRange(p, 0, 0.6),
        transform: `translateY(${lerp(p, dy, 0)}px)`,
        filter: `blur(${lerp(clampRange(p, 0, 0.9), 10, 0)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Designed stand-in for a missing photo or clip: teal-to-charcoal with arches and a slow light sweep. */
export const PlaceholderBackdrop: React.FC<{ frame: number; variant?: number }> = ({ frame, variant = 0 }) => {
  const sweep = ((frame * 3) % 1600) - 400;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `linear-gradient(${150 + variant * 18}deg, ${T.deepTeal} 0%, ${T.charcoal} 85%)` }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${30 + variant * 14}% 30%, ${alpha(T.turquoise, 0.35)}, transparent 55%)` }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 120 + i * 300 - variant * 40, top: 520 + (i % 2) * 70, width: 240, height: 640, borderRadius: "120px 120px 0 0", border: `3px solid ${alpha(T.turquoise, 0.28)}`, borderBottom: "none" }} />
      ))}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: sweep, width: 260, background: `linear-gradient(90deg, transparent, ${alpha(T.white, 0.07)}, transparent)`, transform: "skewX(-14deg)" }} />
    </div>
  );
};

/**
 * Atmospheric dark vignette so lower-third type stays crisp without hiding the picture:
 * charcoal at 85% on the bottom edge, clear by 55% of the frame height. A lighter band at the top keeps badges legible.
 */
export const BottomScrim: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${alpha(T.charcoal, 0.85 * strength)} 0%, ${alpha(T.charcoal, 0)} ${T.layout.scrimReach}%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 480, background: `linear-gradient(to bottom, ${alpha(T.charcoal, 0.4)}, ${alpha(T.charcoal, 0)})` }} />
  </>
);

/** Lower-third container: left aligned, its bottom edge on the shared baseline. */
export const LowerThird: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 22 }) => (
  <div style={{ position: "absolute", left: T.layout.marginX, right: T.layout.marginX, bottom: T.layout.lowerThirdBottom, display: "flex", flexDirection: "column", alignItems: "flex-start", gap }}>{children}</div>
);
