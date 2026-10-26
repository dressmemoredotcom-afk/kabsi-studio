import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../tokens";
import { END_CARD_SECONDS, STRINGS } from "../kit";
import { clampRange } from "../../../engine/src/anim";
import { Logo } from "./Logo";
import { SafeZone } from "./SafeZone";
import { SmallPrint } from "./SmallPrint";

const Card: React.FC<{ smallPrint: boolean; allowMissingLogo: boolean }> = ({ smallPrint, allowMissingLogo }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const rise = (atS: number) => {
    const t = clampRange(frame, atS * fps, (atS + 0.4) * fps);
    return { opacity: t, transform: `translateY(${(1 - t) * 24}px)` };
  };
  const wide = width > 1200;
  return (
    <div style={{ position: "absolute", inset: 0, background: colors.night }}>
      <SafeZone>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: wide ? 44 : 56 }}>
          <div style={rise(0.1)}>
            <Logo kind="mark" height={wide ? 200 : 260} allowMissing={allowMissingLogo} />
          </div>
          <div style={{ ...rise(0.5), fontFamily: fonts.title, fontWeight: 700, fontSize: wide ? 92 : 84, lineHeight: 1.1, color: colors.paper, maxWidth: wide ? 1300 : 860, textWrap: "balance" } as React.CSSProperties}>{STRINGS.endLine}</div>
          <div style={{ ...rise(0.9), fontFamily: fonts.body, fontWeight: 600, fontSize: 44, color: colors.paper }}>{STRINGS.endCta}</div>
        </div>
        {smallPrint && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", ...rise(1.2) }}>
            <SmallPrint />
          </div>
        )}
      </SafeZone>
    </div>
  );
};

/**
 * The end card: the mark, "Your business on Google. Taken care of." and "Free check at kabsi.co", for the last 3
 * seconds. `totalS` is the length of the video; the card starts at totalS - 3.
 */
export const EndCard: React.FC<{ totalS: number; smallPrint?: boolean; allowMissingLogo?: boolean }> = ({ totalS, smallPrint = false, allowMissingLogo = false }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round((totalS - END_CARD_SECONDS) * fps)} durationInFrames={Math.round(END_CARD_SECONDS * fps)}>
      <Card smallPrint={smallPrint} allowMissingLogo={allowMissingLogo} />
    </Sequence>
  );
};
