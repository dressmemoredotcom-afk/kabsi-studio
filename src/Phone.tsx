import React from "react";
import { colors, radii, shadows } from "./tokens";
import { clampRange, pop } from "./anim";
import { Easing, interpolate } from "remotion";

/** Frame coordinates of the phone. The screen's own origin is SCREEN.x, SCREEN.y. */
export const PHONE = { x: 100, y: 170, w: 880, bezel: 18 };
export const SCREEN = { x: PHONE.x + PHONE.bezel, y: PHONE.y + PHONE.bezel, w: PHONE.w - PHONE.bezel * 2 };

/** Phone body cropped by the bottom of the frame, with a slow push to 105 percent. */
export const Phone: React.FC<{
  frame: number;
  riseAtS: number;
  pushFromF: number;
  pushToF: number;
  children: React.ReactNode;
}> = ({ frame, riseAtS, pushFromF, pushToF, children }) => {
  const rise = pop(frame, riseAtS);
  const push = interpolate(frame, [pushFromF, pushToF], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // Push from the top of the content so nothing moves up out of the safe area.
        transformOrigin: "540px 280px",
        transform: `translateY(${(1 - rise) * 420}px) scale(${push})`,
        opacity: clampRange(rise, 0, 0.25),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PHONE.x,
          top: PHONE.y,
          width: PHONE.w,
          height: 2100,
          boxSizing: "border-box",
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
          }}
        />
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 28,
              top: 1070 + i * 250,
              width: 788,
              height: 222,
              boxSizing: "border-box",
              borderRadius: radii.card,
              background: colors.white,
              border: `2px solid ${colors.hairline}`,
              padding: 28,
            }}
          >
            {[260, 520, 400].map((w, j) => (
              <div
                key={j}
                style={{
                  width: w,
                  height: 22,
                  borderRadius: radii.pill,
                  background: colors.hairline,
                  marginBottom: 22,
                }}
              />
            ))}
          </div>
        ))}
        {children}
      </div>
    </div>
  );
};
