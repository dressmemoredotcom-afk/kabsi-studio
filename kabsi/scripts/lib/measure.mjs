// Measures a voice: pace, pitch movement, loudness. Plain JavaScript on the samples, no extra tools.
//   pace            words a minute over the speech (leading and trailing silence trimmed, pauses inside a line kept)
//   pitch movement  spread of the voice's pitch, in semitones: standard deviation and the gap between the 10th and 90th
//                   percentile. Pitch is found frame by frame with autocorrelation (40 ms frames every 10 ms, 70 to 400 Hz).
//   loudness        integrated loudness (LUFS) and loudness range (LU) from FFmpeg's EBU R128 meter
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

/** Pitch of each 10 ms hop in Hz, or null where the frame is silent or unvoiced. */
export const pitchTrack = (samples, rate) => {
  const win = Math.round(rate * 0.04);
  const hop = Math.round(rate * 0.01);
  const minLag = Math.floor(rate / 400);
  const maxLag = Math.ceil(rate / 70);
  const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0);
  const gate = (0.05 * peak) ** 2;
  const track = [];
  for (let start = 0; start + win + maxLag < samples.length; start += hop) {
    let energy = 0;
    for (let i = 0; i < win; i++) energy += samples[start + i] ** 2;
    if (energy / win < gate) {
      track.push(null);
      continue;
    }
    const r = new Float64Array(maxLag + 1);
    let best = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let cross = 0;
      let lagged = 0;
      for (let i = 0; i < win; i++) {
        cross += samples[start + i] * samples[start + i + lag];
        lagged += samples[start + i + lag] ** 2;
      }
      r[lag] = cross / Math.sqrt(energy * lagged + 1e-12);
      best = Math.max(best, r[lag]);
    }
    if (best < 0.5) {
      track.push(null);
      continue;
    }
    // The first strong peak, not the strongest: the strongest is often an octave too low.
    let lag = minLag;
    for (let l = minLag + 1; l < maxLag; l++) {
      if (r[l] >= 0.9 * best && r[l] >= r[l - 1] && r[l] >= r[l + 1]) {
        lag = l;
        break;
      }
    }
    track.push(rate / lag);
  }
  return track;
};

/** Pitch spread in semitones from a pitch track. */
export const pitchMovement = (track) => {
  const voiced = track.filter((f) => f !== null);
  const mid = median(voiced);
  const st = voiced.map((f) => 12 * Math.log2(f / mid));
  // A short median filter removes single-frame octave jumps.
  const smooth = st.map((_, i) => median(st.slice(Math.max(0, i - 2), i + 3)));
  const mean = smooth.reduce((a, b) => a + b, 0) / smooth.length;
  const sd = Math.sqrt(smooth.reduce((a, b) => a + (b - mean) ** 2, 0) / smooth.length);
  const sorted = [...smooth].sort((a, b) => a - b);
  return { medianHz: median(voiced), stdSemitones: sd, rangeSemitones: percentile(sorted, 0.9) - percentile(sorted, 0.1), voicedShare: voiced.length / track.length };
};

/** Words a minute over `speechSeconds` of speech. */
export const pace = (words, speechSeconds) => (words / speechSeconds) * 60;
