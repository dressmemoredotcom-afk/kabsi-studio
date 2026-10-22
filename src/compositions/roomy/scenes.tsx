import React from "react";
import { Easing, Img, OffthreadVideo, Sequence, interpolate } from "remotion";
import { SCREEN as COPY } from "../../scriptRoomy";
import { alpha, radii, roomy, shadows } from "../../tokens";
import { clampRange, lerp } from "../../anim";
import { ASSETS, assetUrl } from "./assets";
import { Badge, BASELINE_BOTTOM, BottomScrim, glass, MARGIN_X, PlaceholderBackdrop, Photo, Reveal, TYPE } from "./ui";

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
  const scale = interpolate(frame, [from, to + OVERLAP], [1, 1.06], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

/** Scene 2: the walkthrough clip, muted, from source second 19, with one frosted badge. */
export const TerraceScene: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const video = assetUrl(ASSETS.walkthrough);
  const length = to - from + OVERLAP;
  return (
    <>
      {video ? (
        // The Sequence gives the clip its own clock, starting at 0 when the scene starts.
        <Sequence from={from} durationInFrames={length}>
          <OffthreadVideo
            src={video}
            // Source frames from 570 (19 s). The scene is 165 frames, so it plays 19.0 s to 24.5 s, plus the dissolve.
            trimBefore={570}
            durationInFrames={length}
            muted
            volume={0}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      ) : (
        <PlaceholderBackdrop frame={frame} variant={1} />
      )}
      <BottomScrim strength={0.7} />
      <LowerThird>
        <Reveal frame={frame} atS={from / 30 + 0.9}>
          <Badge text={COPY.terrace.badge} />
        </Reveal>
      </LowerThird>
    </>
  );
};

/** Scene 3: the lounge and library with a slow pan from the sofa to the shelves. Figure and label in the lower third. */
export const LibraryScene: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const k = interpolate(frame, [from, to + OVERLAP], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = from / 30;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(k, 1.04, 1.09)})` }}>
        <Photo src={assetUrl(ASSETS.library)} frame={frame} variant={2} objectPosition={`${lerp(k, 52, 86)}% 50%`} />
      </div>
      <BottomScrim strength={0.9} reach={72} />
      <LowerThird gap={18}>
        <Reveal frame={frame} atS={s + 0.5}>
          <div style={{ ...TYPE.display, fontSize: 112, lineHeight: "112px" }}>{COPY.library.value}</div>
        </Reveal>
        <Reveal frame={frame} atS={s + 0.8}>
          <div style={{ ...TYPE.label, fontSize: 28, letterSpacing: "0.26em", color: roomy.turquoise }}>{COPY.library.label}</div>
        </Reveal>
        <Reveal frame={frame} atS={s + 1.2} style={{ marginTop: 14 }}>
          <div style={{ ...glass, ...TYPE.label, textTransform: "none", letterSpacing: "0.08em", fontSize: 29, color: roomy.white, padding: "16px 32px", borderRadius: radii.pill, whiteSpace: "nowrap" }}>
            {COPY.library.pill}
          </div>
        </Reveal>
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
        <Reveal frame={frame} atS={s + 0.6} style={{ width: "100%" }}>
          <div style={{ ...glass, borderRadius: radii.large, padding: "30px 24px", display: "flex", flexDirection: "column", gap: 22, width: "100%", boxSizing: "border-box" }}>
            {COPY.specs.rows.map((row, r) => (
              <Reveal key={r} frame={frame} atS={s + 0.9 + r * 0.35} dy={14}>
                <div style={{ ...TYPE.label, letterSpacing: "0.15em", fontSize: 29, color: roomy.white, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, whiteSpace: "nowrap" }}>
                  {row.map((item, i) => (
                    <React.Fragment key={item}>
                      {i > 0 && <span style={{ width: 9, height: 9, borderRadius: radii.pill, background: roomy.turquoise }} />}
                      <span>{item}</span>
                    </React.Fragment>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
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
        <Reveal frame={frame} atS={s + 1.5} style={{ marginTop: ASSETS.logo ? 56 : 84 }}>
          <div style={{ ...TYPE.label, fontSize: 23, letterSpacing: "0.32em", paddingLeft: "0.32em", color: alpha(roomy.white, 0.7) }}>{COPY.outro.viewing}</div>
        </Reveal>
        <Reveal frame={frame} atS={s + 1.8} style={{ marginTop: 26 }}>
          <div
            style={{
              ...glass,
              background: alpha(roomy.white, 0.08),
              border: `1px solid ${alpha(roomy.turquoise, 0.6)}`,
              padding: "0 56px",
              height: 108,
              display: "flex",
              alignItems: "center",
              borderRadius: radii.pill,
              fontFamily: roomy.fonts.ui,
              fontWeight: 500,
              fontSize: 39,
              letterSpacing: "0.05em",
              color: roomy.white,
            }}
          >
            {COPY.outro.cta}
          </div>
        </Reveal>
        <Reveal frame={frame} atS={s + 2.2} style={{ marginTop: 40 }}>
          <div style={{ ...TYPE.label, fontSize: 24, letterSpacing: "0.2em", paddingLeft: "0.2em", color: alpha(roomy.white, 0.6) }}>{COPY.outro.handle}</div>
        </Reveal>
      </div>
    </>
  );
};
