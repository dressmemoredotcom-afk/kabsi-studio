import React from "react";
import { useVideoConfig } from "remotion";
import { alpha, colors, fonts, SAFE } from "../tokens";
import { SAFE_MARGIN } from "../kit";

/** The safe rectangle for the current frame size: the plan's insets at 1080 x 1920, an even margin at any other size. */
export const useSafeBox = () => {
  const { width, height } = useVideoConfig();
  return width === 1080 && height === 1920
    ? { ...SAFE }
    : { left: SAFE_MARGIN, right: width - SAFE_MARGIN, top: SAFE_MARGIN, bottom: height - SAFE_MARGIN };
};

/**
 * Keeps text out of the platforms' interface: children are laid out inside the safe rectangle (1080 x 1920: not the
 * top 220 px, bottom 420 px or right 120 px). `debug` draws the forbidden bands over the picture; it is off in every
 * render, and on only when you switch it on in Studio.
 */
export const SafeZone: React.FC<{ debug?: boolean; children?: React.ReactNode }> = ({ debug = false, children }) => {
  const { width, height } = useVideoConfig();
  const box = useSafeBox();
  const band: React.CSSProperties = { position: "absolute", background: alpha(colors.red, 0.28) };
  const label: React.CSSProperties = { position: "absolute", fontFamily: fonts.body, fontWeight: 700, fontSize: 26, color: colors.paper };
  return (
    <>
      <div style={{ position: "absolute", left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top }}>{children}</div>
      {debug && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100 }}>
          <div style={{ ...band, left: 0, top: 0, width, height: box.top }} />
          <div style={{ ...band, left: 0, top: box.bottom, width, height: height - box.bottom }} />
          <div style={{ ...band, left: box.right, top: box.top, width: width - box.right, height: box.bottom - box.top }} />
          <div style={{ ...band, left: 0, top: box.top, width: box.left, height: box.bottom - box.top }} />
          <div style={{ position: "absolute", left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top, border: `3px dashed ${colors.red}`, boxSizing: "border-box" }} />
          <div style={{ ...label, left: 16, top: 16 }}>top {box.top}</div>
          <div style={{ ...label, left: 16, top: box.bottom + 16 }}>bottom {height - box.bottom}</div>
          <div style={{ ...label, left: box.right + 8, top: box.top + 16 }}>right {width - box.right}</div>
        </div>
      )}
    </>
  );
};
