# Kabsi Studio

A free, open-source video pipeline for Kabsi promos. One script file, one command, one finished MP4.

Kabsi (kabsi.co) looks after a local business's Google Business Profile: it drafts a reply to every new
review, watches the profile and says when something changes, and sends one short report a week. The owner
approves everything. Brand line: "Your reviews and listing. Taken care of."

## Videos

| Id | Composition | Script | Voice | Output |
| --- | --- | --- | --- | --- |
| 01 | `KabsiPromo01` | `src/brands/kabsi/script.ts` | `af_heart`, calm | `out/kabsi-promo-01-9x16-v1.mp4` |
| 02 | `KabsiPromo02` | `src/brands/kabsi/script02.ts` | `af_sarah` at 1.15x | `out/kabsi-promo-02-9x16-v2.mp4` |
| 03 | `PromoVideoV3` | `src/brands/kabsi/script03.ts` | `af_sarah` at 1.2x (placeholder) or your own files | `out/kabsi-promo-03-9x16-v3.mp4` |

Video 03 is the production template: about 20 seconds, with a three-track Remotion mix (voice, music, sound
effects), word-by-word kinetic captions, a realistic phone mockup with a glass notification banner, and a slot for
external b-roll. Its composition is `src/brands/kabsi/compositions/PromoVideoV3.tsx`.

**Rendered files are not committed.** `out/*.mp4`, `out/*.png` and temporary render files are git-ignored. Render
locally, or run the `render` workflow from the Actions tab and download the artifact.

## Render a video

```bash
npm install
npm run render:03     # video 03 (also render, render:02)
```

Each render does everything in order:

1. runs `scripts/check-script.mjs` and stops on any rule break,
2. makes or measures the voice (Kokoro placeholders, or your files for video 03),
3. renders the picture with Remotion (near-lossless; for video 03 the voice, music and sound effects are mixed here too),
4. normalises the audio to -14 LUFS with the true peak under -1 dB, and encodes H.264 + AAC with FFmpeg,
5. writes the poster frame.

Output goes to `out/` (1080 x 1920, 30 fps): the MP4 and a poster PNG, named in the table above. Video 01 and 02
generate their Kokoro voice into `assets/voice01/` and `assets/voice02/`; `assets/voice/` is for incoming files.

Needs Node 22 or newer and FFmpeg with libx264 on the PATH. Remotion downloads its own headless Chrome on first
run. To use an installed Chromium instead, set `CHROME_PATH=/path/to/chrome`.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run check` | Rule check for every video (banned phrases, dashes, tokens, timing). |
| `npm run build` | Type check, lint, rule check, then a Remotion bundle build. Must pass before a push. |
| `npm run typecheck`, `npm run lint` | The first two steps of build, on their own. |
| `npm run render:roomy -- <id>`, `npm run roomy:use -- <id>` | Render a Roomy listing reel, or just make it the active one. |
| `npm run roomy:assets`, `npm run roomy:voice` | The two Roomy preparation steps on their own (for the active listing). |
| `npm run audio` | Regenerate the stock music loop and sound effects in `assets/audio/`. |
| `npm run voice`, `voice:02`, `voice:03` | Regenerate that video's voice lines and their measured durations. |
| `npm run studio` | Remotion Studio, to scrub and preview. |

The GitHub Actions workflow (`.github/workflows/render.yml`) runs `npm run build` on every push. Its render job runs
from the Actions tab (pick the video) and uploads the files as an artifact. The render job has not been run yet.

## Change the script

Everything spoken or shown lives in the video's script file (**`src/brands/kabsi/script.ts`**, **`script02.ts`** or **`script03.ts`**):

- `VOICE_LINES`: each voice-over line (numbers written as words) and its caption chunks. Captions joined must
  equal the line.
- `SCREEN`: every on-screen string, outside the captions.
- `SCENES`: when each scene cuts in, in seconds. Each scene cuts in on its voice line. In 02 and 03, each line can also
  set `offset`, the seconds after the cut that its voice starts.

Then run the matching `npm run voice` command (only if a voice-over line changed) and render. Captions are timed from
each line's measured audio length, split across the chunks by character count, so no speech recognition is needed.
The check fails if a line runs past its scene or the video leaves its length range (28 to 30 seconds for 01 and 02,
18 to 22 for 03).

Colours, radii and shadows come only from the brand's `tokens.ts` (`src/brands/kabsi/tokens.ts`, `src/brands/roomy/tokens.ts`); the check fails on a hex colour anywhere else. Videos 02
and 03 use one extra colour there, `chatGreen` (#25D366), for chat bubbles, and 03 adds the phone and glass shadows.

### Voice

Voice ids are saved in `kabsi.config.json`: `"kabsi-voice"` (video 01, `af_heart`) and `"kabsi-voice-upbeat"`
(video 02, `af_sarah`), each with its speed. `node scripts/voice.mjs 02 --compare af_sarah,af_bella --speed 1.15`
writes the opening and closing lines in each voice to `out/voice-test-02/` for listening. To switch voice, change
the id, run `npm run voice:02`, then `npm run render:02`. Video 02's pick came from measurements (pitch level and
movement, brightness, loudness, pace) across every female Kokoro voice, not from listening.

### Rules enforced by `scripts/check-script.mjs`

No em dashes, en dashes or exclamation marks; none of the banned phrases (automatically, real-time, 24/7,
rank higher, number one, more reviews, more customers, guaranteed, best, easiest, in seconds, one tap, official
Google partner, approved by Google); no statistics or prices; no asking only happy customers, rewards for
reviews or "leave 5 stars"; no review attributed to a named person; "instantly" is blocked too, as it is the same
claim as real-time; no digits in the voice-over; the "Example" tag, the Harbour Lane Coffee business and
the brand line are intact (small print must say early access and not affiliated with Google); captions equal the voice-over; timing fits. It reads the VO, the captions and every
on-screen string, and also scans `src/` for dashes and stray colours.

## Audio: voice, music and sound effects (video 03)

The composition mixes three tracks, in `src/core/audio/`:

1. **Voice-over**: one clip per script line, placed on its scene.
2. **Background music**: `assets/audio/bgm/kabsi-upbeat-loop.mp3`, looped. It ducks to -20 dB under every voice
   line (dropping 0.12 s before the voice starts), comes back up to -11 dB in the gaps and across transitions,
   swells to -8 dB once the last line ends, and fades in and out. The levels are in `DEFAULT_DUCK` in
   `src/core/audio/mix.ts`. The loop is normalised to about -1 dBFS, so these are levels relative to that.
3. **Sound effects**: `sfx-pop`, `sfx-whoosh`, `sfx-whatsapp-ping`, `sfx-click`, `sfx-success` and `sfx-star` in
   `assets/audio/sfx/`, fired on exact frames from the cue list `SFX_CUES` in `src/brands/kabsi/compositions/v3/events.ts`.
   Picture and sound read the same event times, so they cannot drift apart.

After Remotion renders the mix, `scripts/render.mjs` normalises it to -14 LUFS (two-pass loudnorm) with a limiter
so the true peak stays under -1 dB, and encodes AAC.

The shipped music and effects are **generated from scratch** by `scripts/make-audio.mjs` (synthesised sine, saw
and noise), so there is nothing to license. They are stand-ins: to use licensed or bought audio, overwrite the
files with the same names, or point `BGM` and `SFX_FILES` at new ones. Check the licence of any pack first.

### Your own voice files

Drop a take for a line into `assets/voice/v3/`, named after the line id: `hook`, `whatsapp`, `qr` or `end`, as
`.mp3`, `.wav` or `.m4a`. `npm run render:03` (or `npm run voice:03`) measures it and uses it instead of the Kokoro
placeholder. For word-exact captions, add `<id>.words.json` beside it:

```json
[{ "text": "Too", "start": 0.0, "end": 0.21 }, { "text": "busy", "start": 0.21, "end": 0.48 }]
```

Times are seconds from the start of that file, one entry per word of the voice-over line. Without it, caption words
are timed by their share of the line's characters. If a take is longer than its scene, `npm run check` fails.

### Captions

`src/brands/kabsi/components/KineticCaptions.tsx` shows one phrase at a time on a soft black box. The word being spoken turns
Kabsi yellow with a small scale pop. Videos 02 and 03 use it.

### External clips (b-roll, talking heads, screen captures)

Put an MP4 in `assets/video/` and add an entry to `BROLL` in `src/brands/kabsi/compositions/PromoVideoV3.tsx`:
`{ file: "cafe-counter.mp4", fromS: 0, toS: 3 }`. The clip plays full frame under the UI, captions and audio mix, and
is silent by default. Any clip must follow the same rules as the script: no claims from the banned list, no real
people's reviews, and keep the licence of each clip on record.

## Roomy Properties: the dynamic listing reel (RoomyDynamicReel)

One composition that builds a 22 second luxury Instagram Reel (1080 x 1920, 30 fps, 660 frames) from
a listing file, whatever mix of photos and clips it lists: one to eight items, interior or exterior, with or
without a bedroom. Each listing is a file in `assets/roomy/listings/<id>.json`; one command makes its reel.

```bash
npm run render:roomy -- sursock-580sqm   # typecheck, find the assets, make the voice, check the rules, render, master audio
npm run roomy:use -- sursock-580sqm      # only make a listing the one Studio shows
```

The reel lands in `out/roomy-<id>.mp4`, mastered to -14 LUFS with true peak under -1 dB. The chosen listing is copied to
`assets/roomy/listing.json` (what Studio and the scripts read). Edit the file in `listings/`, never that copy; the check
fails if they differ.

**The listing** (`assets/roomy/listings/<id>.json`, shape in `src/brands/roomy/schema.ts`): `neighborhood`, `propertyTitle`, an
optional `price`, `specs` (for example `["310 SQM", "3 SUITES", "TERRACE", "2 PARKING"]`), `media` (each a `photo` or a
`video` with `src`, an optional `startAtSecond` for clips, and an optional `headline` and `subline`), an optional
`voScript`, and `whatsappContact`. A `src` is relative to `assets/roomy/`, or starts with `/` to point elsewhere under
`assets/`. A mistake in the file stops the render with a plain message saying which field is wrong.

**The pacing** (`src/brands/roomy/storyboard.ts`): the outro takes the last 4 seconds (120 frames). The 540 frames before
it are shared evenly: each of N items gets `floor(540 / N)` frames and the first takes the remainder. Scenes dissolve
into each other over 12 frames.

**What each scene says**: the first scene shows the neighborhood badge and a serif headline (the item's own, else the
property title). The last shows a `FOR SALE` badge, with the price when there is one. Middle scenes show a glass bar
with the item's own headline and subline or, if it has none, its share of the specs. A one-item reel carries the specs on
its only scene. Copy sits in the lower third over a charcoal gradient (85% at the bottom edge, clear by 55%); the
distance from the bottom is `layout.lowerThirdBottom` in `src/brands/roomy/tokens.ts`.

**Pictures**: photos fill the frame and move slowly, pushing in (1.00 to 1.06) on even scenes and pulling out (1.06 to
1.00) on odd ones, with a sideways drift on landscape photos. Clips play muted from `startAtSecond`, filling the frame.
A missing file shows a branded placeholder instead of failing the render. `node scripts/roomy-assets.mjs` lists what it
found.

**Logo**: `assets/roomy/roomy-logo.png` (or `Transparent.png`) in the outro, on a soft light plate because the artwork is
dark teal. If the file carries a tagline under the artwork, the outro crops it off without altering the file; a logo with
no tagline is shown whole. Until a logo is added, a typographic ROOMY PROPERTIES wordmark stands in.

**Voice**: Kokoro `bf_emma` (`roomy-voice` and `roomy-voice-speed` in `kabsi.config.json`). Lines come from `voScript`
(one per media item in order, an empty string for a silent scene, and one more for the outro) or, if there is none, are
written from the neighborhood, title and specs, with numbers spelled out. Each line starts after its scene cuts in and
after a pause from the line before. If they do not fit in 22 seconds the voice speeds up a little, and as a last resort
lines in the middle scenes are dropped. `node scripts/roomy-voice.mjs` shows the result. A ready-made
`assets/roomy/voiceover.mp3` replaces the Kokoro voice.

**Music**: `assets/audio/bgm/luxury-house.mp3`, or the generated ambient stand-in until you add it. 15% under the voice,
55% in the pauses, across scene changes and in the outro, with soft ramps and fades (`DUCK` in
`src/brands/roomy/RoomyAudio.tsx`).

## Layout

```
src/core/          shared by every brand: anim.ts (springs), audio/ (the mixer and ducking), timeline.ts, frame.ts
src/brands/roomy/  Roomy Properties: tokens, schema, storyboard, DynamicReel, RoomyAudio, components/
src/brands/kabsi/  Kabsi: Promo (video 01), v2/ (video 02), compositions/ (PromoVideoV3), components/, tokens, scripts
src/Root.tsx       registers every composition: RoomyDynamicReel, KabsiPromo01, KabsiPromo02, PromoVideoV3
assets/fonts/      Lalezar, Readex Pro, Cormorant Garamond and Jost, with their OFL licence files
assets/audio/      bgm/ music loops, sfx/ sound effects
assets/roomy/      listings/<id>.json, the active listing.json, and the Roomy photos, clips and logo
assets/voice/      incoming voice files for Kabsi video 03
assets/video/      external clips for the b-roll layer
scripts/           check-script, voice, render, roomy-assets, roomy-voice, make-audio, master-audio
out/               finished video (git-ignored)
```

`assets/` is Remotion's public directory.

## Licences

Everything used here allows commercial use at no cost.

| Tool | Licence | Notes |
| --- | --- | --- |
| Remotion 4 (`remotion`, `@remotion/*`) | [Remotion License](https://www.remotion.dev/docs/license), Free License | Kabsi qualifies for the free licence: a for-profit organisation with 3 employees or fewer. If Kabsi grows past 3 employees, a company licence is needed. |
| React, React DOM | MIT | |
| Kokoro TTS (`kokoro-js` and the Kokoro-82M ONNX model) | Apache 2.0 | Voices `af_heart` and `bf_emma` ship with the model. |
| `@huggingface/transformers`, `phonemizer` | Apache 2.0 | Used by kokoro-js. |
| ONNX Runtime | MIT | |
| FFmpeg | LGPL / GPL (this build has libx264) | Used as a command-line tool; it is not redistributed here. |
| Chromium / Chrome Headless Shell | BSD-style | Used by Remotion to draw frames. |
| Cormorant Garamond, Jost (Roomy reel) | SIL Open Font License 1.1 | `assets/fonts/OFL-CormorantGaramond.txt`, `OFL-Jost.txt`. From the google/fonts repository. |
| Zod | MIT | Checks `listing.json`. |
| TypeScript, ESLint | Apache 2.0, MIT | Dev only. |
| Music loop and sound effects in `assets/audio/` | Generated by `scripts/make-audio.mjs` | Original synthesis, no third-party material. |
| Lalezar (titles) | SIL Open Font License 1.1 | `assets/fonts/OFL-Lalezar.txt`. From the google/fonts repository. |
| Readex Pro (everything else) | SIL Open Font License 1.1 | `assets/fonts/OFL-ReadexPro.txt`. From the google/fonts repository; the variable font is saved as `ReadexPro-Variable.ttf`. |

## Product screens

The screens are drawn in React with invented data for "Harbour Lane Coffee". Every screen carries an "Example"
tag. Google's interface, logo, Maps pin and colours are never drawn; "Google" appears in words only. Video 02
shows Kabsi as a WhatsApp-style chat (generic bubbles, no WhatsApp logo). The QR code is a drawn illustration and
does not scan.
