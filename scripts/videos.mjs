// One entry per video. Scripts take the id as their first argument (default "01").
export const VIDEOS = {
  "01": {
    scriptFile: "../src/script.ts",
    composition: "KabsiPromo01",
    voiceKey: "kabsi-voice",
    speedKey: "voice-speed",
    voiceDir: "voice",
    voiceJson: "voice.json",
    out: "kabsi-promo-01-9x16-v1.mp4",
    poster: "kabsi-promo-01-poster.png",
    posterAtS: 28.4,
  },
  "02": {
    scriptFile: "../src/script02.ts",
    composition: "KabsiPromo02",
    voiceKey: "kabsi-voice-upbeat",
    speedKey: "voice-speed-upbeat",
    voiceDir: "voice02",
    voiceJson: "voice02.json",
    out: "kabsi-promo-02-9x16-v2.mp4",
    poster: "kabsi-promo-02-poster.png",
    posterAtS: 28,
  },
};

export const pickVideo = (argv) => {
  const id = argv.find((a) => /^\d\d$/.test(a)) ?? "01";
  if (!VIDEOS[id]) throw new Error(`Unknown video ${id}`);
  return { id, ...VIDEOS[id] };
};
