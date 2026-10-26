import React from "react";
import { alpha, colors, fonts } from "../tokens";
import { STRINGS } from "../kit";

/** "Kabsi is independent and not affiliated with Google." Needed on ads and explainers. Keep it inside the safe zone. */
export const SmallPrint: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 28, lineHeight: "36px", color: alpha(colors.paper, 0.78), ...style }}>{STRINGS.smallPrint}</div>
);
