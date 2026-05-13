"""Generate the public-facing markdown docs."""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path

import networkx as nx

from ..graph import build_dependency_graph, build_feature_graph, export_graph_mermaid, export_feature_graph_mermaid
from ..schemas.feature import FeatureManifest, FeatureStatus
from ..schemas.registry import FeatureRegistry, RouteRegistry, SystemRegistry
from ..schemas.snapshot import FileRole, RepoSnapshot
from ..utils.markers import RenderResult, safe_render
from ..validators.results import IssueLevel, ValidationReport
from ._environment import get_env


@dataclass(slots=True)
class GenerationOutcome:
    written: list[RenderResult]

    def changed(self) -> int:
        return sum(1 for r in self.written if r.wrote)


class DocsGenerator:
    def __init__(
        self,
        repo_root: Path,
        snapshot: RepoSnapshot,
        features: FeatureRegistry,
        systems: SystemRegistry,
        routes: RouteRegistry,
        validation: ValidationReport | None = None,
    ) -> None:
        self.repo_root = repo_root
        self.snapshot = snapshot
        self.features = features
        self.systems = systems
        self.routes = routes
        self.validation = validation or ValidationReport()
        self.env = get_env()

    def generate_all(self) -> GenerationOutcome:
        written: list[RenderResult] = []
        written.append(self.generate_project_context())
        written.append(self.generate_feature_tracker())
        written.append(self.generate_current_ai_context())
        written.append(self.generate_drift_report())
        written.append(self.generate_feature_map())
        written.append(self.generate_route_map())
        written.append(self.generate_system_map())
        written.append(self.generate_component_map())
        written.append(self.generate_dependency_map())
        written.extend(self.generate_graphs())
        return GenerationOutcome(written)

    # ----- shared context builders --------------------------------------

    def _stats(self) -> dict:
        shipped = [f for f in self.features.features if f.status == FeatureStatus.shipped]
        return {
            "file_count": len(self.snapshot.files),
            "ts_count": sum(1 for f in self.snapshot.files if f.path.endswith((".ts", ".tsx"))),
            "test_count": sum(1 for f in self.snapshot.files if f.is_test),
            "feature_count": len(self.features.features),
            "shipped_feature_count": len(shipped),
            "system_count": len(self.systems.systems),
            "route_count": len(self.routes.routes),
        }

    def _layers(self) -> dict[str, list]:
        layers: dict[str, list] = defaultdict(list)
        for f in self.snapshot.files:
            key = f.layer or f.role.value
            if key in {"docs", "config"}:
                continue
            layers[key].append(f)
        return {k: layers[k] for k in sorted(layers)}

    def _hotspots(self) -> list[tuple[str, int]]:
        _, report = build_dependency_graph(self.snapshot)
        return report.hotspots

    def _split_features(self) -> tuple[list[FeatureManifest], list[FeatureManifest], list[FeatureManifest], list[FeatureManifest]]:
        shipped, in_progress, planned, deprecated = [], [], [], []
        for f in self.features.features:
            target = {
                FeatureStatus.shipped: shipped,
                FeatureStatus.in_progress: in_progress,
                FeatureStatus.planned: planned,
                FeatureStatus.deprecated: deprecated,
            }[f.status]
            target.append(f)
        for lst in (shipped, in_progress, planned, deprecated):
            lst.sort(key=lambda f: f.name.lower())
        return shipped, in_progress, planned, deprecated

    def _drift_summary(self) -> list[str]:
        lines: list[str] = []
        for issue in self.validation.issues:
            if issue.level == IssueLevel.error:
                lines.append(f"ERROR · {issue.code} · {issue.message}")
        return lines[:10]

    # ----- individual generators ----------------------------------------

    def generate_project_context(self) -> RenderResult:
        shipped, in_progress, planned, _ = self._split_features()
        body = self.env.get_template("PROJECT_CONTEXT.md.j2").render(
            generated_at=_stamp(self.snapshot),
            git_commit=self.snapshot.git_commit,
            git_branch=self.snapshot.git_branch,
            git_dirty=self.snapshot.git_dirty,
            stats=self._stats(),
            layers=self._layers(),
            shipped_features=shipped,
            in_progress_features=in_progress,
            planned_features=planned,
            systems=self.systems.systems,
            drift_summary=self._drift_summary(),
        )
        target = self.repo_root / "PROJECT_CONTEXT.md"
        return safe_render(target, body)

    def generate_feature_tracker(self) -> RenderResult:
        shipped, in_progress, planned, deprecated = self._split_features()
        body = self.env.get_template("FEATURE_TRACKER.md.j2").render(
            generated_at=_stamp(self.snapshot),
            shipped_features=shipped,
            in_progress_features=in_progress,
            planned_features=planned,
            deprecated_features=deprecated,
        )
        target = self.repo_root / "FEATURE_TRACKER.md"
        return safe_render(target, body)

    def generate_current_ai_context(self) -> RenderResult:
        shipped, in_progress, planned, _ = self._split_features()
        body = self.env.get_template("CURRENT_AI_CONTEXT.md.j2").render(
            generated_at=_stamp(self.snapshot),
            git_commit=self.snapshot.git_commit,
            layers=self._layers(),
            shipped_features=shipped,
            in_progress_features=in_progress,
            planned_features=planned,
            systems=self.systems.systems,
            hotspots=self._hotspots(),
            priorities=[],
        )
        target = self.repo_root / "CURRENT_AI_CONTEXT.md"
        return safe_render(target, body)

    def generate_drift_report(self) -> RenderResult:
        body = self.env.get_template("DRIFT_REPORT.md.j2").render(
            generated_at=_stamp(self.snapshot),
            issues=self.validation.issues,
            error_count=self.validation.error_count,
            warning_count=self.validation.warning_count,
            info_count=sum(1 for i in self.validation.issues if i.level == IssueLevel.info),
        )
        target = self.repo_root / "DRIFT_REPORT.md"
        return safe_render(target, body)

    def generate_feature_map(self) -> RenderResult:
        body = self.env.get_template("feature-map.md.j2").render(
            generated_at=_stamp(self.snapshot),
            features=sorted(self.features.features, key=lambda f: (f.status.value, f.name.lower())),
        )
        target = self.repo_root / "docs" / "generated" / "feature-map.md"
        return safe_render(target, body)

    def generate_route_map(self) -> RenderResult:
        body = self.env.get_template("route-map.md.j2").render(
            generated_at=_stamp(self.snapshot),
            routes=sorted(self.routes.routes, key=lambda r: r.name.lower()),
        )
        target = self.repo_root / "docs" / "generated" / "route-map.md"
        return safe_render(target, body)

    def generate_system_map(self) -> RenderResult:
        body = self.env.get_template("system-map.md.j2").render(
            generated_at=_stamp(self.snapshot),
            systems=sorted(self.systems.systems, key=lambda s: s.name.lower()),
        )
        target = self.repo_root / "docs" / "generated" / "system-map.md"
        return safe_render(target, body)

    def generate_component_map(self) -> RenderResult:
        rows = []
        for f in self.snapshot.files:
            if f.role not in {FileRole.component, FileRole.overlay}:
                continue
            comps = sorted({s.name for s in f.exported_symbols if s.kind.value in {"component", "function"}})
            if not comps:
                continue
            consumer_count = sum(
                1
                for other in self.snapshot.files
                if other.path != f.path
                and any(name in (other.jsx_children_used or []) for name in comps)
            )
            rows.append(
                dict(
                    path=f.path,
                    components=comps,
                    feature_id=f.feature_id,
                    consumer_count=consumer_count,
                )
            )
        rows.sort(key=lambda r: (-r["consumer_count"], r["path"]))
        body = self.env.get_template("component-map.md.j2").render(
            generated_at=_stamp(self.snapshot),
            rows=rows,
        )
        target = self.repo_root / "docs" / "generated" / "component-map.md"
        return safe_render(target, body)

    def generate_dependency_map(self) -> RenderResult:
        _, report = build_dependency_graph(self.snapshot)
        body = self.env.get_template("dependency-map.md.j2").render(
            generated_at=_stamp(self.snapshot),
            report=report,
        )
        target = self.repo_root / "docs" / "generated" / "dependency-map.md"
        return safe_render(target, body)

    def generate_graphs(self) -> list[RenderResult]:
        out: list[RenderResult] = []
        graph, _ = build_dependency_graph(self.snapshot)
        mermaid = export_graph_mermaid(graph)
        dep_md = self.repo_root / "docs" / "graphs" / "dependency-graph.md"
        out.append(_write_mermaid(dep_md, "Dependency graph", mermaid))

        fgraph = build_feature_graph(self.snapshot, self.features.features)
        fg = export_feature_graph_mermaid(fgraph)
        feat_md = self.repo_root / "docs" / "graphs" / "feature-graph.md"
        out.append(_write_mermaid(feat_md, "Feature graph", fg))
        return out


def _stamp(snap: RepoSnapshot) -> str:
    return snap.generated_at.isoformat(timespec="seconds")


def _write_mermaid(target: Path, title: str, mermaid: str) -> RenderResult:
    body = f"# {title}\n\n```mermaid\n{mermaid}```\n"
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.read_text(encoding="utf-8") == body:
        return RenderResult(target, False, "unchanged")
    target.write_text(body, encoding="utf-8", newline="\n")
    return RenderResult(target, True, "written")
