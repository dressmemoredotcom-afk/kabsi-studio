// One command: check the script, make the voice if missing, render with Remotion, mix and encode with FFmpeg.
//   npm run render        video 01
//   npm run render:02     video 02
// Env: CHROME_PATH to use an installed Chromium instead of Remotion's own browser.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { pickVideo } from "./videos.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const video = pickVideo(process.argv.slice(2));
const { VOICE_LINES, SCENES, VO_OFFSET_S } = await import(video.scriptFile);
const out = join(root, "out");
const tmp = join(out, `.tmp-${video.id}`);
const FINAL = join(out, video.out);
const POSTER = join(out, video.poster);
const POSTER_AT_S = video.posterAtS; // end card fully built, nothing mid-animation

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: opts.capture ? "pipe" : "inherit", encoding: "utf8", cwd: root });
  if (r.status !== 0) {
    if (opts.capture) console.error(r.stderr);
    throw new Error(`${cmd} ${args.slice(0, 3).join(" ")} failed`);
  }
  return r;
};

// 1. Rules first.
run("node", ["scripts/check-script.mjs", video.id]);

// 2. Voice, if it has not been generated.
const wavs = VOICE_LINES.map((l) => join(root, "assets", video.voiceDir, `${l.id}.wav`));
if (!wavs.every(existsSync) || !existsSync(join(root, "src", "generated", video.voiceJson))) {
  run("node", ["scripts/voice.mjs", video.id]);
  run("node", ["scripts/check-script.mjs", video.id]);
}

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

// 3. Picture: Remotion renders a silent, high-quality intermediate.
const serveUrl = await bundle({
  entryPoint: join(root, "src", "index.ts"),
  publicDir: join(root, "assets"),
});
const browserExecutable = process.env.CHROME_PATH || null;
const composition = await selectComposition({ serveUrl, id: video.composition, browserExecutable });
const silent = join(tmp, "silent.mp4");
let lastPct = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 12,
  colorSpace: "bt709",
  muted: true,
  outputLocation: silent,
  browserExecutable,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct > lastPct) console.log(`render ${(lastPct = pct)}%`);
  },
});

// 4. Voice track: place each line at its start, then loudness-normalise to -14 LUFS, peak at most -1 dBTP.
const total = SCENES[SCENES.length - 1].to;
const inputs = wavs.flatMap((w) => ["-i", w]);
const delays = VOICE_LINES.map((l, i) => {
  const ms = Math.round((SCENES.find((s) => s.id === l.id).from + (l.offset ?? VO_OFFSET_S)) * 1000);
  return `[${i}:a]adelay=${ms}|${ms},aresample=48000[a${i}]`;
});
const mix = `${delays.join(";")};${VOICE_LINES.map((_, i) => `[a${i}]`).join("")}amix=inputs=${VOICE_LINES.length}:normalize=0,apad=whole_dur=${total},atrim=0:${total},acompressor=threshold=0.05:ratio=4:attack=5:release=120:makeup=1[mix]`;
const raw = join(tmp, "voice-raw.wav");
run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", mix, "-map", "[mix]", "-ac", "1", raw]);

const LN = "I=-14:TP=-1:LRA=11";
const voice = join(tmp, "voice.wav");
run("ffmpeg", [
  "-y", "-loglevel", "error", "-i", raw,
  "-af", `loudnorm=${LN},alimiter=limit=0.891:level=false,aresample=48000`,
  "-ac", "1", voice,
]);

// 5. Final encode: H.264 + AAC, faststart, under 20 MB.
run("ffmpeg", [
  "-y", "-loglevel", "error",
  "-i", silent, "-i", voice,
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "6M", "-bufsize", "12M",
  "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "1",
  "-t", String(total), "-movflags", "+faststart",
  FINAL,
]);

// 6. Poster: the clearest frame, straight from the final file.
run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(POSTER_AT_S), "-i", FINAL, "-frames:v", "1", POSTER]);
rmSync(tmp, { recursive: true, force: true });
console.log(`done: ${FINAL}\n      ${POSTER}`);
