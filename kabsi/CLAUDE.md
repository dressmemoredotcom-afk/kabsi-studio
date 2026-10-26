# Kabsi videos

Kabsi (kabsi.co) looks after a local business's Google Business Profile. This folder holds Kabsi's videos only.

1. **Read `kabsi/docs/VIDEO-PLAN.md` first** and follow its sections 1 to 3 without exception.
2. In its section 5 prompt, `inputs/[ID]/` means `kabsi/public/inputs/[ID]/` and `out/[ID]/` means `kabsi/out/[ID]/`.
3. `docs/VIDEO-PLAN.md` in kabsi-canvas wins if the two copies differ. Refresh the copy here when it changes.
4. Every claim must be in https://kabsi.co/llms-full.txt. Features marked [COMING] there may be shown only in videos
   whose publish gate (in `kabsi/docs/PROGRESS.md`) says so.
5. Keep `kabsi/docs/PROGRESS.md` up to date: status, version, lane R review and publish gate for each video.

## Where things go

- `src/videos/<ID>.tsx` and `src/videos/<name>.copy.ts`: one composition per catalogue ID, registered in `src/Root.tsx`.
  The copy file holds every on-screen string and voice-over line; the rule check, voice and render read it.
- `src/components/`: reusable parts (PhoneMockup, KineticCaptions, BRollLayer, CutFlash, the WhatsApp-style chat parts,
  QrStand, QrArt). `src/tokens.ts` is the only place for colours, radii and shadows; `src/fonts.ts` loads the fonts.
- `public/`: Remotion's public dir. `brand/` (fonts, logo), `audio/`, `voice/<ID>/`, `inputs/<ID>/` (Rashid's footage).
- `config.json`: the Kokoro voice and speed.
- `out/<ID>/`: the review package, committed.

## Commands

`npm run kabsi:studio`, `npm run kabsi:check`, `npm run kabsi:voice -- <ID>`, `npm run kabsi:render -- <ID>`.
`KabsiKitTest` is a placeholder (5 seconds, the word on the night background) so the entry bundles; remove it once
real videos exist.
