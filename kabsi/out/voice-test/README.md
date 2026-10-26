# Kabsi voice test

Two lines, each read by the five Kokoro voices Kabsi may use (calm, adult, British English), at speed 1.0:

- "Your business on Google. Taken care of."
- "A new review came in. The reply is ready for your yes."

Each voice has one file with the two lines, 0.6 seconds apart. `all.wav` has the five files in the order below with 1 second of silence between them. Files are 24 kHz mono WAV, as Kokoro makes them, with no loudness change.

## Order

1. bf_alice (bf_alice.wav)
2. bf_isabella (bf_isabella.wav)
3. bf_lily (bf_lily.wav)
4. bm_george (bm_george.wav)
5. bm_lewis (bm_lewis.wav)

## Measurements

| Order | Voice | File | Pace (words a minute) | Pitch movement (semitones, standard deviation) | Pitch range (semitones, 10th to 90th percentile) | Loudness (LUFS) | Loudness range (LU) | Calm score (lower is calmer) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | bf_alice | bf_alice.wav | 186.5 (3) | 4.07 (4) | 11.46 | -20.2 | 0.9 (1) | 8 |
| 2 | bf_isabella | bf_isabella.wav | 187.1 (4) | 2.34 (1) | 5.98 | -16.9 | 1.4 (4) | 9 |
| 3 | bf_lily | bf_lily.wav | 190.8 (5) | 3.93 (3) | 9.87 | -20.7 | 1.1 (2) | 10 |
| 4 | bm_george | bm_george.wav | 174.9 (1) | 3.49 (2) | 8.49 | -21.4 | 1.1 (3) | 6 |
| 5 | bm_lewis | bm_lewis.wav | 180.9 (2) | 5.93 (5) | 10.11 | -22.8 | 2.2 (5) | 12 |

Numbers in brackets are the voice's rank on that measure among the five, 1 being calmest (slowest, least pitch movement, steadiest loudness). Pace is words a minute over the speech with the silence before, after and between the lines left out. Pitch is found by autocorrelation every 10 ms. Loudness is the EBU R128 integrated level of the whole file; it is shown but not ranked, because every video's voice is set to -14 LUFS anyway.

**Calmest by these numbers: bm_george**, then bf_alice, bf_isabella, bf_lily, bm_lewis. The numbers do not hear: listen to all.wav before choosing, then set the one voice in kabsi/config.json.
