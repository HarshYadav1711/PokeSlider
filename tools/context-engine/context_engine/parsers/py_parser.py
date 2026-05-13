"""libcst-based Python parser used for self-analysis of the engine.

We deliberately keep this small. Its current purpose is twofold:
    * Validate that the engine's own Python sources parse cleanly.
    * Make it possible (in the future) to extract context blocks from any
      Python files added to the repository.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import libcst as cst


@dataclass(slots=True)
class PythonModuleFacts:
    path: str
    imports: list[str] = field(default_factory=list)
    top_level_names: list[str] = field(default_factory=list)
    ok: bool = True
    error: str | None = None


class PythonParser:
    def parse_file(self, path: Path, repo_relative: str) -> PythonModuleFacts:
        try:
            source = path.read_text(encoding="utf-8")
        except OSError as exc:
            return PythonModuleFacts(path=repo_relative, ok=False, error=str(exc))
        try:
            module = cst.parse_module(source)
        except cst.ParserSyntaxError as exc:
            return PythonModuleFacts(path=repo_relative, ok=False, error=str(exc))

        facts = PythonModuleFacts(path=repo_relative)
        for stmt in module.body:
            if isinstance(stmt, cst.SimpleStatementLine):
                for small in stmt.body:
                    if isinstance(small, cst.Import):
                        for alias in small.names:
                            facts.imports.append(_qualified_name(alias.name))
                    elif isinstance(small, cst.ImportFrom):
                        mod_name = _qualified_name(small.module) if small.module else ""
                        facts.imports.append(mod_name)
            elif isinstance(stmt, cst.FunctionDef):
                facts.top_level_names.append(stmt.name.value)
            elif isinstance(stmt, cst.ClassDef):
                facts.top_level_names.append(stmt.name.value)
        return facts


def _qualified_name(node: cst.CSTNode | None) -> str:
    if node is None:
        return ""
    if isinstance(node, cst.Name):
        return node.value
    if isinstance(node, cst.Attribute):
        return _qualified_name(node.value) + "." + node.attr.value
    return ""
