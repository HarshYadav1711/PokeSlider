"""Dependency graph edge schema."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class DependencyKind(str, Enum):
    import_value = "import"
    types_only = "type_import"
    store_usage = "store_usage"
    query_key_usage = "query_key_usage"
    feature_owns = "feature_owns"
    system_powers = "system_powers"


class DependencyEdge(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    source: str = Field(description="Repo-relative POSIX source path or manifest id.")
    target: str = Field(description="Repo-relative POSIX target path or manifest id.")
    kind: DependencyKind
    raw_specifier: str | None = Field(
        default=None,
        description="The original import specifier string before resolution, when applicable.",
    )

    def key(self) -> tuple[str, str, str]:
        return (self.source, self.target, self.kind.value)
