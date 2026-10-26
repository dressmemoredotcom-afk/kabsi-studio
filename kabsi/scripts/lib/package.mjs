// Facts about a rendered Kabsi file, and the work after the render: check it against its format preset, fit it to
// the preset's size cap, strip sound from silent formats, write the posters. A render fails if its file breaks the preset.
import { spawnSync } from "node:child_process";
import { mkdtempSync, renameSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../engine/scripts/render-core.mjs";
import { FORMATS, parseSize } from "../../src/formats.ts";

const probeJson = (file) =>
  JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,duration:format=duration,size", "-of", "json", file], { capture: true }).stdout);

/** What a file is: size in pixels, frame rate, length, codec, whether it has sound, bytes. */
export const probe = (file) => {
  const j = probeJson(file);
  const v = j.streams.find((s) => s.codec_type === "video");
  const [n, d] = v.r_frame_rate.split("/").map(Number);
  return {
    width: v.width,
    height: v.height,
    fps: n / d,
    codec: v.codec_name,
    pixFmt: v.pix_fmt,
    hasAudio: j.streams.some((s) => s.codec_type === "audio"),
    durationS: Number(j.format.duration),
    bytes: statSync(file).size,
  };
};

/** Integrated loudness (LUFS) and loudness range (LU) of a file's sound, or null for silence. */
export const loudness = (file) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
  const out = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const num = (re) => {
    const m = re.exec(out);
    return m ? Number(m[1]) : null;
  };
  const i = num(/\bI:\s+(-?[\d.]+) LUFS/);
  return { lufs: Number.isFinite(i) ? i : null, lra: num(/\bLRA:\s+(-?[\d.]+) LU/), truePeak: num(/Peak:\s+(-?[\d.]+) dBFS/) };
};

const mb = (b) => `${(b / 1_000_000).toFixed(2)} MB`;

/** Every preset rule, with its measured value. { ok, checks: [{ name, ok, note }] }. */
export const verifyPreset = (copy, size, file) => {
  const f = FORMATS[copy.format];
  const want = parseSize(size);
  const p = probe(file);
  const checks = [];
  const add = (name, ok, note) => checks.push({ name, ok, note });
  add("size", p.width === want.width && p.height === want.height, `${p.width} x ${p.height}, wanted ${want.width} x ${want.height}`);
  add("frame rate", Math.abs(p.fps - f.fps) < 0.01, `${p.fps} fps, wanted ${f.fps}`);
  add("codec", p.codec === "h264" && p.pixFmt === "yuv420p", `${p.codec} ${p.pixFmt}, wanted h264 yuv420p`);
  const inRange = p.durationS >= f.minS - 0.1 && p.durationS <= f.maxS + 0.1;
  add("length", inRange || !!copy.testOnly, `${p.durationS.toFixed(2)} s, range ${f.minS} to ${f.maxS} s${!inRange && copy.testOnly ? " (waived for a kit test)" : ""}`);
  add("sound", f.sound === "none" ? !p.hasAudio : p.hasAudio, f.sound === "none" ? (p.hasAudio ? "has a sound track, wanted none" : "no sound track") : p.hasAudio ? "has a sound track" : "no sound track, wanted voice");
  if (f.capBytes) add("size cap", p.bytes < f.capBytes, `${mb(p.bytes)}, under ${mb(f.capBytes)}`);
  return { ok: checks.every((c) => c.ok), checks, probe: p };
};

/**
 * Makes the file meet its format's sound and size rules. Silent formats lose their sound track. When the format has a
 * size cap and the file is over it, the video is re-encoded in two passes to a bitrate that fits (3 tries, each smaller).
 * Works in place. Returns a note for the log.
 */
export const fitToFormat = (copy, file) => {
  const f = FORMATS[copy.format];
  const p = probe(file);
  const silent = f.sound === "none";
  const over = f.capBytes && p.bytes >= f.capBytes;
  if (!silent && !over) return "kept as rendered";
  const tmp = mkdtempSync(join(tmpdir(), "fit-"));
  try {
    const out = join(tmp, "fit.mp4");
    if (!over) {
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-map", "0:v", "-c:v", "copy", "-an", "-movflags", "+faststart", out]);
      renameSync(out, file);
      return "sound track removed";
    }
    const audioBps = silent ? 0 : 192_000;
    let share = 0.9;
    for (let attempt = 1; attempt <= 3; attempt++, share -= 0.1) {
      const video = Math.max(80_000, Math.floor((f.capBytes * share * 8) / p.durationS - audioBps));
      const common = ["-c:v", "libx264", "-b:v", String(video), "-maxrate", String(Math.round(video * 1.6)), "-bufsize", String(video * 2), "-preset", "slow", "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709"];
      const pass = ["-passlogfile", join(tmp, "x264")];
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", file, ...common, ...pass, "-pass", "1", "-an", "-f", "null", "/dev/null"]);
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-map", "0:v", ...(silent ? [] : ["-map", "0:a", "-c:a", "copy"]), ...common, ...pass, "-pass", "2", ...(silent ? ["-an"] : []), "-movflags", "+faststart", out]);
      if (statSync(out).size < f.capBytes) {
        renameSync(out, file);
        return `re-encoded to fit under ${mb(f.capBytes)} (${(video / 1000).toFixed(0)} kbit/s video, try ${attempt})`;
      }
    }
    throw new Error(`${file} is still over ${mb(f.capBytes)} after 3 tries: shorten the video or simplify its motion`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};

/** A WebP copy of a PNG poster. */
export const webpPoster = (png, webp) => run("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-c:v", "libwebp", "-quality", "82", webp]);
