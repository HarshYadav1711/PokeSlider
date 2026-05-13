"""Utility helpers (markers, hashing, git, paths, walking)."""

from .markers import (
    AUTO_END,
    AUTO_START,
    MANUAL_END,
    MANUAL_START,
    extract_manual_notes,
    safe_render,
)
from .hashing import file_sha256, stable_hash
from .paths import is_text_path, normalize_repo_path, repo_root_from
from .walker import RepoWalker

__all__ = [
    "AUTO_END",
    "AUTO_START",
    "MANUAL_END",
    "MANUAL_START",
    "extract_manual_notes",
    "safe_render",
    "file_sha256",
    "stable_hash",
    "is_text_path",
    "normalize_repo_path",
    "repo_root_from",
    "RepoWalker",
]
