import React from "react";
import { Img, OffthreadVideo, Sequence, interpolate, Easing } from "remotion";
import { SCREEN as COPY } from "../../scriptRoomy";
import { alpha, radii, roomy, shadows, SAFE } from "../../tokens";
import { clampRange, lerp, pop } from "../../anim";
import { ASSETS, assetUrl } from "./assets";
import { frosted, GENTLE, labelStyle, PlaceholderBackdrop, Photo, Pill, Reveal, Scrims } from "./ui";

const ease = Easing.inOut(Easing.cubic);
/** Frames a scene stays under the next one while it fades in. */
export const OVERLAP = 12;

/** Scene 1: terrace photo with a slow Ken Burns push (1.00 to 1.08), a turquoise place pill, and the hook line. */
export const HookScene: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const scale = interpolate(frame, [from, to + OVERLAP], [1, 1.08], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = frame / 30;
  const line = clampRange(t, 1.7, 2.5);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "62% 45%" }}>
        <Photo src={assetUrl(ASSETS.terrace)} frame={frame} variant={0} objectPosition="68% 50%" />
      </div>
      <Scrims top={0.6} bottom={0.5} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 22% at 50% 46%, ${alpha(roomy.charcoal, 0.5)}, transparent 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <Reveal frame={frame} atS={0.35} dy={-24}>
          <Pill text={COPY.hook.pill} solid />
        </Reveal>
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: 1080 - SAFE.right,
          top: 740,
          textAlign: "center",
          fontFamily: roomy.fonts.display,
          fontWeight: 600,
          fontSize: 164,
          lineHeight: "150px",
          letterSpacing: "-0.01em",
          color: roomy.white,
          textShadow: roomy.textShadow,
        }}
      >
        {COPY.hook.title.map((text, i) => (
          <Reveal key={text} frame={frame} atS={0.7 + i * 0.55}>
            {text}
          </Reveal>
        ))}
        <div style={{ margin: "44px auto 0", height: 4, width: lerp(line, 0, 280), borderRadius: radii.pill, background: roomy.turquoise }} />
      </div>
    </>
  );
};

/** Scene 2: the walkthrough clip, seconds 19 to 25 of the source, muted, with a frosted badge. */
export const TerraceScene: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const video = assetUrl(ASSETS.walkthrough);
  const badge = pop(frame, from / 30 + 0.7, GENTLE);
  return (
    <>
      {video ? (
        // The Sequence gives the clip its own clock, starting at 0 when the scene starts.
        <Sequence from={from} durationInFrames={180 + OVERLAP}>
          <OffthreadVideo
            src={video}
            // Source frames 570 to 750 (19 s to 25 s), plus the frames that play while the next scene fades in.
            trimBefore={570}
            durationInFrames={180 + OVERLAP}
            muted
            volume={0}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      ) : (
        <PlaceholderBackdrop frame={frame} variant={1} />
      )}
      <Scrims top={0.35} bottom={0.55} />
      <div style={{ position: "absolute", left: SAFE.left, right: 1080 - SAFE.right, top: 1088, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            ...frosted,
            ...labelStyle,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "28px 38px",
            fontSize: 27,
            letterSpacing: "0.1em",
            color: roomy.white,
            whiteSpace: "nowrap",
            opacity: clampRange(badge, 0, 0.5),
            transform: `translateY(${lerp(badge, 50, 0)}px)`,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: radii.pill, background: roomy.turquoise, flexShrink: 0 }} />
          {COPY.terrace.badge}
        </div>
      </div>
    </>
  );
};

/** Scene 3: the lounge photo with a slow pan from the sofa to the library, a spec card and a sub-pill. */
export const LibraryScene: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const k = interpolate(frame, [from, to + OVERLAP], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = pop(frame, from / 30 + 0.35, GENTLE);
  const pill = pop(frame, from / 30 + 0.9, GENTLE);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(k, 1.04, 1.1)})` }}>
        <Photo src={assetUrl(ASSETS.library)} frame={frame} variant={2} objectPosition={`${lerp(k, 52, 88)}% 50%`} />
      </div>
      <Scrims top={0.4} bottom={0.6} />
      <div style={{ position: "absolute", left: SAFE.left, right: 1080 - SAFE.right, top: 790, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div
          style={{
            ...frosted,
            width: "100%",
            boxSizing: "border-box",
            padding: "38px 40px 40px",
            textAlign: "center",
            opacity: clampRange(card, 0, 0.5),
            transform: `translateY(${lerp(card, 60, 0)}px)`,
          }}
        >
          <div style={{ fontFamily: roomy.fonts.display, fontWeight: 600, fontSize: 132, lineHeight: "120px", color: roomy.white }}>{COPY.library.value}</div>
          <div style={{ ...labelStyle, marginTop: 18, fontSize: 31, letterSpacing: "0.24em", color: roomy.turquoise }}>{COPY.library.label}</div>
        </div>
        <div
          style={{
            ...frosted,
            ...labelStyle,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 40px",
            borderRadius: radii.pill,
            fontSize: 29,
            letterSpacing: "0.08em",
            textTransform: "none",
            color: roomy.white,
            opacity: clampRange(pill, 0, 0.5),
            transform: `translateY(${lerp(pill, 40, 0)}px)`,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24">
            <path d="M4 3h4v18H4zM9 5h4v16H9zM14.3 4.6l3.8-1 3.2 16.4-3.8 1z" fill="none" stroke={roomy.turquoise} strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          {COPY.library.pill}
        </div>
      </div>
    </>
  );
};

/** Scene 4: blurred bedroom behind a 2 by 2 spec grid that pops into view. */
export const SpecsScene: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const badge = pop(frame, from / 30 + 0.2, GENTLE);
  const cellW = (SAFE.right - SAFE.left - 40) / 2;
  const cellH = 300;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: "scale(1.14)", filter: "blur(20px)" }}>
        <Photo src={assetUrl(ASSETS.bedroom)} frame={frame} variant={1} objectPosition="45% 50%" />
      </div>
      <div style={{ position: "absolute", inset: 0, background: alpha(roomy.charcoal, 0.4) }} />
      <Scrims top={0.3} bottom={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: clampRange(badge, 0, 0.5), transform: `translateY(${lerp(badge, -24, 0)}px)` }}>
        <Pill text={COPY.specs.badge} />
      </div>
      {COPY.specs.cells.map((cell, i) => {
        const p = pop(frame, from / 30 + 0.55 + i * 0.22, GENTLE);
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <div
            key={cell.label}
            style={{
              ...frosted,
              position: "absolute",
              left: SAFE.left + col * (cellW + 40),
              top: 520 + row * (cellH + 40),
              width: cellW,
              height: cellH,
              boxSizing: "border-box",
              padding: "0 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              opacity: clampRange(p, 0, 0.4),
              transform: `scale(${lerp(p, 0.78, 1)}) translateY(${lerp(p, 40, 0)}px)`,
            }}
          >
            <div style={{ position: "absolute", top: 0, left: "50%", width: 70, height: 4, marginLeft: -35, borderRadius: radii.pill, background: roomy.turquoise }} />
            <div style={{ fontFamily: roomy.fonts.display, fontWeight: 600, fontSize: 124, lineHeight: "120px", color: roomy.white }}>{cell.value}</div>
            <div style={{ ...labelStyle, marginTop: 14, fontSize: 27, letterSpacing: "0.2em", color: roomy.turquoise }}>{cell.label}</div>
          </div>
        );
      })}
    </>
  );
};

/** The agency logo, or a typographic stand-in until roomy-logo.png is added. */
const Logo: React.FC<{ frame: number; atS: number }> = ({ frame, atS }) => {
  const p = pop(frame, atS, GENTLE);
  const logo = assetUrl(ASSETS.logo);
  return (
    <div style={{ opacity: clampRange(p, 0, 0.5), transform: `scale(${lerp(p, 0.86, 1)})`, textAlign: "center" }}>
      {logo ? (
        <Img src={logo} style={{ width: 560, height: 320, objectFit: "contain" }} />
      ) : (
        <div style={{ height: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: roomy.fonts.display, fontWeight: 600, fontSize: 168, lineHeight: "160px", letterSpacing: "0.06em", color: roomy.white }}>{COPY.outro.wordmarkTop}</div>
          <div style={{ width: 90, height: 3, margin: "16px 0 20px", background: roomy.turquoise }} />
          <div style={{ ...labelStyle, fontSize: 36, letterSpacing: "0.52em", color: roomy.turquoise, paddingLeft: "0.52em" }}>{COPY.outro.wordmarkBottom}</div>
        </div>
      )}
    </div>
  );
};

/** Scene 5: charcoal with a turquoise glow, the logo, the slogan, the tagline and the call to action. */
export const OutroScene: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const t = frame / 30;
  const s = from / 30;
  const glow = 0.4 + 0.08 * Math.sin((t - s) * 1.6);
  const cta = pop(frame, s + 1.7, GENTLE);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: roomy.charcoal }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 36%, ${alpha(roomy.turquoise, glow)} 0%, ${alpha(roomy.deepTeal, 0.28)} 38%, transparent 68%)` }} />
      <div style={{ position: "absolute", left: SAFE.left, right: 1080 - SAFE.right, top: 290, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Logo frame={frame} atS={s + 0.15} />
        <Reveal frame={frame} atS={s + 0.7} style={{ marginTop: 44, textAlign: "center" }}>
          {COPY.outro.sloganLines.map((l) => (
            <div key={l} style={{ ...labelStyle, fontSize: 46, lineHeight: "66px", letterSpacing: "0.2em", color: roomy.white, paddingLeft: "0.2em" }}>
              {l}
            </div>
          ))}
        </Reveal>
        <Reveal frame={frame} atS={s + 1.2} style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ width: 120, height: 3, background: roomy.turquoise }} />
          <div style={{ fontFamily: roomy.fonts.display, fontStyle: "italic", fontWeight: 500, fontSize: 46, lineHeight: "56px", color: alpha(roomy.white, 0.88), textAlign: "center" }}>{COPY.outro.tagline}</div>
        </Reveal>
        <div
          style={{
            marginTop: 52,
            padding: "0 56px",
            height: 112,
            display: "flex",
            alignItems: "center",
            borderRadius: radii.pill,
            background: roomy.turquoise,
            color: roomy.charcoal,
            fontFamily: roomy.fonts.ui,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: "0.04em",
            boxShadow: shadows.lifted,
            opacity: clampRange(cta, 0, 0.5),
            transform: `scale(${lerp(cta, 0.86, 1)})`,
          }}
        >
          {COPY.outro.cta}
        </div>
        <Reveal frame={frame} atS={s + 2.1} style={{ marginTop: 34, ...labelStyle, fontSize: 27, letterSpacing: "0.14em", color: alpha(roomy.white, 0.78), textAlign: "center", textTransform: "none" }}>
          {COPY.outro.handle} | {COPY.outro.footer}
        </Reveal>
      </div>
    </>
  );
};
