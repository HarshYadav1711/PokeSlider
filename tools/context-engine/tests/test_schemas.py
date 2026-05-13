"""Schema truth-contract tests."""

from __future__ import annotations

from context_engine.schemas.common import Confidence, FileRef, ImplementationEvidence
from context_engine.schemas.feature import FeatureManifest, FeatureStatus


def test_empty_evidence_downgrades_to_uncertain() -> None:
    ev = ImplementationEvidence(confidence=Confidence.verified)
    fixed = ev.downgrade_if_unsupported()
    assert fixed.confidence == Confidence.uncertain


def test_evidence_with_only_referenced_by_caps_at_inferred() -> None:
    ev = ImplementationEvidence(
        referenced_by=[FileRef(path="src/foo.ts")],
        confidence=Confidence.verified,
    )
    fixed = ev.downgrade_if_unsupported()
    assert fixed.confidence == Confidence.inferred


def test_shipped_requires_evidence() -> None:
    f = FeatureManifest(
        id="x",
        name="X",
        status=FeatureStatus.shipped,
        evidence=ImplementationEvidence(),
    )
    assert f.is_evidence_sufficient_for_shipped() is False


def test_shipped_with_evidence_is_ok() -> None:
    f = FeatureManifest(
        id="x",
        name="X",
        status=FeatureStatus.shipped,
        evidence=ImplementationEvidence(
            source_files=[FileRef(path="src/foo.ts")],
            confidence=Confidence.partial,
        ),
    )
    assert f.is_evidence_sufficient_for_shipped() is True
