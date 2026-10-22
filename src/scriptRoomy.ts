// Roomy Properties reel (@roomyproperties). Voice-over lines and every on-screen string.
// scripts/check-script.mjs reads this file. Keep it free of imports.

export type VoiceLine = {
  id: string;
  /** Spoken text. Numbers are written as words. */
  vo: string;
  /** Seconds after the scene cuts in that the voice should start, when there is room. */
  offset?: number;
};

export const VOICE_LINES: VoiceLine[] = [
  {
    id: "hook",
    vo: "Imagine waking up in the historic heart of Downtown Beirut, overlooking ancient Roman ruins.",
    offset: 0.1,
  },
  {
    id: "terrace",
    vo: "Step out onto an expansive private teak terrace, built for true outdoor living.",
    offset: 0.1,
  },
  {
    id: "library",
    vo: "Inside, two hundred and seventy-five square meters of architectural elegance, complete with a custom library.",
    offset: 0.1,
  },
  {
    id: "specs",
    vo: "Featuring two master en-suite bedrooms and two dedicated parking spaces.",
    offset: 0.1,
  },
  {
    id: "outro",
    vo: "For sale with Roomy Properties. Send a direct message to book your private tour.",
    offset: 0.1,
  },
];

/** Every string drawn on screen. */
export const SCREEN = {
  hook: {
    pill: "DOWNTOWN BEIRUT",
    title: ["Wake Up", "Over History."],
  },
  terrace: {
    badge: "EXPANSIVE TEAK TERRACE • PRIVATE RUINS VIEW",
  },
  library: {
    value: "275 SQM",
    label: "ARCHITECTURAL RESIDENCE",
    pill: "Custom Floor-to-Ceiling Library",
  },
  specs: {
    badge: "FOR SALE • DOWNTOWN BEIRUT",
    cells: [
      { value: "275", label: "SQM" },
      { value: "2", label: "MASTER SUITES" },
      { value: "TEAK", label: "TERRACE" },
      { value: "2", label: "PARKING SPOTS" },
    ],
  },
  outro: {
    agency: "Roomy Properties",
    wordmarkTop: "ROOMY",
    wordmarkBottom: "PROPERTIES",
    slogan: "WHERE LUXURY MEETS CONVENIENCE",
    sloganLines: ["WHERE LUXURY", "MEETS CONVENIENCE"],
    tagline: "Your Gateway to Luxury Living in Lebanon",
    cta: "DM or Call +961 71 203 398",
    handle: "@roomyproperties",
    footer: "DM for Private Viewings",
  },
} as const;

/** Scene windows in seconds: 22 seconds, 660 frames at 30 fps. */
export const SCENES = [
  { id: "hook", from: 0, to: 4 },
  { id: "terrace", from: 4, to: 10 },
  { id: "library", from: 10, to: 14 },
  { id: "specs", from: 14, to: 18 },
  { id: "outro", from: 18, to: 22 },
] as const;
