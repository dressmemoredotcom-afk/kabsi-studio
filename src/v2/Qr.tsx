import React from "react";
import { SCREEN as COPY } from "../script02";
import { alpha, colors, fonts, radii, shadows } from "../tokens";
import { clampRange, lerp, pop } from "../anim";
import { ExampleTag } from "../ui";
import { BOUNCE, SLAM, SNAP } from "./spring";
import { wordTime } from "./timeline";

const N = 25;

/** A drawn, decorative QR-style pattern (not scannable). Seeded so every render is identical. */
const modules = (() => {
  let seed = 20240607;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const grid: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.52));
  const finder = (ox: number, oy: number) => {
    for (let y = -1; y <= 7; y++)
      for (let x = -1; x <= 7; x++) {
        const gx = ox + x;
        const gy = oy + y;
        if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue;
        const ring = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[gy][gx] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (ring || core);
      }
  };
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);
  for (let i = 8; i < N - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }
  return grid;
})();

const QrArt: React.FC<{ size: number }> = ({ size }) => {
  const m = size / N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {modules.flatMap((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x * m} y={y * m} width={m + 0.6} height={m + 0.6} fill={colors.ink} /> : null)),
      )}
    </svg>
  );
};

const Star: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.5l-5.9 3.3 1.3-6.7-4.9-4.6 6.6-.8z" fill={colors.yellow} />
  </svg>
);

/** Scene 3: QR card pops in, stars pop one by one, then it shrinks up and reply bubbles stack below. */
export const QrScene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const cardAt = 10.0;
  const bracketAt = 10.9;
  const scanAt = 11.3;
  const starsAt = 10.45;
  const shrinkAt = wordTime("qr", "reply") - 0.1;

  const card = pop(frame, cardAt, BOUNCE);
  const bracket = pop(frame, bracketAt, SLAM);
  const shrink = pop(frame, shrinkAt, SNAP);
  const groupScale = lerp(shrink, 1, 0.68);
  const scan = clampRange(t, scanAt, scanAt + 0.8);
  const scanOn = t >= scanAt && t < scanAt + 0.9;

  const CARD_W = 560;
  const QR = 400;

  const bubbleAt = [shrinkAt + 0.25, shrinkAt + 0.65, shrinkAt + 1.05];

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "540px 290px",
          transform: `scale(${groupScale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: (1080 - CARD_W) / 2,
            top: 290,
            width: CARD_W,
            height: 582,
            boxSizing: "border-box",
            padding: 36,
            borderRadius: radii.large,
            background: colors.white,
            boxShadow: shadows.lifted,
            opacity: clampRange(card, 0, 0.3),
            transform: `translateY(${lerp(card, 260, 0)}px) rotate(${lerp(card, -14, -2)}deg) scale(${lerp(card, 0.4, 1)})`,
          }}
        >
          <div style={{ position: "relative", width: QR, height: QR }}>
            <QrArt size={QR} />
            {/* Viewfinder corners snap onto the code */}
            {[0, 1, 2, 3].map((i) => {
              const x = i % 2 === 0 ? -22 : QR + 22 - 56;
              const y = i < 2 ? -22 : QR + 22 - 56;
              const offset = lerp(bracket, 50, 0);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: x + (i % 2 === 0 ? -offset : offset),
                    top: y + (i < 2 ? -offset : offset),
                    width: 56,
                    height: 56,
                    opacity: clampRange(bracket, 0, 0.3),
                    borderColor: colors.chatGreen,
                    borderStyle: "solid",
                    borderWidth: 0,
                    borderTopWidth: i < 2 ? 10 : 0,
                    borderBottomWidth: i >= 2 ? 10 : 0,
                    borderLeftWidth: i % 2 === 0 ? 10 : 0,
                    borderRightWidth: i % 2 === 1 ? 10 : 0,
                    borderRadius: 8,
                  }}
                />
              );
            })}
            {scanOn && (
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  width: QR + 20,
                  top: scan * QR - 5,
                  height: 10,
                  borderRadius: radii.pill,
                  background: colors.chatGreen,
                  boxShadow: `0 0 30px ${alpha(colors.chatGreen, 0.9)}`,
                }}
              />
            )}
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 36,
              lineHeight: "46px",
              textAlign: "center",
              color: colors.ink,
              textWrap: "balance",
            } as React.CSSProperties}
          >
            {COPY.qr.label}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: (1080 - CARD_W) / 2,
            top: 902,
            width: CARD_W,
            height: 88,
            borderRadius: radii.pill,
            background: colors.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: shadows.lifted,
            opacity: clampRange(pop(frame, starsAt - 0.1, SNAP), 0, 0.3),
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const p = pop(frame, starsAt + i * 0.16, SLAM);
            return (
              <div key={i} style={{ transform: `scale(${lerp(p, 0, 1)}) rotate(${lerp(p, -50, 0)}deg)`, opacity: clampRange(p, 0, 0.2) }}>
                <Star size={64} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute", left: 780, top: 292, opacity: clampRange(card, 0, 0.3) }}>
        <ExampleTag text={COPY.app.example} />
      </div>

      {bubbleAt.map((at, i) => {
        const p = pop(frame, at, BOUNCE);
        if (p <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 120,
              top: 790 + i * 84,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "8px 26px 10px",
              borderRadius: `${radii.large}px ${radii.large}px 6px ${radii.large}px`,
              background: colors.chatGreen,
              color: colors.ink,
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 38,
              lineHeight: "46px",
              boxShadow: shadows.lifted,
              opacity: clampRange(p, 0, 0.3),
              transform: `translateX(${lerp(p, 300, 0)}px) scale(${lerp(p, 0.6, 1)})`,
              transformOrigin: "100% 100%",
            }}
          >
            {COPY.qr.sent}
            <svg width="44" height="30" viewBox="0 0 30 20">
              <path d="M1.5 10.5l5 5L16 4M10.5 14.5l1.5 1.5L21.5 4" fill="none" stroke={colors.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      })}
    </>
  );
};
