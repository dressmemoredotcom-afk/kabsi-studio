# Kabsi Studio

A free, open-source video pipeline for Kabsi promos. One script file, one command, one finished MP4.

Kabsi (kabsi.co) looks after a local business's Google Business Profile: it drafts a reply to every new
review, watches the profile and says when something changes, and sends one short report a week. The owner
approves everything. Brand line: "Your reviews and listing. Taken care of."

## Videos

| Id | Script | Voice | Output |
| --- | --- | --- | --- |
| 01 | `src/script.ts` | `kabsi-voice` (`af_heart`, calm) | `out/kabsi-promo-01-9x16-v1.mp4` |
| 02 | `src/script02.ts` | `kabsi-voice-upbeat` (`af_sarah` at 1.15x) | `out/kabsi-promo-02-9x16-v2.mp4` |

Video 02 is the fast, WhatsApp-first social ad: hard cuts, bouncy springs, a chat-style product screen, a QR code
scene and a listing alert. Its code lives in `src/v2/`.

## Render a video

```bash
npm install
npm run render        # video 01
npm run render:02     # video 02
```

Each render does everything in order:

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
| `npm run check` | Rule check for every video. |
| `npm run voice`, `npm run voice:02` | Regenerate that video's voice lines and their measured durations. |
| `npm run studio` | Remotion Studio, to scrub and preview. |

A manual GitHub Actions workflow (`.github/workflows/render.yml`) runs the same steps on `ubuntu-latest`. The
check job runs on every push; the render job runs from the Actions tab (workflow_dispatch) and uploads the files
as an artifact. It has not been run yet.

## Change the script

Everything spoken or shown lives in the video's script file (**`src/script.ts`** for 01, **`src/script02.ts`** for 02):

- `VOICE_LINES`: each voice-over line (numbers written as words) and its caption chunks. Captions joined must
  equal the line.
- `SCREEN`: every on-screen string, outside the captions.
- `SCENES`: when each scene cuts in, in seconds. Each scene cuts in on its voice line. In 02, each line can also
  set `offset`, the seconds after the cut that its voice starts.

Then run `npm run voice` or `npm run voice:02` (only if a voice-over line changed) and the matching render. Captions are timed from each
line's measured audio length, split across the chunks by character count, so no speech recognition is needed.
The check fails if a line runs past its scene or the video leaves 28 to 30 seconds.

Colours, radii and shadows come only from `src/tokens.ts`; the check fails on a hex colour anywhere else. Video 02
adds one colour there, `chatGreen` (#25D366), for the chat bubbles.

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

## Layout

```
src/            Remotion compositions for video 01, tokens.ts, script.ts, timeline.ts
src/v2/         video 02: scenes, chat UI, captions, timeline. Script is src/script02.ts
src/generated/  voice.json, voice02.json: measured length of each voice line (written by npm run voice)
assets/fonts/   Lalezar and Readex Pro, with their OFL licence files
assets/voice/   video 01 voice, one WAV per line (assets/voice02/ for video 02)
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

The screens are drawn in React with invented data for "Harbour Lane Coffee". Every screen carries an "Example"
tag. Google's interface, logo, Maps pin and colours are never drawn; "Google" appears in words only. Video 02
shows Kabsi as a WhatsApp-style chat (generic bubbles, no WhatsApp logo). The QR code is a drawn illustration and
does not scan.
