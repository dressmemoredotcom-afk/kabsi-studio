import React from "react";
import { Composition } from "remotion";
import { z } from "zod";
import { FRAME } from "../../engine/src/frame";
import defaultListing from "../listings/sursock-580sqm-v3.json";
import { DynamicReel } from "./DynamicReel";
import { RoomyListingSchema } from "./schema";
import { totalFrames } from "./storyboard";

/** The reel's props: one listing, from roomy/listings/<id>.json. The render passes it as input props. */
export const RoomyReelPropsSchema = z.object({ listing: RoomyListingSchema });

/**
 * Roomy Properties: RoomyDynamicReel, a listing reel (22 seconds unless durationSeconds says otherwise). Studio opens
 * on sursock-580sqm-v3; `npm run roomy:studio -- <id>` opens on another listing. A bad listing fails with a clear message.
 */
export const Root: React.FC = () => (
  <Composition
    id="RoomyDynamicReel"
    component={DynamicReel}
    schema={RoomyReelPropsSchema}
    defaultProps={{ listing: RoomyListingSchema.parse(defaultListing) }}
    calculateMetadata={({ props }) => {
      const listing = RoomyListingSchema.parse(props.listing);
      return { props: { listing }, durationInFrames: totalFrames(listing) };
    }}
    fps={FRAME.fps}
    width={FRAME.width}
    height={FRAME.height}
  />
);
