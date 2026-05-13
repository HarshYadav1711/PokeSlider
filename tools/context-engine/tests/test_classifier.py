"""Sanity checks for the file classifier — these are the truth tier for
folder-based assumptions."""

from __future__ import annotations

from context_engine.scanner.classifier import classify_path
from context_engine.schemas.snapshot import FileRole


def test_feature_engine_is_engine() -> None:
    c = classify_path("src/features/team-builder/teamBuilderEngine.ts")
    assert c.role == FileRole.engine
    assert c.feature_id == "team_builder"
    assert c.is_test is False


def test_feature_engine_test_is_test() -> None:
    c = classify_path("src/features/team-builder/teamBuilderEngine.test.ts")
    assert c.is_test is True
    assert c.role == FileRole.test


def test_overlay_tsx_is_overlay() -> None:
    c = classify_path("src/features/overlay/PokemonDetailPanel.tsx")
    assert c.role == FileRole.overlay


def test_feature_modal_tsx_is_component() -> None:
    c = classify_path("src/features/compare/ComparisonModal.tsx")
    assert c.role == FileRole.component


def test_zustand_store_is_store() -> None:
    c = classify_path("src/store/teamBuilderStore.ts")
    assert c.role == FileRole.store


def test_query_layer_is_query() -> None:
    c = classify_path("src/query/keys.ts")
    assert c.role == FileRole.query


def test_a11y_helpers_are_a11y() -> None:
    c = classify_path("src/a11y/useFocusTrap.ts")
    assert c.role == FileRole.a11y


def test_types_file_is_types() -> None:
    c = classify_path("src/types/pokemon.ts")
    assert c.role == FileRole.types


def test_feature_types_is_types() -> None:
    c = classify_path("src/features/team-builder/teamBuilderTypes.ts")
    assert c.role == FileRole.types
    assert c.feature_id == "team_builder"


def test_feature_util_falls_back_to_util() -> None:
    c = classify_path("src/features/compare/comparisonScoring.ts")
    assert c.role == FileRole.util
