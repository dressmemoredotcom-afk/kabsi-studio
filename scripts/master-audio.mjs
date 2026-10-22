// Normalises a finished MP4's audio to -14 LUFS with the true peak under -1 dB, in place.
// The video stream is copied untouched, so there is no second video encode.
//   node scripts/master-audio.mjs out/roomy-downtown-275sqm.mp4
import { renameSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const file = process.argv[2];
if (!file || !existsSync(file)) {
  console.error(`master-audio: file not found: ${file}`);
  process.exit(1);
}
const run = (args, capture) => {
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr);
    process.exit(1);
  }
  return r;
};

const LN = "I=-14:TP=-1:LRA=11";
const pass1 = run(["-hide_banner", "-nostats", "-i", file, "-vn", "-af", `loudnorm=${LN}:print_format=json`, "-f", "null", "-"]);
const m = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf("{"), pass1.stderr.lastIndexOf("}") + 1));
const norm =
  `loudnorm=${LN}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,` +
  "alimiter=limit=0.79:level=false,aresample=48000";
// The audio must end with the picture: trim it to the video stream's length.
const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
const videoSeconds = Number(probe.stdout.trim());
const tmp = file.replace(/\.mp4$/, ".mastered.mp4");
run(["-y", "-loglevel", "error", "-i", file, "-map", "0:v", "-map", "0:a", "-c:v", "copy", ...(Number.isFinite(videoSeconds) ? ["-t", String(videoSeconds)] : []), "-af", norm, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", tmp]);
renameSync(tmp, file);
console.log(`master-audio: ${file} was ${m.input_i} LUFS, now -14 LUFS (true peak under -1 dB)`);
