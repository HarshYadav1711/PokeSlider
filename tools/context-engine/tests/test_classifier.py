"""Sanity checks for the file classifier."""

from __future__ import annotations

from context_engine.scanner import classify
from context_engine.schemas import FileRole


def test_feature_engine_is_engine() -> None:
    role, feature_id, is_test = classify("src/features/team-builder/teamBuilderEngine.ts")
    assert role == FileRole.engine
    assert feature_id == "team_builder"
    assert is_test is False


def test_engine_test_file_is_test() -> None:
    role, _, is_test = classify("src/features/team-builder/teamBuilderEngine.test.ts")
    assert is_test is True
    assert role == FileRole.test


def test_overlay_tsx_is_overlay() -> None:
    role, _, _ = classify("src/features/overlay/PokemonDetailPanel.tsx")
    assert role == FileRole.overlay


def test_feature_modal_tsx_is_component() -> None:
    role, _, _ = classify("src/features/compare/ComparisonModal.tsx")
    assert role == FileRole.component


def test_zustand_store_is_store() -> None:
    role, _, _ = classify("src/store/teamBuilderStore.ts")
    assert role == FileRole.store


def test_query_layer_is_query() -> None:
    role, _, _ = classify("src/query/keys.ts")
    assert role == FileRole.query


def test_a11y_helpers_are_a11y() -> None:
    role, _, _ = classify("src/a11y/useFocusTrap.ts")
    assert role == FileRole.a11y


def test_types_file_is_types() -> None:
    role, _, _ = classify("src/types/pokemon.ts")
    assert role == FileRole.types


def test_feature_types_is_types() -> None:
    role, feature_id, _ = classify("src/features/team-builder/teamBuilderTypes.ts")
    assert role == FileRole.types
    assert feature_id == "team_builder"


def test_feature_util_falls_back_to_util() -> None:
    role, _, _ = classify("src/features/compare/comparisonScoring.ts")
    assert role == FileRole.util
