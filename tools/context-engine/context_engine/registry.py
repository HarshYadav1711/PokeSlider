"""Load and persist feature manifests as YAML files under ``project-metadata/features/``.

No registry class. No abstractions for systems/routes/decisions — those used
to have their own folders and types; they were over-modeled for the current
scale of this repo. ``shared_systems`` and ``dependencies`` are now just
strings on a feature manifest.
"""

from __future__ import annotations

from pathlib import Path

import yaml

from .schemas import FeatureManifest, Snapshot

FEATURES_DIRNAME = "features"
SNAPSHOT_RELPATH = ("current-state", "snapshot.json")


def features_dir(metadata_root: Path) -> Path:
    return metadata_root / FEATURES_DIRNAME


def load_features(metadata_root: Path) -> list[FeatureManifest]:
    fdir = features_dir(metadata_root)
    if not fdir.exists():
        return []
    out: list[FeatureManifest] = []
    for f in sorted(fdir.glob("*.yaml")):
        data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
        out.append(FeatureManifest.model_validate(data))
    return out


def save_feature(metadata_root: Path, manifest: FeatureManifest) -> Path:
    fdir = features_dir(metadata_root)
    fdir.mkdir(parents=True, exist_ok=True)
    path = fdir / f"{manifest.id}.yaml"
    payload = manifest.model_dump(mode="json", exclude_none=True)
    text = yaml.safe_dump(payload, sort_keys=False, allow_unicode=True)
    path.write_text(text, encoding="utf-8", newline="\n")
    return path


def save_snapshot(metadata_root: Path, snapshot: Snapshot) -> Path:
    path = metadata_root.joinpath(*SNAPSHOT_RELPATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(snapshot.model_dump_json(indent=2), encoding="utf-8", newline="\n")
    return path


def load_snapshot(metadata_root: Path) -> Snapshot | None:
    path = metadata_root.joinpath(*SNAPSHOT_RELPATH)
    if not path.exists():
        return None
    try:
        return Snapshot.model_validate_json(path.read_text(encoding="utf-8"))
    except Exception:
        return None
