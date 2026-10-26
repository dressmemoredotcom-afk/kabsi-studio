import React from "react";
import { AbsoluteFill } from "remotion";
import "../fonts";
import { colors, fonts } from "../tokens";
import { COPY } from "./kit-test.copy";

/** A placeholder so the Kabsi entry bundles: five seconds of the word on the night background. */
export const KabsiKitTest: React.FC = () => (
  <AbsoluteFill style={{ background: colors.night, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: fonts.title, fontSize: 220, color: colors.yellow, lineHeight: 1 }}>{COPY.screen.word as string}</div>
  </AbsoluteFill>
);
