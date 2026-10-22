import { staticFile } from "remotion";
import manifest from "../../generated/roomy-assets.json";

/** Which Roomy files exist, written by scripts/roomy-assets.mjs. A null means the placeholder is used. */
export type RoomyManifest = {
  logo: string | null;
  terrace: string | null;
  walkthrough: string | null;
  library: string | null;
  bedroom: string | null;
  bgm: string | null;
  bgmStandin: string | null;
  voiceover: string | null;
};

export const ASSETS: RoomyManifest = manifest;

/** URL for a file under assets/, or null when the file is missing. */
export const assetUrl = (file: string | null): string | null => (file ? staticFile(file) : null);

/** The music that plays: your luxury-house.mp3 if present, else the generated stand-in, else silence. */
export const BGM_FILE = ASSETS.bgm ?? ASSETS.bgmStandin;
