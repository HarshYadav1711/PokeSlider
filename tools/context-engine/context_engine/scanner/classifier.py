"""File role classifier.

Deterministic, based on folder placement + filename conventions. Confidence
is reported as ``inferred`` here; AST evidence (e.g. ``create`` calls for
Zustand stores, ``defineConfig`` for vite, ``useQuery`` for query hooks)
can upgrade to ``partial`` at the snapshot-build layer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import PurePosixPath

from ..schemas.snapshot import FileRole


@dataclass(slots=True, frozen=True)
class ClassifiedFile:
    role: FileRole
    feature_id: str | None
    layer: str | None
    is_test: bool


_TEST_SUFFIXES = (".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".test.js", ".spec.js")


def _feature_id_from_parts(parts: tuple[str, ...]) -> str | None:
    try:
        idx = parts.index("features")
    except ValueError:
        return None
    if idx + 1 >= len(parts):
        return None
    name = parts[idx + 1]
    return name.replace("-", "_")


class FileClassifier:
    def classify(self, repo_path: str) -> ClassifiedFile:
        return classify_path(repo_path)


def classify_path(repo_path: str) -> ClassifiedFile:  # noqa: PLR0911, PLR0912
    p = PurePosixPath(repo_path)
    parts = p.parts
    name = p.name.lower()
    is_test = any(name.endswith(suf) for suf in _TEST_SUFFIXES)
    feature_id = _feature_id_from_parts(parts)
    suffix = p.suffix.lower()

    if "node_modules" in parts or "dist" in parts or "legacy" in parts:
        return ClassifiedFile(FileRole.unknown, None, None, is_test)

    if suffix in {".md", ".mdc"}:
        return ClassifiedFile(FileRole.docs, feature_id, "docs", False)
    if suffix in {".css", ".scss"}:
        return ClassifiedFile(FileRole.style, feature_id, "design", False)
    if name in {
        "vite.config.ts",
        "vitest.config.ts",
        "eslint.config.js",
        "tsconfig.json",
        "tsconfig.app.json",
        "tsconfig.node.json",
        "package.json",
        "pyproject.toml",
    } or suffix in {".toml", ".yml", ".yaml", ".ini", ".cfg"}:
        return ClassifiedFile(FileRole.config, None, "config", False)
    if is_test:
        return ClassifiedFile(FileRole.test, feature_id, "test", True)

    if suffix not in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
        return ClassifiedFile(FileRole.unknown, feature_id, None, False)

    if "providers" in parts:
        return ClassifiedFile(FileRole.provider, feature_id, "providers", is_test)
    if "store" in parts:
        return ClassifiedFile(FileRole.store, feature_id, "state", is_test)
    if "query" in parts:
        return ClassifiedFile(FileRole.query, feature_id, "query", is_test)
    if "services" in parts:
        return ClassifiedFile(FileRole.service, feature_id, "data", is_test)
    if "hooks" in parts or (suffix in {".ts", ".tsx"} and name.startswith("use") and name[3:4].isupper()):
        return ClassifiedFile(FileRole.hook, feature_id, "hooks", is_test)
    if "a11y" in parts:
        return ClassifiedFile(FileRole.a11y, feature_id, "a11y", is_test)
    if "motion" in parts:
        return ClassifiedFile(FileRole.motion, feature_id, "motion", is_test)
    if "types" in parts:
        return ClassifiedFile(FileRole.types, feature_id, "types", is_test)
    if "data" in parts and "features" not in parts:
        return ClassifiedFile(FileRole.data, None, "data", is_test)
    if "utils" in parts:
        return ClassifiedFile(FileRole.util, feature_id, "util", is_test)

    if "features" in parts:
        if name.lower().endswith("engine.ts"):
            return ClassifiedFile(FileRole.engine, feature_id, "engine", is_test)
        if name.endswith("store.ts") or "store" in name:
            return ClassifiedFile(FileRole.store, feature_id, "state", is_test)
        if suffix == ".ts" and (
            name.startswith("use") and len(name) > 3 and name[3:4].isupper()
        ):
            return ClassifiedFile(FileRole.hook, feature_id, "hooks", is_test)
        if suffix == ".tsx":
            if "overlay" in parts:
                return ClassifiedFile(FileRole.overlay, feature_id, "ui", is_test)
            return ClassifiedFile(FileRole.component, feature_id, "ui", is_test)
        if name.endswith("types.ts"):
            return ClassifiedFile(FileRole.types, feature_id, "types", is_test)
        return ClassifiedFile(FileRole.util, feature_id, "util", is_test)

    if suffix == ".tsx":
        return ClassifiedFile(FileRole.component, None, "ui", is_test)

    if "components" in parts:
        return ClassifiedFile(FileRole.component, None, "ui", is_test)

    return ClassifiedFile(FileRole.unknown, None, None, is_test)
