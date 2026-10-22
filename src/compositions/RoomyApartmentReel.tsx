import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fontsRoomy";
import { roomy } from "../tokens";
import { clampRange } from "../anim";
import { TR } from "../timelineRoomy";
import { RoomyAudio } from "./roomy/RoomyAudio";
import { HookScene, LibraryScene, OVERLAP, OutroScene, SpecsScene, TerraceScene } from "./roomy/scenes";

/**
 * Roomy Properties, "Downtown 275 sqm": a 22 second luxury real estate reel, 1080 x 1920, 30 fps, 660 frames.
 * Five scenes dissolve into each other. Any missing photo, clip, logo or track falls back to a designed
 * placeholder, see scripts/roomy-assets.mjs.
 */
export const RoomyApartmentReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { scene } = TR;
  const hook = scene("hook");
  const terrace = scene("terrace");
  const library = scene("library");
  const specs = scene("specs");
  const outro = scene("outro");

  /** A scene stays on screen through the next one's dissolve. The first fades up from charcoal. */
  const layer = (s: { fromF: number; toF: number }, index: number, children: React.ReactNode) => {
    if (frame < s.fromF || frame >= s.toF + OVERLAP) return null;
    const fade = index === 0 ? clampRange(frame, 0, 10) : clampRange(frame, s.fromF, s.fromF + OVERLAP);
    return <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>;
  };

  return (
    <AbsoluteFill style={{ background: roomy.charcoal }}>
      {layer(hook, 0, <HookScene frame={frame} from={hook.fromF} to={hook.toF} />)}
      {layer(terrace, 1, <TerraceScene frame={frame} from={terrace.fromF} />)}
      {layer(library, 2, <LibraryScene frame={frame} from={library.fromF} to={library.toF} />)}
      {layer(specs, 3, <SpecsScene frame={frame} from={specs.fromF} />)}
      {layer(outro, 4, <OutroScene frame={frame} from={outro.fromF} />)}
      <RoomyAudio />
    </AbsoluteFill>
  );
};
