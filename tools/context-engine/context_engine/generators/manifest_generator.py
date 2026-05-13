"""Generate / update feature & system YAML manifests from the live snapshot.

The generator is conservative:
    * **Never** marks a feature as ``shipped`` automatically.
    * Only *upgrades* evidence (adds files / references / confidence boost
      when supported) and *never* removes human-authored fields like
      ``manual_notes`` or ``description``.
    * Manifests that already exist are merged, not overwritten.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from ..registry import RegistryStore
from ..schemas.common import Confidence, FileRef, ImplementationEvidence
from ..schemas.feature import FeatureManifest, FeatureStatus
from ..schemas.snapshot import FileFact, FileRole, RepoSnapshot
from ..schemas.system import SystemManifest


@dataclass(slots=True)
class ManifestUpdate:
    feature_writes: list[Path]
    system_writes: list[Path]
    notes: list[str]


class ManifestGenerator:
    def __init__(self, store: RegistryStore, snapshot: RepoSnapshot) -> None:
        self.store = store
        self.snapshot = snapshot

    def refresh(self) -> ManifestUpdate:
        feature_writes: list[Path] = []
        system_writes: list[Path] = []
        notes: list[str] = []

        # 1) Refresh feature evidence by feature_id grouping.
        registry = self.store.load_features()
        feature_index = registry.by_id()

        feature_files = _group_by_feature(self.snapshot.files)

        for fid, files in feature_files.items():
            manifest = feature_index.get(fid)
            if manifest is None:
                notes.append(
                    f"No manifest for feature '{fid}'; create project-metadata/features/{fid}.yaml or run `context-engine generate --features-from-folders`."
                )
                continue
            new_manifest = _update_feature_evidence(manifest, files, self.snapshot)
            if new_manifest != manifest:
                feature_writes.append(self.store.save_feature(new_manifest))

        # 2) Auto-discover system manifests for known horizontal layers.
        existing_systems = {s.id for s in self.store.load_systems().systems}
        for system in _auto_discover_systems(self.snapshot):
            if system.id in existing_systems:
                continue
            system_writes.append(self.store.save_system(system))

        return ManifestUpdate(feature_writes, system_writes, notes)


def _group_by_feature(files: Iterable[FileFact]) -> dict[str, list[FileFact]]:
    out: dict[str, list[FileFact]] = {}
    for f in files:
        if not f.feature_id:
            continue
        out.setdefault(f.feature_id, []).append(f)
    return out


def _update_feature_evidence(
    manifest: FeatureManifest,
    files: list[FileFact],
    snapshot: RepoSnapshot,
) -> FeatureManifest:
    existing_paths = {ref.path for ref in manifest.evidence.source_files}
    new_source_files = list(manifest.evidence.source_files)
    new_tests = list(manifest.evidence.tests)
    detected_stores: set[str] = set(manifest.stores)
    detected_query_keys: set[str] = set(manifest.query_keys)
    referenced_by_set: set[str] = {ref.path for ref in manifest.evidence.referenced_by}

    for f in files:
        if f.is_test:
            if not any(t.path == f.path for t in new_tests):
                new_tests.append(FileRef(path=f.path))
            continue
        if f.path not in existing_paths:
            new_source_files.append(FileRef(path=f.path))
            existing_paths.add(f.path)
        detected_stores.update(f.referenced_stores)
        detected_query_keys.update(f.referenced_query_keys)

    feature_paths = {f.path for f in files}
    for other in snapshot.files:
        if other.feature_id == manifest.id:
            continue
        if any(t.endswith(p) for t in other.imports for p in feature_paths):
            referenced_by_set.add(other.path)
        if other.feature_id and any(
            (other.feature_id == manifest.id) for _ in [0]
        ):
            pass

    has_source = bool(new_source_files)
    has_tests = bool(new_tests)
    confidence = Confidence.uncertain
    if has_source and has_tests:
        confidence = Confidence.verified
    elif has_source and referenced_by_set:
        confidence = Confidence.verified
    elif has_source:
        confidence = Confidence.partial
    else:
        confidence = Confidence.inferred

    new_evidence = ImplementationEvidence(
        source_files=sorted(new_source_files, key=lambda r: r.path),
        referenced_by=[FileRef(path=p) for p in sorted(referenced_by_set)],
        routes=list(manifest.evidence.routes),
        tests=sorted(new_tests, key=lambda r: r.path),
        confidence=confidence,
        notes=manifest.evidence.notes,
    )

    return manifest.model_copy(
        update={
            "evidence": new_evidence,
            "stores": sorted(detected_stores) or manifest.stores,
            "query_keys": sorted(detected_query_keys) or manifest.query_keys,
        }
    )


def _auto_discover_systems(snapshot: RepoSnapshot) -> list[SystemManifest]:
    candidates: dict[str, SystemManifest] = {}

    role_to_system = {
        FileRole.a11y: ("a11y", "Accessibility primitives", "a11y"),
        FileRole.motion: ("motion", "Motion preferences and transitions", "motion"),
        FileRole.query: ("query-layer", "TanStack Query keys, client, prefetch", "query"),
        FileRole.store: ("zustand-stores", "Client UI state stores", "state"),
        FileRole.service: ("pokeapi-services", "PokéAPI service layer", "data"),
        FileRole.engine: ("rules-engines", "Deterministic local rule engines", "engine"),
        FileRole.provider: ("app-providers", "App-level providers (QueryClient, Atmosphere)", "providers"),
    }

    grouped: dict[str, list[FileFact]] = {}
    for f in snapshot.files:
        if f.role in role_to_system:
            grouped.setdefault(role_to_system[f.role][0], []).append(f)

    for role, (sid, purpose, layer) in role_to_system.items():
        files = grouped.get(sid, [])
        if not files:
            continue
        evidence = ImplementationEvidence(
            source_files=sorted([FileRef(path=f.path) for f in files], key=lambda r: r.path),
            confidence=Confidence.partial,
        )
        candidates[sid] = SystemManifest(
            id=sid,
            name=_humanize(sid),
            purpose=purpose,
            layer=layer,
            evidence=evidence,
        )
    return list(candidates.values())


def _humanize(sid: str) -> str:
    return " ".join(p.capitalize() for p in sid.replace("_", "-").split("-"))
