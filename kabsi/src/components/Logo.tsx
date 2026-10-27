import React from "react";
import { Img, staticFile } from "remotion";
import { colors } from "../tokens";
import { LOGO } from "../kit";

/**
 * The Kabsi ring mark, straight from kabsi/public/brand/kabsi-mark.svg (the design studio's favicon.svg, unchanged;
 * never redrawn or recoloured). `height` is its size in pixels, and it is round. Like the studio's KabsiMark, `ring`
 * (the default) sets it in a paper disc with a 2 px ring at 32 px, so the black circle stays visible on a dark ground;
 * pass `ring={false}` on a light ground. If the file goes missing the render fails.
 */
export const LogoMark: React.FC<{ height: number; ring?: boolean }> = ({ height, ring = true }) => {
  const pad = ring ? (height * 2) / 32 : 0;
  return (
    <div style={{ width: height, height, boxSizing: "border-box", flexShrink: 0, borderRadius: "50%", padding: pad, background: ring ? colors.paper : undefined }}>
      <Img src={staticFile(LOGO.mark)} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
};
