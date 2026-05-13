"""GitPython-based helpers — best-effort; never required."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True, frozen=True)
class GitContext:
    commit: str | None
    branch: str | None
    dirty: bool


def read_git_context(root: Path) -> GitContext:
    try:
        from git import InvalidGitRepositoryError, Repo
    except Exception:  # pragma: no cover - optional dep at runtime
        return GitContext(None, None, False)

    try:
        repo = Repo(str(root), search_parent_directories=True)
    except InvalidGitRepositoryError:
        return GitContext(None, None, False)
    except Exception:
        return GitContext(None, None, False)

    try:
        commit = repo.head.commit.hexsha
    except Exception:
        commit = None
    try:
        branch = repo.active_branch.name
    except Exception:
        branch = None
    try:
        dirty = repo.is_dirty(untracked_files=False)
    except Exception:
        dirty = False
    return GitContext(commit, branch, dirty)
