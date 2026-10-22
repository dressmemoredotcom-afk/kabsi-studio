// One entry per video. Scripts take the id as their first argument (default "01").
//   audioMode "ffmpeg":   the voice is mixed and encoded by scripts/render.mjs (promos 01 and 02).
//   audioMode "remotion": the composition carries voice, music and SFX tracks; ffmpeg only normalises and encodes.
//   realVoice: true: files in assets/<voiceDir> (mp3, wav or m4a, named after the line id) beat Kokoro placeholders.
export const VIDEOS = {
  "01": {
    scriptFile: "../src/script.ts",
    composition: "KabsiPromo01",
    voiceKey: "kabsi-voice",
    speedKey: "voice-speed",
    voiceDir: "voice01",
    voiceJson: "voice.json",
    out: "kabsi-promo-01-9x16-v1.mp4",
    poster: "kabsi-promo-01-poster.png",
    posterAtS: 28.4,
    audioMode: "ffmpeg",
    minS: 28,
    maxS: 30,
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
    audioMode: "ffmpeg",
    minS: 28,
    maxS: 30,
  },
  "04": {
    // Roomy Properties reel. Another brand: the Kabsi content rules do not apply, the generic wording rules do.
    brand: "roomy",
    scriptFile: "../src/scriptRoomy.ts",
    composition: "RoomyApartmentReel",
    voiceKey: "roomy-voice",
    speedKey: "roomy-voice-speed",
    voiceDir: "roomy/voice",
    voiceJson: "voice04.json",
    out: "roomy-downtown-275sqm.mp4",
    poster: "roomy-downtown-poster.png",
    posterAtS: 26.0,
    audioMode: "remotion",
    // Lines start at their scene unless the line before is still speaking; they must all end by maxEnd.
    chain: { gap: 1.0, maxEnd: 27.0 },
    minS: 27.5,
    maxS: 28.5,
  },
  "03": {
    scriptFile: "../src/script03.ts",
    composition: "PromoVideoV3",
    voiceKey: "kabsi-voice-upbeat",
    speedKey: "voice-speed-v3",
    voiceDir: "voice/v3",
    voiceJson: "voice03.json",
    out: "kabsi-promo-03-9x16-v3.mp4",
    poster: "kabsi-promo-03-poster.png",
    posterAtS: 18.5,
    audioMode: "remotion",
    realVoice: true,
    minS: 18,
    maxS: 22,
  },
};

export const pickVideo = (argv) => {
  const id = argv.find((a) => /^\d\d$/.test(a)) ?? "01";
  if (!VIDEOS[id]) throw new Error(`Unknown video ${id}`);
  return { id, ...VIDEOS[id] };
};
