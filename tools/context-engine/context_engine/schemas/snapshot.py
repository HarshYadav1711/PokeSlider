"""Repository scan snapshot — the structural truth of the codebase at a moment."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from .dependency import DependencyEdge


class FileRole(str, Enum):
    """Coarse classification used by the engine."""

    component = "component"
    hook = "hook"
    store = "store"
    service = "service"
    engine = "engine"
    query = "query"
    feature_entry = "feature_entry"
    overlay = "overlay"
    route_module = "route_module"
    data = "data"
    util = "util"
    a11y = "a11y"
    motion = "motion"
    types = "types"
    test = "test"
    style = "style"
    config = "config"
    provider = "provider"
    template = "template"
    docs = "docs"
    unknown = "unknown"


class SymbolKind(str, Enum):
    function = "function"
    component = "component"
    hook = "hook"
    store = "store"
    constant = "constant"
    type = "type"
    class_ = "class"
    interface = "interface"


class SymbolFact(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    name: str
    kind: SymbolKind
    exported: bool = False
    is_default_export: bool = False
    line: int | None = Field(default=None, ge=1)


class FileFact(BaseModel):
    """Everything we know about one file from the AST scan."""

    model_config = ConfigDict(extra="forbid")

    path: str = Field(description="Repo-relative POSIX path.")
    role: FileRole = FileRole.unknown
    sha256: str
    size_bytes: int
    loc: int = 0
    feature_id: str | None = None
    layer: str | None = None
    imports: list[str] = Field(default_factory=list)
    exported_symbols: list[SymbolFact] = Field(default_factory=list)
    referenced_stores: list[str] = Field(default_factory=list)
    referenced_query_keys: list[str] = Field(default_factory=list)
    referenced_hooks: list[str] = Field(default_factory=list)
    jsx_children_used: list[str] = Field(default_factory=list, description="JSX component names referenced.")
    is_test: bool = False
    parser: str = "tree-sitter"
    parser_ok: bool = True


class RepoSnapshot(BaseModel):
    """A complete scan result. Cached and version-stamped."""

    model_config = ConfigDict(extra="forbid")

    schema_version: int = 1
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    git_commit: str | None = None
    git_branch: str | None = None
    git_dirty: bool = False
    root: str
    files: list[FileFact] = Field(default_factory=list)
    edges: list[DependencyEdge] = Field(default_factory=list)
    parser_errors: list[str] = Field(default_factory=list)

    def by_path(self) -> dict[str, FileFact]:
        return {f.path: f for f in self.files}
