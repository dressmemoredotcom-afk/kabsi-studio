// Kabsi design tokens. Import colours, radii and shadows from here only.

export const colors = {
  yellow: "#FFD60A",
  yellowPressed: "#E8C309",
  black: "#000000",
  carbon: "#0B0B0B",
  ink: "#111111",
  white: "#FFFFFF",
  sand: "#F6F4EF",
  stone: "#5E5B55",
  stoneOnDark: "#C9C5BC",
  hairline: "#E4E0D7",
  red: "#D93025",
  green: "#1F8A5B",
  amber: "#B45309",
  amberSoft: "#FEF3C7",
  // Promo 02: WhatsApp-style chat bubbles.
  chatGreen: "#25D366",
} as const;

export const radii = {
  card: 14,
  large: 24,
  pill: 999,
} as const;

export const shadows = {
  card: "0 6px 18px rgba(0,0,0,0.06)",
  lifted: "0 14px 30px rgba(0,0,0,0.09)",
  // Phone mockup and glass banners (promo 03).
  phone: "0 20px 50px rgba(0,0,0,0.3)",
  glass: "0 8px 32px rgba(0,0,0,0.18)",
} as const;

export const fonts = {
  title: '"Lalezar", sans-serif',
  body: '"Readex Pro", sans-serif',
} as const;

export { alpha, FRAME, SAFE } from "../../core/frame";
