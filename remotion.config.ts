import { Config } from "@remotion/cli/config";

Config.setPublicDir("assets");
Config.setVideoImageFormat("png");
// Tag and convert as BT.709, so brand colours decode the same everywhere.
Config.setColorSpace("bt709");
