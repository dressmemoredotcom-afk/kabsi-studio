# Roomy Properties reels

Roomy Properties sells property in Beirut. This folder holds Roomy's listing reels only: one luxury Instagram Reel per
listing, 1080 x 1920 at 30 fps, built by the `RoomyDynamicReel` composition from `roomy/listings/<id>.json`.

Read `roomy/docs/BRIEF.md` before changing anything: it explains the listing file, the pacing, the copy, the voice and
the music, and it lists the open questions for Hussein. Do not guess the answers to those questions; ask.

## Where things go

- `listings/<id>.json`: one file per listing; `id` equals the file name. Edit these, nothing else holds a copy.
- `public/media/<property>/`: that property's photos and clips. `public/brand/`: logo and fonts. `public/audio/`:
  music. `public/voice/<id>/`: Kokoro lines (regenerated, not tracked) or a recorded `voiceover.mp3`.
- `src/`: the composition (`Root.tsx`, `DynamicReel.tsx`, `RoomyAudio.tsx`, `storyboard.ts`, `schema.ts`,
  `components/`). `src/tokens.ts` is the only place for colours and type; `src/generated/` is written by the scripts.
- `config.json`: the Kokoro voice and speed.
- `out/<id>/`: the review package, committed: the reel, the poster, contact sheets at 2 frames a second and
  `script.txt` with the voice lines.
- `docs/PROGRESS.md`: the state of every listing's reel. Update it with each render.

## Commands

`npm run roomy:render -- <id>` does everything in order: type check, asset scan, voice, rule check, render, audio
master, poster, contact sheets, script. `npm run roomy:studio -- <id>` opens Studio on a listing.
`npm run roomy:check`, `npm run roomy:voice -- <id>` and `npm run roomy:assets` run single steps.
