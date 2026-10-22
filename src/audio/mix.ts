// Gain maths for the background music: ducks under the voice, rises between lines and in the outro.

export const dbToGain = (db: number): number => 10 ** (db / 20);

export type Span = { fromS: number; toS: number };

export type DuckConfig = {
  /** Level while a voice line is playing. The loop is normalised to about -1 dBFS, so this is the music peak. */
  duckDb: number;
  /** Level in the gaps between voice lines and across transitions. */
  openDb: number;
  /** Level once the last voice line has finished, so the music swells under the outro. */
  outroDb: number;
  outroFromS: number;
  /** The music starts dropping this long before a voice line begins. */
  attackS: number;
  /** After a voice line ends, the music takes this long to come back up. */
  releaseS: number;
  fadeInS: number;
  fadeOutS: number;
  totalS: number;
};

export const DEFAULT_DUCK: Omit<DuckConfig, "outroFromS" | "totalS"> = {
  duckDb: -20,
  openDb: -11,
  outroDb: -8,
  attackS: 0.12,
  releaseS: 0.4,
  fadeInS: 0.25,
  fadeOutS: 0.45,
};

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/** 0 when the voice is silent, 1 while it speaks, with smooth ramps on both sides. */
export const duckAmount = (tS: number, voice: readonly Span[], attackS: number, releaseS: number): number =>
  voice.reduce((m, v) => {
    let a = 0;
    if (tS >= v.fromS - attackS && tS < v.fromS) a = smooth((tS - (v.fromS - attackS)) / attackS);
    else if (tS >= v.fromS && tS <= v.toS) a = 1;
    else if (tS > v.toS && tS < v.toS + releaseS) a = 1 - smooth((tS - v.toS) / releaseS);
    return Math.max(m, a);
  }, 0);

/** Music level in dB at time tS. Interpolated in dB so the ramps sound even. */
export const bgmDb = (tS: number, voice: readonly Span[], cfg: DuckConfig): number => {
  const open = cfg.openDb + (cfg.outroDb - cfg.openDb) * smooth((tS - cfg.outroFromS) / 0.8);
  const d = duckAmount(tS, voice, cfg.attackS, cfg.releaseS);
  const db = open + (cfg.duckDb - open) * d;
  const fadeIn = smooth(tS / cfg.fadeInS);
  const fadeOut = smooth((cfg.totalS - tS) / cfg.fadeOutS);
  const fade = Math.min(fadeIn, fadeOut);
  // Fades go to silence, not just to a lower dB.
  return fade <= 0.001 ? -90 : db + 20 * Math.log10(fade);
};
