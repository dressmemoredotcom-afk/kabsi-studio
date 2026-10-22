import React from "react";
import { Composition } from "remotion";
import { FRAME } from "./tokens";
import { Promo } from "./Promo";
import { TOTAL_FRAMES } from "./timeline";
import { PromoVideoV3 } from "./compositions/PromoVideoV3";
import { T3 } from "./timeline03";
import { Promo02 } from "./v2/Promo02";
import { TOTAL_FRAMES as TOTAL_FRAMES_02 } from "./v2/timeline";

/** Kabsi.co promos: KabsiPromo01, KabsiPromo02 and PromoVideoV3. */
export const KabsiCompositions: React.FC = () => (
  <>
    <Composition id="KabsiPromo01" component={Promo} durationInFrames={TOTAL_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="KabsiPromo02" component={Promo02} durationInFrames={TOTAL_FRAMES_02} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="PromoVideoV3" component={PromoVideoV3} durationInFrames={T3.TOTAL_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
  </>
);
