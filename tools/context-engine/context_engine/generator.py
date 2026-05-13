"""Generate the four context artifacts.

Outputs (all use AUTO-GENERATED markers and preserve MANUAL-NOTES blocks):

* ``PROJECT_CONTEXT.md``       — onboarding capsule for the repo
* ``FEATURE_TRACKER.md``       — shipped / in-progress / planned tables
* ``CURRENT_AI_CONTEXT.md``    — short AI handoff snapshot
* ``.cursor/rules/context-engine.mdc`` — onboarding mirror for Cursor

The generator also refreshes evidence on feature manifests in-place (additive
only — never deletes human-authored fields).
"""

from __future__ import annotations

from collections import defaultdict
from functools import lru_cache
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from .markers import RenderResult, safe_render
from .registry import save_feature
from .schemas import (
    Confidence,
    FeatureManifest,
    FeatureStatus,
    Snapshot,
    derive_confidence,
)


# ---------------------------------------------------------------------------
# Jinja environment
# ---------------------------------------------------------------------------


@lru_cache(maxsize=1)
def _env() -> Environment:
    template_root = Path(__file__).resolve().parent / "templates"
    return Environment(
        loader=FileSystemLoader(str(template_root)),
        autoescape=False,
        undefined=StrictUndefined,
        keep_trailing_newline=True,
    )


# ---------------------------------------------------------------------------
# Manifest evidence refresh (additive only)
# ---------------------------------------------------------------------------


def refresh_evidence(
    metadata_root: Path, snapshot: Snapshot, features: list[FeatureManifest]
) -> list[Path]:
    """Augment manifests with evidence discovered in the snapshot.

    Never removes existing manifest data. Updates ``source_files`` / ``tests``
    / ``stores`` as the union of the manifest values and what was found on
    disk under the feature's folder, then recomputes ``confidence``.
    """
    by_feature: dict[str, list] = defaultdict(list)
    for fact in snapshot.files:
        if fact.feature_id:
            by_feature[fact.feature_id].append(fact)

    written: list[Path] = []
    for f in features:
        observed = by_feature.get(f.id, [])
        if not observed and not f.source_files and not f.tests:
            continue

        sources = set(f.source_files)
        tests = set(f.tests)
        stores = set(f.stores)
        for fact in observed:
            (tests if fact.is_test else sources).add(fact.path)
            stores.update(fact.referenced_stores)

        new_confidence = derive_confidence(sorted(sources), sorted(tests))
        updated = f.model_copy(
            update={
                "source_files": sorted(sources),
                "tests": sorted(tests),
                "stores": sorted(stores) or list(f.stores),
                "confidence": new_confidence,
            }
        )
        if updated != f:
            written.append(save_feature(metadata_root, updated))
            # mutate the in-memory list so downstream rendering sees the update
            f.source_files[:] = updated.source_files
            f.tests[:] = updated.tests
            f.stores[:] = updated.stores
            f.confidence = updated.confidence
    return written


# ---------------------------------------------------------------------------
# Render
# ---------------------------------------------------------------------------


def _partition(features: list[FeatureManifest]):
    by_status: dict[FeatureStatus, list[FeatureManifest]] = defaultdict(list)
    for f in features:
        by_status[f.status].append(f)
    for lst in by_status.values():
        lst.sort(key=lambda x: x.name.lower())
    return (
        by_status[FeatureStatus.shipped],
        by_status[FeatureStatus.in_progress],
        by_status[FeatureStatus.planned],
        by_status[FeatureStatus.deprecated],
    )


def _shared_systems(features: list[FeatureManifest]) -> list[str]:
    s: set[str] = set()
    for f in features:
        s.update(f.shared_systems)
    return sorted(s)


def _stats(snapshot: Snapshot, features: list[FeatureManifest]) -> dict:
    shipped = sum(1 for f in features if f.status == FeatureStatus.shipped)
    return {
        "file_count": len(snapshot.files),
        "ts_count": sum(1 for f in snapshot.files if f.path.endswith((".ts", ".tsx"))),
        "test_count": sum(1 for f in snapshot.files if f.is_test),
        "feature_count": len(features),
        "shipped_count": shipped,
    }


def _stamp(snapshot: Snapshot) -> str:
    return snapshot.generated_at.isoformat(timespec="seconds")


def _ctx_common(snapshot: Snapshot, features: list[FeatureManifest]) -> dict:
    shipped, in_progress, planned, deprecated = _partition(features)
    return {
        "generated_at": _stamp(snapshot),
        "git_commit": snapshot.git_commit,
        "git_branch": snapshot.git_branch,
        "git_dirty": snapshot.git_dirty,
        "stats": _stats(snapshot, features),
        "shipped_features": shipped,
        "in_progress_features": in_progress,
        "planned_features": planned,
        "deprecated_features": deprecated,
        "shared_systems": _shared_systems(features),
    }


def generate_all(
    repo_root: Path,
    snapshot: Snapshot,
    features: list[FeatureManifest],
    issues: list | None = None,
) -> list[RenderResult]:
    ctx = _ctx_common(snapshot, features)
    ctx["issues"] = issues or []
    env = _env()

    results: list[RenderResult] = []
    results.append(safe_render(repo_root / "PROJECT_CONTEXT.md", env.get_template("PROJECT_CONTEXT.md.j2").render(**ctx)))
    results.append(safe_render(repo_root / "FEATURE_TRACKER.md", env.get_template("FEATURE_TRACKER.md.j2").render(**ctx)))
    results.append(safe_render(repo_root / "CURRENT_AI_CONTEXT.md", env.get_template("CURRENT_AI_CONTEXT.md.j2").render(**ctx)))

    mdc_target = repo_root / ".cursor" / "rules" / "context-engine.mdc"
    results.append(safe_render(mdc_target, env.get_template("context-engine.mdc.j2").render(**ctx)))
    return results
