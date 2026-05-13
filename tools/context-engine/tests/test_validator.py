"""Anti-hallucination contract tests — the validator must catch fake claims."""

from __future__ import annotations

from context_engine.schemas import (
    Confidence,
    FeatureManifest,
    FeatureStatus,
    FileFact,
    FileRole,
    Snapshot,
)
from context_engine.validator import IssueLevel, validate


def _snapshot(paths: list[str]) -> Snapshot:
    return Snapshot(
        root=".",
        files=[FileFact(path=p, role=FileRole.component, sha256="0" * 64) for p in paths],
    )


def test_shipped_without_source_files_is_error() -> None:
    issues = validate(
        _snapshot([]),
        [
            FeatureManifest(
                id="x",
                name="X",
                status=FeatureStatus.shipped,
                confidence=Confidence.uncertain,
            )
        ],
    )
    assert any(i.code == "SHIPPED_NO_EVIDENCE" and i.level == IssueLevel.error for i in issues)


def test_missing_referenced_file_is_error() -> None:
    issues = validate(
        _snapshot([]),
        [
            FeatureManifest(
                id="x",
                name="X",
                status=FeatureStatus.shipped,
                source_files=["src/imaginary.tsx"],
                confidence=Confidence.verified,
            )
        ],
    )
    assert any(i.code == "MISSING_FILE" and i.level == IssueLevel.error for i in issues)


def test_unknown_dependency_is_warning() -> None:
    issues = validate(
        _snapshot(["src/real.tsx"]),
        [
            FeatureManifest(
                id="x",
                name="X",
                status=FeatureStatus.shipped,
                source_files=["src/real.tsx"],
                confidence=Confidence.partial,
                dependencies=["does_not_exist"],
            )
        ],
    )
    assert any(i.code == "UNKNOWN_DEPENDENCY" and i.level == IssueLevel.warning for i in issues)


def test_clean_feature_produces_no_issues() -> None:
    issues = validate(
        _snapshot(["src/real.tsx"]),
        [
            FeatureManifest(
                id="x",
                name="X",
                status=FeatureStatus.shipped,
                source_files=["src/real.tsx"],
                confidence=Confidence.partial,
            )
        ],
    )
    assert issues == []
