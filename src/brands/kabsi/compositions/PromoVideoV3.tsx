import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fonts";
import { AudioMix } from "../../../core/audio/AudioMix";
import { BRollLayer, type BRollClip } from "../components/BRollLayer";
import { CutFlash } from "../components/CutFlash";
import { KineticCaptions } from "../components/KineticCaptions";
import { PhoneMockup } from "../components/PhoneMockup";
import { Rays } from "../components/Rays";
import { clampRange, lerp, pop } from "../../../core/anim";
import { colors } from "../tokens";
import { T3 } from "../timeline03";
import { BOUNCE, SNAP } from "../v2/spring";
import { HookScene } from "./v3/HookScene";
import { OutroScene } from "./v3/OutroScene";
import { QrScene } from "./v3/QrScene";
import { WhatsAppScene, waBeats } from "./v3/WhatsAppScene";
import { DUCK, SFX_CUES } from "./v3/events";

/**
 * External clips (AI b-roll, a talking head, a screen capture) go here. Put the file in assets/video
 * and add a line, for example { file: "cafe-counter.mp4", fromS: 0, toS: 3 }. The clip plays under the
 * UI, captions and sound mix. Empty: this template uses drawn graphics only.
 */
export const BROLL: readonly BRollClip[] = [];

const BGM = "audio/bgm/kabsi-upbeat-loop.mp3";

/** The phone zooms in with a bounce on the cut and punches slightly on each beat. */
const PhoneStage: React.FC<{ frame: number; zoomAtS: number; punchesS: readonly number[]; children: React.ReactNode }> = ({
  frame,
  zoomAtS,
  punchesS,
  children,
}) => {
  const zoom = pop(frame, zoomAtS, BOUNCE);
  const punch = punchesS.reduce((sum, t) => (frame / 30 >= t ? sum + 0.03 * (1 - pop(frame, t, SNAP)) : sum), 0);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // Scale from the top of the content so nothing moves up out of the safe area.
        transformOrigin: "540px 280px",
        transform: `translateY(${lerp(zoom, 140, 0)}px) scale(${lerp(zoom, 0.5, 1) + punch})`,
        opacity: clampRange(zoom, 0, 0.2),
      }}
    >
      {children}
    </div>
  );
};

/** PromoVideoV3: about twenty seconds, 1080 x 1920, 30 fps. Hook, WhatsApp, QR counter stand, outro. */
export const PromoVideoV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { scene, lines, captionChunks, scenes } = T3;
  const hook = scene("hook");
  const wa = scene("whatsapp");
  const qr = scene("qr");
  const end = scene("end");
  const within = (s: { fromF: number; toF: number }) => frame >= s.fromF && frame < s.toF;

  return (
    <AbsoluteFill style={{ background: colors.black }}>
      <BRollLayer clips={BROLL} />

      {within(hook) && <HookScene frame={frame} fromF={hook.fromF} toF={hook.toF} />}

      {within(wa) && (
        <AbsoluteFill>
          <Rays frame={frame} />
          <PhoneStage frame={frame} zoomAtS={wa.from} punchesS={waBeats}>
            <PhoneMockup>
              <WhatsAppScene frame={frame} />
            </PhoneMockup>
          </PhoneStage>
        </AbsoluteFill>
      )}

      {within(qr) && (
        <AbsoluteFill>
          <QrScene frame={frame} />
        </AbsoluteFill>
      )}

      {within(end) && <OutroScene frame={frame} />}

      <CutFlash frame={frame} cutFrames={scenes.slice(1).map((s) => s.fromF)} />
      <KineticCaptions frame={frame} chunks={captionChunks} />

      <AudioMix
        voice={lines.map((l) => {
          if (!l.file) throw new Error(`No voice file for ${l.id}. Run npm run voice:03.`);
          return { src: l.file, startF: l.startF, durF: l.durF };
        })}
        bgm={BGM}
        duck={DUCK}
        sfx={SFX_CUES}
      />
    </AbsoluteFill>
  );
};
