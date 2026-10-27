import React from "react";
import { Composition } from "remotion";
import { FRAME } from "./tokens";
import { parseSize } from "./formats";
import { KitTest } from "./videos/kit-test";
import { COPY as KIT_TEST } from "./videos/kit-test.copy";
import { W1 } from "./videos/W1";
import { COPY as W1_COPY } from "./videos/W1.copy";
import type { VideoCopy } from "./videos/types";

type Video = { copy: VideoCopy; component: React.FC<{ safeZoneDebug?: boolean }> };

/** Every Kabsi video. Each video's id is its catalogue ID from docs/VIDEO-PLAN.md section 4, or kit-test. */
const VIDEOS: Video[] = [
  { copy: KIT_TEST, component: KitTest },
  { copy: W1_COPY, component: W1 },
];

/** One composition per video and size, named <ID>-<width>x<height>. */
export const Root: React.FC = () => (
  <>
    {VIDEOS.flatMap(({ copy, component }) =>
      copy.sizes.map((size) => {
        const { width, height } = parseSize(size);
        return (
          <Composition
            key={`${copy.id}-${size}`}
            id={`${copy.id}-${size}`}
            component={component}
            defaultProps={{ safeZoneDebug: false }}
            durationInFrames={copy.seconds * FRAME.fps}
            fps={FRAME.fps}
            width={width}
            height={height}
          />
        );
      }),
    )}
  </>
);
