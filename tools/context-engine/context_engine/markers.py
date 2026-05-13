"""Safe-merge markers — the engine's single most important safety property.

Generated docs live inside ``<!-- AUTO-GENERATED-START -->`` /
``<!-- AUTO-GENERATED-END -->``. Human prose lives outside that region OR
inside ``<!-- MANUAL-NOTES-START -->`` / ``<!-- MANUAL-NOTES-END -->``.
Both are preserved verbatim across regenerations.

If a target file exists but has no markers, the engine writes a sibling
``<stem>.generated.md`` instead of overwriting human-authored prose.
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


@dataclass(slots=True, frozen=True)
class RenderResult:
    path: Path
    wrote: bool
    reason: str


def extract_manual_notes(text: str) -> str | None:
    m = _MANUAL_RE.search(text)
    return m.group("body").strip("\n") if m else None


def _wrap_auto(body: str) -> str:
    return f"{AUTO_START}\n{body.rstrip()}\n{AUTO_END}"


def _wrap_manual(body: str | None) -> str:
    inner = (body or "").strip("\n")
    return f"{MANUAL_START}\n{inner}\n{MANUAL_END}" if inner else f"{MANUAL_START}\n{MANUAL_END}"


def safe_render(target: Path, auto_body: str, *, header: str | None = None) -> RenderResult:
    """Write ``auto_body`` into the AUTO-GENERATED region of ``target``.

    Behavior:
      * Target missing → create file with AUTO + empty MANUAL blocks.
      * Target exists with markers → replace only the AUTO region; preserve
        everything else (including any MANUAL-NOTES block) byte-for-byte.
      * Target exists without markers → write ``<stem>.generated.md`` sidecar
        instead of overwriting human-authored prose.
    """
    if AUTO_START in auto_body or AUTO_END in auto_body:
        raise ValueError("auto_body must not contain AUTO-GENERATED markers")

    target.parent.mkdir(parents=True, exist_ok=True)

    if not target.exists():
        body = _wrap_auto(auto_body) + "\n\n" + _wrap_manual(None) + "\n"
        if header:
            body = header.rstrip() + "\n\n" + body
        target.write_text(body, encoding="utf-8", newline="\n")
        return RenderResult(target, True, "created")

    existing = target.read_text(encoding="utf-8")
    if _AUTO_RE.search(existing) is None:
        sidecar = target.with_name(target.stem + ".generated.md")
        sidecar.write_text(
            _wrap_auto(auto_body) + "\n\n" + _wrap_manual(None) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        return RenderResult(sidecar, True, "sidecar (no markers in original)")

    replaced = _AUTO_RE.sub(lambda _m: _wrap_auto(auto_body), existing, count=1)
    if _MANUAL_RE.search(replaced) is None:
        replaced = replaced.rstrip() + "\n\n" + _wrap_manual(None) + "\n"

    if replaced == existing:
        return RenderResult(target, False, "unchanged")
    target.write_text(replaced, encoding="utf-8", newline="\n")
    return RenderResult(target, True, "auto-region updated")
