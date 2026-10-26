// Fails (exit 1) if a Kabsi video's words or source break a Kabsi rule.
//   node kabsi/scripts/check.mjs               checks every video and the source
//   node kabsi/scripts/check.mjs kit-test      checks one video (and the source)
// The rules are in kabsi/docs/VIDEO-PLAN.md sections 1 to 3; the code is in lib/rules.mjs.
import { pathToFileURL } from "node:url";
import { loadCopies } from "./lib/copies.mjs";
import { bannedCount, checkSource, checkVideo } from "./lib/rules.mjs";

/** Runs the check; returns { failures, lines } without exiting, so the other scripts can use it. */
export const runCheck = async (only) => {
  const copies = await loadCopies();
  if (only && !copies.some((c) => c.id === only)) {
    return { failures: [{ rule: "usage", where: "", msg: `no video "${only}". Known: ${copies.map((c) => c.id).join(", ")}` }], lines: [] };
  }
  const failures = [];
  const lines = [];
  for (const copy of copies) {
    if (only && copy.id !== only) continue;
    const r = checkVideo(copy);
    r.failures.forEach((f) => failures.push({ ...f, where: `[${copy.id}] ${f.where}` }));
    lines.push(`[${copy.id}] ${r.strings.length} strings (${r.strings.filter((s) => s.vo).length} voice-over lines), ${r.timing}`);
    r.notes.forEach((n) => lines.push(`  note: ${n}`));
  }
  const src = checkSource({ copies });
  failures.push(...src.failures);
  if (src.logoMissing.length) lines.push(`note: logo files not uploaded yet (${src.logoMissing.length}); only a kit test may render without them`);
  lines.unshift(`${bannedCount} banned-phrase rules, ${src.sourceFiles} source files`);
  return { failures, lines };
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { failures, lines } = await runCheck(process.argv[2]);
  if (failures.length) {
    console.error(`kabsi check FAIL (${failures.length})`);
    failures.forEach((f) => console.error(`  - ${f.where}: ${f.msg}`));
    process.exit(1);
  }
  console.log(`kabsi check PASS: ${lines[0]}`);
  lines.slice(1).forEach((l) => console.log(`  ${l}`));
}
