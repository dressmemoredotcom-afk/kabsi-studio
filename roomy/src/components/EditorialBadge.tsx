import React from "react";
import { roomyTokens as T } from "../tokens";
import { glass, TYPE } from "./primitives";

/**
 * Small frosted badge with a turquoise dot, for the place and the sale status. `ar` adds the name in Arabic after
 * a divider. Arabic letters join, so it takes no letter spacing and is never uppercased.
 */
export const EditorialBadge: React.FC<{ text: string; ar?: string; style?: React.CSSProperties }> = ({ text, ar, style }) => (
  <div style={{ ...TYPE.label, ...glass, display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 30px", borderRadius: T.radii.pill, color: T.white, whiteSpace: "nowrap", ...style }}>
    <span style={{ width: 9, height: 9, borderRadius: T.radii.pill, background: T.turquoise, flexShrink: 0 }} />
    {text}
    {ar && (
      <>
        <span style={{ width: 1, height: 26, background: T.turquoise, opacity: 0.6, flexShrink: 0 }} />
        <span dir="rtl" lang="ar" style={{ fontFamily: T.fonts.arabic, fontSize: 36, letterSpacing: 0, textTransform: "none", lineHeight: 1, paddingBottom: 4 }}>
          {ar}
        </span>
      </>
    )}
  </div>
);
