# Context Intelligence Engine

A deterministic, truthful, self-healing context layer for the PokeSlider repository.

The engine scans the real codebase, builds machine-readable manifests of
features / systems / surfaces / dependencies, generates onboarding documentation,
and validates that nothing on disk drifts from what the registries claim.

## Truth contract

The engine is built around one rule: **implementation truth beats polished
documentation**. To honor that, the engine:

- Never marks a feature as `shipped` unless evidence files exist on disk.
- Never blindly rewrites human-authored documentation. Generated regions live
  inside `<!-- AUTO-GENERATED-START -->` / `<!-- AUTO-GENERATED-END -->`
  markers, and `<!-- MANUAL-NOTES-START -->` / `<!-- MANUAL-NOTES-END -->`
  blocks are preserved.
- Reports confidence (`verified` / `partial` / `inferred` / `uncertain`) for
  every claim. Anything below `partial` is excluded from "shipped" docs.
- Refuses to invent files or features. Validators reject manifests that point
  to paths that do not exist.

## Source-of-truth hierarchy

1. Actual implementation in `src/`
2. Feature / system / route registries under `project-metadata/`
3. Machine-readable snapshot under `project-metadata/current-state/snapshot.json`
4. Generated documentation in the repo root and `docs/generated/`
5. Manual prose inside `<!-- MANUAL-NOTES-* -->` blocks

## Parsing strategy (transparent deviation)

The original task brief asked for `libcst` for AST analysis. `libcst` is a
Python-only concrete syntax tree and cannot parse TypeScript or TSX. To honor
the spirit of the rule ("no regex-based architecture parsing") the engine
uses:

- **`tree-sitter` + `tree-sitter-typescript`** for `.ts` / `.tsx` AST parsing.
- **`libcst`** for any Python files — including the engine's own source —
  for symmetric self-analysis support.

Both are deterministic, structured parsers. The decision is recorded in
[`DECISIONS_LOG.md`](../../DECISIONS_LOG.md).

## Installation

The engine is a standalone Python package. From the repo root:

```bash
python -m pip install -e ./tools/context-engine
```

Requires Python 3.12+. The `tree-sitter-typescript` wheel ships native code
but is published with Windows / macOS / Linux wheels.

## Commands

```bash
context-engine init                # create project-metadata skeleton
context-engine scan                # AST scan, persist snapshot.json
context-engine generate            # refresh manifests + regenerate docs + .mdc
context-engine validate            # exit non-zero on drift / fake claims
context-engine drift-report        # write DRIFT_REPORT.md only
context-engine architecture-report # print verified architecture table
context-engine context-report      # print CURRENT_AI_CONTEXT.md to stdout
context-engine graph -f mermaid    # export dependency graph
context-engine graph -f feature-mermaid -o docs/graphs/features.md
context-engine watch               # incremental regeneration on changes
```

`scan` writes:

- `project-metadata/current-state/snapshot.json` — full structural truth
- `project-metadata/.cache/file-cache.json` — hash-keyed file cache

`generate` writes (only where markers are present, or where a sidecar is safe):

- `PROJECT_CONTEXT.md`, `FEATURE_TRACKER.md`, `CURRENT_AI_CONTEXT.md`,
  `DRIFT_REPORT.md` — root onboarding capsules.
- `docs/generated/{feature,route,system,component,dependency}-map.md`
- `docs/graphs/{dependency,feature}-graph.md`
- `.cursor/rules/context-engine.mdc` — Cursor onboarding mirror.
- Updated `project-metadata/{features,systems}/*.yaml` with refreshed evidence.

## Workflow for contributors

1. Make code changes in `src/`.
2. If you've added or removed a feature surface, edit
   `project-metadata/features/<id>.yaml` (create if new). The engine will
   refuse to call something "shipped" without a matching manifest.
3. Run `context-engine scan && context-engine generate`.
4. Inspect the diff. If it surprises you, the manifests are out of date — not
   the engine.
5. Commit code + manifests + generated docs together.

## Editing rules

- **Inside the AUTO-GENERATED block**: don't. Re-run `generate`.
- **Outside the block**: free for humans. Stays untouched.
- **`<!-- MANUAL-NOTES-* -->` block**: preserved verbatim across regenerations.
- **No markers? No silent overwrite.** The engine writes a sidecar
  `*.generated.md` and exits cleanly.

## CI integration

`scripts/context-engine-ci.ps1` (and `.sh`) runs `scan` → `validate` →
`generate --docs-only` and fails the build if errors are reported or if
the generated documentation differs from what's committed. Wire it from
your preferred CI yaml.

## What this engine deliberately does **not** do

- It does not rewrite source code.
- It does not try to infer business intent from filenames alone — that lives
  in manifests with `confidence: inferred`.
- It does not call any LLM or external service.
- It does not gate on coverage; if you want test thresholds, layer them
  separately.
