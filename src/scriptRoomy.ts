// Roomy Properties reel (@roomyproperties). Voice-over lines and every on-screen string.
// scripts/check-script.mjs reads this file. Keep it free of imports.

export type VoiceLine = {
  id: string;
  /** Spoken text. Numbers are written as words. */
  vo: string;
  /** Seconds after the scene cuts in that the voice starts, when there is room. */
  offset?: number;
};

// Short on purpose: slow, calm delivery with room to breathe before and after every line.
export const VOICE_LINES: VoiceLine[] = [
  { id: "hook", vo: "Downtown Beirut. Overlooking history.", offset: 1.0 },
  { id: "terrace", vo: "A private terrace, directly above the ancient ruins.", offset: 1.0 },
  { id: "library", vo: "Two hundred and seventy-five square meters of refined luxury.", offset: 0.3 },
  { id: "specs", vo: "Two master suites, and dedicated private parking.", offset: 1.0 },
  { id: "outro", vo: "Exclusively with Roomy Properties.", offset: 1.0 },
];

/** Every string drawn on screen. */
export const SCREEN = {
  hook: {
    pill: "DOWNTOWN BEIRUT",
    title: ["WAKE UP", "OVER HISTORY"],
    subtext: "Front-row views of the ancient ruins",
  },
  terrace: {
    badge: "EXPANSIVE TEAK TERRACE",
  },
  library: {
    value: "275 SQM",
    label: "ARCHITECTURAL RESIDENCE",
    pill: "Custom Floor-to-Ceiling Library",
  },
  specs: {
    badge: "FOR SALE • DOWNTOWN BEIRUT",
    rows: [
      ["275 SQM", "2 MASTER SUITES"],
      ["TEAK TERRACE", "2 PARKING SPOTS"],
    ],
  },
  outro: {
    agency: "Roomy Properties",
    wordmarkTop: "ROOMY",
    wordmarkBottom: "PROPERTIES",
    slogan: "WHERE LUXURY MEETS CONVENIENCE",
    sloganLines: ["WHERE LUXURY", "MEETS CONVENIENCE"],
    viewing: "SCHEDULE A PRIVATE VIEWING",
    cta: "DM or Call +961 71 203 398",
    handle: "@roomyproperties",
  },
} as const;

/** Scene windows in seconds: 22 seconds, 660 frames at 30 fps. */
export const SCENES = [
  { id: "hook", from: 0, to: 4.5 },
  { id: "terrace", from: 4.5, to: 10 },
  { id: "library", from: 10, to: 14 },
  { id: "specs", from: 14, to: 18 },
  { id: "outro", from: 18, to: 22 },
] as const;
