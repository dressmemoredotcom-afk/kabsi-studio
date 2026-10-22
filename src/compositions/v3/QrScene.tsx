import React from "react";
import { SCREEN as COPY } from "../../script03";
import { alpha, colors, radii, shadows } from "../../tokens";
import { clampRange, lerp, pop } from "../../anim";
import { QrStand, STAND } from "../../components/QrStand";
import { ExampleTag } from "../../ui";
import { BOUNCE, SLAM, SNAP } from "../../v2/spring";
import { EV, STAR_COUNT } from "./events";

const COUNTER_Y = 925;
const STAND_LEFT = (1080 - STAND.cardW) / 2;
const STAND_TOP = COUNTER_Y + 6 - (STAND.cardH + STAND.baseH);

const Star: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.5l-5.9 3.3 1.3-6.7-4.9-4.6 6.6-.8z" fill={colors.yellow} />
  </svg>
);

/** Scene 3: a counter-top QR stand expands onto the counter, a light beam scans it, five stars pop in. */
export const QrScene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const { standAt, beamAt, starsAt } = EV.qr;
  const stand = pop(frame, standAt, BOUNCE);
  const beam = clampRange(t, beamAt, beamAt + 0.8);
  const beamOn = t >= beamAt && t < beamAt + 0.85;
  const pill = pop(frame, starsAt - 0.15, SNAP);
  const lastStar = starsAt + (STAR_COUNT - 1) * 0.16;
  const burst = clampRange(t, lastStar, lastStar + 0.5);
  const tag = pop(frame, standAt + 0.2, SNAP);

  return (
    <>
      {/* Wall and counter */}
      <div style={{ position: "absolute", inset: 0, background: colors.sand }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: COUNTER_Y,
          bottom: 0,
          background: `linear-gradient(180deg, ${colors.yellow} 0%, ${colors.yellowPressed} 100%)`,
          boxShadow: `0 -2px 0 ${alpha(colors.white, 0.6)}`,
        }}
      />

      {/* Rings expand from the stand as it lands */}
      {[0, 0.18].map((delay) => {
        const k = clampRange(t, standAt + delay, standAt + delay + 0.9);
        return (
          <div
            key={delay}
            style={{
              position: "absolute",
              left: 540 - 260,
              top: 620 - 260,
              width: 520,
              height: 520,
              borderRadius: radii.pill,
              border: `8px solid ${alpha(colors.ink, 0.22)}`,
              opacity: k > 0 && k < 1 ? 1 - k : 0,
              transform: `scale(${0.4 + k * 1.9})`,
            }}
          />
        );
      })}

      <QrStand
        label={COPY.qr.label}
        brand={COPY.qr.brand}
        scan={beamOn ? beam : -1}
        style={{
          left: STAND_LEFT,
          top: STAND_TOP,
          opacity: clampRange(stand, 0, 0.2),
          transform: `scale(${lerp(stand, 0.1, 1)}) rotate(${lerp(stand, -8, 0)}deg)`,
          transformOrigin: "50% 100%",
        }}
      />

      {/* Five-star rating: ink pill on the counter, stars pop in one at a time */}
      <div
        style={{
          position: "absolute",
          left: (1080 - 540) / 2,
          top: 962,
          width: 540,
          height: 96,
          borderRadius: radii.pill,
          background: colors.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          boxShadow: shadows.lifted,
          opacity: clampRange(pill, 0, 0.3),
          transform: `scale(${lerp(pill, 0.6, 1) * (1 + 0.05 * Math.sin(burst * Math.PI))})`,
        }}
      >
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const p = pop(frame, starsAt + i * 0.16, SLAM);
          return (
            <div key={i} style={{ opacity: clampRange(p, 0, 0.2), transform: `scale(${lerp(p, 0, 1)}) rotate(${lerp(p, -60, 0)}deg)` }}>
              <Star size={66} />
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", right: 70, top: 292, opacity: clampRange(tag, 0, 0.3) }}>
        <ExampleTag text={COPY.app.example} />
      </div>
    </>
  );
};
