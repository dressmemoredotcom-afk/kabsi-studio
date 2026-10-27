# Roomy Properties: listing reels

Roomy Properties (@roomyproperties) sells property in Beirut. A Roomy reel is a luxury Instagram Reel for one listing:
1080 x 1920, 30 fps, 22 seconds unless the listing sets `durationSeconds` (allow about 3.5 seconds per item). One
composition, `RoomyDynamicReel`, builds it from one listing file, whatever mix of photos and clips it lists: one to
twelve items, interior or exterior, with or without a bedroom.

## The listing

`roomy/listings/<id>.json` (shape in `roomy/src/schema.ts`; `id` must equal the file name): `neighborhood`, an
optional `neighborhoodAr`, `propertyTitle`, an optional `price`, `specs` (for example
`["310 SQM", "3 SUITES", "TERRACE", "2 PARKING"]`), `media` (each a `photo` or a `video` with `src`; clips take an
optional `startAtSecond`, `playbackRate` and `focusX`; every item takes an optional `headline` and `subline`, and an optional `seconds` that fixes its scene length), an
optional `voScript`, `durationSeconds`, and `whatsappContact`. A `src` is relative to `roomy/public/media/` (for example
`sursock/photo-01.jpeg`), or starts with `/` to point elsewhere under `roomy/public/`. The listing reaches the
composition as input props; nothing is copied. A mistake in the file stops the render with a plain message.

## How a reel is built

- **Pacing** (`roomy/src/storyboard.ts`): the outro takes the last 4 seconds (120 frames). The frames before it are
  shared evenly between the items; the first takes the remainder. An item with `seconds` keeps exactly that length and the
  others share what is left (a clip pinned to 2.6 s shows 3.0 s of footage, counting the 0.4 s it plays under the next scene). Scenes dissolve into each other over 12 frames.
- **Copy**: the first scene shows the neighborhood badge (with its Arabic name when given) and a serif headline (the
  item's own, else the property title). The last shows a `FOR SALE` badge, with the price when there is one. Middle
  scenes show a glass bar with the item's own headline and subline or, if it has none, its share of the specs. Copy sits
  in the lower third over a charcoal gradient; `layout.lowerThirdBottom` in `roomy/src/tokens.ts` sets its height.
- **Pictures**: photos fill the frame and drift slowly in or out. Vertical clips fill the frame; horizontal clips play
  in a window on their own blurred glow. Black bars burned into a clip are found and cropped. A missing file shows a
  branded placeholder instead of failing the render.
- **Logo**: `roomy/public/brand/roomy-logo.png` in the outro, on a soft light plate. A tagline under the artwork is
  cropped off without altering the file. Without a logo, a typographic ROOMY PROPERTIES wordmark stands in.
- **Voice**: Kokoro `bf_emma` at 0.85x (`roomy/config.json`). Lines come from `voScript` (one per item, an empty string
  for a silent scene, and one more for the outro) or are written from the neighborhood, title and specs, with numbers
  spelled out. If they do not fit, the voice speeds up a little, and as a last resort middle lines are dropped. A
  ready-made `roomy/public/voice/<id>/voiceover.mp3` replaces the Kokoro voice.
- **Music**: `roomy/public/audio/luxury-house.mp3`, or the generated `ambient-loop.mp3` until it is added. 15% under
  the voice, 55% in the pauses and the outro, with soft ramps and fades (`roomy/src/RoomyAudio.tsx`).
- **Master**: -14 LUFS with the true peak under -1 dB, H.264 and AAC.

## Rules the check enforces

No dashes used as punctuation and no exclamation marks on screen; no digits in the voice-over (numbers as words); no
"guaranteed", "best", "number one" or statistics in the voice-over or headlines; the stored voice must match the
listing's script and end before the reel does; colours only from `roomy/src/tokens.ts`.

Arabic may appear on screen today (the neighborhood's Arabic name in the first badge). The no-Arabic rule of the other
brand in this repo does not apply to Roomy; whether Arabic is wanted is an open question below.

## Open questions for Hussein

- Who approves a reel before it is posted?
- Where are reels posted (Instagram only, or also TikTok, WhatsApp status, the website)?
- Are prices shown on screen? Today a listing shows its price only if the file has one.
- May Arabic appear on screen, and in the voice?
- Written permission for each property's photos and clips: who gave it, and where is it kept?
