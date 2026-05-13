"""Context Engine — lightweight truthful project context for PokeSlider.

Top-level modules:

* ``schemas``   — Pydantic models for ``FeatureManifest`` + ``Snapshot``.
* ``markers``   — Safe AUTO-GENERATED / MANUAL-NOTES merging.
* ``parser``    — Tree-sitter TS/TSX AST extraction.
* ``scanner``   — Walk + classify + parse into a ``Snapshot``.
* ``registry``  — Load/save feature YAML manifests + snapshot JSON.
* ``cache``     — SHA + engine-version keyed per-file cache.
* ``validator`` — Three structural checks (fake refs, missing evidence, unknown deps).
* ``generator`` — Refresh evidence + render four context artifacts.
* ``watcher``   — watchdog wrapper with debounce.
* ``cli``       — Typer app: ``scan``, ``generate``, ``validate``, ``watch``.
"""

from __future__ import annotations

__version__ = "0.2.0"
