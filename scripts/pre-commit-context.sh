#!/usr/bin/env bash
# Lightweight pre-commit hook: scan + validate only. Generation is left to
# the developer or the CI workflow to avoid surprise edits to staged files.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if ! command -v context-engine >/dev/null 2>&1; then
  echo "context-engine not installed; skipping context check." >&2
  exit 0
fi

context-engine scan >/dev/null
context-engine validate
