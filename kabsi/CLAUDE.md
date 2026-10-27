# Kabsi videos

Kabsi (kabsi.co) looks after a local business's Google Business Profile. This folder holds Kabsi's videos only.

1. **Read `kabsi/docs/VIDEO-PLAN.md` first** and follow its sections 1 to 3 without exception.
2. In its section 5 prompt, `inputs/[ID]/` means `kabsi/public/inputs/[ID]/` and `out/[ID]/` means `kabsi/out/[ID]/`.
3. `docs/VIDEO-PLAN.md` in kabsi-canvas wins if the two copies differ. Refresh the copy here when it changes.
4. Every claim must be in https://kabsi.co/llms-full.txt. Features marked [COMING] there may be shown only in videos
   whose publish gate (in `kabsi/docs/PROGRESS.md`) says so.
5. Keep `kabsi/docs/PROGRESS.md` up to date: status, version, lane R review and publish gate for each video.

## The brand kit (what every video uses)

- `src/tokens.ts`: the nine colours of VIDEO-PLAN section 2 and nothing else (yellow, night, carbon, paper, ink, mute,
  green, red, tap ring), plus radii, shadows, fonts and the safe area. The only file that may hold a colour. Captions use
  paper as their "white". Build transparent colours with `alpha()`.
- `src/kit.ts`: the kit's own words (end card line, call to action, small print, Example badge), the 3 second end card,
  the half second tap ring, the safe-zone insets, the logo file names and the five allowed voices. Pure data.
- `src/formats.ts`: the five rows of VIDEO-PLAN section 3 as presets (sizes, 30 fps, length, sound, caption mode, size cap).
- `src/captions.ts`: the one caption source. Wrapping, timing, SRT and WebVTT text, and the rule that keeps a caption
  clear of a tap point.
- `src/fonts.ts` loads Bricolage Grotesque (titles) and Manrope (captions and body) from `public/brand/fonts/`, each with
  its OFL licence file. No other font.
- `src/components/`: `Captions` (burned-in, 2 lines of 32 characters, one yellow word, `taps` keeps it clear of a tap),
  `SafeZone` (text stays out of the top 220 px, bottom 420 px and right 120 px of 1080 x 1920; `debug` draws the bands),
  `TapRing`, `ExampleBadge`, `EndCard`, `SmallPrint`, `Logo` (`LogoMark`), `wordmark.tsx` (`Wordmark`, `LogoLockup`),
  `KabsiFrame` (voice, burned-in captions and the safe-zone overlay for every video), `PhoneMockup`, `chat.tsx` (the demo
  chat, built to the design studio's own: see below), `WhatsAppGlyph` (the only way to draw the WhatsApp glyph: from
  simple-icons, unaltered, never animated), `BRollLayer`, `CutFlash`, `QrStand`, `QrArt`.
- Logo: the mark is `public/brand/kabsi-mark.svg`, the design studio's `favicon.svg` renamed and unchanged (the rule
  check holds it to the same bytes). The wordmark is not a file: it is the text "Kabsi" in Bricolage Grotesque Bold 700,
  letter spacing -0.02em, ink on a light ground and paper on a dark one, set by `components/wordmark.tsx`. Mark and
  wordmark together use the studio's proportions (32 px mark, 10 px gap, 22 px text). Never redraw or recolour either.
  Bricolage's optical size is pinned to 14 (`fonts.titleVariation`), as on the website.
- Design studio references in `docs/`: `styles.css` (its colours match the nine in `tokens.ts`), `whatsapp.tsx` and
  `public/brand/fonts/ui.tsx` (the mark's sizes), and two screenshots of its demo chat. `chat.tsx` follows them: status
  bar, header with the mark and the Example badge, dotted ground that stacks from the bottom, incoming bubbles with a tail
  and a row of three buttons (Yes, Edit, Skip, in that order), the owner's Yes as a yellow outgoing bubble with ticks,
  Approved with an Undo button, Published. It keeps the kit's colours and fonts, and is not WhatsApp's own design.

## Where things go

- `src/videos/<ID>.tsx` and `src/videos/<name>.copy.ts`: one composition per catalogue ID, registered in
  `src/Root.tsx` (one composition per size, named `<ID>-<width>x<height>`). A video draws inside `KabsiFrame`, uses
  `<ExampleBadge />` for every invented business and `<EndCard />` for the end card. The copy file (type `VideoCopy`)
  holds its format, sizes, length, every on-screen string and every voice-over line with its captions. The rule check,
  voice and render read it. Captions come only from the voice lines' `captions`: never write a second caption list.
- `public/`: Remotion's public dir. `brand/` (fonts, logo), `audio/`, `voice/<ID>/`, `inputs/<ID>/` (Rashid's footage).
- `config.json`: the Kokoro voice and speed. One voice for every video, one of `bf_alice`, `bf_isabella`, `bf_lily`,
  `bm_george`, `bm_lewis`. The voice is chosen: it is `bm_george`, and it stays that way for every video.
- `src/generated/voice/<ID>.json`: measured voice lengths and starts, written by `npm run kabsi:voice`. Committed.
- `out/<ID>/`: the review package, committed. `out/kit-test/` is the kit's own test.

## Commands

| Command | What it does |
| --- | --- |
| `npm run kabsi:studio` | Remotion Studio. Switch `safeZoneDebug` on in the props to see the safe zone. |
| `npm run kabsi:check [-- <ID>]` | The rule check on every video (or one) and on the source. Fails on any broken rule. |
| `npm run kabsi:voice -- <ID>` | Makes the voice lines (Kokoro, or a recorded file per line in `public/voice/<ID>/`, with optional word times). |
| `npm run kabsi:render -- <ID>` | Check, voice, render every size, fit to the format preset (fails if the file breaks it), then write `out/<ID>/`. |
| `npm run kabsi:checklist -- <ID>` | Rewrites `out/<ID>/checklist.md` from the package, picking up `visual-review.json`. |
| `npm run kabsi:voice-test` | Writes `out/voice-test/`: two lines in the five voices, `all.wav`, README and measurements. The voice is chosen, so that folder is not kept. |

`kabsi:render` needs Chrome: set `CHROME_PATH` if Remotion cannot download its own.

## The review package

`npm run kabsi:render -- <ID>` ends by writing `kabsi/out/<ID>/`: `kabsi-<id>-<name>-<size>.mp4` for each size, the
captions (`kabsi-<id>-<name>.vtt` for website formats, which burn nothing in; `.srt` for social formats, which also burn
them in), the poster as PNG and WebP, `contact-sheet-NN.png` at 2 frames a second, `script.txt`, `licences.txt` and
`checklist.md`.

`checklist.md` answers every rule of VIDEO-PLAN section 1 (and the kit and format rules) with yes or no and a note. Code
fills what code can check. For the visual rules, look at the contact sheet with the Read tool, then write
`out/<ID>/visual-review.json`:

```json
{ "contactSheet": "<sha256 of the contact sheets>", "rows": { "safe-zone": { "answer": "yes", "note": "..." } } }
```

(`sheetHash(dir)` in `scripts/lib/checklist.mjs` gives the hash; the row ids are `VISUAL_RULES` in the same file.) Run
`npm run kabsi:checklist -- <ID>`. An answer counts only while the contact sheet is the one it was made from. Anything
you could not see stays "lane R to confirm".

## The rule check

`scripts/lib/rules.mjs` reads every voice line, caption and on-screen string of every video, plus the kit's own words:
no dashes or exclamation marks; the banned words and claims of VIDEO-PLAN section 1; no statistics or prices; no Arabic
in any text under `kabsi/`; every invented business shows the Example badge; the end card line is exactly "Your business
on Google. Taken care of."; no colour outside `tokens.ts`, which holds exactly the nine; numbers in the voice as words;
captions joined equal the voice; at most 2 lines of 32 characters; length inside the format's range. Also banned:
"more reviews", higher or better rating, automatic and automatically, autopilot, on its own and by itself (anywhere,
since the check cannot tell whose "itself" it is), locks and lock your profile, blocks edits, stops edits. The logo is
checked too: `kabsi-mark.svg` must be byte for byte the design studio's favicon, and the wordmark spec must hold. A video
of `kit-test` is the one exception: its length range is waived.
