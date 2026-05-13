"""Gitignore-aware, deterministic repository walker.

Uses ``git ls-files --cached --others --exclude-standard`` when available
(fast and authoritative). Falls back to a static deny-list otherwise.
"""

from __future__ import annotations

import subprocess
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from pathlib import Path

_FALLBACK_DENY = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".cache",
    "coverage",
    ".pytest_cache",
    ".ruff_cache",
    "__pycache__",
    "legacy",
    ".idea",
    ".vscode",
}


@dataclass(slots=True, frozen=True)
class WalkConfig:
    extra_exclude: frozenset[str] = frozenset()
    follow_symlinks: bool = False


class RepoWalker:
    def __init__(self, root: Path, config: WalkConfig | None = None) -> None:
        self.root = root.resolve()
        self.config = config or WalkConfig()

    def iter_files(self) -> Iterator[Path]:
        listed = self._git_ls_files()
        if listed is not None:
            for rel in listed:
                p = self.root / rel
                if p.is_file():
                    yield p
            return
        yield from self._fallback_walk(self.root)

    def _git_ls_files(self) -> list[str] | None:
        try:
            res = subprocess.run(
                [
                    "git",
                    "-c",
                    "core.quotepath=off",
                    "ls-files",
                    "--cached",
                    "--others",
                    "--exclude-standard",
                ],
                cwd=str(self.root),
                capture_output=True,
                text=True,
                timeout=30,
                check=False,
            )
        except (FileNotFoundError, subprocess.SubprocessError):
            return None
        if res.returncode != 0:
            return None
        return [line for line in res.stdout.splitlines() if line.strip()]

    def _fallback_walk(self, root: Path) -> Iterable[Path]:
        deny = _FALLBACK_DENY | self.config.extra_exclude
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            parts = path.relative_to(root).parts
            if any(part in deny for part in parts):
                continue
            yield path
