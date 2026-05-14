# Context Engine (lightweight)

A small Python tool that keeps the PokeSlider repo's onboarding documentation
honest. It scans `src/`, refreshes feature manifest evidence, and regenerates
four context artifacts inside `<!-- AUTO-GENERATED-START -->` markers.

**Designed to be boring**: ~1000 LOC of Python, 4 CLI commands, 4 generated
artifacts, 3 validators. Single-developer-readable.

## Truth contract

- Never marks a feature as `shipped` without `source_files` that exist on disk.
- Never blindly rewrites a documentation file — only the region inside
  `<!-- AUTO-GENERATED-START -->` / `<!-- AUTO-GENERATED-END -->` markers.
- `<!-- MANUAL-NOTES-START -->` / `<!-- MANUAL-NOTES-END -->` blocks are
  preserved verbatim.
- Reports `Confidence` (`verified` / `partial` / `inferred`) per feature.

## Source-of-truth hierarchy

1. Actual implementation in `src/`
2. `project-metadata/features/<id>.yaml`
3. `project-metadata/current-state/snapshot.json` (derivative)
4. Generated docs (derivative)
5. Human prose inside `<!-- MANUAL-NOTES-* -->`

## Module layout (flat)

```
tools/context-engine/context_engine/
  __init__.py    cli.py         # Typer app: scan, generate, validate, watch
  scanner.py     # walk + classify + parse → Snapshot
  parser.py      # tree-sitter TS/TSX extractor
  schemas.py     # Pydantic FeatureManifest + Snapshot
  registry.py    # load/save feature YAML + snapshot JSON
  generator.py   # refresh evidence + render 4 artifacts
  validator.py   # 3 checks (fake refs, missing evidence, unknown deps)
  markers.py     # safe AUTO-GENERATED / MANUAL-NOTES merging
  cache.py       # SHA + engine-version per-file cache
  watcher.py     # watchdog wrapper with debounce
  templates/
    PROJECT_CONTEXT.md.j2
    FEATURE_TRACKER.md.j2
    CURRENT_AI_CONTEXT.md.j2
    context-engine.mdc.j2
```

## Installation

```bash
python -m pip install -e ./tools/context-engine
```

Requires Python 3.12+. `tree-sitter` + `tree-sitter-typescript` ship native
wheels for Windows / macOS / Linux.

## Commands

```bash
context-engine scan       # AST scan; refresh manifest evidence; persist snapshot
context-engine generate   # regenerate the 4 artifacts (calls scan if needed)
context-engine validate   # exit non-zero on fake refs or missing evidence
context-engine watch      # debounce-regenerate on changes
```

Outputs:

- `PROJECT_CONTEXT.md`        (in repo root, with markers)
- `FEATURE_TRACKER.md`        (in repo root, with markers)
- `CURRENT_AI_CONTEXT.md`     (in repo root, with markers)
- `.cursor/rules/context-engine.mdc`

Persisted state:

- `project-metadata/features/*.yaml`
- `project-metadata/current-state/snapshot.json`
- `project-metadata/.cache/file-cache.json`  (gitignored)

## Workflow for contributors

1. Make code changes in `src/`.
2. If you add or remove a feature surface, edit
   `project-metadata/features/<id>.yaml` (or create one). A feature cannot
   be `shipped` without on-disk `source_files`.
3. Run `context-engine scan && context-engine generate`.
4. Commit code + manifests + generated docs together.

### Cursor automation (optional)

If you use **Cursor Agent** with the built-in todo list, the project hook in
`.cursor/hooks.json` runs `context-engine scan` and `context-engine generate`
automatically when a **TodoWrite** updates the list so that **every todo is
completed** (detected on the transition into the all-done state). Requires
Python 3.12+ and `pip` on `PATH` (the hook installs the editable package if
`context-engine` is not already available). Cache files live under
`.cursor/hooks/cache/` (gitignored).

## Validators

| Code | Level | Meaning |
|---|---|---|
| `MISSING_FILE` | error | Manifest points to a path that doesn't exist on disk. |
| `SHIPPED_NO_EVIDENCE` | error | Status is `shipped` but `source_files` is empty. |
| `UNKNOWN_DEPENDENCY` | warning | A `dependencies:` entry points at an unknown feature id. |

## What this engine deliberately does **not** do

- No dependency-graph cycle analysis, coupling hotspots, fan-in/out reports.
- No Mermaid/DOT exports.
- No drift/architecture/context reports.
- No system or route manifests (just strings on a feature).
- No LLM, no external services.

The Pokémon product is the focus; this is a small assistant, not a platform.

## Parsing tools

Tree-sitter (`tree-sitter` + `tree-sitter-typescript`) is the only AST tool —
deterministic, structured, Windows / macOS / Linux wheels. The earlier `libcst`
dependency was removed (Python-only; never parsed anything in this repo).
