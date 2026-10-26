// Brand-kit constants from docs/VIDEO-PLAN.md section 2. Pure data with no imports, so the components and the rule
// check (a Node script) read the same values.

/** Words the kit puts on screen itself. The rule check reads this file, so they are checked like any video's words. */
export const STRINGS = {
  endLine: "Your business on Google. Taken care of.",
  endCta: "Free check at kabsi.co",
  smallPrint: "Kabsi is independent and not affiliated with Google.",
  exampleBadge: "Example",
} as const;

export const END_CARD_SECONDS = 3;
export const TAP_RING_SECONDS = 0.5;

/** Section 2: keep text out of the top 220 px, the bottom 420 px and the right 120 px of a 1080 x 1920 frame. */
export const SAFE_INSETS = { top: 220, bottom: 420, right: 120, left: 60 } as const;
/** Every other frame size keeps this margin on all sides. */
export const SAFE_MARGIN = 60;

/** Logo files in kabsi/public/brand/, copied unchanged from kabsi-design-studio public/. Never redrawn or recoloured. */
export const LOGO = {
  mark: "brand/kabsi-mark.svg",
  wordmark: "brand/kabsi-wordmark.svg",
} as const;

/** The Kokoro voices Kabsi may use: calm, adult, British English. One of them is chosen once in config.json. */
export const VOICES = ["bf_alice", "bf_isabella", "bf_lily", "bm_george", "bm_lewis"] as const;
