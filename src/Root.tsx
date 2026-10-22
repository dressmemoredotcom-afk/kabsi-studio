import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FRAME } from "./tokens";
import { TOTAL_FRAMES } from "./timeline";

export const Root: React.FC = () => (
  <Composition
    id="KabsiPromo01"
    component={Promo}
    durationInFrames={TOTAL_FRAMES}
    fps={FRAME.fps}
    width={FRAME.width}
    height={FRAME.height}
  />
);
