// The dynamic storyboard: how a listing turns into scenes, on-screen copy and a voice-over script.
// Pure functions with no Remotion imports, so the composition and the Node scripts share the exact same rules.
import type { RoomyListing } from "./schema";

export const FPS = 30;
/** Every reel is 22 seconds, 660 frames. */
export const TOTAL_FRAMES = 660;
/** The outro is always the last 4 seconds. */
export const OUTRO_FRAMES = 120;
/** Frames a scene stays under the next one while it dissolves in. */
export const OVERLAP = 12;
export const CONTENT_FRAMES = TOTAL_FRAMES - OUTRO_FRAMES;

export type ScenePlan = { index: number; from: number; frames: number };

/**
 * Splits the 18 seconds before the outro evenly between the media items. Each gets floor(540 / N) frames and the
 * first scene takes the remainder, so the scenes always add up to exactly 540 frames.
 */
export const planScenes = (count: number): ScenePlan[] => {
  const each = Math.floor(CONTENT_FRAMES / count);
  const remainder = CONTENT_FRAMES - each * count;
  let from = 0;
  return Array.from({ length: count }, (_, index) => {
    const frames = each + (index === 0 ? remainder : 0);
    const plan = { index, from, frames };
    from += frames;
    return plan;
  });
};

export const OUTRO_FROM = CONTENT_FRAMES;

/* ----------------------------- on-screen copy ----------------------------- */

export type SceneCopy = {
  /** Small badge at the top left. */
  topBadge?: string;
  /** Serif headline in the lower third (first scene). */
  headline?: string;
  /** Italic line under the headline. */
  subline?: string;
  /** Glass bar: rows of short items, joined by turquoise dots. */
  bar?: string[][];
};

const rowsOfTwo = (items: string[]): string[][] => {
  const rows: string[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
};

/**
 * Decides what each scene says.
 *   First scene:  neighborhood badge, headline (the item's own, else the property title), subline (its own, else the price).
 *   Last scene:   a "FOR SALE" badge, with the price when there is one.
 *   Other scenes: a glass bar with the item's own headline and subline, or, when it has none, its share of the specs.
 * A single-item reel carries the specs on its only scene.
 */
export const sceneCopy = (listing: RoomyListing): SceneCopy[] => {
  const n = listing.media.length;
  const own = (i: number) => listing.media[i].headline || listing.media[i].subline;
  const plain = listing.media.map((_, i) => i).filter((i) => (n === 1 ? true : i >= 1) && !own(i));
  const share = Math.ceil(listing.specs.length / Math.max(1, plain.length));
  const specsFor = (i: number): string[] => {
    const slot = plain.indexOf(i);
    return slot < 0 ? [] : listing.specs.slice(slot * share, slot * share + share);
  };

  return listing.media.map((item, i) => {
    const copy: SceneCopy = {};
    if (i === 0) {
      copy.topBadge = listing.neighborhood;
      copy.headline = item.headline || listing.propertyTitle;
      // The price shows on the last scene's badge; a one-scene reel has no other place for it.
      copy.subline = item.subline || (n === 1 ? listing.price : undefined);
      if (n === 1 && listing.specs.length) copy.bar = rowsOfTwo(listing.specs);
      return copy;
    }
    if (i === n - 1) copy.topBadge = listing.price ? `FOR SALE • ${listing.price}` : "FOR SALE";
    const text = [item.headline, item.subline].filter((t): t is string => Boolean(t));
    const items = text.length ? text : specsFor(i);
    if (items.length) copy.bar = rowsOfTwo(items);
    return copy;
  });
};

/* -------------------------------- voice-over -------------------------------- */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** 0 to 99,999 in words, British style: "three hundred and ten". */
export const numberToWords = (n: number): string => {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${numberToWords(n % 100)}` : ""}`;
  const rest = n % 1000;
  return `${numberToWords(Math.floor(n / 1000))} thousand${rest ? (rest < 100 ? " and " : " ") + numberToWords(rest) : ""}`;
};

const lower = (text: string) => text.toLowerCase();
export const titleCase = (text: string) => lower(text).replace(/\b\w/g, (c) => c.toUpperCase());

/** "310 SQM" becomes "three hundred and ten square meters"; text the rules do not know is spoken as written. */
export const specToSpeech = (spec: string): string => {
  const s = spec.trim();
  let m = s.match(/^(\d+)\s*(sqm|sq\.?\s*m|m2|m²)$/i);
  if (m) return `${numberToWords(Number(m[1]))} square meters`;
  m = s.match(/^(\d+)\s*(master )?suites?$/i);
  if (m) return `${numberToWords(Number(m[1]))} ${m[2] ? "master " : ""}${Number(m[1]) === 1 ? "suite" : "suites"}`;
  m = s.match(/^(\d+)\s*(bedrooms?|beds?)$/i);
  if (m) return `${numberToWords(Number(m[1]))} ${Number(m[1]) === 1 ? "bedroom" : "bedrooms"}`;
  m = s.match(/^(\d+)\s*(bathrooms?|baths?)$/i);
  if (m) return `${numberToWords(Number(m[1]))} ${Number(m[1]) === 1 ? "bathroom" : "bathrooms"}`;
  m = s.match(/^(\d+)\s*(parking( spots?| spaces?)?)$/i);
  if (m) return `${numberToWords(Number(m[1]))} ${Number(m[1]) === 1 ? "parking space" : "parking spaces"}`;
  if (/^(private )?terrace$/i.test(s)) return "a private terrace";
  if (/^teak terrace$/i.test(s)) return "a teak terrace";
  if (/^(private )?(pool|garden|rooftop)$/i.test(s)) return `a private ${lower(s.replace(/^private /i, ""))}`;
  // Any remaining digits are spoken as numbers so the voice never meets a digit.
  return lower(s).replace(/\d+/g, (d) => numberToWords(Number(d)));
};

const joinSpoken = (parts: string[]): string => (parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`);

export const DEFAULT_OUTRO_LINE = "Exclusively with Roomy Properties.";

/**
 * One voice-over line per media item plus one for the outro (so N + 1 entries; an empty string is a silent scene).
 * A script in the listing wins. Without one, a script is written: the neighborhood and title on the first scene,
 * the specs spread over the following scenes, and the standard outro line.
 */
export const resolveVoScript = (listing: RoomyListing): string[] => {
  const n = listing.media.length;
  if (listing.voScript) {
    const lines = Array.from({ length: n }, (_, i) => (listing.voScript![i] ?? "").trim());
    const outro = (listing.voScript[n] ?? "").trim();
    return [...lines, outro || DEFAULT_OUTRO_LINE];
  }
  const lines: string[] = Array.from({ length: n }, () => "");
  lines[0] = `${titleCase(listing.neighborhood)}. ${titleCase(listing.propertyTitle)}.`;
  const slots = Array.from({ length: n - 1 }, (_, i) => i + 1);
  if (slots.length && listing.specs.length) {
    const share = Math.ceil(listing.specs.length / slots.length);
    slots.forEach((scene, slot) => {
      const part = listing.specs.slice(slot * share, slot * share + share).map(specToSpeech);
      if (part.length) lines[scene] = `${part.length === 1 ? "" : "Featuring "}${joinSpoken(part)}.`.replace(/^./, (c) => c.toUpperCase());
    });
  } else if (n === 1 && listing.specs.length) {
    lines[0] += ` Featuring ${joinSpoken(listing.specs.map(specToSpeech))}.`;
  }
  return [...lines, DEFAULT_OUTRO_LINE];
};

/** A short fingerprint of the voice-over, so a stored voice track is only used when it still matches the listing. */
export const voiceSignature = (lines: string[]): string => {
  let h = 5381;
  const text = lines.join("\u0001");
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${lines.length}:${(h >>> 0).toString(16)}`;
};

/* ------------------------------ asset naming ------------------------------ */

/** Where a media `src` lives under assets/: absolute paths from assets/, everything else inside assets/roomy/. */
export const mediaAssetPath = (src: string): string => (src.startsWith("/") ? src.slice(1) : `roomy/${src}`);
