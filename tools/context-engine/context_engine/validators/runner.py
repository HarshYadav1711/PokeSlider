"""Run all validators against the current snapshot + registries."""

from __future__ import annotations

from collections.abc import Iterable

from ..schemas.feature import FeatureManifest, FeatureStatus
from ..schemas.registry import FeatureRegistry, RouteRegistry, SystemRegistry
from ..schemas.snapshot import FileRole, RepoSnapshot
from .results import IssueLevel, ValidationReport


class ValidationRunner:
    def __init__(
        self,
        snapshot: RepoSnapshot,
        features: FeatureRegistry,
        systems: SystemRegistry,
        routes: RouteRegistry,
    ) -> None:
        self.snapshot = snapshot
        self.features = features
        self.systems = systems
        self.routes = routes
        self._by_path = snapshot.by_path()

    def run(self) -> ValidationReport:
        report = ValidationReport()
        self._check_feature_evidence(report)
        self._check_feature_references(report)
        self._check_system_references(report)
        self._check_route_files(report)
        self._check_dead_routes(report)
        self._check_unused_stores(report)
        self._check_orphan_components(report)
        self._check_fake_claims(report)
        return report

    # --- per-check methods --------------------------------------------------

    def _check_feature_evidence(self, report: ValidationReport) -> None:
        for f in self.features.features:
            if f.status == FeatureStatus.shipped and not f.evidence.source_files:
                report.add(
                    IssueLevel.error,
                    "FEATURE_NO_EVIDENCE",
                    f"Feature '{f.id}' is marked 'shipped' but has no source_files evidence.",
                    target=f.id,
                    suggestion="Run `context-engine scan` then `context-engine generate` to auto-attach evidence.",
                )
                continue
            for ref in f.evidence.source_files:
                if ref.path not in self._by_path:
                    report.add(
                        IssueLevel.error,
                        "FEATURE_EVIDENCE_MISSING_FILE",
                        f"Feature '{f.id}' references missing file '{ref.path}'.",
                        target=f.id,
                    )

    def _check_feature_references(self, report: ValidationReport) -> None:
        feature_ids = {f.id for f in self.features.features}
        for f in self.features.features:
            for dep in f.dependencies:
                if dep not in feature_ids:
                    report.add(
                        IssueLevel.warning,
                        "FEATURE_DEPENDENCY_UNKNOWN",
                        f"Feature '{f.id}' depends on unknown feature '{dep}'.",
                        target=f.id,
                    )
            for sys_id in f.shared_systems:
                if sys_id not in {s.id for s in self.systems.systems}:
                    report.add(
                        IssueLevel.warning,
                        "FEATURE_SYSTEM_UNKNOWN",
                        f"Feature '{f.id}' references unknown system '{sys_id}'.",
                        target=f.id,
                    )

    def _check_system_references(self, report: ValidationReport) -> None:
        for s in self.systems.systems:
            for ref in s.evidence.source_files:
                if ref.path not in self._by_path:
                    report.add(
                        IssueLevel.error,
                        "SYSTEM_EVIDENCE_MISSING_FILE",
                        f"System '{s.id}' references missing file '{ref.path}'.",
                        target=s.id,
                    )

    def _check_route_files(self, report: ValidationReport) -> None:
        feature_ids = {f.id for f in self.features.features}
        for r in self.routes.routes:
            if r.source_file not in self._by_path:
                report.add(
                    IssueLevel.error,
                    "ROUTE_MISSING_SOURCE",
                    f"Route '{r.id}' source_file '{r.source_file}' does not exist.",
                    target=r.id,
                )
            if r.owning_feature and r.owning_feature not in feature_ids:
                report.add(
                    IssueLevel.warning,
                    "ROUTE_UNKNOWN_FEATURE",
                    f"Route '{r.id}' belongs to unknown feature '{r.owning_feature}'.",
                    target=r.id,
                )

    def _check_dead_routes(self, report: ValidationReport) -> None:
        """A route is 'dead' when nothing in src/ references its source file via JSX or import."""
        triggers_set = {trig for r in self.routes.routes for trig in r.triggered_by}
        for r in self.routes.routes:
            f = self._by_path.get(r.source_file)
            if not f:
                continue
            if any(
                r.source_file == edge.target
                for edge in self.snapshot.edges
            ):
                continue
            if r.source_file in triggers_set:
                continue
            jsx_name = _filename_to_component(r.source_file)
            if jsx_name and any(
                jsx_name in (ff.jsx_children_used or []) for ff in self.snapshot.files
            ):
                continue
            report.add(
                IssueLevel.warning,
                "ROUTE_POSSIBLY_DEAD",
                f"Route '{r.id}' source '{r.source_file}' has no inbound references in scanned sources.",
                target=r.id,
            )

    def _check_unused_stores(self, report: ValidationReport) -> None:
        store_files = [f for f in self.snapshot.files if f.role == FileRole.store]
        referenced = set()
        for f in self.snapshot.files:
            for sname in f.referenced_stores or []:
                referenced.add(sname)
        for s in store_files:
            for sym in s.exported_symbols:
                if sym.name.startswith("use") and sym.name.endswith("Store"):
                    if sym.name not in referenced:
                        report.add(
                            IssueLevel.warning,
                            "STORE_UNUSED",
                            f"Store '{sym.name}' (in '{s.path}') has no detected consumers.",
                            target=s.path,
                        )

    def _check_orphan_components(self, report: ValidationReport) -> None:
        for f in self.snapshot.files:
            if f.role not in {FileRole.component, FileRole.overlay}:
                continue
            if f.is_test:
                continue
            comp_names = {sym.name for sym in f.exported_symbols if sym.kind.value in {"component", "function"}}
            if not comp_names:
                continue
            used_anywhere = False
            for other in self.snapshot.files:
                if other.path == f.path:
                    continue
                if any(name in other.jsx_children_used for name in comp_names):
                    used_anywhere = True
                    break
                if f.path in [_strip_ext(edge.target) for edge in self.snapshot.edges if edge.source == other.path]:
                    used_anywhere = True
                    break
            if not used_anywhere:
                report.add(
                    IssueLevel.info,
                    "COMPONENT_NO_DETECTED_CONSUMERS",
                    f"Component file '{f.path}' has no detected consumers via JSX or imports.",
                    target=f.path,
                )

    def _check_fake_claims(self, report: ValidationReport) -> None:
        for f in self.features.features:
            for path_str in _iter_referenced_paths(f):
                if path_str and path_str not in self._by_path:
                    report.add(
                        IssueLevel.error,
                        "FAKE_REFERENCE",
                        f"Feature '{f.id}' mentions file '{path_str}' which does not exist.",
                        target=f.id,
                    )


def _iter_referenced_paths(f: FeatureManifest) -> Iterable[str]:
    for ref in f.evidence.source_files:
        yield ref.path
    for ref in f.evidence.referenced_by:
        yield ref.path
    for ref in f.evidence.tests:
        yield ref.path


def _filename_to_component(path: str) -> str | None:
    from pathlib import PurePosixPath

    stem = PurePosixPath(path).stem
    if not stem:
        return None
    if not stem[0].isalpha():
        return None
    return stem[0].upper() + stem[1:]


def _strip_ext(p: str) -> str:
    for ext in (".ts", ".tsx", ".js", ".jsx"):
        if p.endswith(ext):
            return p[: -len(ext)]
    return p
