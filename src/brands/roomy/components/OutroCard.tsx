import React from "react";
import { Img } from "remotion";
import { alpha } from "../../../core/frame";
import { roomyTokens as T } from "../tokens";
import { assetUrl, type LogoAsset } from "../assets";
import { glass, Reveal, TYPE } from "./primitives";

/**
 * Height of the logo artwork in pixels. Change it here. The logo is dark teal on transparent, so it sits on a soft
 * light plate to stay visible on the charcoal background.
 */
export const LOGO_HEIGHT = 330;

/**
 * The logo image. When the file carries a tagline under the artwork (found by scripts/roomy-assets.mjs), the picture
 * is cropped just above it, so the outro shows the logo without the tagline and the file itself stays untouched.
 */
const Logo: React.FC<{ frame: number; atFrame: number; logo: LogoAsset | null }> = ({ frame, atFrame, logo }) => {
  const url = assetUrl(logo?.file);
  const keep = logo && logo.taglineCropY ? logo.taglineCropY / logo.height : 1;
  return (
  <Reveal frame={frame} atFrame={atFrame} dy={20}>
    {logo && url ? (
      <div style={{ background: alpha(T.white, 0.96), borderRadius: T.radii.large, padding: "34px 46px", boxShadow: T.shadows.lifted }}>
        <div style={{ height: LOGO_HEIGHT * keep, overflow: "hidden" }}>
          <Img src={url} style={{ display: "block", height: LOGO_HEIGHT, width: "auto", maxWidth: 700, objectFit: "contain", objectPosition: "top" }} />
        </div>
      </div>
    ) : (
      // Typographic stand-in until the logo file is added.
      <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <div style={{ ...TYPE.display, fontSize: 92, lineHeight: "88px", paddingLeft: "0.12em" }}>ROOMY</div>
        <div style={{ ...TYPE.label, fontSize: 22, letterSpacing: "0.55em", paddingLeft: "0.55em", color: T.turquoise }}>PROPERTIES</div>
      </div>
    )}
  </Reveal>
  );
};

/** The closing four seconds: charcoal with a teal glow, the logo, an invitation, and the contact details. */
export const OutroCard: React.FC<{
  frame: number;
  from: number;
  logo: LogoAsset | null;
  contact: string;
  instagram: string;
}> = ({ frame, from, logo, contact, instagram }) => {
  const glow = 0.36 + 0.06 * Math.sin(((frame - from) / 30) * 1.4);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: T.charcoal }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 38%, ${alpha(T.turquoise, glow)} 0%, ${alpha(T.deepTeal, 0.24)} 36%, transparent 66%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logo ? 330 : 440, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Logo frame={frame} atFrame={from + 6} logo={logo} />
        <Reveal frame={frame} atFrame={from + 24} style={{ marginTop: 64 }}>
          <div style={{ fontFamily: T.fonts.display, fontWeight: 500, fontSize: 38, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: alpha(T.white, 0.88), lineHeight: "52px" }}>
            Private viewings
            <br />
            by appointment
          </div>
        </Reveal>
        <Reveal frame={frame} atFrame={from + 48} style={{ marginTop: 60 }}>
          <div style={{ ...glass, background: alpha(T.white, 0.08), border: `1px solid ${alpha(T.turquoise, 0.6)}`, borderRadius: 64, padding: "28px 70px", fontFamily: T.fonts.ui, fontWeight: 500, fontSize: 50, letterSpacing: "0.05em", color: T.white }}>
            {contact}
          </div>
        </Reveal>
        <Reveal frame={frame} atFrame={from + 62} style={{ marginTop: 34 }}>
          <div style={{ ...TYPE.label, fontSize: 26, letterSpacing: "0.2em", paddingLeft: "0.2em", color: alpha(T.white, 0.7) }}>{instagram}</div>
        </Reveal>
      </div>
    </>
  );
};
