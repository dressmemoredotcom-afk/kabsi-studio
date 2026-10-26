// Rewrites kabsi/out/<ID>/checklist.md from the files already in the review package, so a visual review written after
// the render (visual-review.json) shows up without rendering again.
//   node kabsi/scripts/checklist.mjs <ID>
import { loadCopies } from "./lib/copies.mjs";
import { writeChecklist } from "./lib/checklist.mjs";

const id = process.argv[2];
const copy = (await loadCopies()).find((c) => c.id === id);
if (!copy) {
  console.error("kabsi checklist: name a video");
  process.exit(1);
}
const c = await writeChecklist(copy);
console.log(`kabsi checklist: ${copy.id}: ${c.yes} yes, ${c.no} no, ${c.confirm} for lane R to confirm`);
