// Brand-kit constants from docs/VIDEO-PLAN.md section 2. Pure data with no imports, so the components and the rule
// check (a Node script) read the same values.

/** Words the kit puts on screen itself. The rule check reads this file, so they are checked like any video's words. */
export const STRINGS = {
  endLine: "Your business on Google. Taken care of.",
  endCta: "Free check at kabsi.co",
  smallPrint: "Kabsi is independent and not affiliated with Google.",
  exampleBadge: "Example",
  /** The wordmark's text, set in the font (components/wordmark.tsx). */
  wordmark: "Kabsi",
} as const;

export const END_CARD_SECONDS = 3;
export const TAP_RING_SECONDS = 0.5;

/** Section 2: keep text out of the top 220 px, the bottom 420 px and the right 120 px of a 1080 x 1920 frame. */
export const SAFE_INSETS = { top: 220, bottom: 420, right: 120, left: 60 } as const;
/** Every other frame size keeps this margin on all sides. */
export const SAFE_MARGIN = 60;

/**
 * The ring mark: the design studio's favicon.svg, renamed and otherwise untouched, so the rule check holds it to the
 * same bytes (sha256). Never redrawn or recoloured. The wordmark is not a file: it is the text "Kabsi" set in
 * components/wordmark.tsx.
 */
export const LOGO = {
  mark: "brand/kabsi-mark.svg",
  markSha256: "b1cc4bc13388c6fa3d272c820f145d42c728e16f1ad03805536a776014e4ce85",
} as const;

/** The mark and wordmark together, from the design studio's ui.tsx (KabsiMark size-8, Logo gap-2.5 and text-[1.375rem]). */
export const LOCKUP = { markPx: 32, gapPx: 10, wordmarkPx: 22 } as const;

/** The wordmark: Bricolage Grotesque Bold, letter spacing -0.02em, ink on light and paper on dark. */
export const WORDMARK = { weight: 700, letterSpacing: "-0.02em" } as const;

/** The Kokoro voices Kabsi may use: calm, adult, British English. One of them is chosen once in config.json. */
export const VOICES = ["bf_alice", "bf_isabella", "bf_lily", "bm_george", "bm_lewis"] as const;
