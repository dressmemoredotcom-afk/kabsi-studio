// Roomy Properties reel (@roomyproperties). Voice-over lines and every on-screen string.
// scripts/check-script.mjs reads this file. Keep it free of imports.

export type VoiceLine = {
  id: string;
  /** Spoken text. Numbers are written as words. */
  vo: string;
  /** Seconds after the scene cuts in that the voice starts, when there is room. */
  offset?: number;
};

// Short, slow lines with room to breathe before and after each one.
export const VOICE_LINES: VoiceLine[] = [
  { id: "hook", vo: "Downtown Beirut. Overlooking history.", offset: 1.0 },
  { id: "salon", vo: "Two hundred and seventy-five square meters of refined architectural living.", offset: 0.8 },
  { id: "terrace", vo: "Step out onto an expansive teak terrace directly above the Roman ruins.", offset: 0.8 },
  { id: "specs", vo: "Featuring two master suites and private parking.", offset: 1.0 },
  { id: "outro", vo: "Exclusively with Roomy Properties.", offset: 1.0 },
];

/** Every string drawn on screen. Glass-bar copy is rows of items; the items are joined by turquoise dots. */
export const SCREEN = {
  hook: {
    pill: "DOWNTOWN BEIRUT",
    title: ["WAKE UP", "OVER HISTORY"],
    subtext: "Front-row views of the ancient ruins",
  },
  salon: {
    bar: [["275 SQM GRAND SALON", "BESPOKE LIBRARY"]],
  },
  terrace: {
    bar: [["EXPANSIVE TEAK TERRACE", "PRIVATE RUINS VIEW"]],
  },
  specs: {
    badge: "FOR SALE",
    bar: [["2 MASTER SUITES", "2 PARKING SPOTS"], ["DOWNTOWN BEIRUT"]],
  },
  outro: {
    agency: "Roomy Properties",
    wordmarkTop: "ROOMY",
    wordmarkBottom: "PROPERTIES",
    slogan: "WHERE LUXURY MEETS CONVENIENCE",
    sloganLines: ["WHERE LUXURY", "MEETS CONVENIENCE"],
    cta: "Schedule a Private Viewing | +961 71 203 398",
    handle: "@roomyproperties",
  },
} as const;

/** Scene windows in seconds: 28 seconds, 840 frames at 30 fps. */
export const SCENES = [
  { id: "hook", from: 0, to: 4 },
  { id: "salon", from: 4, to: 10 },
  { id: "terrace", from: 10, to: 16 },
  { id: "specs", from: 16, to: 22 },
  { id: "outro", from: 22, to: 28 },
] as const;
