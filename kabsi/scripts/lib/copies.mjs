// Loads every Kabsi video's words: one COPY per kabsi/src/videos/*.copy.ts (Node reads the TypeScript directly).
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const loadCopies = async () => {
  const dir = join(root, "src", "videos");
  const files = readdirSync(dir).filter((f) => f.endsWith(".copy.ts")).sort();
  return Promise.all(files.map(async (f) => (await import(join(dir, f))).COPY));
};

/** The composition id of one size of one video. */
export const compositionId = (copy, size) => `${copy.id}-${size}`;

/** kabsi/out/<folder>/ for a video: its id, or copy.outDir when a kit test names one. */
export const outFolder = (copy) => copy.outDir ?? copy.id;
