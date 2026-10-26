import { staticFile } from "remotion";
import manifest from "./generated/assets.json";

/** One media item as found on disk by roomy/scripts/assets.mjs. `file` is null when the file is missing. */
export type MediaAsset = {
  file: string | null;
  kind: "photo" | "video";
  width: number;
  height: number;
  /** Video length in seconds. */
  durationS: number;
  /** For video with black bars burned into the picture: where the real picture is. Left out when there are none. */
  content?: { x: number; y: number; width: number; height: number };
};

/** The logo file, its size, and the row where an artwork-plus-tagline logo should be cropped to drop the tagline. */
export type LogoAsset = { file: string; width: number; height: number; taglineCropY: number | null };

/** What one listing's reel uses: its photos and clips, and an optional ready-made voice-over. */
export type ListingAssets = {
  voiceover: string | null;
  media: Record<string, MediaAsset>;
};

export type RoomyManifest = {
  logo: LogoAsset | null;
  bgm: string | null;
  bgmStandin: string | null;
  listings: Record<string, ListingAssets>;
};

export const ASSETS: RoomyManifest = manifest as RoomyManifest;

/** A listing's files, or nothing found yet (every item then shows its placeholder). */
export const listingAssets = (id: string): ListingAssets => ASSETS.listings[id] ?? { voiceover: null, media: {} };

/** URL for a file under roomy/public/, or null when the file is missing. */
export const assetUrl = (file: string | null | undefined): string | null => (file ? staticFile(file) : null);

/** The music that plays: your luxury-house.mp3 if present, else the generated stand-in, else silence. */
export const BGM_FILE = ASSETS.bgm ?? ASSETS.bgmStandin;
