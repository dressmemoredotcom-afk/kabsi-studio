import React from "react";
import { KineticCaptions } from "../components/KineticCaptions";
import { captionChunks } from "./timeline";

/** Promo 02 captions: the shared kinetic captions fed from promo 02's timeline. */
export const Captions: React.FC<{ frame: number }> = ({ frame }) => (
  <KineticCaptions frame={frame} chunks={captionChunks} />
);
