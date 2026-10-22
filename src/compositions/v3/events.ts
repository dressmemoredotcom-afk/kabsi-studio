import { DEFAULT_DUCK, type DuckConfig } from "../../audio/mix";
import type { SfxCue } from "../../audio/sfx";
import { sec } from "../../lib/timeline";
import { T3 } from "../../timeline03";

const { wordTime, scene, lines } = T3;

/** Every moment the picture and the sound effects hang on, in seconds. One place, so they cannot drift apart. */
export const EV = {
  hook: {
    words: ["Too", "busy", "to", "answer", "your", "Google", "reviews?"].map((w, i, all) => {
      // Words land on the beat of the voice: "reviews?" is the last word, so it uses the line's own wording.
      const phrase = i === all.length - 1 ? "reviews" : w;
      return wordTime("hook", phrase);
    }),
  },
  wa: (() => {
    const from = scene("whatsapp").from;
    const bannerAt = from + 0.55;
    const openAt = Math.max(bannerAt + 1.25, wordTime("whatsapp", "to WhatsApp"));
    const replyAt = Math.max(wordTime("whatsapp", "with a reply") + 0.1, openAt + 0.7);
    const tapAt = Math.max(wordTime("whatsapp", "approve it") + 0.1, replyAt + 1.1);
    return { from, bannerAt, openAt, replyAt, tapAt, publishAt: tapAt + 0.15 };
  })(),
  qr: (() => {
    const from = scene("qr").from;
    return {
      from,
      standAt: from + 0.1,
      beamAt: Math.max(wordTime("qr", "QR codes"), from + 0.7),
      starsAt: wordTime("qr", "real review") - 0.35,
    };
  })(),
  end: (() => {
    const from = scene("end").from;
    const ctaAt = wordTime("end", "Try fourteen") - 0.15;
    return {
      from,
      markAt: from + 0.1,
      tagAt: wordTime("end", "Your reviews"),
      careAt: wordTime("end", "Taken care"),
      ctaAt,
      smallAt: ctaAt + 0.5,
    };
  })(),
};

const lastVoiceEnd = Math.max(...lines.map((l) => l.end));

export const DUCK: DuckConfig = {
  ...DEFAULT_DUCK,
  outroFromS: lastVoiceEnd,
  totalS: T3.TOTAL_FRAMES / 30,
};

export const STAR_COUNT = 5;

const at = (name: SfxCue["name"], s: number, db: number, rate?: number): SfxCue => ({
  name,
  atFrame: sec(s),
  db,
  ...(rate ? { rate } : {}),
});

/** Sound effects on exact frames. Levels are relative to each file; the voice stays on top. */
export const SFX_CUES: SfxCue[] = [
  at("whoosh", 0.02, -14),
  at("pop", EV.hook.words[3], -8),
  at("whoosh", EV.wa.from, -9),
  at("ping", EV.wa.bannerAt, -7),
  at("whoosh", EV.wa.openAt - 0.05, -14),
  at("pop", EV.wa.openAt + 0.12, -9),
  at("pop", EV.wa.replyAt, -9, 1.08),
  at("click", EV.wa.tapAt, -7),
  at("success", EV.wa.publishAt, -8),
  at("whoosh", EV.qr.from, -9),
  at("pop", EV.qr.standAt + 0.05, -7),
  ...Array.from({ length: STAR_COUNT }, (_, i) => at("star", EV.qr.starsAt + i * 0.16, -10, 1 + i * 0.13)),
  at("whoosh", EV.end.from, -9),
  at("pop", EV.end.markAt, -7),
  at("pop", EV.end.ctaAt, -8, 1.12),
];
