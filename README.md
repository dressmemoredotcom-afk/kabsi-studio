# Kabsi Studio

A free, open-source video pipeline for Kabsi promos. One script file, one command, one finished MP4.

Kabsi (kabsi.co) looks after a local business's Google Business Profile: it drafts a reply to every new
review, watches the profile and says when something changes, and sends one short report a week. The owner
approves everything. Brand line: "Your reviews and listing. Taken care of."

## Videos

| Id | Composition | Script | Voice | Output |
| --- | --- | --- | --- | --- |
| 01 | `KabsiPromo01` | `src/script.ts` | `af_heart`, calm | `out/kabsi-promo-01-9x16-v1.mp4` |
| 02 | `KabsiPromo02` | `src/script02.ts` | `af_sarah` at 1.15x | `out/kabsi-promo-02-9x16-v2.mp4` |
| 03 | `PromoVideoV3` | `src/script03.ts` | `af_sarah` at 1.2x (placeholder) or your own files | `out/kabsi-promo-03-9x16-v3.mp4` |

Video 03 is the production template: about 20 seconds, with a three-track Remotion mix (voice, music, sound
effects), word-by-word kinetic captions, a realistic phone mockup with a glass notification banner, and a slot for
external b-roll. Its composition is `src/compositions/PromoVideoV3.tsx`.

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
| `npm run audio` | Regenerate the stock music loop and sound effects in `assets/audio/`. |
| `npm run voice`, `voice:02`, `voice:03` | Regenerate that video's voice lines and their measured durations. |
| `npm run studio` | Remotion Studio, to scrub and preview. |

The GitHub Actions workflow (`.github/workflows/render.yml`) runs `npm run build` on every push. Its render job runs
from the Actions tab (pick the video) and uploads the files as an artifact. The render job has not been run yet.

## Change the script

Everything spoken or shown lives in the video's script file (**`src/script.ts`**, **`src/script02.ts`** or **`src/script03.ts`**):

- `VOICE_LINES`: each voice-over line (numbers written as words) and its caption chunks. Captions joined must
  equal the line.
- `SCREEN`: every on-screen string, outside the captions.
- `SCENES`: when each scene cuts in, in seconds. Each scene cuts in on its voice line. In 02 and 03, each line can also
  set `offset`, the seconds after the cut that its voice starts.

Then run the matching `npm run voice` command (only if a voice-over line changed) and render. Captions are timed from
each line's measured audio length, split across the chunks by character count, so no speech recognition is needed.
The check fails if a line runs past its scene or the video leaves its length range (28 to 30 seconds for 01 and 02,
18 to 22 for 03).

Colours, radii and shadows come only from `src/tokens.ts`; the check fails on a hex colour anywhere else. Videos 02
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

The composition mixes three tracks, in `src/audio/`:

1. **Voice-over**: one clip per script line, placed on its scene.
2. **Background music**: `assets/audio/bgm/kabsi-upbeat-loop.mp3`, looped. It ducks to -20 dB under every voice
   line (dropping 0.12 s before the voice starts), comes back up to -11 dB in the gaps and across transitions,
   swells to -8 dB once the last line ends, and fades in and out. The levels are in `DEFAULT_DUCK` in
   `src/audio/mix.ts`. The loop is normalised to about -1 dBFS, so these are levels relative to that.
3. **Sound effects**: `sfx-pop`, `sfx-whoosh`, `sfx-whatsapp-ping`, `sfx-click`, `sfx-success` and `sfx-star` in
   `assets/audio/sfx/`, fired on exact frames from the cue list `SFX_CUES` in `src/compositions/v3/events.ts`.
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

`src/components/KineticCaptions.tsx` shows one phrase at a time on a soft black box. The word being spoken turns
Kabsi yellow with a small scale pop. Videos 02 and 03 use it.

### External clips (b-roll, talking heads, screen captures)

Put an MP4 in `assets/video/` and add an entry to `BROLL` in `src/compositions/PromoVideoV3.tsx`:
`{ file: "cafe-counter.mp4", fromS: 0, toS: 3 }`. The clip plays full frame under the UI, captions and audio mix, and
is silent by default. Any clip must follow the same rules as the script: no claims from the banned list, no real
people's reviews, and keep the licence of each clip on record.

## Roomy Properties reel (RoomyApartmentReel)

A 22 second luxury real estate reel for Roomy Properties (@roomyproperties): 1080 x 1920, 30 fps, 660 frames.
Five scenes dissolve into each other: the ruins view (slow push 1.00 to 1.06), the walkthrough clip (muted, from source
second 19), the lounge and library (slow pan), the master suite (sharp, push 1.00 to 1.05) with one glass spec bar, and
the outro with the logo. Copy lives in the lower third of each scene, left aligned on one baseline just above the Reels
caption zone, over a black-to-clear gradient so the pictures stay clear. Composition:
`src/compositions/RoomyApartmentReel.tsx`, scenes in `src/compositions/roomy/scenes.tsx`, copy and timings in
`src/scriptRoomy.ts`. Brand colours, the frosted card and the fonts (Cormorant Garamond for headlines, Jost for labels,
both OFL) are in `src/tokens.ts`.

```bash
npm run render:roomy      # writes out/roomy-downtown-275sqm.mp4
```

`render:roomy` is `remotion render RoomyApartmentReel out/roomy-downtown-275sqm.mp4`, plus hooks that npm runs around it:
before, `scripts/roomy-assets.mjs` records which files exist, the Kokoro voice is made (or reused) and the rules are
checked; after, `scripts/master-audio.mjs` normalises the audio to -14 LUFS with the video stream copied untouched.

**Assets** go in `assets/roomy/` (`roomy-logo.png`, `terrace-ruins`, `living-room-library`, `master-bedroom` as
`.jpg`, `.jpeg` or `.png`, and `apartment-walkthrough.mp4`) and `assets/audio/bgm/luxury-house.mp3`. They are read
through `staticFile()`. Each one has a fallback, so a missing file never breaks the render: photos and the clip fall
back to a teal-to-charcoal backdrop with arches, the logo to a typographic ROOMY / PROPERTIES wordmark, and the music
to a generated ambient stand-in (`assets/audio/bgm/roomy-ambient-standin.mp3`, from `node scripts/make-audio.mjs roomy`).
The script prints what is missing. The walkthrough is drawn with `OffthreadVideo`, which decodes H.264 reliably in
Remotion's headless Chrome.

**Voice**: Kokoro `bf_emma` at 0.88x (`roomy-voice` and `roomy-voice-speed` in `kabsi.config.json`), one clip per line
in `assets/roomy/voice/`. The script is five short lines, scheduled so each line starts after its scene cuts in (1 s
lead-in where there is room) with at least 0.8 s of silence between lines (`chain` in `scripts/videos.mjs`). The library
line is the longest, so it is the one that limits how slow the voice can go: `node scripts/voice.mjs 04 --fit` re-checks
the fit if the copy or speed changes. To use your own voice, put one file at `assets/roomy/voiceover.mp3`; it plays from
frame 0 and replaces the Kokoro lines.

**Music mix**: 18% under the voice, 55% in the pauses and the outro, 0.5 s fade in, 0.9 s fade out (`DUCK` in
`src/compositions/roomy/RoomyAudio.tsx`).

## Layout

```
src/compositions/  PromoVideoV3 and its scenes (v3/)
src/components/    shared pieces: PhoneMockup, whatsapp (banner, chat), QrStand, KineticCaptions, BRollLayer
src/audio/         the mixer: AudioMix, ducking maths (mix.ts), sound-effect catalogue (sfx.ts)
src/lib/           createTimeline: script plus measured voice to frames
src/               video 01 (Promo.tsx, script.ts), tokens.ts; src/v2/ is video 02 (script02.ts)
src/generated/     voice*.json: measured length of each voice line (written by the voice scripts)
assets/fonts/      Lalezar and Readex Pro, with their OFL licence files
assets/audio/      bgm/ music loops, sfx/ sound effects
assets/voice/      incoming voice files (v3/ holds video 03's; Kokoro placeholders there are git-ignored)
assets/video/      external clips for the b-roll layer
scripts/        voice.mjs, check-script.mjs, render.mjs
out/            finished video, poster, check frames, voice test samples
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
| TypeScript, ESLint | Apache 2.0, MIT | Dev only. |
| Music loop and sound effects in `assets/audio/` | Generated by `scripts/make-audio.mjs` | Original synthesis, no third-party material. |
| Lalezar (titles) | SIL Open Font License 1.1 | `assets/fonts/OFL-Lalezar.txt`. From the google/fonts repository. |
| Readex Pro (everything else) | SIL Open Font License 1.1 | `assets/fonts/OFL-ReadexPro.txt`. From the google/fonts repository; the variable font is saved as `ReadexPro-Variable.ttf`. |

## Product screens

The screens are drawn in React with invented data for "Harbour Lane Coffee". Every screen carries an "Example"
tag. Google's interface, logo, Maps pin and colours are never drawn; "Google" appears in words only. Video 02
shows Kabsi as a WhatsApp-style chat (generic bubbles, no WhatsApp logo). The QR code is a drawn illustration and
does not scan.
