// Fails (exit 1) if any tracked file is over 45 MB, so the repo stays under GitHub's limits.
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LIMIT_MB = 45;
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const r = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" });
if (r.status !== 0) {
  console.error(`file-size: git ls-files failed\n${r.stderr}`);
  process.exit(1);
}
const files = r.stdout.split("\0").filter(Boolean);
const big = files
  .filter((f) => existsSync(join(root, f)))
  .map((f) => ({ f, mb: statSync(join(root, f)).size / 1e6 }))
  .filter(({ mb }) => mb > LIMIT_MB);
if (big.length) {
  console.error(`file-size FAIL: ${big.length} tracked file${big.length === 1 ? "" : "s"} over ${LIMIT_MB} MB`);
  big.forEach(({ f, mb }) => console.error(`  - ${f}: ${mb.toFixed(1)} MB`));
  process.exit(1);
}
console.log(`file-size PASS: ${files.length} tracked files, none over ${LIMIT_MB} MB`);
