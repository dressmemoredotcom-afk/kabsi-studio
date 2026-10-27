# Checklist: W1 (hero)

Format: Website loop. Sizes: 1080x1920, 1080x608. Contact sheet: contact-sheet-01.png, contact-sheet-02.png.
Visual review: recorded for these contact sheets.
Result: 30 yes, 0 no, 1 for lane R to confirm.

## Section 1: rules every video follows

| Rule | Answer | Note |
| --- | --- | --- |
| Plain English for owners: no em dashes, en dashes or exclamation marks | yes | 16 voice, caption and screen strings read |
| Never "spot", "grid", "pin", "listing", "visibility", or "app" for Kabsi | yes | word list checked in every string |
| Every claim is in https://kabsi.co/llms-full.txt | lane R to confirm | code cannot read the claims; compare the script with llms-full.txt |
| Never says or shows: top of Google, more customers or bookings, guaranteed results, fully automatic, set and forget, Google-approved or partner, removing bad reviews | yes | claim list checked in every string |
| Kabsi publishes nothing without the owner's yes: every demo shows the Yes | yes | the string "Yes" is in the copy. Yes, Edit, Skip show from 1.5 s, the Yes is tapped at 4.5 s and the owner's Yes bubble follows at 4.8 s, before Approved. |
| No Arabic in frame, voice or captions | yes | no recordings in this video, and no Arabic in any string or in kabsi/ text |
| Always hidden in recordings: Google logo and colours, account photos, emails, phone numbers, contact suggestions, other people's photos, notifications, the recorder's toolbar | yes | no recordings in this video |
| Google's name only as plain words; no Google logo, colours or approval | yes | the name appears only in text. Google appears only as plain words ("Publish it on Google?", "goes to Google", "is on Google"); no Google logo or colours, nothing suggesting approval. |
| Small print on ads and explainers: Kabsi is independent and not affiliated with Google | yes | not required for a website loop |
| WhatsApp: the glyph only from simple-icons, unaltered, only where it means WhatsApp, never animated | yes | the glyph only comes through components/WhatsAppGlyph.tsx, which takes no style or animation |
| No invented proof: no testimonials, star ratings, user counts or logos | yes | no such words in any string. The review quote belongs to the Example business and is shown as a message to approve, not as proof. No stars, star icons, ratings, counts, logos or testimonial framing in any frame. |
| No actors or AI-made people presented as owners or customers | yes | no people in this video |
| Invented example businesses carry the Example badge | yes | <ExampleBadge /> drawn for Harbour Lane Coffee. The Example badge sits in the chat header and is on screen in every frame from 0.0 to 12.0 s in both sizes, including the empty opening and closing frames. |
| Real owners appear only from the Founding 25, with written consent, saying their own words | yes | no real owner in this video |
| Faces: only people who agreed in writing | yes | no faces in this video |
| Stock clips: a licence that allows ads, link kept in the folder | yes | no stock clips |
| Voice: one voice for every product video, calm, adult, neutral British English, never a clone | yes | no voice in this video |
| Voice is AI, so the platform's AI label goes on where it asks (TikTok, YouTube) | yes | no voice |
| Music only with a licence for commercial use, about -20 LUFS under the voice; voice at -14 LUFS | yes | no music. no sound |

## Sections 2 and 3: brand kit and format

| Rule | Answer | Note |
| --- | --- | --- |
| Colours: only the nine of section 2, all from src/tokens.ts, no WhatsApp green | yes | tokens.ts holds exactly the nine; no other colour in source |
| Type: Bricolage Grotesque for titles, Manrope for captions and body | yes | both fonts with their OFL licences in public/brand/fonts/; no other font in source |
| Logo: the real ring mark and the wordmark, never redrawn or recoloured | yes | kabsi-mark.svg is the design studio's favicon.svg byte for byte; the wordmark is the text "Kabsi" in Bricolage Grotesque Bold 700, letter spacing -0.02em, ink on light and paper on dark |
| Captions: Manrope SemiBold, white on night at 80 percent, 2 lines of 32 characters at most, one yellow word at most, clear of the tap | yes | no spoken words, so no captions |
| Captions as the format asks | yes | Website loop: none in the picture, VTT file; no spoken words, so no caption file |
| Safe zone: text out of the top 220 px, bottom 420 px and right 120 px (1080 x 1920) | yes | 1080 x 1920: all text is inside the safe area (the header text starts below y 280, the lowest text ends above y 1440, the right-most text ends near x 915). 1080 x 608: the plan sets no safe zone for it. The phone is cropped top and bottom, so the header sits about 8 px from the top and the chat runs off the bottom; the kit's own 60 px margin for other sizes is not kept there. Lane R to decide if that matters on the website. |
| Tap rings: #111827 at 30 percent for half a second on each tap | yes | One soft dark ring on the Yes button at 4.5 s, half a second, in both sizes. |
| End card, 3 seconds: the mark, the line, the call to action | yes | this video has no end card |
| The hook is in the first 2 seconds | yes | The Kabsi chat is on screen from the first frame and the review slides in at 1.5 s, inside the first 2 seconds. Checked at 390 px wide on the 1080 x 608 file: the text is about 12.6 px, readable, and nothing is cut off except older messages that scroll out under the header after the Yes. |
| Format: size, 30 fps, length, sound and file size as the preset | yes | 1080x1920: size 1080 x 1920, wanted 1080 x 1920; frame rate 30 fps, wanted 30; codec h264 yuv420p, wanted h264 yuv420p; length 12.00 s, range 8 to 16 s; sound no sound track; size cap 0.53 MB, under 1.50 MB \| 1080x608: size 1080 x 608, wanted 1080 x 608; frame rate 30 fps, wanted 30; codec h264 yuv420p, wanted h264 yuv420p; length 12.00 s, range 8 to 16 s; sound no sound track; size cap 0.42 MB, under 1.50 MB |
| Voice level at -14 LUFS | yes | no sound |
| Works with the sound off | yes | not a burned-in caption format (Website loop) |
