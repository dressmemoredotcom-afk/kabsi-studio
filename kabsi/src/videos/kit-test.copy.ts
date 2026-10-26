// Everything the kit test shows or says. kabsi/scripts/check.mjs reads every *.copy.ts in this folder.
import type { VideoCopy } from "./types";

export const COPY: VideoCopy = {
  id: "kit-test",
  name: "demo",
  format: "social",
  sizes: ["1080x1920"],
  seconds: 10,
  screen: {
    header: { name: "Kabsi", note: "For Olive Street Bakery" },
    review: { label: "New Google review", text: "Lovely bread and a warm welcome.", time: "9:41" },
    reply: { label: "Your reply, ready", text: "Thank you. We are glad you enjoyed it, and we hope to see you again.", time: "9:41" },
    yes: "Yes",
    published: "Published on your Google profile",
  },
  voiceLines: [
    { id: "M1", vo: "A new review came in.", captions: ["A new review came in."], offset: 0.2 },
    { id: "M2", vo: "The reply is ready for your yes.", captions: ["The reply is ready", "for your yes."] },
    { id: "M3", vo: "Then it is published.", captions: ["Then it is published."], offset: 5.2 },
  ],
  highlight: { "M2#2": "yes" },
  businesses: ["Olive Street Bakery"],
  endCard: true,
  smallPrint: true,
  demo: true,
  testOnly: true,
};
