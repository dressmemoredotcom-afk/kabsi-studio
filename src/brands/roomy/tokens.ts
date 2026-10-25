// Roomy Properties (@roomyproperties) design tokens. Import colours, type and shadows from here only.
import { alpha } from "../../core/frame";

const palette = {
  deepTeal: "#245766",
  turquoise: "#3CBAC5",
  charcoal: "#231F20",
  white: "#FFFFFF",
} as const;

export const roomyTokens = {
  ...palette,
  /** Frosted card fill and border: charcoal at 78% with a turquoise hairline. */
  frosted: "rgba(35, 31, 32, 0.78)",
  frostedBorder: "1px solid rgba(60, 186, 197, 0.35)",
  /** Soft shadow that keeps white type crisp over a photo. */
  textShadow: "0 4px 32px rgba(0,0,0,0.5)",
  shadows: {
    glass: "0 8px 32px rgba(0,0,0,0.18)",
    lifted: "0 14px 30px rgba(0,0,0,0.09)",
  },
  radii: { large: 24, pill: 999 },
  fonts: {
    /** Cormorant Garamond: uppercase serif headlines with open tracking. */
    display: '"Cormorant Garamond", serif',
    /** Jost: uppercase labels, pills and spec lines. */
    ui: '"Jost", sans-serif',
  },
  layout: {
    /** Left edge of all lower-third copy. */
    marginX: 80,
    /**
     * Distance from the bottom edge of the frame to the bottom of the lower-third copy. 684 px puts it just above
     * the zone Instagram covers with the caption and buttons (the bottom 35%). Lower it, for example to 200,
     * if you want the copy closer to the bottom edge.
     */
    lowerThirdBottom: 684,
    /** The dark gradient behind lower-third copy reaches this far up the frame, in percent. */
    scrimReach: 55,
    /**
     * Where horizontal footage plays: a window across the full width, this far from the top and this tall, with
     * soft edges, above a blurred copy of the same footage. The window ends above the lower-third copy.
     */
    landscapeWindow: { top: 150, height: 1060, feather: 90 },
  },
  /** Charcoal at 85%, the strongest point of the lower-third gradient. */
  scrim: alpha(palette.charcoal, 0.85),
} as const;

export type RoomyTokens = typeof roomyTokens;
