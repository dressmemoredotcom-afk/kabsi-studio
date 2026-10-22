import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { colors } from "./tokens";
import { Captions } from "./Captions";
import { EndCard } from "./EndCard";
import { Hook } from "./Hook";
import { Phone } from "./Phone";
import { AppHeader, Protection, Report, ReviewFlow, ScreenSwap } from "./screens";
import { lines, scenes } from "./timeline";
import "./fonts";

const scene = (id: string) => {
  const s = scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const hook = scene("hook");
  const draft = scene("draft");
  const approve = scene("approve");
  const protect = scene("protect");
  const report = scene("report");
  const end = scene("end");

  const phoneOn = frame >= draft.fromF && frame < end.fromF;
  return (
    <AbsoluteFill style={{ background: colors.black }}>
      {frame < draft.fromF && <Hook frame={frame} />}

      {phoneOn && (
        <AbsoluteFill style={{ background: colors.yellow }}>
          <Phone
            frame={frame}
            riseAtS={draft.from + 0.05}
            pushFromF={draft.fromF}
            pushToF={end.fromF}
          >
            <AppHeader />
            <ScreenSwap frame={frame} fromF={draft.fromF} toF={protect.fromF}>
              <ReviewFlow frame={frame} />
            </ScreenSwap>
            <ScreenSwap frame={frame} fromF={protect.fromF} toF={report.fromF}>
              <Protection frame={frame} />
            </ScreenSwap>
            <ScreenSwap frame={frame} fromF={report.fromF} toF={end.fromF} outro={false}>
              <Report frame={frame} />
            </ScreenSwap>
          </Phone>
        </AbsoluteFill>
      )}

      {frame >= end.fromF && <EndCard frame={frame} startS={end.from} />}

      <Captions frame={frame} />

      {lines.map((l) => (
        <Sequence key={l.id} from={l.startF} durationInFrames={l.durF + 2}>
          <Audio src={staticFile(`voice/${l.id}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
