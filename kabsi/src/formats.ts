// The five rows of docs/VIDEO-PLAN.md section 3 as presets. Pure data with no imports: the compositions, the rule
// check and the render script all read it, and a render fails if its file breaks the preset.

export type FormatId = "web-loop" | "web-explainer" | "social" | "meta-feed" | "youtube";
export type Sound = "none" | "voice" | "voice-music";
/**
 * vtt: no captions in the picture, WebVTT file. srt: no captions in the picture, SRT file.
 * burn+srt: captions burned in and an SRT file. burn: captions burned in only.
 */
export type CaptionMode = "vtt" | "srt" | "burn+srt" | "burn";

export type Format = {
  id: FormatId;
  label: string;
  /** Allowed sizes as "WIDTHxHEIGHT". */
  sizes: readonly string[];
  fps: 30;
  minS: number;
  maxS: number;
  sound: Sound;
  captions: CaptionMode;
  /** Largest file in bytes, when the plan sets one. */
  capBytes?: number;
  /** The plan also asks for a WebP poster. */
  webpPoster?: boolean;
};

export const FORMATS: Record<FormatId, Format> = {
  // 1080 wide max, 9:16 or 16:9. Under 1.5 MB, so the file is fitted to that size after the render.
  "web-loop": { id: "web-loop", label: "Website loop", sizes: ["1080x1920", "1080x608"], fps: 30, minS: 8, maxS: 16, sound: "none", captions: "vtt", capBytes: 1_500_000, webpPoster: true },
  "web-explainer": { id: "web-explainer", label: "Website explainer", sizes: ["1920x1080", "1080x1920"], fps: 30, minS: 45, maxS: 90, sound: "voice", captions: "vtt", capBytes: 12_000_000 },
  social: { id: "social", label: "Reels, TikTok, Shorts", sizes: ["1080x1920"], fps: 30, minS: 15, maxS: 35, sound: "voice-music", captions: "burn+srt" },
  "meta-feed": { id: "meta-feed", label: "Meta feed ad", sizes: ["1080x1350", "1080x1920"], fps: 30, minS: 15, maxS: 15, sound: "voice", captions: "burn" },
  youtube: { id: "youtube", label: "YouTube how-to", sizes: ["1920x1080"], fps: 30, minS: 45, maxS: 120, sound: "voice", captions: "srt" },
};

export const burnsCaptions = (f: Format) => f.captions === "burn" || f.captions === "burn+srt";
export const captionFile = (f: Format): "vtt" | "srt" | null =>
  f.captions === "vtt" ? "vtt" : f.captions === "srt" || f.captions === "burn+srt" ? "srt" : null;

export const parseSize = (size: string) => {
  const [width, height] = size.split("x").map(Number);
  return { width, height };
};
