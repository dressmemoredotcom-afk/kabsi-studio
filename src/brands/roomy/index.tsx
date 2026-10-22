import React from "react";
import { Composition } from "remotion";
import { FRAME } from "../../core/frame";
import listingFile from "../../../assets/roomy/listing.json";
import { DynamicReel } from "./DynamicReel";
import { RoomyListingSchema } from "./schema";
import { TOTAL_FRAMES } from "./storyboard";

/** assets/roomy/listing.json, checked against the schema, with defaults filled in. A bad file fails with a clear message. */
export const defaultListing = RoomyListingSchema.parse(listingFile);

/** Roomy Properties: RoomyDynamicReel, a 22 second listing reel built from assets/roomy/listing.json. */
export const RoomyCompositions: React.FC = () => (
  <Composition
    id="RoomyDynamicReel"
    component={DynamicReel}
    schema={RoomyListingSchema}
    defaultProps={defaultListing}
    durationInFrames={TOTAL_FRAMES}
    fps={FRAME.fps}
    width={FRAME.width}
    height={FRAME.height}
  />
);
