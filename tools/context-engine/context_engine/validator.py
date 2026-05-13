"""Validation — the three checks that actually matter.

1. ``MISSING_FILE``        — a manifest references a file that does not exist.
2. ``SHIPPED_NO_EVIDENCE`` — a feature is marked ``shipped`` but has no
                              ``source_files`` (anti-hallucination guard).
3. ``UNKNOWN_DEPENDENCY``  — a feature depends on another feature id that
                              does not exist in the registry.

Anything else (orphan components, dead routes, unused stores) was either
noisy or ambiguous, so it's gone. Adding more checks later is fine — keep
them in this module so the contract stays visible.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .schemas import FeatureManifest, FeatureStatus, Snapshot


class IssueLevel(str, Enum):
    error = "error"
    warning = "warning"


@dataclass(slots=True, frozen=True)
class Issue:
    level: IssueLevel
    code: str
    message: str
    target: str | None = None
    suggestion: str | None = None


def validate(snapshot: Snapshot, features: list[FeatureManifest]) -> list[Issue]:
    issues: list[Issue] = []
    present = {f.path for f in snapshot.files}
    known_ids = {f.id for f in features}

    for f in features:
        for path in (*f.source_files, *f.tests):
            if path not in present:
                issues.append(
                    Issue(
                        IssueLevel.error,
                        "MISSING_FILE",
                        f"Feature '{f.id}' references missing file '{path}'.",
                        target=f.id,
                    )
                )

        if f.status == FeatureStatus.shipped and not f.source_files:
            issues.append(
                Issue(
                    IssueLevel.error,
                    "SHIPPED_NO_EVIDENCE",
                    f"Feature '{f.id}' is marked 'shipped' but has no source_files.",
                    target=f.id,
                    suggestion="Add real source paths or move status to 'in_progress'.",
                )
            )

        for dep in f.dependencies:
            if dep not in known_ids:
                issues.append(
                    Issue(
                        IssueLevel.warning,
                        "UNKNOWN_DEPENDENCY",
                        f"Feature '{f.id}' depends on unknown feature '{dep}'.",
                        target=f.id,
                    )
                )

    return issues


def error_count(issues: list[Issue]) -> int:
    return sum(1 for i in issues if i.level == IssueLevel.error)


def warning_count(issues: list[Issue]) -> int:
    return sum(1 for i in issues if i.level == IssueLevel.warning)
