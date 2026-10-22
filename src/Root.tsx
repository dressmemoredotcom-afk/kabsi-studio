import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FRAME } from "./tokens";
import { TOTAL_FRAMES } from "./timeline";
import { PromoVideoV3 } from "./compositions/PromoVideoV3";
import { RoomyApartmentReel } from "./compositions/RoomyApartmentReel";
import { TR } from "./timelineRoomy";
import { T3 } from "./timeline03";
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
    <Composition
      id="PromoVideoV3"
      component={PromoVideoV3}
      durationInFrames={T3.TOTAL_FRAMES}
      fps={FRAME.fps}
      width={FRAME.width}
      height={FRAME.height}
    />
    <Composition
      id="RoomyApartmentReel"
      component={RoomyApartmentReel}
      durationInFrames={TR.TOTAL_FRAMES}
      fps={FRAME.fps}
      width={FRAME.width}
      height={FRAME.height}
    />
  </>
);
