"""Safe-merge markers for generated documentation.

We never blindly rewrite a documentation file. Instead, each generated file
contains an ``<!-- AUTO-GENERATED-START -->`` / ``<!-- AUTO-GENERATED-END -->``
region that the engine owns, and optional ``<!-- MANUAL-NOTES-START -->`` /
``<!-- MANUAL-NOTES-END -->`` blocks that the engine MUST preserve.

Rules:
1. If the target file does not exist, write a new file containing the rendered
   AUTO-GENERATED block and an empty MANUAL-NOTES block.
2. If the target exists and contains an AUTO-GENERATED region, replace ONLY
   that region. Everything outside the region is preserved verbatim.
3. If the target exists but lacks the markers, do NOT overwrite; raise a
   :class:`MissingMarkersError` so the caller can decide (CLI prints a warning
   and writes alongside ``<file>.generated.md`` instead).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

AUTO_START = "<!-- AUTO-GENERATED-START -->"
AUTO_END = "<!-- AUTO-GENERATED-END -->"
MANUAL_START = "<!-- MANUAL-NOTES-START -->"
MANUAL_END = "<!-- MANUAL-NOTES-END -->"

_AUTO_RE = re.compile(
    rf"{re.escape(AUTO_START)}(?P<body>.*?){re.escape(AUTO_END)}",
    flags=re.DOTALL,
)
_MANUAL_RE = re.compile(
    rf"{re.escape(MANUAL_START)}(?P<body>.*?){re.escape(MANUAL_END)}",
    flags=re.DOTALL,
)


class MissingMarkersError(RuntimeError):
    """Raised when an existing file has no AUTO-GENERATED markers."""


@dataclass(slots=True, frozen=True)
class RenderResult:
    path: Path
    wrote: bool
    reason: str


def extract_manual_notes(existing_text: str) -> str | None:
    """Return the manual-notes body if present, else None."""
    m = _MANUAL_RE.search(existing_text)
    if m is None:
        return None
    return m.group("body").strip("\n")


def wrap_auto(body: str) -> str:
    body = body.rstrip() + "\n"
    return f"{AUTO_START}\n{body}{AUTO_END}"


def wrap_manual(body: str | None) -> str:
    body_text = (body or "").strip("\n")
    if body_text:
        return f"{MANUAL_START}\n{body_text}\n{MANUAL_END}"
    return f"{MANUAL_START}\n{MANUAL_END}"


def safe_render(
    target: Path,
    rendered_auto_body: str,
    *,
    default_header: str | None = None,
    require_markers: bool = False,
    sidecar_on_missing: bool = True,
) -> RenderResult:
    """Write ``rendered_auto_body`` into the auto-generated region of ``target``.

    Parameters
    ----------
    target:
        Destination markdown path.
    rendered_auto_body:
        Body that will live inside ``<!-- AUTO-GENERATED-START -->`` ...
        ``<!-- AUTO-GENERATED-END -->``. Must NOT contain those markers.
    default_header:
        When the file is being created from scratch, optional Markdown text
        placed above the AUTO block.
    require_markers:
        If True and the existing file lacks markers, raise instead of
        creating a sidecar.
    sidecar_on_missing:
        When markers are absent and ``require_markers`` is False, the engine
        writes ``<stem>.generated.md`` beside the original file.
    """
    if AUTO_START in rendered_auto_body or AUTO_END in rendered_auto_body:
        raise ValueError("rendered_auto_body must not contain AUTO-GENERATED markers")

    target.parent.mkdir(parents=True, exist_ok=True)

    if not target.exists():
        body = wrap_auto(rendered_auto_body) + "\n\n" + wrap_manual(None) + "\n"
        if default_header:
            body = default_header.rstrip() + "\n\n" + body
        target.write_text(body, encoding="utf-8", newline="\n")
        return RenderResult(target, True, "created")

    existing = target.read_text(encoding="utf-8")
    if _AUTO_RE.search(existing) is None:
        if require_markers:
            raise MissingMarkersError(f"{target} has no AUTO-GENERATED markers")
        if sidecar_on_missing:
            sidecar = target.with_suffix(target.suffix + ".generated")
            if sidecar.suffix != ".md":
                sidecar = target.with_name(target.stem + ".generated.md")
            sidecar.write_text(
                wrap_auto(rendered_auto_body) + "\n\n" + wrap_manual(None) + "\n",
                encoding="utf-8",
                newline="\n",
            )
            return RenderResult(sidecar, True, "sidecar (no markers in original)")
        return RenderResult(target, False, "no markers; sidecar disabled")

    replaced = _AUTO_RE.sub(
        lambda _m: wrap_auto(rendered_auto_body),
        existing,
        count=1,
    )

    if _MANUAL_RE.search(replaced) is None:
        replaced = replaced.rstrip() + "\n\n" + wrap_manual(None) + "\n"

    if replaced == existing:
        return RenderResult(target, False, "unchanged")

    target.write_text(replaced, encoding="utf-8", newline="\n")
    return RenderResult(target, True, "auto-region updated")
