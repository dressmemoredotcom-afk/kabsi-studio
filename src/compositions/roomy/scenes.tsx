import React from "react";
import { Easing, Img, OffthreadVideo, Sequence, interpolate } from "remotion";
import { SCREEN as COPY } from "../../scriptRoomy";
import { alpha, radii, roomy, shadows } from "../../tokens";
import { clampRange, lerp } from "../../anim";
import { ASSETS, assetUrl } from "./assets";
import { Badge, BASELINE_BOTTOM, BottomScrim, glass, GlassBar, MARGIN_X, PlaceholderBackdrop, Photo, Reveal, TYPE } from "./ui";

const ease = Easing.inOut(Easing.cubic);
/** Frames a scene stays under the next one while it fades in. */
export const OVERLAP = 12;

/** Lower-third container: left aligned, its bottom edge on the shared baseline. */
const LowerThird: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 22 }) => (
  <div style={{ position: "absolute", left: MARGIN_X, right: MARGIN_X, bottom: BASELINE_BOTTOM, display: "flex", flexDirection: "column", alignItems: "flex-start", gap }}>{children}</div>
);

const topLeft: React.CSSProperties = { position: "absolute", left: MARGIN_X, top: 300 };

/** Scene 1: the ruins, kept clear. A slow push (1.00 to 1.06), a place badge up top, the title in the lower third. */
export const HookScene: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const scale = interpolate(frame, [from, to + OVERLAP], [1, 1.05], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rule = clampRange(frame / 30, 0.7, 1.7);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "64% 40%" }}>
        <Photo src={assetUrl(ASSETS.terrace)} frame={frame} variant={0} objectPosition="68% 50%" />
      </div>
      <BottomScrim reach={68} />
      <div style={topLeft}>
        <Reveal frame={frame} atS={0.4} dy={-16}>
          <Badge text={COPY.hook.pill} />
        </Reveal>
      </div>
      <LowerThird gap={26}>
        <div style={{ height: 3, width: lerp(rule, 0, 84), background: roomy.turquoise }} />
        <div>
          {COPY.hook.title.map((line, i) => (
            <Reveal key={line} frame={frame} atS={0.9 + i * 0.45}>
              <div style={{ ...TYPE.display, fontSize: 92, lineHeight: "100px" }}>{line}</div>
            </Reveal>
          ))}
        </div>
        <Reveal frame={frame} atS={2.2}>
          <div style={TYPE.body}>{COPY.hook.subtext}</div>
        </Reveal>
      </LowerThird>
    </>
  );
};

/**
 * Scenes 2 and 3: a muted clip from the walkthrough with one glass bar. `trimBefore` is the source frame the clip
 * starts on (30 is second 1, 570 is second 19). Each scene plays 180 frames, plus the frames that run while the
 * next scene dissolves in.
 */
export const ClipScene: React.FC<{
  frame: number;
  from: number;
  to: number;
  trimBefore: number;
  rows: readonly (readonly string[])[];
  variant: number;
}> = ({ frame, from, to, trimBefore, rows, variant }) => {
  const video = assetUrl(ASSETS.walkthrough);
  const length = to - from + OVERLAP;
  return (
    <>
      {video ? (
        // The Sequence gives the clip its own clock, starting at 0 when the scene starts.
        <Sequence from={from} durationInFrames={length}>
          <OffthreadVideo
            src={video}
            trimBefore={trimBefore}
            durationInFrames={length}
            muted
            volume={0}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      ) : (
        <PlaceholderBackdrop frame={frame} variant={variant} />
      )}
      <BottomScrim strength={0.7} />
      <LowerThird>
        <GlassBar frame={frame} atS={from / 30 + 0.9} rows={rows} />
      </LowerThird>
    </>
  );
};

/** Scene 4: the master suite, sharp, with a slow push (1.00 to 1.05) and one glass bar carrying the specs. */
export const SpecsScene: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const scale = interpolate(frame, [from, to + OVERLAP], [1, 1.05], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = from / 30;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "50% 55%" }}>
        <Photo src={assetUrl(ASSETS.bedroom)} frame={frame} variant={1} objectPosition="42% 50%" />
      </div>
      <BottomScrim strength={0.7} />
      <div style={topLeft}>
        <Reveal frame={frame} atS={s + 0.3} dy={-16}>
          <Badge text={COPY.specs.badge} />
        </Reveal>
      </div>
      <LowerThird>
        <GlassBar frame={frame} atS={s + 0.9} rows={COPY.specs.bar} />
      </LowerThird>
    </>
  );
};

/**
 * Height of the logo image in pixels. The logo is a tall stacked mark (about 4 wide to 5 high) with lettering at the
 * bottom, so it needs far more than 130 px to stay readable. Change it here.
 */
export const LOGO_HEIGHT = 330;

/**
 * The agency logo image, or a typographic stand-in until roomy-logo.png is added. The logo is dark teal on
 * transparent, so it sits on a soft light plate to stay visible on the charcoal background.
 */
const Logo: React.FC<{ frame: number; atS: number }> = ({ frame, atS }) => {
  const logo = assetUrl(ASSETS.logo);
  return (
    <Reveal frame={frame} atS={atS} dy={20}>
      {logo ? (
        <div style={{ background: alpha(roomy.white, 0.96), borderRadius: radii.large, padding: "34px 46px", boxShadow: shadows.lifted }}>
          <Img src={logo} style={{ display: "block", height: LOGO_HEIGHT, width: "auto", maxWidth: 700, objectFit: "contain" }} />
        </div>
      ) : (
        <div style={{ height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ ...TYPE.display, fontSize: 88, lineHeight: "84px", letterSpacing: "0.12em", paddingLeft: "0.12em" }}>{COPY.outro.wordmarkTop}</div>
          <div style={{ ...TYPE.label, fontSize: 22, letterSpacing: "0.55em", paddingLeft: "0.55em", color: roomy.turquoise }}>{COPY.outro.wordmarkBottom}</div>
        </div>
      )}
    </Reveal>
  );
};

/** Scene 5: charcoal with a turquoise glow, the logo, the slogan, and a frosted call to action. */
export const OutroScene: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const s = from / 30;
  const glow = 0.36 + 0.06 * Math.sin((frame / 30 - s) * 1.4);
  // "Schedule a Private Viewing | +961 71 203 398": the invitation over the number, in one frosted pill.
  const [ctaLead, ctaPhone] = COPY.outro.cta.split(" | ");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: roomy.charcoal }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 38%, ${alpha(roomy.turquoise, glow)} 0%, ${alpha(roomy.deepTeal, 0.24)} 36%, transparent 66%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ASSETS.logo ? 290 : 430, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Logo frame={frame} atS={s + 0.2} />
        <Reveal frame={frame} atS={s + 0.9} style={{ marginTop: ASSETS.logo ? 52 : 64 }}>
          {COPY.outro.sloganLines.map((l) => (
            <div key={l} style={{ ...TYPE.label, fontSize: 42, lineHeight: "62px", letterSpacing: "0.22em", paddingLeft: "0.22em", color: roomy.turquoise }}>
              {l}
            </div>
          ))}
        </Reveal>
        <Reveal frame={frame} atS={s + 1.6} style={{ marginTop: ASSETS.logo ? 56 : 84 }}>
          <div
            style={{
              ...glass,
              background: alpha(roomy.white, 0.08),
              border: `1px solid ${alpha(roomy.turquoise, 0.6)}`,
              padding: "26px 64px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              borderRadius: 64,
              color: roomy.white,
            }}
          >
            <div style={{ ...TYPE.label, fontSize: 24, letterSpacing: "0.28em", paddingLeft: "0.28em", color: alpha(roomy.white, 0.75) }}>{ctaLead}</div>
            <div style={{ fontFamily: roomy.fonts.ui, fontWeight: 500, fontSize: 46, letterSpacing: "0.05em" }}>{ctaPhone}</div>
          </div>
        </Reveal>
        <Reveal frame={frame} atS={s + 2.2} style={{ marginTop: 36 }}>
          <div style={{ ...TYPE.label, fontSize: 24, letterSpacing: "0.2em", paddingLeft: "0.2em", color: alpha(roomy.white, 0.6) }}>{COPY.outro.handle}</div>
        </Reveal>
      </div>
    </>
  );
};
