"""Deterministic TypeScript / TSX AST extraction via tree-sitter.

We extract only the fields the rest of the engine actually consumes:

* ``imports``               — list of source specifier strings
* ``exported_symbols``      — list of top-level exported names
* ``referenced_stores``     — identifiers matching ``use*Store``
* ``referenced_query_keys`` — ``qk.*`` property accesses

No dataclass zoo. No JSX consumer tracking. No regex.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any


@dataclass(slots=True)
class ParseResult:
    ok: bool = True
    error: str | None = None
    imports: list[str] = field(default_factory=list)
    exported_symbols: list[str] = field(default_factory=list)
    referenced_stores: list[str] = field(default_factory=list)
    referenced_query_keys: list[str] = field(default_factory=list)


@lru_cache(maxsize=1)
def _languages() -> tuple[Any, Any]:
    from tree_sitter import Language
    import tree_sitter_typescript as tsts

    return Language(tsts.language_typescript()), Language(tsts.language_tsx())


def _make_parser(language: Any) -> Any:
    from tree_sitter import Parser

    parser = Parser()
    if hasattr(parser, "set_language"):
        try:
            parser.set_language(language)
            return parser
        except Exception:
            pass
    parser.language = language  # type: ignore[assignment]
    return parser


@lru_cache(maxsize=1)
def _parsers() -> tuple[Any, Any]:
    ts, tsx = _languages()
    return _make_parser(ts), _make_parser(tsx)


def parse_ts(path: Path) -> ParseResult:
    """Parse a single TS or TSX file. Returns a structured ``ParseResult``."""
    try:
        source = path.read_bytes()
    except OSError as exc:
        return ParseResult(ok=False, error=f"read: {exc}")

    ts_parser, tsx_parser = _parsers()
    parser = tsx_parser if path.suffix.lower() == ".tsx" else ts_parser
    try:
        tree = parser.parse(source)
    except Exception as exc:  # pragma: no cover - defensive
        return ParseResult(ok=False, error=f"parse: {exc}")

    result = ParseResult()
    _visit_top_level(tree.root_node, source, result)
    _collect_refs(tree.root_node, source, result)

    seen = set()
    result.imports = [s for s in result.imports if not (s in seen or seen.add(s))]
    result.exported_symbols = sorted(set(result.exported_symbols))
    return result


def _text(node: Any, source: bytes) -> str:
    return source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")


def _visit_top_level(root: Any, source: bytes, out: ParseResult) -> None:
    for node in root.children:
        nt = node.type
        if nt == "import_statement":
            _record_import(node, source, out)
        elif nt == "export_statement":
            _record_export(node, source, out)


def _record_import(node: Any, source: bytes, out: ParseResult) -> None:
    src_node = node.child_by_field_name("source")
    if src_node is None:
        for c in node.children:
            if c.type == "string":
                src_node = c
                break
    if src_node is not None:
        out.imports.append(_text(src_node, source).strip("\"'`"))


def _record_export(node: Any, source: bytes, out: ParseResult) -> None:
    head = source[node.start_byte : min(node.start_byte + 30, node.end_byte)].decode(
        "utf-8", errors="replace"
    )
    is_default = "export default" in head
    for child in node.children:
        nt = child.type
        if nt == "function_declaration" or nt == "class_declaration":
            name = _child_text(child, "name", source)
            if name:
                out.exported_symbols.append(name if not is_default else f"default:{name}")
        elif nt in {"lexical_declaration", "variable_declaration"}:
            for vc in child.children:
                if vc.type == "variable_declarator":
                    name_node = vc.child_by_field_name("name")
                    if name_node is not None and name_node.type == "identifier":
                        out.exported_symbols.append(_text(name_node, source))
        elif nt in {"type_alias_declaration", "interface_declaration"}:
            name = _child_text(child, "name", source)
            if name:
                out.exported_symbols.append(name)
        elif nt == "export_clause":
            for spec in child.children:
                if spec.type == "export_specifier":
                    name_node = spec.child_by_field_name("name") or _first_identifier(spec)
                    if name_node is not None:
                        out.exported_symbols.append(_text(name_node, source))


def _child_text(node: Any, field_name: str, source: bytes) -> str | None:
    child = node.child_by_field_name(field_name)
    return _text(child, source) if child is not None else None


def _first_identifier(node: Any) -> Any | None:
    for c in node.children:
        if c.type in {"identifier", "type_identifier", "property_identifier"}:
            return c
    return None


def _collect_refs(root: Any, source: bytes, out: ParseResult) -> None:
    stores: set[str] = set()
    qkeys: set[str] = set()
    stack: list[Any] = [root]
    while stack:
        n = stack.pop()
        nt = n.type
        if nt == "identifier":
            name = _text(n, source)
            if name.startswith("use") and len(name) > 3 and name[3].isupper() and name.endswith("Store"):
                stores.add(name)
        elif nt == "member_expression":
            obj = n.child_by_field_name("object")
            prop = n.child_by_field_name("property")
            if obj is not None and prop is not None and _text(obj, source) == "qk":
                qkeys.add(_text(prop, source))
        stack.extend(n.children)
    out.referenced_stores = sorted(stores)
    out.referenced_query_keys = sorted(qkeys)
