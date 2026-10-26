// Renders one composition to a finished MP4, for any brand.
//   1. Remotion bundles the brand's entry and renders H.264 with its audio mix (PNG frames, BT.709).
//   2. FFmpeg normalises the audio to -14 LUFS in two passes, with a limiter so the true peak stays under -1 dB, and
//      encodes AAC. The video stream is copied untouched, so there is no second video encode.
//   3. FFmpeg writes the poster frame from the finished file.
// Env: CHROME_PATH to use an installed Chromium instead of Remotion's own browser.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

export const LOUDNESS = "I=-14:TP=-1:LRA=11";

export const run = (cmd, args, { capture = false, cwd } = {}) => {
  const r = spawnSync(cmd, args, { stdio: capture ? "pipe" : "inherit", encoding: "utf8", cwd, maxBuffer: 1 << 26 });
  if (r.status !== 0) {
    if (capture) console.error(r.stderr);
    throw new Error(`${cmd} ${args.slice(0, 3).join(" ")} failed`);
  }
  return r;
};

/** Length of a file's video stream in seconds. */
export const videoSeconds = (file) => {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", file], { capture: true });
  return Number(r.stdout.trim());
};

/**
 * Normalises `input`'s audio to -14 LUFS (true peak under -1 dB) and writes `output` with the video stream copied.
 * Digital silence cannot be measured, so a silent track is only re-encoded.
 */
export const masterAudio = (input, output) => {
  const pass1 = run("ffmpeg", ["-hide_banner", "-nostats", "-i", input, "-vn", "-af", `loudnorm=${LOUDNESS}:print_format=json`, "-f", "null", "-"], { capture: true });
  const m = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf("{"), pass1.stderr.lastIndexOf("}") + 1));
  const silent = !Number.isFinite(Number(m.input_i));
  const norm = silent
    ? "aresample=48000"
    : `loudnorm=${LOUDNESS}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,` +
      "alimiter=limit=0.79:level=false,aresample=48000";
  // The audio must end with the picture: trim it to the video stream's length.
  const seconds = videoSeconds(input);
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", input,
    "-map", "0:v", "-map", "0:a", "-c:v", "copy",
    ...(Number.isFinite(seconds) ? ["-t", String(seconds)] : []),
    "-af", norm, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
    "-movflags", "+faststart", output,
  ]);
  return { inputLufs: silent ? null : Number(m.input_i) };
};

/** One frame of `video` at `atS` seconds, as a PNG. */
export const posterFrame = (video, atS, output) => {
  run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(atS), "-i", video, "-frames:v", "1", output]);
};

/**
 * Renders `composition` from `entry` with `publicDir` as Remotion's public dir, masters the audio and writes the
 * poster. `posterAtS` defaults to the middle of the video. Returns the frame count, fps and length.
 */
export async function renderReel({ entry, publicDir, composition: id, inputProps = {}, outFile, posterFile, posterAtS, crf = 18 }) {
  mkdirSync(dirname(outFile), { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), "render-"));
  try {
    const serveUrl = await bundle({ entryPoint: entry, publicDir });
    const browserExecutable = process.env.CHROME_PATH || null;
    const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
    const raw = join(tmp, "raw.mp4");
    let lastPct = -1;
    await renderMedia({
      composition,
      serveUrl,
      inputProps,
      codec: "h264",
      crf,
      imageFormat: "png",
      colorSpace: "bt709",
      enforceAudioTrack: true,
      outputLocation: raw,
      browserExecutable,
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 10) * 10;
        if (pct > lastPct) console.log(`render ${(lastPct = pct)}%`);
      },
    });
    const { inputLufs } = masterAudio(raw, outFile);
    const durationS = composition.durationInFrames / composition.fps;
    if (posterFile) posterFrame(outFile, posterAtS ?? durationS / 2, posterFile);
    console.log(`render: ${outFile}, ${composition.durationInFrames} frames, ${durationS} s` + (inputLufs === null ? ", silent" : `, audio ${inputLufs} LUFS to -14 LUFS`));
    return { frames: composition.durationInFrames, fps: composition.fps, durationS };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
