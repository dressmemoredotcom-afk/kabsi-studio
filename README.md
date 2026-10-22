# Kabsi Studio

A free, open-source video pipeline for Kabsi promos. One script file, one command, one finished MP4.

Kabsi (kabsi.co) looks after a local business's Google Business Profile: it drafts a reply to every new
review, watches the profile and says when something changes, and sends one short report a week. The owner
approves everything. Brand line: "Your reviews and listing. Taken care of."

## Render one video

```bash
npm install
npm run render
```

`npm run render` does everything in order:

1. runs `scripts/check-script.mjs` and stops on any rule break,
2. generates the voice (Kokoro) if it is not already in `assets/voice/`,
3. renders the picture with Remotion (silent, near-lossless),
4. mixes the voice, normalises it to about -14 LUFS with a peak near -1 dBFS, and encodes H.264 + AAC with FFmpeg,
5. writes the poster frame.

Output:

- `out/kabsi-promo-01-9x16-v1.mp4` (1080 x 1920, 30 fps, 29.8 s)
- `out/kabsi-promo-01-poster.png`

Needs Node 22 or newer and FFmpeg with libx264 on the PATH. Remotion downloads its own headless Chrome on first
run. To use an installed Chromium instead, set `CHROME_PATH=/path/to/chrome`.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run check` | Rule check only. |
| `npm run voice` | Regenerate the voice lines and their measured durations. |
| `npm run studio` | Remotion Studio, to scrub and preview. |

A manual GitHub Actions workflow (`.github/workflows/render.yml`) runs the same steps on `ubuntu-latest`. The
check job runs on every push; the render job runs from the Actions tab (workflow_dispatch) and uploads the files
as an artifact. It has not been run yet.

## Change the script

Everything spoken or shown lives in **`src/script.ts`**:

- `VOICE_LINES`: each voice-over line (numbers written as words) and its caption chunks. Captions joined must
  equal the line.
- `SCREEN`: every on-screen string, outside the captions.
- `SCENES`: when each scene cuts in, in seconds. Each scene cuts in on its voice line.

Then run `npm run voice` (only if a voice-over line changed) and `npm run render`. Captions are timed from each
line's measured audio length, split across the chunks by character count, so no speech recognition is needed.
The check fails if a line runs past its scene or the video leaves 28 to 30 seconds.

Colours, radii and shadows come only from `src/tokens.ts`; the check fails on a hex colour anywhere else.

### Voice

The voice id is saved in `kabsi.config.json` as `"kabsi-voice"` (currently `af_heart`). `voice-speed` is there
too. `node scripts/voice.mjs --compare af_heart,bf_emma` writes the hook line in each voice to `out/voice-test/`
for listening. To switch voice, change the id and run `npm run voice` then `npm run render`.

### Rules enforced by `scripts/check-script.mjs`

No em dashes, en dashes or exclamation marks; none of the banned phrases (automatically, real-time, 24/7,
rank higher, number one, more reviews, more customers, guaranteed, best, easiest, in seconds, one tap, official
Google partner, approved by Google); no statistics or prices; no asking only happy customers, rewards for
reviews or "leave 5 stars"; no digits in the voice-over; the "Example" tag, the Harbour Lane Coffee business and
the brand line are intact; captions equal the voice-over; timing fits. It reads the VO, the captions and every
on-screen string, and also scans `src/` for dashes and stray colours.

## Layout

```
src/            Remotion compositions, tokens.ts, script.ts, timeline.ts
src/generated/  voice.json, measured length of each voice line (written by npm run voice)
assets/fonts/   Lalezar and Readex Pro, with their OFL licence files
assets/voice/   one WAV per voice-over line
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
| TypeScript | Apache 2.0 | Dev only. |
| Lalezar (titles) | SIL Open Font License 1.1 | `assets/fonts/OFL-Lalezar.txt`. From the google/fonts repository. |
| Readex Pro (everything else) | SIL Open Font License 1.1 | `assets/fonts/OFL-ReadexPro.txt`. From the google/fonts repository; the variable font is saved as `ReadexPro-Variable.ttf`. |

## Product screens

The phone screens are drawn in React as Kabsi's own app, with invented data for "Harbour Lane Coffee". Every
screen carries an "Example" tag. Google's interface, logo, Maps pin and colours are never drawn; "Google"
appears in words only.
