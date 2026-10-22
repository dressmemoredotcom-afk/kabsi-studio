import React from "react";
import { roomyTokens as T } from "../tokens";
import { glass, Reveal, TYPE } from "./primitives";

/**
 * The spec bar: translucent glass holding rows of short items in one type style, with turquoise dots between
 * items. Rows reveal one after the other.
 */
export const GlassBar: React.FC<{ frame: number; atFrame: number; rows: readonly (readonly string[])[] }> = ({ frame, atFrame, rows }) => (
  <Reveal frame={frame} atFrame={atFrame} style={{ width: "100%" }}>
    <div style={{ ...glass, borderRadius: T.radii.large, padding: "28px 20px", display: "flex", flexDirection: "column", gap: 20, width: "100%", boxSizing: "border-box" }}>
      {rows.map((row, r) => (
        <Reveal key={r} frame={frame} atFrame={atFrame + 9 + r * 10} dy={14}>
          <div style={{ ...TYPE.label, letterSpacing: "0.13em", fontSize: 26, color: T.white, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
            {row.map((item, i) => (
              <React.Fragment key={`${item}-${i}`}>
                {i > 0 && <span style={{ width: 9, height: 9, borderRadius: T.radii.pill, background: T.turquoise, flexShrink: 0 }} />}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  </Reveal>
);
