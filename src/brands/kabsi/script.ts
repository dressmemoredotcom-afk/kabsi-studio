// The single source of truth for the promo: voice-over lines, captions and every
// on-screen string. scripts/check-script.mjs reads this file and enforces the rules.
// Keep this file free of imports so Node can load it directly.

export type VoiceLine = {
  id: string;
  /** Spoken text. Numbers are written as words. */
  vo: string;
  /** Caption chunks, shown in order across the measured audio. Joined, they must equal `vo`. */
  captions: string[];
};

export const VOICE_LINES: VoiceLine[] = [
  {
    id: "hook",
    vo: "Who answers your Google reviews?",
    captions: ["Who answers your Google reviews?"],
  },
  {
    id: "draft",
    vo: "Kabsi drafts a reply to every new review, using what it knows about your business.",
    captions: [
      "Kabsi drafts a reply to every new review,",
      "using what it knows about your business.",
    ],
  },
  {
    id: "approve",
    vo: "You read it, change anything you like, and approve. Nothing goes live without you.",
    captions: [
      "You read it, change anything you like, and approve.",
      "Nothing goes live without you.",
    ],
  },
  {
    id: "protect",
    vo: "Kabsi watches your Google profile and tells you when something changes.",
    captions: ["Kabsi watches your Google profile", "and tells you when something changes."],
  },
  {
    id: "report",
    vo: "Every week, one short report.",
    captions: ["Every week, one short report."],
  },
  {
    id: "end",
    vo: "Kabsi. Your reviews and listing. Taken care of.",
    captions: ["Kabsi. Your reviews and listing. Taken care of."],
  },
];

/** Every string drawn on screen, outside the captions. */
export const SCREEN = {
  hook: {
    lines: ["Who", "answers", "your Google", "reviews?"],
    keyWord: "answers",
  },
  app: {
    business: "Harbour Lane Coffee",
    example: "Example",
  },
  review: {
    label: "New review",
    stars: 4,
    starsLabel: "4 stars",
    text: "Great flat white, the wait was a bit long",
    replyLabel: "Your reply",
    draftPill: "Draft ready",
    publishedPill: "Published",
    reply:
      "Thank you for the kind words about the flat white. Sorry about the wait, we are working on busy mornings.",
    edit: "Edit",
    approve: "Approve",
    published: "Published",
    publishedNote: "Posted with your approval",
  },
  protection: {
    label: "Google Protection",
    title: "Your Saturday hours changed on Google to Closed",
    beforeLabel: "Before",
    beforeValue: "Sat 7:30 am to 3:00 pm",
    afterLabel: "Now",
    afterValue: "Sat Closed",
    button: "Keep my information",
    confirmTitle: "Done",
    confirmNote: "Your information is kept",
  },
  report: {
    label: "Weekly Care Report",
    title: "Kabsi took care of 6 things this week",
    items: [
      "4 replies drafted and approved",
      "1 listing change flagged and kept",
      "1 reply waiting for you",
    ],
  },
  end: {
    wordmark: "Kabsi",
    tagline: "Your reviews and listing. Taken care of.",
    button: "Check my Google profile free",
    url: "kabsi.co",
    small: "Early access. Kabsi is not affiliated with Google.",
  },
} as const;

/** Scene windows in seconds. Each scene cuts in on its voice line. */
export const SCENES = [
  { id: "hook", from: 0, to: 3 },
  { id: "draft", from: 3, to: 10 },
  { id: "approve", from: 10, to: 15 },
  { id: "protect", from: 15, to: 21 },
  { id: "report", from: 21, to: 25 },
  { id: "end", from: 25, to: 29.8 },
] as const;

/** Voice-over starts this long after its scene cuts in. */
export const VO_OFFSET_S = 0.2;
