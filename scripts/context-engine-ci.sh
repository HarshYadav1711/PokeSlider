#!/usr/bin/env bash
# Run the Context Intelligence Engine in CI / pre-commit mode.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

if ! command -v context-engine >/dev/null 2>&1; then
  echo "Installing context-engine (editable)..."
  python -m pip install --quiet -e ./tools/context-engine
fi

echo "→ scan"
context-engine scan

echo "→ generate"
context-engine generate

echo "→ validate"
if ! context-engine validate; then
  echo "context-engine validation failed." >&2
  exit 1
fi

echo "→ git diff check (generated artifacts must be committed)"
generated_paths=(
  "PROJECT_CONTEXT.md"
  "FEATURE_TRACKER.md"
  "CURRENT_AI_CONTEXT.md"
  "DRIFT_REPORT.md"
  "docs/generated"
  "docs/graphs"
  ".cursor/rules/context-engine.mdc"
  "project-metadata"
)
if ! git diff --quiet -- "${generated_paths[@]}"; then
  echo "Generated artifacts are out of date. Run 'context-engine generate' and commit:" >&2
  git diff --name-only -- "${generated_paths[@]}" >&2
  exit 1
fi

echo "✓ context engine clean"
