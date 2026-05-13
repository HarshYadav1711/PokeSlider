"""Repository scanner.

Walks the working tree (gitignore-aware via ``git ls-files``), classifies each
file by role (folder + filename conventions), and — for ``.ts``/``.tsx`` files —
extracts imports / exports / store refs / query-key refs via tree-sitter.

The output is a :class:`Snapshot` of :class:`FileFact` rows. No graphs, no
edges. Anything more is computed on demand by the generator/validator.
"""

from __future__ import annotations

import hashlib
import subprocess
from pathlib import Path, PurePosixPath

from .cache import FileCache
from .parser import ParseResult, parse_ts
from .schemas import FileFact, FileRole, Snapshot

SCAN_ROOTS = ("src/",)
"""Folders we actually scan for AST facts. Other paths only count for git context."""

_FALLBACK_DENY = {
    ".git", "node_modules", "dist", "build", ".vite", ".cache", "coverage",
    ".pytest_cache", ".ruff_cache", "__pycache__", "legacy",
}

_TS_LIKE = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
_TEST_SUFFIXES = (".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx")


# ---------------------------------------------------------------------------
# Walk
# ---------------------------------------------------------------------------


def _iter_repo_files(root: Path) -> list[Path]:
    try:
        res = subprocess.run(
            ["git", "-c", "core.quotepath=off", "ls-files",
             "--cached", "--others", "--exclude-standard"],
            cwd=str(root), capture_output=True, text=True, timeout=30, check=False,
        )
    except (FileNotFoundError, subprocess.SubprocessError):
        res = None
    if res is not None and res.returncode == 0:
        return [root / line for line in res.stdout.splitlines() if line.strip()]
    out: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in _FALLBACK_DENY for part in path.relative_to(root).parts):
            continue
        out.append(path)
    return out


# ---------------------------------------------------------------------------
# Classify
# ---------------------------------------------------------------------------


def classify(repo_path: str) -> tuple[FileRole, str | None, bool]:
    """Return (role, feature_id, is_test)."""
    p = PurePosixPath(repo_path)
    parts = p.parts
    name = p.name.lower()
    suffix = p.suffix.lower()
    is_test = any(name.endswith(suf) for suf in _TEST_SUFFIXES)

    feature_id: str | None = None
    if "features" in parts:
        idx = parts.index("features")
        if idx + 1 < len(parts):
            feature_id = parts[idx + 1].replace("-", "_")

    if "node_modules" in parts or "dist" in parts or "legacy" in parts:
        return FileRole.unknown, None, is_test
    if suffix in {".md", ".mdc"}:
        return FileRole.docs, feature_id, False
    if suffix in {".css", ".scss"}:
        return FileRole.style, feature_id, False
    if name in {
        "vite.config.ts", "vitest.config.ts", "eslint.config.js",
        "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
        "package.json", "pyproject.toml",
    } or suffix in {".toml", ".yml", ".yaml", ".ini", ".cfg"}:
        return FileRole.config, None, False
    if is_test:
        return FileRole.test, feature_id, True
    if suffix not in _TS_LIKE:
        return FileRole.unknown, feature_id, False

    if "providers" in parts:
        return FileRole.provider, feature_id, False
    if "store" in parts:
        return FileRole.store, feature_id, False
    if "query" in parts:
        return FileRole.query, feature_id, False
    if "services" in parts:
        return FileRole.service, feature_id, False
    if "hooks" in parts or (name.startswith("use") and name[3:4].isupper()):
        return FileRole.hook, feature_id, False
    if "a11y" in parts:
        return FileRole.a11y, feature_id, False
    if "motion" in parts:
        return FileRole.motion, feature_id, False
    if "types" in parts or name.endswith("types.ts"):
        return FileRole.types, feature_id, False
    if "data" in parts and "features" not in parts:
        return FileRole.data, None, False
    if "utils" in parts:
        return FileRole.util, feature_id, False
    if "features" in parts:
        if name.endswith("engine.ts"):
            return FileRole.engine, feature_id, False
        if name.endswith("store.ts") or "store" in name:
            return FileRole.store, feature_id, False
        if suffix == ".tsx":
            return (FileRole.overlay if "overlay" in parts else FileRole.component, feature_id, False)
        return FileRole.util, feature_id, False
    if suffix == ".tsx" or "components" in parts:
        return FileRole.component, None, False
    return FileRole.unknown, None, False


# ---------------------------------------------------------------------------
# Git context (lightweight, no GitPython)
# ---------------------------------------------------------------------------


def _git_context(root: Path) -> tuple[str | None, str | None, bool]:
    def _run(args: list[str]) -> str | None:
        try:
            r = subprocess.run(["git", *args], cwd=str(root), capture_output=True, text=True, timeout=10, check=False)
        except (FileNotFoundError, subprocess.SubprocessError):
            return None
        return r.stdout.strip() if r.returncode == 0 else None

    commit = _run(["rev-parse", "HEAD"])
    branch = _run(["rev-parse", "--abbrev-ref", "HEAD"])
    status = _run(["status", "--porcelain"])
    return commit, branch, bool(status)


# ---------------------------------------------------------------------------
# Scan
# ---------------------------------------------------------------------------


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _in_scan_root(rel: str) -> bool:
    keep_files = {
        "package.json", "vite.config.ts", "vitest.config.ts",
        "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
        "PROJECT_CONTEXT.md", "FEATURE_TRACKER.md", "CURRENT_AI_CONTEXT.md",
        "DECISIONS_LOG.md", "README.md",
    }
    return rel in keep_files or any(rel.startswith(r) for r in SCAN_ROOTS) or rel.startswith("project-metadata/") or rel.startswith(".cursor/")


def _to_repo_rel(root: Path, p: Path) -> str:
    return p.resolve().relative_to(root.resolve()).as_posix()


def scan(root: Path, *, cache: FileCache | None = None) -> Snapshot:
    """Produce a deterministic snapshot of the repository."""
    root = root.resolve()
    commit, branch, dirty = _git_context(root)
    snap = Snapshot(root=str(root), git_commit=commit, git_branch=branch, git_dirty=dirty)
    present: set[str] = set()

    for path in _iter_repo_files(root):
        rel = _to_repo_rel(root, path)
        if not _in_scan_root(rel):
            continue
        present.add(rel)
        try:
            sha = _sha256(path)
        except OSError:
            continue

        cached = cache.get(rel, sha) if cache else None
        if cached is not None:
            snap.files.append(cached)
            continue

        role, feature_id, is_test = classify(rel)
        suffix = path.suffix.lower()
        fact = FileFact(path=rel, role=role, feature_id=feature_id, sha256=sha, is_test=is_test)
        try:
            fact.loc = sum(1 for _ in path.open("r", encoding="utf-8", errors="replace"))
        except OSError:
            pass

        if suffix in _TS_LIKE:
            res: ParseResult = parse_ts(path)
            fact.parser_ok = res.ok
            if res.ok:
                fact.imports = res.imports
                fact.exported_symbols = res.exported_symbols
                fact.referenced_stores = res.referenced_stores
                fact.referenced_query_keys = res.referenced_query_keys
            else:
                snap.parser_errors.append(f"{rel}: {res.error}")

        snap.files.append(fact)
        if cache and fact.parser_ok:
            cache.put(fact)

    if cache:
        cache.prune(present)
        cache.flush()
    return snap
