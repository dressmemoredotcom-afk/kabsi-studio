// Everything W1 shows. kabsi/scripts/check.mjs reads every *.copy.ts in this folder. The words are COPY.md section 20
// of kabsi-canvas. A website loop: no voice, no captions, no sound.
import type { VideoCopy } from "./types";

export const COPY: VideoCopy = {
  id: "W1",
  name: "hero",
  format: "web-loop",
  sizes: ["1080x1920", "1080x608"],
  seconds: 12,
  posterS: 4.2,
  screen: {
    clock: "11:40",
    header: { name: "Kabsi", note: "On WhatsApp" },
    review: {
      lead: "This review for Harbour Lane Coffee has no reply:",
      quote: "'Lovely flat white and a friendly team.'",
      suggest: "Here is the reply I suggest:",
      draft: "'Thank you, that made our day. See you again soon.'",
      ask: "Publish it on Google?",
    },
    buttons: ["Yes", "Edit", "Skip"],
    yes: "Yes",
    approved: "Approved. It goes to Google in 10 seconds. Reply Undo to stop it.",
    undo: "Undo",
    published: "Your reply is on Google. Done.",
  },
  voiceLines: [],
  businesses: ["Harbour Lane Coffee"],
  endCard: false,
  smallPrint: false,
  demo: true,
};
