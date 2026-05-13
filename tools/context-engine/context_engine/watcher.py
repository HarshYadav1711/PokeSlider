"""Minimal watchdog-based file watcher with debounce."""

from __future__ import annotations

import threading
import time
from collections.abc import Callable
from pathlib import Path

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

_IGNORE = {".git", "node_modules", "dist", "build", ".vite", ".cache", "__pycache__"}
_INTERESTING_EXT = (".ts", ".tsx", ".js", ".jsx", ".yaml", ".yml", ".md", ".mdc", ".json", ".css")


class _Handler(FileSystemEventHandler):
    def __init__(self, on_change: Callable[[], None]) -> None:
        super().__init__()
        self._on_change = on_change

    def on_any_event(self, event: FileSystemEvent) -> None:  # type: ignore[override]
        if event.is_directory:
            return
        src = event.src_path if isinstance(event.src_path, str) else ""
        if not src.endswith(_INTERESTING_EXT):
            return
        if any(part in _IGNORE for part in Path(src).parts):
            return
        self._on_change()


def watch(root: Path, on_change: Callable[[], None], *, debounce_ms: int = 750) -> None:
    timer: dict[str, threading.Timer | None] = {"t": None}
    lock = threading.Lock()

    def _fire() -> None:
        try:
            on_change()
        except Exception:  # pragma: no cover - keep loop alive
            pass

    def _bump() -> None:
        with lock:
            if timer["t"] is not None:
                timer["t"].cancel()
            t = threading.Timer(debounce_ms / 1000.0, _fire)
            t.daemon = True
            timer["t"] = t
            t.start()

    observer = Observer()
    observer.schedule(_Handler(_bump), str(root), recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        observer.stop()
        observer.join(timeout=3.0)
