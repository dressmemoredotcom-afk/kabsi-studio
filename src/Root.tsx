import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FRAME } from "./tokens";
import { TOTAL_FRAMES } from "./timeline";
import { Promo02 } from "./v2/Promo02";
import { TOTAL_FRAMES as TOTAL_FRAMES_02 } from "./v2/timeline";

export const Root: React.FC = () => (
  <>
    <Composition
    id="KabsiPromo01"
    component={Promo}
    durationInFrames={TOTAL_FRAMES}
    fps={FRAME.fps}
    width={FRAME.width}
    height={FRAME.height}
    />
    <Composition
      id="KabsiPromo02"
      component={Promo02}
      durationInFrames={TOTAL_FRAMES_02}
      fps={FRAME.fps}
      width={FRAME.width}
      height={FRAME.height}
    />
  </>
);
