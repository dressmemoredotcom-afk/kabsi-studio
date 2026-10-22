import React from "react";
import { Img } from "remotion";
import { alpha, colors, radii, roomy, shadows } from "../../tokens";
import { clampRange, lerp, pop } from "../../anim";

/** Smooth springs, no bounce: everything arrives slowly and settles. */
export const SOFT = { damping: 24, stiffness: 70, mass: 1.1 };
export const GENTLE = { damping: 20, stiffness: 90, mass: 1 };

/** Left edge of all lower-third copy, and the line its bottom edge sits on (just above the Reels caption zone). */
export const MARGIN_X = 80;
export const BASELINE_BOTTOM = 1920 - 1236;

/**
 * One type scale for the whole reel.
 *   display: Cormorant Garamond caps with open tracking, for the headline of each scene
 *   label:   Jost caps, for badges and spec lines
 *   body:    Cormorant Garamond italic, for the one line of supporting copy
 */
export const TYPE = {
  display: { fontFamily: roomy.fonts.display, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: roomy.white, textShadow: roomy.textShadow } as React.CSSProperties,
  label: { fontFamily: roomy.fonts.ui, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 26, textShadow: roomy.textShadow } as React.CSSProperties,
  body: { fontFamily: roomy.fonts.display, fontStyle: "italic", fontWeight: 500, fontSize: 40, color: alpha(roomy.white, 0.92), textShadow: roomy.textShadow } as React.CSSProperties,
};

/** Translucent glass: charcoal at 55% over a gentle blur, with a turquoise hairline. */
export const glass: React.CSSProperties = {
  background: alpha(roomy.charcoal, 0.55),
  border: `1px solid ${alpha(roomy.turquoise, 0.45)}`,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: shadows.glass,
};

/** Fades up from slightly below and out of a soft blur. */
export const Reveal: React.FC<{ frame: number; atS: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  frame,
  atS,
  dy = 26,
  style,
  children,
}) => {
  const p = pop(frame, atS, SOFT);
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
  const angle = 150 + variant * 18;
  const sweep = ((frame * 3) % 1600) - 400;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `linear-gradient(${angle}deg, ${roomy.deepTeal} 0%, ${roomy.charcoal} 85%)` }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${30 + variant * 14}% 30%, ${alpha(roomy.turquoise, 0.35)}, transparent 55%)` }} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 120 + i * 300 - variant * 40,
            top: 520 + (i % 2) * 70,
            width: 240,
            height: 640,
            borderRadius: "120px 120px 0 0",
            border: `3px solid ${alpha(roomy.turquoise, 0.28)}`,
            borderBottom: "none",
          }}
        />
      ))}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: sweep, width: 260, background: `linear-gradient(90deg, transparent, ${alpha(roomy.white, 0.07)}, transparent)`, transform: "skewX(-14deg)" }} />
    </div>
  );
};

/** A photo, cropped to fill the frame and kept sharp, or the placeholder when the file is missing. */
export const Photo: React.FC<{
  src: string | null;
  frame: number;
  variant?: number;
  objectPosition?: string;
  style?: React.CSSProperties;
}> = ({ src, frame, variant, objectPosition = "50% 50%", style }) =>
  src ? (
    <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition, ...style }} />
  ) : (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      <PlaceholderBackdrop frame={frame} variant={variant} />
    </div>
  );

/**
 * Black rising from the bottom edge, so lower-third type stays crisp without covering the picture:
 * linear-gradient(to top, black 85% at the bottom edge, clear by 60% of the frame height).
 */
export const BottomScrim: React.FC<{ strength?: number; reach?: number }> = ({ strength = 0.85, reach = 60 }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${alpha(colors.black, strength)} 0%, ${alpha(colors.black, 0)} ${reach}%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 480, background: `linear-gradient(to bottom, ${alpha(colors.black, 0.4)}, ${alpha(colors.black, 0)})` }} />
  </>
);

/** Small frosted badge with a turquoise dot, used for place and status labels. */
export const Badge: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <div
    style={{
      ...TYPE.label,
      ...glass,
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 30px",
      borderRadius: radii.pill,
      color: roomy.white,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: radii.pill, background: roomy.turquoise, flexShrink: 0 }} />
    {text}
  </div>
);

/**
 * The spec bar: translucent glass holding rows of short items, all one type style, with turquoise dots between
 * items. Rows reveal one after the other. Sits in a lower third.
 */
export const GlassBar: React.FC<{ frame: number; atS: number; rows: readonly (readonly string[])[] }> = ({ frame, atS, rows }) => (
  <Reveal frame={frame} atS={atS} style={{ width: "100%" }}>
    <div style={{ ...glass, borderRadius: radii.large, padding: "28px 20px", display: "flex", flexDirection: "column", gap: 20, width: "100%", boxSizing: "border-box" }}>
      {rows.map((row, r) => (
        <Reveal key={r} frame={frame} atS={atS + 0.3 + r * 0.35} dy={14}>
          <div style={{ ...TYPE.label, letterSpacing: "0.13em", fontSize: 26, color: roomy.white, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
            {row.map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && <span style={{ width: 9, height: 9, borderRadius: radii.pill, background: roomy.turquoise, flexShrink: 0 }} />}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  </Reveal>
);
