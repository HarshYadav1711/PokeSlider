"""Top-level registry models that aggregate manifests."""

from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from .feature import FeatureManifest
from .route import RouteSurface
from .system import SystemManifest


class FeatureRegistry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int = 1
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    features: list[FeatureManifest] = Field(default_factory=list)

    def by_id(self) -> dict[str, FeatureManifest]:
        return {f.id: f for f in self.features}


class SystemRegistry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int = 1
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    systems: list[SystemManifest] = Field(default_factory=list)

    def by_id(self) -> dict[str, SystemManifest]:
        return {s.id: s for s in self.systems}


class RouteRegistry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int = 1
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    routes: list[RouteSurface] = Field(default_factory=list)

    def by_id(self) -> dict[str, RouteSurface]:
        return {r.id: r for r in self.routes}
