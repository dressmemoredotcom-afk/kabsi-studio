import { Config } from "@remotion/cli/config";

// Each brand passes its own entry and --public-dir (see package.json). These settings apply to both.
Config.setVideoImageFormat("png");
// Tag and convert as BT.709, so brand colours decode the same everywhere.
Config.setColorSpace("bt709");
