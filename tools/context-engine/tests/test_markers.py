"""The single most important safety contract — never overwrite human prose."""

from __future__ import annotations

from pathlib import Path

import pytest

from context_engine.markers import (
    AUTO_END,
    AUTO_START,
    MANUAL_END,
    MANUAL_START,
    extract_manual_notes,
    safe_render,
)


def test_creates_file_with_both_blocks_when_missing(tmp_path: Path) -> None:
    target = tmp_path / "DOC.md"
    result = safe_render(target, "hello body")
    assert result.wrote is True
    text = target.read_text(encoding="utf-8")
    assert AUTO_START in text and AUTO_END in text
    assert "hello body" in text
    assert MANUAL_START in text and MANUAL_END in text


def test_replaces_only_the_auto_region(tmp_path: Path) -> None:
    target = tmp_path / "DOC.md"
    target.write_text(
        "# Title\n\n"
        f"{AUTO_START}\nold content\n{AUTO_END}\n\n"
        f"{MANUAL_START}\nKEEP ME\n{MANUAL_END}\n",
        encoding="utf-8",
    )
    result = safe_render(target, "fresh content")
    assert result.wrote is True
    text = target.read_text(encoding="utf-8")
    assert "fresh content" in text
    assert "old content" not in text
    assert "KEEP ME" in text
    assert "# Title" in text


def test_no_op_when_auto_body_unchanged(tmp_path: Path) -> None:
    target = tmp_path / "DOC.md"
    safe_render(target, "stable body")
    second = safe_render(target, "stable body")
    assert second.wrote is False
    assert second.reason == "unchanged"


def test_does_not_overwrite_file_without_markers(tmp_path: Path) -> None:
    target = tmp_path / "ALREADY.md"
    original = "# Existing human-written doc\n\nSome paragraph.\n"
    target.write_text(original, encoding="utf-8")
    result = safe_render(target, "would be auto-generated body")
    assert result.wrote is True
    assert result.path != target
    assert result.path.name.endswith(".generated.md")
    assert target.read_text(encoding="utf-8") == original


def test_extract_manual_notes_returns_inner_body() -> None:
    text = f"foo\n{MANUAL_START}\nKept lines\n{MANUAL_END}\nbar"
    assert extract_manual_notes(text) == "Kept lines"


def test_rejects_body_containing_markers(tmp_path: Path) -> None:
    target = tmp_path / "x.md"
    with pytest.raises(ValueError):
        safe_render(target, f"naughty {AUTO_START}")
