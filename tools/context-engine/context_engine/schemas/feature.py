"""Feature manifests."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from .common import ImplementationEvidence


class FeatureStatus(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    shipped = "shipped"
    deprecated = "deprecated"


class FeatureManifest(BaseModel):
    """A user-visible capability of the application.

    Truth contract:
      * ``status == "shipped"`` requires ``evidence.confidence`` of ``verified``
        or ``partial`` AND at least one ``source_files`` entry.
      * Stores, routes, and shared systems referenced here must exist on disk
        (validated by the validators package).
    """

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^[a-z][a-z0-9_-]*$", description="kebab/snake stable id")
    name: str
    status: FeatureStatus
    description: str = Field(default="", description="One-paragraph plain factual summary.")
    owned_routes: list[str] = Field(default_factory=list)
    shared_systems: list[str] = Field(default_factory=list)
    stores: list[str] = Field(default_factory=list)
    query_keys: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    evidence: ImplementationEvidence = Field(default_factory=ImplementationEvidence)
    do_not: list[str] = Field(default_factory=list, description="Hard constraints / anti-patterns.")
    manual_notes: str | None = Field(default=None, description="Human-authored prose preserved verbatim.")

    def is_evidence_sufficient_for_shipped(self) -> bool:
        return (
            self.status == FeatureStatus.shipped
            and bool(self.evidence.source_files)
            and self.evidence.confidence.name in {"verified", "partial"}
        )
