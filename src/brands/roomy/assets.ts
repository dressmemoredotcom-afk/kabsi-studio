import { staticFile } from "remotion";
import manifest from "./generated/roomy-assets.json";

/** One media item as found on disk by scripts/roomy-assets.mjs. `file` is null when the file is missing. */
export type MediaAsset = {
  file: string | null;
  kind: "photo" | "video";
  width: number;
  height: number;
  /** Video length in seconds. */
  durationS: number;
};

/** The logo file, its size, and the row where an artwork-plus-tagline logo should be cropped to drop the tagline. */
export type LogoAsset = { file: string; width: number; height: number; taglineCropY: number | null };

export type RoomyManifest = {
  logo: LogoAsset | null;
  bgm: string | null;
  bgmStandin: string | null;
  voiceover: string | null;
  media: Record<string, MediaAsset>;
};

export const ASSETS: RoomyManifest = manifest as RoomyManifest;

/** URL for a file under assets/, or null when the file is missing. */
export const assetUrl = (file: string | null | undefined): string | null => (file ? staticFile(file) : null);

/** The music that plays: your luxury-house.mp3 if present, else the generated stand-in, else silence. */
export const BGM_FILE = ASSETS.bgm ?? ASSETS.bgmStandin;
