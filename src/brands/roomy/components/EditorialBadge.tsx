import React from "react";
import { roomyTokens as T } from "../tokens";
import { glass, TYPE } from "./primitives";

/** Small frosted badge with a turquoise dot, for the place and the sale status. */
export const EditorialBadge: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <div style={{ ...TYPE.label, ...glass, display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 30px", borderRadius: T.radii.pill, color: T.white, whiteSpace: "nowrap", ...style }}>
    <span style={{ width: 9, height: 9, borderRadius: T.radii.pill, background: T.turquoise, flexShrink: 0 }} />
    {text}
  </div>
);
