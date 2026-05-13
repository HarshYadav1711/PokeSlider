"""Path helpers (repo-relative, POSIX-normalized)."""

from __future__ import annotations

from pathlib import Path

TEXT_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".mdc",
    ".css",
    ".scss",
    ".html",
    ".yml",
    ".yaml",
    ".toml",
    ".py",
    ".sh",
    ".ps1",
    ".cfg",
    ".ini",
    ".env",
    ".lock",
    ".gitignore",
    ".prettierrc",
    ".editorconfig",
}


def is_text_path(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS or path.name in {
        "package.json",
        ".gitignore",
        "README",
    }


def normalize_repo_path(root: Path, path: Path) -> str:
    """Return repo-relative POSIX path."""
    rel = path.resolve().relative_to(root.resolve())
    return rel.as_posix()


def repo_root_from(start: Path) -> Path:
    """Walk upward from ``start`` looking for ``.git``; fall back to ``start``."""
    cur = start.resolve()
    for candidate in [cur, *cur.parents]:
        if (candidate / ".git").exists() or (candidate / "package.json").exists():
            return candidate
    return start.resolve()
