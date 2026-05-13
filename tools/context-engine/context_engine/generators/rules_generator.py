"""Generate / update `.cursor/rules/*.mdc` files (only the auto-generated mirror)."""

from __future__ import annotations

from pathlib import Path

from ..graph import build_dependency_graph
from ..schemas.registry import FeatureRegistry, RouteRegistry, SystemRegistry
from ..schemas.snapshot import RepoSnapshot
from ..utils.markers import RenderResult, safe_render
from ._environment import get_env


class CursorRulesGenerator:
    def __init__(
        self,
        repo_root: Path,
        snapshot: RepoSnapshot,
        features: FeatureRegistry,
        systems: SystemRegistry,
        routes: RouteRegistry,
    ) -> None:
        self.repo_root = repo_root
        self.snapshot = snapshot
        self.features = features
        self.systems = systems
        self.routes = routes
        self.env = get_env()

    def generate(self) -> RenderResult:
        from .docs_generator import _stamp as _doc_stamp

        rules_dir = self.repo_root / ".cursor" / "rules"
        rules_dir.mkdir(parents=True, exist_ok=True)
        target = rules_dir / "context-engine.mdc"

        layers = self._layers()
        hotspots = self._hotspots()
        stats = {
            "file_count": len(self.snapshot.files),
            "shipped_feature_count": sum(1 for f in self.features.features if f.status.value == "shipped"),
            "feature_count": len(self.features.features),
            "system_count": len(self.systems.systems),
            "route_count": len(self.routes.routes),
            "test_count": sum(1 for f in self.snapshot.files if f.is_test),
        }
        body = self.env.get_template("project-context.mdc.j2").render(
            generated_at=_doc_stamp(self.snapshot),
            stats=stats,
            layers=layers,
            hotspots=hotspots,
        )
        return safe_render(target, body)

    def _layers(self) -> dict[str, list]:
        from collections import defaultdict

        d: dict[str, list] = defaultdict(list)
        for f in self.snapshot.files:
            key = f.layer or f.role.value
            if key in {"docs", "config"}:
                continue
            d[key].append(f)
        return {k: d[k] for k in sorted(d)}

    def _hotspots(self) -> list[tuple[str, int]]:
        _, report = build_dependency_graph(self.snapshot)
        return report.hotspots
