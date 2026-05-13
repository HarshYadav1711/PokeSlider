"""On-disk registry storage in YAML/JSON.

Layout under ``project-metadata/`` (repo root):
    features/<id>.yaml
    systems/<id>.yaml
    architecture/routes.yaml        # consolidated, small
    decisions/<id>.yaml
    current-state/snapshot.json     # last full scan (large; cache-like)
"""

from __future__ import annotations

from pathlib import Path

import yaml

from ..schemas.decision import DecisionRecord
from ..schemas.feature import FeatureManifest
from ..schemas.registry import FeatureRegistry, RouteRegistry, SystemRegistry
from ..schemas.route import RouteSurface
from ..schemas.snapshot import RepoSnapshot
from ..schemas.system import SystemManifest


class RegistryStore:
    def __init__(self, metadata_root: Path) -> None:
        self.root = metadata_root.resolve()
        self.features_dir = self.root / "features"
        self.systems_dir = self.root / "systems"
        self.routes_dir = self.root / "architecture"
        self.decisions_dir = self.root / "decisions"
        self.current_state_dir = self.root / "current-state"
        for d in (
            self.features_dir,
            self.systems_dir,
            self.routes_dir,
            self.decisions_dir,
            self.current_state_dir,
        ):
            d.mkdir(parents=True, exist_ok=True)

    # ---- Features ----------------------------------------------------

    def load_features(self) -> FeatureRegistry:
        items: list[FeatureManifest] = []
        for f in sorted(self.features_dir.glob("*.yaml")):
            data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
            items.append(FeatureManifest.model_validate(data))
        return FeatureRegistry(features=items)

    def save_feature(self, manifest: FeatureManifest) -> Path:
        path = self.features_dir / f"{manifest.id}.yaml"
        path.write_text(
            yaml.safe_dump(manifest.model_dump(mode="json"), sort_keys=False, allow_unicode=True),
            encoding="utf-8",
            newline="\n",
        )
        return path

    # ---- Systems -----------------------------------------------------

    def load_systems(self) -> SystemRegistry:
        items: list[SystemManifest] = []
        for f in sorted(self.systems_dir.glob("*.yaml")):
            data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
            items.append(SystemManifest.model_validate(data))
        return SystemRegistry(systems=items)

    def save_system(self, manifest: SystemManifest) -> Path:
        path = self.systems_dir / f"{manifest.id}.yaml"
        path.write_text(
            yaml.safe_dump(manifest.model_dump(mode="json"), sort_keys=False, allow_unicode=True),
            encoding="utf-8",
            newline="\n",
        )
        return path

    # ---- Routes ------------------------------------------------------

    def load_routes(self) -> RouteRegistry:
        path = self.routes_dir / "routes.yaml"
        if not path.exists():
            return RouteRegistry()
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        if isinstance(data, list):
            data = {"routes": data}
        return RouteRegistry.model_validate(data)

    def save_routes(self, registry: RouteRegistry) -> Path:
        path = self.routes_dir / "routes.yaml"
        path.write_text(
            yaml.safe_dump(registry.model_dump(mode="json"), sort_keys=False, allow_unicode=True),
            encoding="utf-8",
            newline="\n",
        )
        return path

    # ---- Decisions ---------------------------------------------------

    def load_decisions(self) -> list[DecisionRecord]:
        out: list[DecisionRecord] = []
        for f in sorted(self.decisions_dir.glob("*.yaml")):
            data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
            out.append(DecisionRecord.model_validate(data))
        return out

    def save_decision(self, decision: DecisionRecord) -> Path:
        path = self.decisions_dir / f"{decision.id}.yaml"
        path.write_text(
            yaml.safe_dump(decision.model_dump(mode="json"), sort_keys=False, allow_unicode=True),
            encoding="utf-8",
            newline="\n",
        )
        return path

    # ---- Snapshot ----------------------------------------------------

    def save_snapshot(self, snapshot: RepoSnapshot) -> Path:
        path = self.current_state_dir / "snapshot.json"
        path.write_text(
            snapshot.model_dump_json(indent=2, exclude_none=False),
            encoding="utf-8",
            newline="\n",
        )
        return path

    def load_snapshot(self) -> RepoSnapshot | None:
        path = self.current_state_dir / "snapshot.json"
        if not path.exists():
            return None
        try:
            return RepoSnapshot.model_validate_json(path.read_text(encoding="utf-8"))
        except Exception:
            return None
