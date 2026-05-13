"""Pydantic models for the context engine.

Kept intentionally small. We have **two** real shapes:

* :class:`FeatureManifest` — the authoritative truth that lives as YAML under
  ``project-metadata/features/<id>.yaml``.
* :class:`Snapshot` — a deterministic dump of what the scanner found on disk.

Anything that used to be a ``SystemManifest`` / ``RouteSurface`` / ``DependencyEdge``
is now either a plain string on a feature manifest or part of the snapshot.
That's enough for this repo.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class Confidence(str, Enum):
    verified = "verified"  # source files + tests on disk
    partial = "partial"    # source files on disk, no tests
    inferred = "inferred"  # only structural placement (folder/filename)
    uncertain = "uncertain"  # no evidence — must NEVER appear in shipped


class FeatureStatus(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    shipped = "shipped"
    deprecated = "deprecated"


class FileRole(str, Enum):
    component = "component"
    hook = "hook"
    store = "store"
    service = "service"
    engine = "engine"
    query = "query"
    overlay = "overlay"
    data = "data"
    util = "util"
    a11y = "a11y"
    motion = "motion"
    types = "types"
    test = "test"
    style = "style"
    config = "config"
    provider = "provider"
    docs = "docs"
    unknown = "unknown"


class FeatureManifest(BaseModel):
    """One user-visible capability. Mirrors a single YAML file."""

    model_config = ConfigDict(extra="forbid")

    id: Annotated[str, Field(pattern=r"^[a-z][a-z0-9_-]*$")]
    name: str
    status: FeatureStatus
    description: str = ""
    stores: list[str] = Field(default_factory=list)
    shared_systems: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    source_files: list[str] = Field(default_factory=list)
    tests: list[str] = Field(default_factory=list)
    confidence: Confidence = Confidence.uncertain
    do_not: list[str] = Field(default_factory=list)
    manual_notes: str | None = None

    def is_evidence_sufficient_for_shipped(self) -> bool:
        return (
            self.status == FeatureStatus.shipped
            and bool(self.source_files)
            and self.confidence in (Confidence.verified, Confidence.partial)
        )


class FileFact(BaseModel):
    """Compact per-file scan result. Only fields we actually consume downstream."""

    model_config = ConfigDict(extra="forbid")

    path: str
    role: FileRole = FileRole.unknown
    feature_id: str | None = None
    sha256: str
    loc: int = 0
    is_test: bool = False
    imports: list[str] = Field(default_factory=list)
    exported_symbols: list[str] = Field(default_factory=list)
    referenced_stores: list[str] = Field(default_factory=list)
    referenced_query_keys: list[str] = Field(default_factory=list)
    parser_ok: bool = True


class Snapshot(BaseModel):
    """What the scanner saw. Cached + persisted, but treated as a derivative artifact."""

    model_config = ConfigDict(extra="forbid")

    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    git_commit: str | None = None
    git_branch: str | None = None
    git_dirty: bool = False
    root: str
    files: list[FileFact] = Field(default_factory=list)
    parser_errors: list[str] = Field(default_factory=list)


def derive_confidence(source_files: list[str], tests: list[str]) -> Confidence:
    if source_files and tests:
        return Confidence.verified
    if source_files:
        return Confidence.partial
    return Confidence.inferred
