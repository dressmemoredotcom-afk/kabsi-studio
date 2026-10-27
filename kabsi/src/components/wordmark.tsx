import React from "react";
import { colors, fonts } from "../tokens";
import { LOCKUP, STRINGS, WORDMARK } from "../kit";
import { LogoMark } from "./Logo";

/**
 * The wordmark: the text "Kabsi" in Bricolage Grotesque Bold 700, letter spacing -0.02em, ink on a light
 * ground and paper on a dark one. It is set as text, never drawn as a picture. `size` is the font size in px.
 */
export const Wordmark: React.FC<{ size: number; on: "light" | "dark" }> = ({ size, on }) => (
  <span
    style={{
      fontFamily: fonts.title,
      fontVariationSettings: fonts.titleVariation,
      fontWeight: WORDMARK.weight,
      letterSpacing: WORDMARK.letterSpacing,
      fontSize: size,
      lineHeight: 1,
      color: on === "light" ? colors.ink : colors.paper,
      whiteSpace: "nowrap",
    }}
  >
    {STRINGS.wordmark}
  </span>
);

/** The mark and the wordmark side by side, in the design studio's proportions: a 32 px mark, 10 px gap, 22 px text. */
export const LogoLockup: React.FC<{ markHeight: number; on: "light" | "dark" }> = ({ markHeight, on }) => {
  const k = markHeight / LOCKUP.markPx;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: LOCKUP.gapPx * k }}>
      <LogoMark height={markHeight} ring={on === "dark"} />
      <Wordmark size={LOCKUP.wordmarkPx * k} on={on} />
    </div>
  );
};
