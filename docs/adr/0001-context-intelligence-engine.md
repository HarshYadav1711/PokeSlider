# 0001 — Context Intelligence Engine

- **Status:** accepted
- **Decided:** 2026-05-14
- **Related features:** all (tooling)

## Context

PokeSlider's onboarding and AI-handoff materials (`PROJECT_CONTEXT.md`,
`FEATURE_TRACKER.md`, `DECISIONS_LOG.md`, `.cursor/rules/*.mdc`) are
manually maintained. As the app grew (Team Builder, Battle Simulator,
evolution timeline explorer, multiple Zustand stores, parallel query keys)
the cost of keeping these documents accurate climbed and the failure mode
became hallucinated or stale claims — exactly the thing they exist to
prevent.

## Decision

Introduce a Python-based **Context Intelligence Engine** under
`tools/context-engine/` that:

1. Scans the repository deterministically using AST parsing (no regex
   for architecture understanding).
2. Persists structural truth in YAML/JSON under `project-metadata/`.
3. Generates documentation and Cursor rules inside explicit
   `<!-- AUTO-GENERATED-START -->` / `<!-- AUTO-GENERATED-END -->` markers,
   never blindly overwriting prose.
4. Validates evidence: any "shipped" claim must point to files that exist
   on disk; any feature reference must resolve.
5. Reports confidence (`verified`/`partial`/`inferred`/`uncertain`) for
   every claim and refuses to promote unsupported ones.

## Parsing tools — transparent deviation

The original brief listed `libcst` for AST extraction. `libcst` parses Python
only. The repository is React + TypeScript. To honor the underlying
constraint ("no regex-based architecture parsing") we use:

- **`tree-sitter` + `tree-sitter-typescript`** for `.ts`/`.tsx` AST analysis
  (deterministic, well-maintained, native wheels for the supported
  platforms).
- **`libcst`** for any Python files (including the engine itself).

Both are structured parsers; neither uses regex for symbol or import
extraction.

## Source-of-truth hierarchy

1. Actual implementation in `src/`
2. Feature / system / route registries in `project-metadata/`
3. Snapshot (`project-metadata/current-state/snapshot.json`)
4. Generated documentation
5. Human prose inside `<!-- MANUAL-NOTES-* -->` blocks

## Consequences

- Adding or removing a user-visible feature requires adding or updating
  a YAML manifest. The engine refuses to call something "shipped" without
  evidence.
- CI gains a verifiable drift check.
- Cursor + future AI sessions can rely on `project-metadata/` as the
  truth tier, not the prose docs.
- The TypeScript mirror at `src/core/feature-registry.ts` provides a
  type-safe view of the manifests for in-app diagnostics.

## Alternatives rejected

- Hand-maintained docs only — proven to drift.
- LLM-driven doc generation — non-deterministic, prone to hallucination.
- Pure TypeScript tooling (e.g. `ts-morph`) — would add a heavy build-time
  dependency and is harder to run from CI hooks without warming the
  Node toolchain.
