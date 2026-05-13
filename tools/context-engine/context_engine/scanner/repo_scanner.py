"""Orchestrates a full repository scan into a :class:`RepoSnapshot`."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from ..cache.file_cache import FileCache
from ..parsers.ts_parser import ParsedModule, TypeScriptParser
from ..schemas.dependency import DependencyEdge, DependencyKind
from ..schemas.snapshot import (
    FileFact,
    FileRole,
    RepoSnapshot,
    SymbolFact,
    SymbolKind,
)
from ..utils.git_utils import read_git_context
from ..utils.hashing import file_sha256
from ..utils.paths import normalize_repo_path
from ..utils.walker import RepoWalker, WalkConfig
from .classifier import ClassifiedFile, classify_path

_TS_LIKE = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}


@dataclass(slots=True)
class ScanResult:
    snapshot: RepoSnapshot
    cache_hits: int = 0
    cache_misses: int = 0
    parse_failures: int = 0
    parsed_modules: dict[str, ParsedModule] = field(default_factory=dict)


class RepoScanner:
    def __init__(
        self,
        repo_root: Path,
        *,
        cache: FileCache | None = None,
        scan_subtrees: list[str] | None = None,
    ) -> None:
        self.repo_root = repo_root.resolve()
        self.cache = cache
        self.scan_subtrees = scan_subtrees or ["src", "scripts", "tools/context-engine"]
        self._ts_parser: TypeScriptParser | None = None

    def _get_ts_parser(self) -> TypeScriptParser:
        if self._ts_parser is None:
            self._ts_parser = TypeScriptParser()
        return self._ts_parser

    def scan(self) -> ScanResult:
        walker = RepoWalker(self.repo_root, WalkConfig())
        files: list[Path] = []
        for p in walker.iter_files():
            rel_posix = normalize_repo_path(self.repo_root, p)
            if not self._is_in_scan_root(rel_posix):
                continue
            files.append(p)

        git = read_git_context(self.repo_root)
        snap = RepoSnapshot(
            root=str(self.repo_root),
            git_commit=git.commit,
            git_branch=git.branch,
            git_dirty=git.dirty,
        )
        result = ScanResult(snapshot=snap)

        present_paths: set[str] = set()
        for path in files:
            rel = normalize_repo_path(self.repo_root, path)
            present_paths.add(rel)
            classified = classify_path(rel)

            try:
                sha = file_sha256(path)
                size = path.stat().st_size
            except OSError:
                continue

            cached = self.cache.get(rel, sha) if self.cache else None
            if cached is not None:
                snap.files.append(cached)
                result.cache_hits += 1
                continue

            result.cache_misses += 1
            fact = self._build_fact(path, rel, sha, size, classified, snap, result)
            snap.files.append(fact)
            if self.cache and fact.parser_ok:
                self.cache.put(fact)

        snap.edges = self._build_edges_from_facts(snap)

        if self.cache:
            self.cache.prune_missing(present_paths)
            self.cache.flush()
        return result

    def _is_in_scan_root(self, rel_posix: str) -> bool:
        keep_roots = (
            "src/",
            "scripts/",
            "tools/",
            "project-metadata/",
            ".cursor/",
            "docs/",
            "public/",
        )
        keep_files = {
            "package.json",
            "vite.config.ts",
            "vitest.config.ts",
            "eslint.config.js",
            "tsconfig.json",
            "tsconfig.app.json",
            "tsconfig.node.json",
            "PROJECT_CONTEXT.md",
            "FEATURE_TRACKER.md",
            "DECISIONS_LOG.md",
            "README.md",
            "index.html",
        }
        if rel_posix in keep_files:
            return True
        return any(rel_posix.startswith(r) for r in keep_roots)

    def _build_fact(
        self,
        path: Path,
        rel: str,
        sha: str,
        size: int,
        classified: ClassifiedFile,
        snap: RepoSnapshot,
        result: ScanResult,
    ) -> FileFact:
        suffix = path.suffix.lower()
        fact = FileFact(
            path=rel,
            role=classified.role,
            sha256=sha,
            size_bytes=size,
            feature_id=classified.feature_id,
            layer=classified.layer,
            is_test=classified.is_test,
        )

        if suffix not in _TS_LIKE:
            fact.parser = "none"
            try:
                fact.loc = sum(1 for _ in path.open("r", encoding="utf-8", errors="replace"))
            except OSError:
                pass
            return fact

        parser = self._get_ts_parser()
        parsed = parser.parse_file(path, rel)
        result.parsed_modules[rel] = parsed
        fact.parser_ok = parsed.ok
        if not parsed.ok:
            result.parse_failures += 1
            snap.parser_errors.append(f"{rel}: {parsed.error}")
            return fact

        try:
            fact.loc = sum(1 for _ in path.open("r", encoding="utf-8", errors="replace"))
        except OSError:
            pass

        fact.imports = [imp.source for imp in parsed.imports]
        fact.exported_symbols = [
            SymbolFact(
                name=s.name,
                kind=_to_symbol_kind(s.kind),
                exported=s.exported,
                is_default_export=s.is_default_export,
                line=s.line,
            )
            for s in parsed.symbols
            if s.exported
        ]
        fact.referenced_stores = parsed.referenced_stores
        fact.referenced_query_keys = parsed.referenced_query_keys
        fact.referenced_hooks = parsed.referenced_hooks
        fact.jsx_children_used = parsed.jsx_children_used

        if fact.role in {FileRole.component, FileRole.overlay} and any(
            s.kind in {"component", "function"} for s in parsed.symbols if s.exported
        ):
            pass

        return fact

    def _build_edges_from_facts(self, snap: RepoSnapshot) -> list[DependencyEdge]:
        """Build edges from FileFact data. Works for both fresh + cache-hit files."""
        edges: list[DependencyEdge] = []
        known_paths = {f.path for f in snap.files}
        for f in snap.files:
            if not f.parser_ok or f.parser == "none":
                continue
            for spec in f.imports:
                resolved = _resolve_import(f.path, spec, known_paths)
                edges.append(
                    DependencyEdge(
                        source=f.path,
                        target=resolved or spec,
                        kind=DependencyKind.import_value,
                        raw_specifier=spec,
                    )
                )
            for store in f.referenced_stores or []:
                edges.append(
                    DependencyEdge(source=f.path, target=store, kind=DependencyKind.store_usage)
                )
            for qk in f.referenced_query_keys or []:
                edges.append(
                    DependencyEdge(
                        source=f.path, target=f"qk.{qk}", kind=DependencyKind.query_key_usage
                    )
                )
        return edges


def _to_symbol_kind(kind: str) -> SymbolKind:
    mapping = {
        "function": SymbolKind.function,
        "component": SymbolKind.component,
        "hook": SymbolKind.hook,
        "store": SymbolKind.store,
        "constant": SymbolKind.constant,
        "type": SymbolKind.type,
        "interface": SymbolKind.interface,
        "class": SymbolKind.class_,
    }
    return mapping.get(kind, SymbolKind.constant)


def _resolve_import(source_file: str, specifier: str, known_paths) -> str | None:
    """Best-effort relative-import resolution. External modules return None."""
    if not specifier.startswith("."):
        return None
    from pathlib import PurePosixPath

    base = PurePosixPath(source_file).parent
    candidate = (base / specifier).as_posix()
    # Normalize ../
    parts: list[str] = []
    for p in candidate.split("/"):
        if p == "." or p == "":
            continue
        if p == "..":
            if parts:
                parts.pop()
            continue
        parts.append(p)
    normalized = "/".join(parts)

    for ext in (".ts", ".tsx", ".js", ".jsx"):
        target = normalized + ext
        if target in known_paths:
            return target
    for ext in (".ts", ".tsx", ".js", ".jsx"):
        target = normalized + "/index" + ext
        if target in known_paths:
            return target
    return None
