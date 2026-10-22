// Shared by every brand: the 1080 x 1920 vertical frame, its safe area, and a helper for colours with transparency.

/** A token colour with transparency, e.g. a caption box (black at 62%). */
export const alpha = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** 1080 x 1920 frame and its safe area (top 14%, bottom 35%, sides 6%). */
export const FRAME = { width: 1080, height: 1920, fps: 30 } as const;
export const SAFE = {
  left: Math.round(FRAME.width * 0.06),
  right: Math.round(FRAME.width * 0.94),
  top: Math.round(FRAME.height * 0.14),
  bottom: Math.round(FRAME.height * 0.65),
} as const;
