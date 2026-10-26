import React from "react";
import { alpha, colors, radii, shadows } from "../tokens";

/** Frame coordinates of the phone body, and the screen inside it. */
export const PHONE_BOX = { x: 100, y: 170, w: 880, rim: 6, bezel: 16 };
export const PHONE_SCREEN = {
  x: PHONE_BOX.x + PHONE_BOX.rim + PHONE_BOX.bezel,
  y: PHONE_BOX.y + PHONE_BOX.rim + PHONE_BOX.bezel,
  w: PHONE_BOX.w - 2 * (PHONE_BOX.rim + PHONE_BOX.bezel),
};

const button = (side: "left" | "right", top: number, height: number): React.CSSProperties => ({
  position: "absolute",
  top: PHONE_BOX.y + top,
  left: side === "left" ? PHONE_BOX.x - 7 : PHONE_BOX.x + PHONE_BOX.w,
  width: 7,
  height,
  borderRadius: 4,
  background: `linear-gradient(${side === "left" ? 270 : 90}deg, ${colors.stone}, ${colors.stoneOnDark})`,
});

/**
 * A phone drawn in CSS: titanium rim, black glass bezel, dynamic island, side buttons and a glass sheen
 * across the screen. Cropped by the bottom of the frame. Children are positioned relative to the screen.
 */
export const PhoneMockup: React.FC<{ background?: string; children: React.ReactNode }> = ({
  background = colors.sand,
  children,
}) => {
  const screenRadius = 98;
  return (
    <>
      <div style={button("left", 300, 64)} />
      <div style={button("left", 430, 118)} />
      <div style={button("left", 580, 118)} />
      <div style={button("right", 500, 176)} />

      <div
        style={{
          position: "absolute",
          left: PHONE_BOX.x,
          top: PHONE_BOX.y,
          width: PHONE_BOX.w,
          height: 2100,
          borderRadius: `${screenRadius + 22}px ${screenRadius + 22}px 0 0`,
          background: `linear-gradient(145deg, ${colors.stoneOnDark} 0%, ${colors.stone} 28%, ${colors.ink} 52%, ${colors.stone} 78%, ${colors.stoneOnDark} 100%)`,
          boxShadow: shadows.phone,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PHONE_BOX.x + PHONE_BOX.rim,
          top: PHONE_BOX.y + PHONE_BOX.rim,
          width: PHONE_BOX.w - 2 * PHONE_BOX.rim,
          height: 2100,
          borderRadius: `${screenRadius + 16}px ${screenRadius + 16}px 0 0`,
          background: colors.black,
          boxShadow: `inset 0 0 0 2px ${alpha(colors.white, 0.08)}`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: PHONE_SCREEN.x,
          top: PHONE_SCREEN.y,
          width: PHONE_SCREEN.w,
          height: 2100,
          borderRadius: `${screenRadius}px ${screenRadius}px 0 0`,
          background,
          overflow: "hidden",
        }}
      >
        {children}

        {/* Glass: a soft diagonal reflection and a bright inner edge, over everything on the screen. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 30,
            borderRadius: `${screenRadius}px ${screenRadius}px 0 0`,
            background: `linear-gradient(118deg, ${alpha(colors.white, 0.2)} 0%, ${alpha(colors.white, 0.05)} 20%, ${alpha(colors.white, 0)} 36%, ${alpha(colors.white, 0)} 72%, ${alpha(colors.white, 0.06)} 100%)`,
            boxShadow: `inset 0 0 0 1.5px ${alpha(colors.white, 0.16)}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: PHONE_SCREEN.w / 2 - 88,
            top: 20,
            width: 176,
            height: 50,
            borderRadius: radii.pill,
            background: colors.black,
            zIndex: 31,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 14,
              width: 22,
              height: 22,
              borderRadius: radii.pill,
              background: `radial-gradient(circle at 35% 35%, ${alpha(colors.stoneOnDark, 0.5)}, ${colors.ink} 70%)`,
            }}
          />
        </div>
      </div>
    </>
  );
};
