"""Route / surface manifests.

PokeSlider has no router today; "routes" here means **user-facing surfaces**:
the main hero, modal dialogs, overlay panels, and bottom sheets that the
user can directly navigate to via UI or keyboard.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from .common import ImplementationEvidence


class RouteSurfaceKind(str, Enum):
    page = "page"
    overlay = "overlay"
    modal = "modal"
    panel = "panel"
    sheet = "sheet"
    embedded = "embedded"


class RouteSurface(BaseModel):
    """A first-class user surface."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^[a-z][a-z0-9_-]*$")
    name: str
    kind: RouteSurfaceKind
    path: str | None = Field(default=None, description="URL or hash route, if any.")
    owning_feature: str | None = None
    source_file: str
    triggered_by: list[str] = Field(default_factory=list, description="Files that open this surface.")
    evidence: ImplementationEvidence = Field(default_factory=ImplementationEvidence)
    manual_notes: str | None = None
