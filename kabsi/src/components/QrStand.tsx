import React from "react";
import { alpha, colors, fonts, radii, shadows } from "../tokens";
import { QrArt } from "./QrArt";

export const STAND = { cardW: 500, cardH: 600, qr: 330, baseH: 34 };

/**
 * A counter-top QR stand drawn in 3D: acrylic card on a dark base, with a soft shadow on the counter.
 * `scan` runs a light beam over the code (0 to 1, or -1 for off). Position and scale come from the caller.
 */
export const QrStand: React.FC<{
  label: string;
  brand: string;
  scan: number;
  style?: React.CSSProperties;
}> = ({ label, brand, scan, style }) => (
  <div style={{ position: "absolute", width: STAND.cardW, height: STAND.cardH + STAND.baseH, perspective: 1800, ...style }}>
    <div
      style={{
        position: "absolute",
        left: 30,
        right: 30,
        bottom: -28,
        height: 40,
        borderRadius: "50%",
        background: alpha(colors.black, 0.35),
        filter: "blur(18px)",
      }}
    />
    <div style={{ position: "absolute", inset: 0, transform: "rotateY(-13deg) rotateX(4deg)", transformStyle: "preserve-3d" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: STAND.cardW,
          height: STAND.cardH,
          boxSizing: "border-box",
          padding: "34px 34px 0",
          borderRadius: `${radii.large + 8}px ${radii.large + 8}px 10px 10px`,
          background: colors.white,
          border: `3px solid ${alpha(colors.white, 0.9)}`,
          boxShadow: `${shadows.lifted}, inset 0 0 0 2px ${colors.hairline}`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", width: STAND.qr, height: STAND.qr, margin: "0 auto" }}>
          <QrArt size={STAND.qr} />
          {scan >= 0 && (
            <div
              style={{
                position: "absolute",
                left: -12,
                width: STAND.qr + 24,
                top: scan * STAND.qr - 5,
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
            marginTop: 20,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 34,
            lineHeight: "44px",
            textAlign: "center",
            color: colors.ink,
            textWrap: "balance",
          } as React.CSSProperties}
        >
          {label}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 70,
            background: colors.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.title,
            fontSize: 48,
            lineHeight: "70px",
            color: colors.yellow,
          }}
        >
          {brand}
        </div>
        {/* Acrylic glare */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(112deg, ${alpha(colors.white, 0.55)} 0%, ${alpha(colors.white, 0)} 30%, ${alpha(colors.white, 0)} 68%, ${alpha(colors.white, 0.25)} 100%)`,
            mixBlendMode: "soft-light",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: -22,
          right: -22,
          top: STAND.cardH - 6,
          height: STAND.baseH + 6,
          borderRadius: "10px 10px 22px 22px",
          background: `linear-gradient(180deg, ${colors.stone} 0%, ${colors.ink} 40%, ${colors.carbon} 100%)`,
          boxShadow: `0 6px 0 ${alpha(colors.black, 0.4)}`,
        }}
      />
    </div>
  </div>
);
