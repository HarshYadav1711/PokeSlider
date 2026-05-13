"""Build dependency / feature graphs from a :class:`RepoSnapshot`."""

from __future__ import annotations

from dataclasses import dataclass, field

import networkx as nx

from ..schemas.dependency import DependencyKind
from ..schemas.feature import FeatureManifest
from ..schemas.snapshot import RepoSnapshot


@dataclass(slots=True)
class GraphReport:
    file_count: int
    edge_count: int
    cycles: list[list[str]] = field(default_factory=list)
    top_fanin: list[tuple[str, int]] = field(default_factory=list)
    top_fanout: list[tuple[str, int]] = field(default_factory=list)
    hotspots: list[tuple[str, int]] = field(default_factory=list)


def build_dependency_graph(snapshot: RepoSnapshot) -> tuple[nx.DiGraph, GraphReport]:
    g: nx.DiGraph = nx.DiGraph()
    for f in snapshot.files:
        g.add_node(f.path, role=f.role.value, layer=f.layer or "", feature_id=f.feature_id or "")

    for edge in snapshot.edges:
        if edge.kind not in {DependencyKind.import_value, DependencyKind.types_only}:
            continue
        if edge.target not in g:
            continue
        g.add_edge(edge.source, edge.target, kind=edge.kind.value)

    cycles: list[list[str]] = []
    try:
        for cyc in nx.simple_cycles(g):
            if len(cyc) >= 2:
                cycles.append(cyc)
                if len(cycles) >= 25:
                    break
    except Exception:
        cycles = []

    indeg = sorted(g.in_degree(), key=lambda x: x[1], reverse=True)
    outdeg = sorted(g.out_degree(), key=lambda x: x[1], reverse=True)
    hotspots = [(n, indeg_v + outdeg_v) for (n, indeg_v), (_, outdeg_v) in zip(indeg, outdeg, strict=False)]
    hotspots.sort(key=lambda x: x[1], reverse=True)

    report = GraphReport(
        file_count=g.number_of_nodes(),
        edge_count=g.number_of_edges(),
        cycles=cycles,
        top_fanin=indeg[:10],
        top_fanout=outdeg[:10],
        hotspots=hotspots[:10],
    )
    return g, report


def build_feature_graph(
    snapshot: RepoSnapshot, features: list[FeatureManifest]
) -> nx.DiGraph:
    """Graph of feature-id -> feature-id based on cross-feature imports."""
    feature_paths: dict[str, set[str]] = {f.id: set() for f in features}
    for f in features:
        for ref in f.evidence.source_files:
            feature_paths[f.id].add(ref.path)
        for ref in f.evidence.referenced_by:
            feature_paths[f.id].add(ref.path)

    path_to_feature: dict[str, str] = {}
    for fid, paths in feature_paths.items():
        for p in paths:
            path_to_feature.setdefault(p, fid)

    for f in snapshot.files:
        if f.feature_id and f.feature_id not in feature_paths:
            feature_paths[f.feature_id] = set()
        if f.feature_id:
            path_to_feature.setdefault(f.path, f.feature_id)

    g: nx.DiGraph = nx.DiGraph()
    for fid in feature_paths:
        g.add_node(fid)

    for edge in snapshot.edges:
        if edge.kind not in {DependencyKind.import_value, DependencyKind.types_only}:
            continue
        src = path_to_feature.get(edge.source)
        tgt = path_to_feature.get(edge.target)
        if src and tgt and src != tgt:
            if g.has_edge(src, tgt):
                g[src][tgt]["weight"] += 1
            else:
                g.add_edge(src, tgt, weight=1)
    return g
