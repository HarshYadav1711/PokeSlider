"""Mermaid + Graphviz exports for graphs."""

from __future__ import annotations

import re

import networkx as nx


def _sanitize_id(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_]", "_", name)


def export_graph_mermaid(graph: nx.DiGraph, *, max_nodes: int = 120) -> str:
    """Render an LR Mermaid graph. Truncates to ``max_nodes`` highest-degree nodes."""
    if graph.number_of_nodes() == 0:
        return "graph LR\n    empty[\"(no nodes)\"]\n"
    degrees = sorted(graph.degree(), key=lambda x: x[1], reverse=True)
    keep = {n for n, _ in degrees[:max_nodes]}
    sub = graph.subgraph(keep).copy()

    lines: list[str] = ["graph LR"]
    for node in sorted(sub.nodes()):
        nid = _sanitize_id(node)
        label = node.replace("src/", "").replace('"', "'")
        lines.append(f'    {nid}["{label}"]')
    for u, v in sorted(sub.edges()):
        lines.append(f"    {_sanitize_id(u)} --> {_sanitize_id(v)}")
    if sub.number_of_nodes() < graph.number_of_nodes():
        omitted = graph.number_of_nodes() - sub.number_of_nodes()
        lines.append(f'    truncated["+ {omitted} additional nodes omitted"]')
    return "\n".join(lines) + "\n"


def export_graph_dot(graph: nx.DiGraph) -> str:
    lines = ["digraph G {", "  rankdir=LR;", "  node [shape=box, fontname=\"Inter\"];"]
    for node in sorted(graph.nodes()):
        nid = _sanitize_id(node)
        label = node.replace('"', "'")
        lines.append(f'  {nid} [label="{label}"];')
    for u, v in sorted(graph.edges()):
        lines.append(f"  {_sanitize_id(u)} -> {_sanitize_id(v)};")
    lines.append("}")
    return "\n".join(lines) + "\n"


def export_feature_graph_mermaid(graph: nx.DiGraph) -> str:
    if graph.number_of_nodes() == 0:
        return "graph LR\n    empty[\"(no features)\"]\n"
    lines = ["graph LR"]
    for node in sorted(graph.nodes()):
        nid = _sanitize_id(node)
        lines.append(f'    {nid}(["{node}"])')
    for u, v, data in sorted(graph.edges(data=True)):
        weight = data.get("weight", 1)
        lines.append(f"    {_sanitize_id(u)} -- {weight} --> {_sanitize_id(v)}")
    return "\n".join(lines) + "\n"
