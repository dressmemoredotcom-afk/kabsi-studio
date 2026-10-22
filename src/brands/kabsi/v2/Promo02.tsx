import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { colors } from "../tokens";
import "../fonts";
import { Captions } from "./Captions";
import { whatsappBeats, WhatsappScene } from "./Chat";
import { End } from "./End";
import { Flash } from "./Flash";
import { Hook } from "./Hook";
import { ProtectScene, protectBeats } from "./Protect";
import { QrScene } from "./Qr";
import { PhoneV2, Rays } from "./Stage";
import { lines, scene } from "./timeline";

/** Promo 02: hard cuts on the voice, springy pop-ins, no slow fades. */
export const Promo02: React.FC = () => {
  const frame = useCurrentFrame();
  const hook = scene("hook");
  const wa = scene("whatsapp");
  const qr = scene("qr");
  const protect = scene("protect");
  const end = scene("end");
  const between = (s: { fromF: number; toF: number }) => frame >= s.fromF && frame < s.toF;

  return (
    <AbsoluteFill style={{ background: colors.black }}>
      {between(hook) && <Hook frame={frame} />}

      {between(wa) && (
        <AbsoluteFill>
          <Rays frame={frame} />
          <PhoneV2 frame={frame} zoomAtS={wa.from} punchesS={whatsappBeats}>
            <WhatsappScene frame={frame} />
          </PhoneV2>
        </AbsoluteFill>
      )}

      {between(qr) && (
        <AbsoluteFill>
          <Rays frame={frame} />
          <QrScene frame={frame} />
        </AbsoluteFill>
      )}

      {between(protect) && (
        <AbsoluteFill>
          <Rays frame={frame} />
          <PhoneV2 frame={frame} zoomAtS={protect.from} punchesS={protectBeats()}>
            <ProtectScene frame={frame} />
          </PhoneV2>
        </AbsoluteFill>
      )}

      {between(end) && <End frame={frame} startS={end.from} />}

      <Flash frame={frame} />
      <Captions frame={frame} />

      {lines.map((l) => (
        <Sequence key={l.id} from={l.startF} durationInFrames={l.durF + 2}>
          <Audio src={staticFile(`voice02/${l.id}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
