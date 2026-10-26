import React from "react";
import { roomyTokens as T } from "../tokens";
import { Reveal, TYPE } from "./primitives";

/** Breaks a headline into at most three balanced lines that fit the lower third at the given size. */
export const balanceLines = (text: string, maxChars: number): string[] => {
  const words = text.trim().split(/\s+/);
  if (text.length <= maxChars || words.length === 1) return [text.trim()];
  const best = (count: number): string[] => {
    // Try every way to cut the words into `count` runs and keep the one whose longest run is shortest.
    let result: string[] = [];
    let score = Infinity;
    const walk = (start: number, left: number, runs: string[]) => {
      if (left === 1) {
        const all = [...runs, words.slice(start).join(" ")];
        const worst = Math.max(...all.map((l) => l.length));
        if (worst < score) {
          score = worst;
          result = all;
        }
        return;
      }
      for (let end = start + 1; end <= words.length - (left - 1); end++) walk(end, left - 1, [...runs, words.slice(start, end).join(" ")]);
    };
    walk(0, count, []);
    return result;
  };
  for (const count of [2, 3]) {
    const lines = best(Math.min(count, words.length));
    if (lines.every((l) => l.length <= maxChars)) return lines;
  }
  return best(Math.min(3, words.length));
};

/** The first scene's title: uppercase serif with open tracking, and one italic supporting line. */
export const EditorialHeadline: React.FC<{ frame: number; atFrame: number; headline: string; subline?: string }> = ({ frame, atFrame, headline, subline }) => {
  const lines = balanceLines(headline, 13);
  const size = lines.every((l) => l.length <= 13) ? 92 : lines.every((l) => l.length <= 15) ? 80 : 68;
  return (
    <>
      <div>
        {lines.map((line, i) => (
          <Reveal key={line} frame={frame} atFrame={atFrame + i * 13}>
            <div style={{ ...TYPE.display, fontSize: size, lineHeight: `${Math.round(size * 1.09)}px` }}>{line}</div>
          </Reveal>
        ))}
      </div>
      {subline && (
        <Reveal frame={frame} atFrame={atFrame + 13 * lines.length + 12}>
          <div style={{ ...TYPE.body, color: T.white }}>{subline}</div>
        </Reveal>
      )}
    </>
  );
};
