// Everything the kit test shows or says. kabsi/scripts/check.mjs reads every *.copy.ts in this folder.
import type { VideoCopy } from "./types";

export const COPY: VideoCopy = {
  id: "kit-test",
  name: "demo",
  format: "social",
  sizes: ["1080x1920"],
  seconds: 10,
  screen: {
    clock: "11:40",
    today: "Today",
    header: { name: "Kabsi", note: "On WhatsApp" },
    review: {
      business: "Juniper Hair Studio:",
      intro: "new review from Maya.",
      quote: "'Lovely blow dry, but I waited too long.'",
      ready: "Reply ready:",
      draft: "'Thank you, Maya. We are sorry about the wait. See you next time.'",
      cta: "Reply Yes to publish.",
    },
    buttons: ["Yes", "Edit", "Skip"],
    yes: "Yes",
    approved: "Approved. It goes to Google in 10 seconds. Reply Undo to stop it.",
    undo: "Undo",
    published: "Published on your Google profile.",
  },
  voiceLines: [
    { id: "M1", vo: "A new review came in.", captions: ["A new review came in."], offset: 0.2 },
    { id: "M2", vo: "The reply is ready for your yes.", captions: ["The reply is ready", "for your yes."] },
    { id: "M3", vo: "Then it is published.", captions: ["Then it is published."], offset: 5.2 },
  ],
  highlight: { "M2#2": "yes" },
  businesses: ["Juniper Hair Studio"],
  endCard: true,
  smallPrint: true,
  demo: true,
  testOnly: true,
};
