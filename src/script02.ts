// Promo 02: fast, WhatsApp-first social ad. Single source of truth for the voice-over, captions and
// every on-screen string. scripts/check-script.mjs reads this file. Keep it free of imports.

export type VoiceLine = {
  id: string;
  /** Spoken text. Numbers are written as words. */
  vo: string;
  /** Caption chunks, shown in order across the measured audio. Joined, they must equal `vo`. */
  captions: string[];
  /** Seconds after the scene cuts in that the voice starts. */
  offset?: number;
};

export const VOICE_LINES: VoiceLine[] = [
  {
    id: "hook",
    vo: "Is your Google Maps listing costing you customers?",
    captions: ["Is your Google Maps listing", "costing you customers?"],
    offset: 0.1,
  },
  {
    id: "whatsapp",
    vo: "Kabsi runs your entire Google Business Profile directly through WhatsApp. No dashboards. No logins.",
    captions: [
      "Kabsi runs your entire",
      "Google Business Profile",
      "directly through WhatsApp.",
      "No dashboards.",
      "No logins.",
    ],
    offset: 0.25,
  },
  {
    id: "qr",
    vo: "Get real reviews with smart QR codes, and reply to every customer from the same chat.",
    captions: [
      "Get real reviews",
      "with smart QR codes,",
      "and reply to every customer",
      "from the same chat.",
    ],
    offset: 0.15,
  },
  {
    id: "protect",
    vo: "Competitors changing your hours? Kabsi catches unauthorized edits so you can put them back.",
    captions: [
      "Competitors changing your hours?",
      "Kabsi catches unauthorized edits",
      "so you can put them back.",
    ],
    offset: 0.15,
  },
  {
    id: "end",
    vo: "Kabsi. Your reviews and listing. Taken care of. Try it free today.",
    captions: ["Kabsi.", "Your reviews and listing.", "Taken care of.", "Try it free today."],
    offset: 0.2,
  },
];

/** Every string drawn on screen, outside the captions. */
export const SCREEN = {
  hook: {
    white: "Is Google Maps",
    yellow: ["Costing You", "Customers?"],
  },
  app: {
    business: "Harbour Lane Coffee",
    example: "Example",
    chatName: "Kabsi",
    chatNote: "Harbour Lane Coffee",
    initial: "K",
  },
  chat: {
    reviewTitle: "New 5-star review",
    reviewText: "Lovely flat white and a friendly team",
    draftPill: "Draft ready",
    draftText: "Thank you, that made our day. See you again soon.",
    approve: "Approve",
    sent: "Approve",
    done: "Done. Your reply is live.",
    stickers: ["No dashboards.", "No logins."],
  },
  qr: {
    label: "Scan to share your experience",
    sent: "Reply sent",
  },
  protect: {
    alert: "Alert: Someone changed your hours to Closed.",
    wasLabel: "Was",
    wasValue: "Open 7:30 am to 3:00 pm",
    nowLabel: "Now",
    nowValue: "Closed",
    button: "Revert Change",
    doneTitle: "Reverted",
    doneNote: "Your hours are back",
  },
  end: {
    wordmark: "Kabsi",
    tagline: "Your reviews and listing. Taken care of.",
    button: "Start Free 14-Day Trial",
    url: "kabsi.co",
    small: "Early access. Kabsi is not affiliated with Google.",
  },
} as const;

/** Scene windows in seconds. Each scene cuts in on its voice line. */
export const SCENES = [
  { id: "hook", from: 0, to: 3 },
  { id: "whatsapp", from: 3, to: 10 },
  { id: "qr", from: 10, to: 16 },
  { id: "protect", from: 16, to: 22 },
  { id: "end", from: 22, to: 29.9 },
] as const;
