// Fails (exit 1) if the brands mix. Brand folders share only engine/, which belongs to none of them.
//   - nothing in engine/ imports from either brand folder, or names either brand;
//   - neither brand folder imports from the other;
//   - neither brand's name appears anywhere in the other's folder, in file contents or file names (any case).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// A brand is a top-level folder with its own config.json, so the engine never has to name one.
const BRANDS = readdirSync(root).filter((d) => d !== "engine" && existsSync(join(root, d, "config.json")));
const SKIP = new Set(["node_modules", ".git"]);
const CODE = /\.(m?[jt]sx?|cjs)$/;
const failures = [];

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

/** The top-level folder a path sits in: engine, one of the brands, or something else. */
const area = (abs) => relative(root, abs).split(sep)[0];

/** Every module specifier in a source file: import, export from, dynamic import and require. */
const specifiers = (src) =>
  [...src.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);

const scan = (dirName) => {
  const files = walk(join(root, dirName));
  for (const file of files) {
    const rel = relative(root, file);
    const others = dirName === "engine" ? BRANDS : BRANDS.filter((b) => b !== dirName);
    if (CODE.test(file)) {
      for (const spec of specifiers(readFileSync(file, "utf8"))) {
        const target = spec.startsWith(".") ? area(resolve(dirname(file), spec)) : spec.split("/")[0];
        if (others.includes(target)) failures.push(`${rel}: imports "${spec}" from ${target}/`);
      }
    }
    for (const other of others) {
      const word = new RegExp(other, "i");
      if (word.test(rel.slice(dirName.length))) failures.push(`${rel}: file name contains "${other}"`);
      // Read as latin1 so binary files are scanned byte for byte too.
      const text = readFileSync(file, "latin1");
      const m = text.match(new RegExp(`.{0,30}${other}.{0,30}`, "i"));
      if (m) failures.push(`${rel}: contains "${other}" (…${m[0].replace(/\s+/g, " ").trim()}…)`);
    }
  }
  return files.length;
};

if (BRANDS.length < 2) failures.push(`found ${BRANDS.length} brand folder(s) with a config.json, expected at least two`);
const counts = ["engine", ...BRANDS].map((d) => `${d}/ ${scan(d)} files`);
if (failures.length) {
  console.error(`isolation FAIL (${failures.length})`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`isolation PASS: ${counts.join(", ")}`);
