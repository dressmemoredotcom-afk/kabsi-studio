import React from "react";
import { Easing, Img, interpolate } from "remotion";
import { lerp } from "../../../core/anim";
import { PlaceholderBackdrop } from "./primitives";

/**
 * A photo that always fills the frame (object-fit: cover) and moves slowly. Even-numbered scenes push in from 1.00
 * to 1.06, odd-numbered ones pull back from 1.06 to 1.00. A landscape photo also drifts sideways so the crop to
 * portrait keeps moving across the picture.
 */
export const KenBurnsPhoto: React.FC<{
  src: string | null;
  frame: number;
  from: number;
  /** Frames the move lasts, including the frames that play while the next scene dissolves in. */
  frames: number;
  index: number;
  width: number;
  height: number;
}> = ({ src, frame, from, frames, index, width, height }) => {
  if (!src) return <PlaceholderBackdrop frame={frame} variant={index % 3} />;
  const k = interpolate(frame, [from, from + frames], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pushIn = index % 2 === 0;
  const scale = pushIn ? lerp(k, 1, 1.06) : lerp(k, 1.06, 1);
  const landscape = width > height;
  // Drift 8 points either way around the centre, in the direction opposite to the previous landscape scene.
  const x = landscape ? (pushIn ? lerp(k, 42, 58) : lerp(k, 58, 42)) : 50;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 50%`, transform: `scale(${scale})`, transformOrigin: "50% 50%" }} />
    </div>
  );
};
