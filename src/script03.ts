// Promo 03: the PromoVideoV3 template. Single source of truth for the voice-over, captions and every
// on-screen string. scripts/check-script.mjs reads this file. Keep it free of imports.

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
    vo: "Too busy to answer your Google reviews?",
    captions: ["Too busy to answer", "your Google reviews?"],
    offset: 0.15,
  },
  {
    id: "whatsapp",
    vo: "Kabsi sends every new review to WhatsApp with a reply drafted. You approve it, and it goes live.",
    captions: [
      "Kabsi sends every new review",
      "to WhatsApp with a reply drafted.",
      "You approve it,",
      "and it goes live.",
    ],
    offset: 0.3,
  },
  {
    id: "qr",
    vo: "Smart QR codes help you ask every customer for a real review.",
    captions: ["Smart QR codes help you", "ask every customer", "for a real review."],
    offset: 0.2,
  },
  {
    id: "end",
    vo: "Kabsi. Your reviews and listing. Taken care of. Try fourteen days free at kabsi dot co.",
    captions: ["Kabsi.", "Your reviews and listing.", "Taken care of.", "Try fourteen days free", "at kabsi dot co."],
    offset: 0.1,
  },
];

/** Every string drawn on screen, outside the captions. */
export const SCREEN = {
  hook: {
    lines: ["Too busy", "to answer", "your Google", "reviews?"],
    keyWord: "answer",
  },
  app: {
    business: "Harbour Lane Coffee",
    example: "Example",
    chatName: "Kabsi",
    chatNote: "Harbour Lane Coffee",
    initial: "K",
  },
  lock: {
    time: "9:41",
  },
  banner: {
    app: "WhatsApp",
    title: "Kabsi",
    time: "now",
    body: "New 5-star review. Reply drafted, ready for your approval.",
  },
  chat: {
    time: "9:41",
    reviewTitle: "New 5-star review",
    reviewText: "Lovely flat white and a friendly team",
    draftPill: "Draft ready",
    draftText: "Thank you, that made our day. See you again soon.",
    approve: "Approve",
    published: "Published",
    publishedNote: "Your reply is live",
  },
  qr: {
    label: "Scan to share your experience",
    brand: "Kabsi",
  },
  end: {
    wordmark: "Kabsi",
    tagline: "Your reviews and listing. Taken care of.",
    cta: "Try 14 Days Free at kabsi.co",
    small: "Early access. Kabsi is not affiliated with Google.",
  },
} as const;

/** Scene windows in seconds. About twenty seconds in all. */
export const SCENES = [
  { id: "hook", from: 0, to: 3 },
  { id: "whatsapp", from: 3, to: 9 },
  { id: "qr", from: 9, to: 14 },
  { id: "end", from: 14, to: 20 },
] as const;
