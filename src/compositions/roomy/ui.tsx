import React from "react";
import { Img } from "remotion";
import { alpha, radii, roomy, shadows } from "../../tokens";
import { clampRange, lerp, pop } from "../../anim";

export const SOFT = { damping: 22, stiffness: 90, mass: 1 };
export const GENTLE = { damping: 16, stiffness: 120, mass: 0.9 };

/** The brand's frosted card: charcoal at 78% with a turquoise hairline, over a soft blur. */
export const frosted: React.CSSProperties = {
  background: roomy.frosted,
  border: roomy.frostedBorder,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: shadows.glass,
  borderRadius: radii.large,
};

export const labelStyle: React.CSSProperties = {
  fontFamily: roomy.fonts.ui,
  fontWeight: 500,
  textTransform: "uppercase",
};

/** Fades up from slightly below and out of a blur: a calm, expensive entrance. */
export const Reveal: React.FC<{ frame: number; atS: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  frame,
  atS,
  dy = 34,
  style,
  children,
}) => {
  const p = pop(frame, atS, SOFT);
  return (
    <div
      style={{
        opacity: clampRange(p, 0, 0.6),
        transform: `translateY(${lerp(p, dy, 0)}px)`,
        filter: `blur(${lerp(clampRange(p, 0, 0.9), 14, 0)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Designed stand-in for a missing photo or clip: teal-to-charcoal with architectural arches and a slow light sweep. */
export const PlaceholderBackdrop: React.FC<{ frame: number; variant?: number }> = ({ frame, variant = 0 }) => {
  const angle = 150 + variant * 18;
  const sweep = ((frame * 4) % 1600) - 400;
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

/** A photo, cropped to fill the frame, or the placeholder when the file is missing. */
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

/** Dark gradients top and bottom so white type stays readable on any photo. */
export const Scrims: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.55, bottom = 0.6 }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: `linear-gradient(180deg, ${alpha(roomy.charcoal, top)}, transparent)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, background: `linear-gradient(0deg, ${alpha(roomy.charcoal, bottom)}, transparent)` }} />
  </>
);

/** Letter-spaced pill, used for the top labels. */
export const Pill: React.FC<{ text: string; solid?: boolean; style?: React.CSSProperties }> = ({ text, solid, style }) => (
  <div
    style={{
      ...labelStyle,
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 38px",
      borderRadius: radii.pill,
      fontSize: 30,
      letterSpacing: "0.26em",
      background: solid ? roomy.turquoise : roomy.frosted,
      color: solid ? roomy.charcoal : roomy.turquoise,
      border: solid ? "none" : roomy.frostedBorder,
      backdropFilter: solid ? undefined : "blur(18px)",
      WebkitBackdropFilter: solid ? undefined : "blur(18px)",
      fontWeight: solid ? 600 : 500,
      ...style,
    }}
  >
    {text}
  </div>
);
