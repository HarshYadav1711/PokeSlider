"""Architectural Decision Record (ADR) schema."""

from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class DecisionStatus(str, Enum):
    proposed = "proposed"
    accepted = "accepted"
    superseded = "superseded"
    rejected = "rejected"


class DecisionRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^[0-9]{4}-[a-z0-9-]+$", description='Format: "0001-decision-slug"')
    title: str
    status: DecisionStatus = DecisionStatus.accepted
    decided_on: date
    context: str = ""
    decision: str
    consequences: str = ""
    related_features: list[str] = Field(default_factory=list)
    related_systems: list[str] = Field(default_factory=list)
    superseded_by: str | None = None
