// Shape of roomy/listings/<id>.json: the one file that describes a listing reel.
import { z } from "zod";

export const MediaItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("photo"),
    /** Relative to roomy/public/media/ (e.g. "sursock/photo-01.jpeg"), or a path from roomy/public/ starting with "/". */
    src: z.string(),
    headline: z.string().optional(),
    subline: z.string().optional(),
    /** Fixes this scene's length in seconds; the items without it share the rest of the time evenly. */
    seconds: z.number().min(1).max(10).optional(),
  }),
  z.object({
    type: z.literal("video"),
    src: z.string(),
    /** Trim start, in seconds. */
    startAtSecond: z.number().default(0),
    /** Playback speed. Below 1 slows a short shot so it fills its scene; 0.7 to 1 stays smooth. */
    playbackRate: z.number().min(0.5).max(1.5).default(1),
    /** Which part of horizontal footage stays in the vertical frame: 0 is the left edge, 50 the centre, 100 the right. */
    focusX: z.number().min(0).max(100).default(50),
    headline: z.string().optional(),
    subline: z.string().optional(),
    /** Fixes this scene's length in seconds. The clip also plays under the next scene's dissolve, 0.4 seconds more. */
    seconds: z.number().min(1).max(10).optional(),
  }),
]);

export const RoomyListingSchema = z
  .object({
    /** The file name in roomy/listings/, without .json. */
    id: z.string().default("listing"),
    /** e.g. "DOWNTOWN BEIRUT", "ACHRAFIEH" */
    neighborhood: z.string(),
    /** The neighborhood in Arabic, shown beside it in the badge on the first scene, e.g. "الأشرفية". */
    neighborhoodAr: z.string().optional(),
    /** e.g. "ARCHITECTURAL RESIDENCE" */
    propertyTitle: z.string(),
    /** e.g. "$1,250,000" or "PRICE UPON REQUEST". Left out, no price is shown. */
    price: z.string().optional(),
    /** e.g. ["310 SQM", "3 SUITES", "TERRACE", "2 PARKING"] */
    specs: z.array(z.string()).default([]),
    /**
     * Voice-over, one line per media item in order (an empty string keeps that scene silent), plus an optional last
     * line for the outro. Left out, a script is written from the neighborhood, title and specs.
     */
    voScript: z.array(z.string()).optional(),
    /** Length of the reel in seconds, outro included. 22 suits five items; allow about 3.5 seconds per item. */
    durationSeconds: z.number().min(15).max(60).default(22),
    /** One to twelve photos and clips. */
    media: z.array(MediaItemSchema).min(1).max(12),
    whatsappContact: z.string().default("+961 71 203 398"),
    instagram: z.string().default("@roomyproperties"),
  })
  .superRefine((listing, ctx) => {
    if (listing.voScript && listing.voScript.length > listing.media.length + 1) {
      ctx.addIssue({
        code: "custom",
        path: ["voScript"],
        message: `voScript has ${listing.voScript.length} lines for ${listing.media.length} media items; use at most ${listing.media.length + 1} (one per item and one for the outro).`,
      });
    }
  });

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type RoomyListing = z.infer<typeof RoomyListingSchema>;
/** What a listing file may contain before defaults are filled in. */
export type RoomyListingInput = z.input<typeof RoomyListingSchema>;
