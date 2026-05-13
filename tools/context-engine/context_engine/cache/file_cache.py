"""Persistent SHA-keyed cache for per-file scan results.

The cache lives at ``project-metadata/.cache/file-cache.json`` (gitignored).
Entries are keyed by repo-relative path + sha256 + the engine version that
produced them. When the engine version bumps (classifier changes, parser
upgrades, schema migrations), the entire cache is silently discarded.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from .. import __version__ as ENGINE_VERSION

if TYPE_CHECKING:
    from ..schemas.snapshot import FileFact


class CacheEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    path: str
    sha256: str
    file_fact_json: str


class FileCachePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: int = 1
    engine_version: str = ENGINE_VERSION
    entries: dict[str, CacheEntry] = Field(default_factory=dict)


class FileCache:
    """In-memory cache backed by a JSON file on disk."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._payload = FileCachePayload()
        self._dirty = False
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            payload = FileCachePayload.model_validate(data)
        except Exception:
            self._payload = FileCachePayload()
            return
        if payload.engine_version != ENGINE_VERSION:
            self._payload = FileCachePayload()
            self._dirty = True
            return
        self._payload = payload

    def get(self, repo_path: str, sha: str) -> "FileFact | None":
        from ..schemas.snapshot import FileFact

        entry = self._payload.entries.get(repo_path)
        if not entry or entry.sha256 != sha:
            return None
        try:
            return FileFact.model_validate_json(entry.file_fact_json)
        except Exception:
            return None

    def put(self, fact: "FileFact") -> None:
        from ..schemas.snapshot import FileFact  # noqa: F401

        self._payload.entries[fact.path] = CacheEntry(
            path=fact.path,
            sha256=fact.sha256,
            file_fact_json=fact.model_dump_json(),
        )
        self._dirty = True

    def prune_missing(self, present_paths: set[str]) -> int:
        removed = [k for k in self._payload.entries if k not in present_paths]
        for k in removed:
            del self._payload.entries[k]
        if removed:
            self._dirty = True
        return len(removed)

    def flush(self) -> None:
        if not self._dirty:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            self._payload.model_dump_json(indent=2),
            encoding="utf-8",
            newline="\n",
        )
        self._dirty = False
