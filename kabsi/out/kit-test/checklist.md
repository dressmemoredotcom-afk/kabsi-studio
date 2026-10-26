# Checklist: kit-test (demo)

Format: Reels, TikTok, Shorts. Sizes: 1080x1920. Contact sheet: contact-sheet-01.png.
Visual review: recorded for these contact sheets.
Result: 27 yes, 2 no, 2 for lane R to confirm.

## Section 1: rules every video follows

| Rule | Answer | Note |
| --- | --- | --- |
| Plain English for owners: no em dashes, en dashes or exclamation marks | yes | 21 voice, caption and screen strings read |
| Never "spot", "grid", "pin", "listing", "visibility", or "app" for Kabsi | yes | word list checked in every string |
| Every claim is in https://kabsi.co/llms-full.txt | lane R to confirm | code cannot read the claims; compare the script with llms-full.txt |
| Never says or shows: top of Google, more customers or bookings, guaranteed results, fully automatic, set and forget, Google-approved or partner, removing bad reviews | yes | claim list checked in every string |
| Kabsi publishes nothing without the owner's yes: every demo shows the Yes | yes | the string "Yes" is in the copy. The Yes button (3.5 to 5.0 s), its tap and the owner's Yes bubble (from 5.5 s) are shown. |
| No Arabic in frame, voice or captions | yes | no recordings in this video, and no Arabic in any string or in kabsi/ text |
| Always hidden in recordings: Google logo and colours, account photos, emails, phone numbers, contact suggestions, other people's photos, notifications, the recorder's toolbar | yes | no recordings in this video |
| Google's name only as plain words; no Google logo, colours or approval | yes | the name appears only in text. Google appears only as plain words (the Published line, the end card line, the small print); no Google logo or colours. |
| Small print on ads and explainers: Kabsi is independent and not affiliated with Google | yes | shown |
| WhatsApp: the glyph only from simple-icons, unaltered, only where it means WhatsApp, never animated | yes | the glyph only comes through components/WhatsAppGlyph.tsx, which takes no style or animation |
| No invented proof: no testimonials, star ratings, user counts or logos | yes | no such words in any string. The only review shown is the Example business's demo text: no stars, no name, no count, and it is not shown as a Kabsi testimonial. |
| No actors or AI-made people presented as owners or customers | yes | no people in this video |
| Invented example businesses carry the Example badge | yes | <ExampleBadge /> drawn for Olive Street Bakery. The Example badge is in the chat header on every frame from 0.0 to 6.5 s, as long as the Example business is on screen. |
| Real owners appear only from the Founding 25, with written consent, saying their own words | yes | no real owner in this video |
| Faces: only people who agreed in writing | yes | no faces in this video |
| Stock clips: a licence that allows ads, link kept in the folder | yes | no stock clips |
| Voice: one voice for every product video, calm, adult, neutral British English, never a clone | yes | Kokoro voice bm_george, from the allowed five |
| Voice is AI, so the platform's AI label goes on where it asks (TikTok, YouTube) | lane R to confirm | Rashid turns the label on when posting, unless the voice is his own recording |
| Music only with a licence for commercial use, about -20 LUFS under the voice; voice at -14 LUFS | yes | no music. voice mix measures -14 LUFS |

## Sections 2 and 3: brand kit and format

| Rule | Answer | Note |
| --- | --- | --- |
| Colours: only the nine of section 2, all from src/tokens.ts, no WhatsApp green | yes | tokens.ts holds exactly the nine; no other colour in source |
| Type: Bricolage Grotesque for titles, Manrope for captions and body | yes | both fonts with their OFL licences in public/brand/fonts/; no other font in source |
| Logo: the real ring mark and wordmark, never redrawn or recoloured | no | missing kabsi/public/brand/kabsi-mark.svg, kabsi/public/brand/kabsi-wordmark.svg: Hussein uploads them unchanged from kabsi-design-studio public/ |
| Captions: Manrope SemiBold, white on night at 80 percent, 2 lines of 32 characters at most, one yellow word at most, clear of the tap | yes | one source: the voice lines' captions. Captions sit low in the empty part of the screen, about 300 px below the Yes button and its tap. |
| Captions as the format asks | yes | Reels, TikTok, Shorts: burned in, SRT file |
| Safe zone: text out of the top 220 px, bottom 420 px and right 120 px (1080 x 1920) | yes | All text sits inside the safe area on the contact sheet, and on a safe-zone debug still at 5.7 s. |
| Tap rings: #111827 at 30 percent for half a second on each tap | yes | One soft dark ring over the Yes button at 4.9 to 5.4 s, visible on the yellow button. |
| End card, 3 seconds: the mark, the line, the call to action | no | "Your business on Google. Taken care of." and "Free check at kabsi.co". The line, the call to action and the small print show from 7.5 s to the end, but the mark is the dashed stand-in ring: the logo files are not uploaded yet. |
| The hook is in the first 2 seconds | yes | The review and the caption "A new review came in." are on screen by 0.5 s. |
| Format: size, 30 fps, length, sound and file size as the preset | yes | 1080x1920: size 1080 x 1920, wanted 1080 x 1920; frame rate 30 fps, wanted 30; codec h264 yuv420p, wanted h264 yuv420p; length 10.00 s, range 15 to 35 s (waived for a kit test); sound has a sound track |
| Voice level at -14 LUFS | yes | -14 LUFS, true peak -2.1 dBFS |
| Works with the sound off | yes | captions are burned in. Captions carry every spoken line and the chat shows the story. |
