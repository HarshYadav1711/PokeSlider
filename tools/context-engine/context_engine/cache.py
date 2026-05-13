"""Hash + engine-version keyed file cache.

If a file's SHA matches what we cached *and* the engine version is the same,
the cached :class:`FileFact` is reused. Otherwise the file is re-scanned.
"""

from __future__ import annotations

import json
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from . import __version__ as ENGINE_VERSION
from .schemas import FileFact


class _Entry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sha256: str
    file_fact_json: str


class _Payload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    engine_version: str = ENGINE_VERSION
    entries: dict[str, _Entry] = Field(default_factory=dict)


class FileCache:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._payload = _Payload()
        self._dirty = False
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            payload = _Payload.model_validate(data)
        except Exception:
            return
        if payload.engine_version != ENGINE_VERSION:
            self._dirty = True
            return
        self._payload = payload

    def get(self, repo_path: str, sha: str) -> FileFact | None:
        entry = self._payload.entries.get(repo_path)
        if not entry or entry.sha256 != sha:
            return None
        try:
            return FileFact.model_validate_json(entry.file_fact_json)
        except Exception:
            return None

    def put(self, fact: FileFact) -> None:
        self._payload.entries[fact.path] = _Entry(
            sha256=fact.sha256, file_fact_json=fact.model_dump_json()
        )
        self._dirty = True

    def prune(self, present: set[str]) -> None:
        gone = [k for k in self._payload.entries if k not in present]
        for k in gone:
            del self._payload.entries[k]
        if gone:
            self._dirty = True

    def flush(self) -> None:
        if not self._dirty:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(self._payload.model_dump_json(indent=2), encoding="utf-8", newline="\n")
        self._dirty = False
