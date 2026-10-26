import React from "react";
import { Composition } from "remotion";
import { FRAME } from "./tokens";
import { KabsiKitTest } from "./videos/KabsiKitTest";
import { COPY as KIT_TEST } from "./videos/kit-test.copy";

/** Every Kabsi composition. Each video's id is its catalogue ID from docs/VIDEO-PLAN.md section 4. */
export const Root: React.FC = () => (
  <>
    <Composition id={KIT_TEST.id} component={KabsiKitTest} durationInFrames={KIT_TEST.seconds * FRAME.fps} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
  </>
);
