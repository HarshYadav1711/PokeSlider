"""Deterministic TypeScript / TSX AST parser using tree-sitter.

Why tree-sitter and not libcst:
    ``libcst`` is a Python-only concrete syntax tree. PokeSlider is React + TS.
    tree-sitter provides a deterministic, well-maintained AST for TS/TSX with
    Python bindings (``tree-sitter`` + ``tree-sitter-typescript``). This honors
    the project rule "no regex-based architecture parsing".

Extracted facts (per file):
    * imports (source specifier, named/default/namespace imports)
    * exports (named exports, default export, re-exports)
    * top-level identifier declarations
    * Zustand store usage (``useXxxStore`` references)
    * TanStack Query key usage (``qk.xxx`` accesses)
    * JSX components referenced
    * referenced hooks (identifiers matching ``use[A-Z]``)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any


@dataclass(slots=True)
class ImportRecord:
    source: str
    named: list[str] = field(default_factory=list)
    default: str | None = None
    namespace: str | None = None
    type_only: bool = False


@dataclass(slots=True)
class ExportRecord:
    name: str
    is_default: bool = False
    is_type: bool = False
    line: int | None = None


@dataclass(slots=True)
class TopLevelSymbol:
    name: str
    kind: str
    line: int
    exported: bool = False
    is_default_export: bool = False


@dataclass(slots=True)
class ParsedModule:
    path: str
    imports: list[ImportRecord] = field(default_factory=list)
    exports: list[ExportRecord] = field(default_factory=list)
    symbols: list[TopLevelSymbol] = field(default_factory=list)
    referenced_stores: list[str] = field(default_factory=list)
    referenced_query_keys: list[str] = field(default_factory=list)
    referenced_hooks: list[str] = field(default_factory=list)
    jsx_children_used: list[str] = field(default_factory=list)
    parser: str = "tree-sitter"
    ok: bool = True
    error: str | None = None


class TypeScriptParser:
    """Singleton-style parser; cheap to instantiate, expensive grammar load is cached."""

    def __init__(self) -> None:
        self._ts_lang, self._tsx_lang = _load_languages()
        self._ts_parser = self._make_parser(self._ts_lang)
        self._tsx_parser = self._make_parser(self._tsx_lang)

    @staticmethod
    def _make_parser(language: Any) -> Any:
        from tree_sitter import Parser

        parser = Parser()
        # tree-sitter >= 0.22 exposes ``language`` as a property setter; older versions
        # use ``set_language``. Support both.
        if hasattr(parser, "set_language"):
            try:
                parser.set_language(language)
                return parser
            except Exception:
                pass
        try:
            parser.language = language  # type: ignore[assignment]
        except Exception as exc:  # pragma: no cover - defensive
            raise RuntimeError(f"tree-sitter Parser API mismatch: {exc}") from exc
        return parser

    def parse_file(self, path: Path, repo_relative: str) -> ParsedModule:
        try:
            source = path.read_bytes()
        except OSError as exc:
            return ParsedModule(path=repo_relative, ok=False, error=f"read: {exc}")

        is_tsx = path.suffix.lower() == ".tsx"
        parser = self._tsx_parser if is_tsx else self._ts_parser
        try:
            tree = parser.parse(source)
        except Exception as exc:
            return ParsedModule(path=repo_relative, ok=False, error=f"parse: {exc}")

        module = ParsedModule(path=repo_relative)
        _walk(tree.root_node, source, module)
        _dedupe(module)
        return module


def _load_languages() -> tuple[Any, Any]:
    return _load_languages_cached()


@lru_cache(maxsize=1)
def _load_languages_cached() -> tuple[Any, Any]:
    from tree_sitter import Language
    import tree_sitter_typescript as tsts

    ts_lang = Language(tsts.language_typescript())
    tsx_lang = Language(tsts.language_tsx())
    return ts_lang, tsx_lang


def _text(node: Any, source: bytes) -> str:
    return source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")


def _walk(root: Any, source: bytes, mod: ParsedModule) -> None:
    """Visit top-level statements + collect identifier references everywhere."""
    for child in root.children:
        _visit_top_level(child, source, mod)
    _collect_references(root, source, mod)


def _visit_top_level(node: Any, source: bytes, mod: ParsedModule) -> None:  # noqa: PLR0912
    nt = node.type
    if nt == "import_statement":
        _record_import(node, source, mod)
        return
    if nt == "export_statement":
        _record_export(node, source, mod)
        return
    if nt == "lexical_declaration" or nt == "variable_declaration":
        for sym in _symbols_from_lexical(node, source, exported=False):
            mod.symbols.append(sym)
        return
    if nt == "function_declaration":
        name = _child_text(node, "name", source)
        if name:
            mod.symbols.append(TopLevelSymbol(name=name, kind="function", line=node.start_point[0] + 1))
        return
    if nt == "class_declaration":
        name = _child_text(node, "name", source)
        if name:
            mod.symbols.append(TopLevelSymbol(name=name, kind="class", line=node.start_point[0] + 1))
        return
    if nt == "type_alias_declaration":
        name = _child_text(node, "name", source)
        if name:
            mod.symbols.append(TopLevelSymbol(name=name, kind="type", line=node.start_point[0] + 1))
        return
    if nt == "interface_declaration":
        name = _child_text(node, "name", source)
        if name:
            mod.symbols.append(TopLevelSymbol(name=name, kind="interface", line=node.start_point[0] + 1))
        return


def _record_import(node: Any, source: bytes, mod: ParsedModule) -> None:
    src_node = node.child_by_field_name("source")
    if src_node is None:
        for c in node.children:
            if c.type == "string":
                src_node = c
                break
    if src_node is None:
        return
    src_text = _text(src_node, source).strip("\"'`")
    rec = ImportRecord(source=src_text)
    rec.type_only = b"import type" in source[node.start_byte : node.start_byte + 20]
    import_clause = None
    for c in node.children:
        if c.type == "import_clause":
            import_clause = c
            break
    if import_clause is None:
        mod.imports.append(rec)
        return
    for c in import_clause.children:
        if c.type == "identifier":
            rec.default = _text(c, source)
        elif c.type == "namespace_import":
            for nc in c.children:
                if nc.type == "identifier":
                    rec.namespace = _text(nc, source)
        elif c.type == "named_imports":
            for nc in c.children:
                if nc.type == "import_specifier":
                    name_node = nc.child_by_field_name("name") or _first_identifier(nc)
                    if name_node is not None:
                        rec.named.append(_text(name_node, source))
    mod.imports.append(rec)


def _record_export(node: Any, source: bytes, mod: ParsedModule) -> None:
    text_head = source[node.start_byte : min(node.start_byte + 30, node.end_byte)].decode(
        "utf-8", errors="replace"
    )
    is_default = "export default" in text_head
    for child in node.children:
        if child.type == "function_declaration":
            name = _child_text(child, "name", source) or "default"
            mod.exports.append(ExportRecord(name=name, is_default=is_default, line=child.start_point[0] + 1))
            mod.symbols.append(
                TopLevelSymbol(
                    name=name,
                    kind="function",
                    line=child.start_point[0] + 1,
                    exported=True,
                    is_default_export=is_default,
                )
            )
        elif child.type == "class_declaration":
            name = _child_text(child, "name", source) or "default"
            mod.exports.append(ExportRecord(name=name, is_default=is_default, line=child.start_point[0] + 1))
            mod.symbols.append(
                TopLevelSymbol(
                    name=name,
                    kind="class",
                    line=child.start_point[0] + 1,
                    exported=True,
                    is_default_export=is_default,
                )
            )
        elif child.type in {"lexical_declaration", "variable_declaration"}:
            for sym in _symbols_from_lexical(child, source, exported=True):
                mod.symbols.append(sym)
                mod.exports.append(
                    ExportRecord(name=sym.name, is_default=False, line=sym.line)
                )
        elif child.type == "type_alias_declaration":
            name = _child_text(child, "name", source)
            if name:
                mod.exports.append(ExportRecord(name=name, is_type=True, line=child.start_point[0] + 1))
                mod.symbols.append(
                    TopLevelSymbol(name=name, kind="type", line=child.start_point[0] + 1, exported=True)
                )
        elif child.type == "interface_declaration":
            name = _child_text(child, "name", source)
            if name:
                mod.exports.append(ExportRecord(name=name, is_type=True, line=child.start_point[0] + 1))
                mod.symbols.append(
                    TopLevelSymbol(name=name, kind="interface", line=child.start_point[0] + 1, exported=True)
                )
        elif child.type == "export_clause":
            for spec in child.children:
                if spec.type == "export_specifier":
                    name_node = spec.child_by_field_name("name") or _first_identifier(spec)
                    if name_node is not None:
                        mod.exports.append(
                            ExportRecord(name=_text(name_node, source), line=spec.start_point[0] + 1)
                        )
        elif is_default and child.type not in {"export", "default"}:
            sym_text = _text(child, source).strip()
            name = sym_text.split("(")[0].split("{")[0].split("\n")[0].strip()
            if name and name.isidentifier():
                mod.exports.append(
                    ExportRecord(name=name, is_default=True, line=child.start_point[0] + 1)
                )


def _symbols_from_lexical(node: Any, source: bytes, *, exported: bool) -> list[TopLevelSymbol]:
    out: list[TopLevelSymbol] = []
    for child in node.children:
        if child.type != "variable_declarator":
            continue
        name_node = child.child_by_field_name("name")
        if name_node is None:
            continue
        if name_node.type != "identifier":
            continue
        name = _text(name_node, source)
        kind = _classify_symbol(name)
        out.append(
            TopLevelSymbol(
                name=name,
                kind=kind,
                line=child.start_point[0] + 1,
                exported=exported,
            )
        )
    return out


def _classify_symbol(name: str) -> str:
    if name.startswith("use") and len(name) > 3 and name[3].isupper():
        if name.endswith("Store"):
            return "store"
        return "hook"
    if name and name[0].isupper():
        return "component"
    return "constant"


def _child_text(node: Any, field_name: str, source: bytes) -> str | None:
    child = node.child_by_field_name(field_name)
    if child is None:
        return None
    return _text(child, source)


def _first_identifier(node: Any) -> Any | None:
    for c in node.children:
        if c.type in {"identifier", "type_identifier", "property_identifier"}:
            return c
    return None


def _collect_references(root: Any, source: bytes, mod: ParsedModule) -> None:
    stores: set[str] = set()
    qkeys: set[str] = set()
    hooks: set[str] = set()
    jsx_components: set[str] = set()

    stack: list[Any] = [root]
    while stack:
        n = stack.pop()
        nt = n.type
        if nt == "identifier":
            name = _text(n, source)
            if name.startswith("use") and len(name) > 3 and name[3].isupper():
                if name.endswith("Store"):
                    stores.add(name)
                else:
                    hooks.add(name)
        elif nt == "member_expression":
            obj = n.child_by_field_name("object")
            prop = n.child_by_field_name("property")
            if obj is not None and prop is not None and _text(obj, source) == "qk":
                qkeys.add(_text(prop, source))
        elif nt in {"jsx_opening_element", "jsx_self_closing_element"}:
            name_node = n.child_by_field_name("name")
            if name_node is not None:
                name_text = _text(name_node, source)
                head = name_text.split(".")[0]
                if head and head[0].isupper():
                    jsx_components.add(name_text)
        stack.extend(n.children)

    mod.referenced_stores = sorted(stores)
    mod.referenced_query_keys = sorted(qkeys)
    mod.referenced_hooks = sorted(hooks)
    mod.jsx_children_used = sorted(jsx_components)


def _dedupe(mod: ParsedModule) -> None:
    seen: set[tuple[str, str]] = set()
    out: list[ImportRecord] = []
    for imp in mod.imports:
        key = (imp.source, ",".join(imp.named) + f"|{imp.default}|{imp.namespace}")
        if key in seen:
            continue
        seen.add(key)
        out.append(imp)
    mod.imports = out
