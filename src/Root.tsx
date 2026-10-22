import React from "react";
import { KabsiCompositions } from "./brands/kabsi";
import { RoomyCompositions } from "./brands/roomy";

/** Every composition, grouped by brand: Roomy Properties (RoomyDynamicReel) and Kabsi (KabsiPromo01, KabsiPromo02, PromoVideoV3). */
export const Root: React.FC = () => (
  <>
    <RoomyCompositions />
    <KabsiCompositions />
  </>
);
