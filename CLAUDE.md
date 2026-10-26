# Working in this repo

This repo is one video studio for two unrelated brands: Kabsi (`kabsi/`) and Roomy Properties (`roomy/`). They share
only `engine/`, which holds brand-neutral code: no colours, fonts, words or media.

- **Name your brand first.** Every session names its brand in the first line of its work and changes only that brand's
  folder. Read that brand's `CLAUDE.md` before anything else.
- **Never mix the brands.** Nothing of one brand may appear in the other's folder, code, config, assets, rule check,
  workflow or docs. `npm run check` runs the isolation check, which fails on an import across brands or on either
  brand's name inside the other's folder.
- **Engine changes prove nothing else moved.** A change to `engine/` needs one Kabsi render and one Roomy render
  before it is merged, compared against renders from before the change.
- **Branches:** `claude/h-kabsi-<id>`, `claude/h-roomy-<id>`, `claude/h-studio-<topic>` (for `engine/` or the root).
- **Pull requests:** open one, and merge it yourself once the `check` workflow is green.
- **Never post or upload anywhere outside this repo.** Rendered files stay in `<brand>/out/` and workflow artifacts.

`npm run build` (type check, lint, both checks, isolation, file size, and a bundle of each brand) must pass before
a push. No tracked file may be over 45 MB.
