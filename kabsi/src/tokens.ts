// Kabsi design tokens, from section 2 of docs/VIDEO-PLAN.md. Import colours, radii and shadows from here only: no
// other file may hold a colour. Shadows and glass are built from these colours with alpha().
import { SAFE_INSETS } from "./kit";
import { alpha } from "../../engine/src/frame";

export const colors = {
  /** One highlight per screen, never body text. */
  yellow: "#FFD60A",
  night: "#0C0C0B",
  carbon: "#161614",
  paper: "#F5F3EE",
  ink: "#111111",
  mute: "#B8B3A8",
  /** Approved, published. */
  green: "#1F8A5B",
  /** Only for a problem. */
  red: "#D93025",
  /** The tap ring, drawn at 30 percent. */
  tapRing: "#111827",
} as const;

export const radii = {
  card: 14,
  large: 24,
  pill: 999,
} as const;

export const shadows = {
  card: `0 6px 18px ${alpha(colors.night, 0.08)}`,
  lifted: `0 14px 30px ${alpha(colors.night, 0.12)}`,
  // Phone mockup and glass banners (components/PhoneMockup.tsx, components/chat.tsx).
  phone: `0 20px 50px ${alpha(colors.night, 0.35)}`,
  glass: `0 8px 32px ${alpha(colors.night, 0.2)}`,
} as const;

export const fonts = {
  title: '"Bricolage Grotesque", sans-serif',
  /**
   * Bricolage Grotesque has an optical-size axis; the website sets it at its default of 14, so every title and the
   * wordmark use `fontVariationSettings: fonts.titleVariation` to look the same as on the website.
   */
  titleVariation: '"opsz" 14',
  body: '"Manrope", sans-serif',
} as const;

/** The 1080 x 1920 safe area: text stays out of the top 220 px, the bottom 420 px and the right 120 px. */
export const SAFE = {
  left: SAFE_INSETS.left,
  right: 1080 - SAFE_INSETS.right,
  top: SAFE_INSETS.top,
  bottom: 1920 - SAFE_INSETS.bottom,
} as const;

export { alpha, FRAME } from "../../engine/src/frame";
