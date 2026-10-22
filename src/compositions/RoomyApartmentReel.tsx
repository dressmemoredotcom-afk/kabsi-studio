import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fontsRoomy";
import { roomy } from "../tokens";
import { clampRange } from "../anim";
import { SCREEN as COPY } from "../scriptRoomy";
import { TR } from "../timelineRoomy";
import { RoomyAudio } from "./roomy/RoomyAudio";
import { ClipScene, HookScene, OVERLAP, OutroScene, SpecsScene } from "./roomy/scenes";

/** Source frames in apartment-walkthrough.mp4 where each clip starts: second 1 (the salon) and second 19 (the terrace). */
const SALON_FROM_FRAME = 30;
const TERRACE_FROM_FRAME = 570;

/**
 * Roomy Properties, "Downtown 275 sqm": a 28 second luxury real estate reel, 1080 x 1920, 30 fps, 840 frames.
 *   0 to 4 s    the ruins view (photo, slow push 1.00 to 1.05)
 *   4 to 10 s   the grand salon (walkthrough, seconds 1 to 7, muted)
 *   10 to 16 s  the terrace (walkthrough, seconds 19 to 25, muted)
 *   16 to 22 s  the master suite (photo, sharp, slow push 1.00 to 1.05)
 *   22 to 28 s  outro with the logo
 * Scenes dissolve into each other. Any missing photo, clip, logo or track falls back to a designed placeholder,
 * see scripts/roomy-assets.mjs. The length comes from SCENES in src/scriptRoomy.ts (TR.TOTAL_FRAMES, 840).
 */
export const RoomyApartmentReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { scene } = TR;
  const hook = scene("hook");
  const salon = scene("salon");
  const terrace = scene("terrace");
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
      {layer(
        salon,
        1,
        <ClipScene frame={frame} from={salon.fromF} to={salon.toF} trimBefore={SALON_FROM_FRAME} rows={COPY.salon.bar} variant={2} />,
      )}
      {layer(
        terrace,
        2,
        <ClipScene frame={frame} from={terrace.fromF} to={terrace.toF} trimBefore={TERRACE_FROM_FRAME} rows={COPY.terrace.bar} variant={1} />,
      )}
      {layer(specs, 3, <SpecsScene frame={frame} from={specs.fromF} to={specs.toF} />)}
      {layer(outro, 4, <OutroScene frame={frame} from={outro.fromF} />)}
      <RoomyAudio />
    </AbsoluteFill>
  );
};
