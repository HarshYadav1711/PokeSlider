"""Watch the working tree and trigger incremental rescans.

We debounce file events into batches and rely on the cache to skip
unchanged files. This keeps regeneration fast on large repos.
"""

from __future__ import annotations

import threading
import time
from collections.abc import Callable
from pathlib import Path

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

_IGNORE_PARTS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".cache",
    "coverage",
    ".pytest_cache",
    ".ruff_cache",
    "__pycache__",
    ".vite",
}


class _Handler(FileSystemEventHandler):
    def __init__(self, on_event: Callable[[str], None]) -> None:
        super().__init__()
        self.on_event = on_event

    def on_any_event(self, event: FileSystemEvent) -> None:  # type: ignore[override]
        if event.is_directory:
            return
        src = event.src_path
        if not isinstance(src, str):
            return
        if any(part in _IGNORE_PARTS for part in Path(src).parts):
            return
        self.on_event(src)


class FileWatcher:
    def __init__(
        self,
        repo_root: Path,
        on_change: Callable[[list[str]], None],
        *,
        debounce_ms: int = 750,
    ) -> None:
        self.repo_root = repo_root.resolve()
        self.on_change = on_change
        self.debounce_ms = debounce_ms
        self._observer = Observer()
        self._pending: list[str] = []
        self._lock = threading.Lock()
        self._timer: threading.Timer | None = None

    def start(self) -> None:
        handler = _Handler(self._record)
        self._observer.schedule(handler, str(self.repo_root), recursive=True)
        self._observer.start()

    def stop(self) -> None:
        self._observer.stop()
        self._observer.join(timeout=3.0)

    def _record(self, path: str) -> None:
        with self._lock:
            self._pending.append(path)
            if self._timer is not None:
                self._timer.cancel()
            self._timer = threading.Timer(self.debounce_ms / 1000.0, self._flush)
            self._timer.daemon = True
            self._timer.start()

    def _flush(self) -> None:
        with self._lock:
            batch = list(self._pending)
            self._pending.clear()
            self._timer = None
        if batch:
            try:
                self.on_change(batch)
            except Exception:  # pragma: no cover - keep the watcher alive
                pass

    def run_forever(self) -> None:
        self.start()
        try:
            while True:
                time.sleep(0.5)
        except KeyboardInterrupt:
            pass
        finally:
            self.stop()
