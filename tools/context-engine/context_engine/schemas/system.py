"""Shared system manifests (engines, services, hooks layers, design tokens, etc.)."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from .common import ImplementationEvidence


class SystemManifest(BaseModel):
    """A reusable horizontal capability (not a single feature)."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^[a-z][a-z0-9_-]*$")
    name: str
    purpose: str = Field(default="", description="Why this system exists, factually.")
    layer: str = Field(
        default="other",
        description="One of: data, query, state, ui, a11y, motion, engine, util, design, providers.",
    )
    used_by: list[str] = Field(default_factory=list, description="Feature or system ids consuming this.")
    evidence: ImplementationEvidence = Field(default_factory=ImplementationEvidence)
    do_not: list[str] = Field(default_factory=list)
    manual_notes: str | None = None
