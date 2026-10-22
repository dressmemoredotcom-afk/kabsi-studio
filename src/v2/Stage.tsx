import React from "react";
import { colors, radii, shadows } from "../tokens";
import { clampRange, lerp, pop } from "../anim";
import { PHONE, SCREEN } from "../Phone";
import { BOUNCE, SNAP } from "./spring";

/** Yellow field with slowly turning rays: movement behind everything. */
export const Rays: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      position: "absolute",
      inset: -400,
      background: `repeating-conic-gradient(from ${frame * 0.7}deg at 50% 50%, ${colors.yellow} 0deg 12deg, ${colors.yellowPressed} 12deg 24deg)`,
    }}
  />
);

/** Phone that zooms in with a bounce on the cut and punches slightly on each beat. */
export const PhoneV2: React.FC<{
  frame: number;
  zoomAtS: number;
  punchesS?: number[];
  children: React.ReactNode;
}> = ({ frame, zoomAtS, punchesS = [], children }) => {
  const zoom = pop(frame, zoomAtS, BOUNCE);
  const punch = punchesS.reduce((sum, t) => (frame / 30 >= t ? sum + 0.035 * (1 - pop(frame, t, SNAP)) : sum), 0);
  const scale = lerp(zoom, 0.5, 1) + punch;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // Scale from the top of the content so nothing moves up out of the safe area.
        transformOrigin: "540px 280px",
        transform: `translateY(${lerp(zoom, 140, 0)}px) scale(${scale})`,
        opacity: clampRange(zoom, 0, 0.2),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PHONE.x,
          top: PHONE.y,
          width: PHONE.w,
          height: 2100,
          borderRadius: `${radii.large * 4}px ${radii.large * 4}px 0 0`,
          background: colors.ink,
          boxShadow: shadows.lifted,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SCREEN.x,
          top: SCREEN.y,
          width: SCREEN.w,
          height: 2100,
          borderRadius: `${radii.large * 3}px ${radii.large * 3}px 0 0`,
          background: colors.sand,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: SCREEN.w / 2 - 80,
            top: 18,
            width: 160,
            height: 44,
            borderRadius: radii.pill,
            background: colors.ink,
            zIndex: 5,
          }}
        />
        {children}
      </div>
    </div>
  );
};
