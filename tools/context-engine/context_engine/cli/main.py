"""Context Intelligence Engine CLI.

Commands:
    init                Create the project-metadata skeleton if missing.
    scan                Scan the repo and persist the current snapshot.
    generate            Refresh manifests + regenerate docs + Cursor rules.
    validate            Run validators and print the report; exit non-zero on errors.
    drift-report        Write DRIFT_REPORT.md without touching other docs.
    architecture-report Print high-level architecture summary.
    context-report      Print the AI-onboarding snapshot to stdout.
    graph               Build + export dependency / feature graphs.
    watch               Watch the working tree and regenerate incrementally.
"""

from __future__ import annotations

import sys
from collections.abc import Iterable
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from .. import __version__
from ..cache.file_cache import FileCache
from ..generators import CursorRulesGenerator, DocsGenerator, ManifestGenerator
from ..graph import (
    build_dependency_graph,
    build_feature_graph,
    export_feature_graph_mermaid,
    export_graph_dot,
    export_graph_mermaid,
)
from ..registry import RegistryStore
from ..scanner import RepoScanner
from ..schemas.snapshot import RepoSnapshot
from ..utils.paths import repo_root_from
from ..validators import ValidationRunner

app = typer.Typer(
    add_completion=False,
    no_args_is_help=True,
    rich_markup_mode="rich",
    help="Truthful, self-healing context intelligence for the PokeSlider repository.",
)


def _make_console() -> Console:
    import os
    import sys

    if os.name == "nt":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
        except Exception:
            pass
        return Console(legacy_windows=False, force_terminal=True, soft_wrap=False)
    return Console()


console = _make_console()


# ASCII glyphs (portable across legacy Windows terminals and CI runners).
OK = "[OK]"
WARN = "[!]"
FAIL = "[X]"
ARROW = "->"
RELOAD = "~>"


def _resolve_root(repo: Path | None) -> Path:
    if repo is not None:
        return repo.resolve()
    return repo_root_from(Path.cwd())


def _metadata_root(root: Path) -> Path:
    return root / "project-metadata"


def _cache_path(root: Path) -> Path:
    return root / "project-metadata" / ".cache" / "file-cache.json"


def _store(root: Path) -> RegistryStore:
    return RegistryStore(_metadata_root(root))


def _scan(root: Path, *, use_cache: bool = True) -> RepoSnapshot:
    cache = FileCache(_cache_path(root)) if use_cache else None
    scanner = RepoScanner(root, cache=cache)
    return scanner.scan().snapshot


@app.callback(invoke_without_command=True)
def _root(
    ctx: typer.Context,
    version: bool = typer.Option(False, "--version", help="Print version and exit."),
) -> None:
    if version:
        typer.echo(__version__)
        raise typer.Exit()
    if ctx.invoked_subcommand is None:
        typer.echo(ctx.get_help())
        raise typer.Exit()


# ---------------------------------------------------------------------------
# init
# ---------------------------------------------------------------------------


@app.command()
def init(
    repo: Path | None = typer.Option(None, help="Repo root (defaults to autodetect)."),
) -> None:
    """Create the project-metadata skeleton (idempotent)."""
    root = _resolve_root(repo)
    store = _store(root)
    console.print(f"[bold]Initialized metadata root[/bold]: {store.root}")
    (root / "docs" / "generated").mkdir(parents=True, exist_ok=True)
    (root / "docs" / "graphs").mkdir(parents=True, exist_ok=True)
    (root / "docs" / "adr").mkdir(parents=True, exist_ok=True)
    (root / ".cursor" / "rules").mkdir(parents=True, exist_ok=True)
    console.print(f"[green]{OK} Ready.[/green] Next: [cyan]context-engine scan[/cyan]")


# ---------------------------------------------------------------------------
# scan
# ---------------------------------------------------------------------------


@app.command()
def scan(
    repo: Path | None = typer.Option(None),
    no_cache: bool = typer.Option(False, "--no-cache", help="Bypass the file cache for this scan."),
    json_out: bool = typer.Option(False, "--json", help="Print the snapshot path as JSON."),
) -> None:
    """Scan the repository and persist a snapshot."""
    root = _resolve_root(repo)
    snapshot = _scan(root, use_cache=not no_cache)
    path = _store(root).save_snapshot(snapshot)
    table = Table(title="Scan summary", show_lines=False)
    table.add_column("Metric")
    table.add_column("Value", justify="right")
    table.add_row("Files", str(len(snapshot.files)))
    table.add_row("Edges", str(len(snapshot.edges)))
    table.add_row("Parser errors", str(len(snapshot.parser_errors)))
    table.add_row("Commit", snapshot.git_commit[:10] if snapshot.git_commit else "-")
    table.add_row("Branch", snapshot.git_branch or "-")
    table.add_row("Snapshot file", str(path.relative_to(root)))
    console.print(table)
    if snapshot.parser_errors:
        console.print(f"[yellow]{WARN} {len(snapshot.parser_errors)} parser error(s); see snapshot.parser_errors[/yellow]")
    if json_out:
        typer.echo(str(path))


# ---------------------------------------------------------------------------
# generate
# ---------------------------------------------------------------------------


@app.command()
def generate(
    repo: Path | None = typer.Option(None),
    docs_only: bool = typer.Option(False, help="Skip manifest refresh; only regenerate docs."),
    manifests_only: bool = typer.Option(False, help="Refresh manifests; skip docs regeneration."),
    skip_cursor: bool = typer.Option(False, help="Skip .cursor/rules regeneration."),
) -> None:
    """Refresh manifests, then regenerate docs + Cursor rules."""
    root = _resolve_root(repo)
    store = _store(root)
    snapshot = store.load_snapshot() or _scan(root)
    store.save_snapshot(snapshot)

    notes: list[str] = []
    feature_writes: list[Path] = []
    system_writes: list[Path] = []

    if not docs_only:
        update = ManifestGenerator(store, snapshot).refresh()
        feature_writes = update.feature_writes
        system_writes = update.system_writes
        notes.extend(update.notes)

    if manifests_only:
        _print_writes(root, feature_writes, system_writes, [], notes)
        return

    features = store.load_features()
    systems = store.load_systems()
    routes = store.load_routes()
    validation = ValidationRunner(snapshot, features, systems, routes).run()
    docs = DocsGenerator(root, snapshot, features, systems, routes, validation=validation).generate_all()
    doc_paths = [r.path for r in docs.written if r.wrote]
    if not skip_cursor:
        rules_result = CursorRulesGenerator(root, snapshot, features, systems, routes).generate()
        if rules_result.wrote:
            doc_paths.append(rules_result.path)
    _print_writes(root, feature_writes, system_writes, doc_paths, notes)
    if validation.error_count:
        console.print(f"[red]{FAIL} {validation.error_count} validation error(s).[/red] See DRIFT_REPORT.md.")


def _print_writes(
    root: Path,
    features: Iterable[Path],
    systems: Iterable[Path],
    docs: Iterable[Path],
    notes: list[str],
) -> None:
    table = Table(title="Generation summary", show_lines=False)
    table.add_column("Kind")
    table.add_column("Path", overflow="fold")
    for p in features:
        table.add_row("feature", str(p.relative_to(root)))
    for p in systems:
        table.add_row("system", str(p.relative_to(root)))
    for p in docs:
        table.add_row("doc", str(p.relative_to(root)))
    if table.row_count == 0:
        console.print("[dim]No files changed.[/dim]")
    else:
        console.print(table)
    for n in notes:
        console.print(f"[yellow]note[/yellow] {n}")


# ---------------------------------------------------------------------------
# validate
# ---------------------------------------------------------------------------


@app.command()
def validate(
    repo: Path | None = typer.Option(None),
    fail_on_warning: bool = typer.Option(False, help="Exit non-zero on warnings as well."),
) -> None:
    """Run validators against the current snapshot + manifests."""
    root = _resolve_root(repo)
    store = _store(root)
    snapshot = store.load_snapshot() or _scan(root)
    features = store.load_features()
    systems = store.load_systems()
    routes = store.load_routes()
    report = ValidationRunner(snapshot, features, systems, routes).run()
    if not report.issues:
        console.print(f"[green]{OK} No issues.[/green]")
        return
    for issue in report.issues:
        colour = {"error": "red", "warning": "yellow", "info": "cyan"}[issue.level.value]
        console.print(
            f"[{colour}][{issue.level.value.upper()}][/{colour}] {issue.code} — {issue.message}"
            + (f" [dim](target: {issue.target})[/dim]" if issue.target else "")
        )
        if issue.suggestion:
            console.print(f"  [dim]{ARROW} {issue.suggestion}[/dim]")
    console.print(
        f"\n[bold]{report.error_count}[/bold] errors, "
        f"[bold]{report.warning_count}[/bold] warnings, "
        f"[bold]{sum(1 for i in report.issues if i.level.value == 'info')}[/bold] info."
    )
    if report.error_count or (fail_on_warning and report.warning_count):
        raise typer.Exit(code=1)


# ---------------------------------------------------------------------------
# drift-report
# ---------------------------------------------------------------------------


@app.command("drift-report")
def drift_report(repo: Path | None = typer.Option(None)) -> None:
    """Write DRIFT_REPORT.md (without modifying other docs)."""
    root = _resolve_root(repo)
    store = _store(root)
    snapshot = store.load_snapshot() or _scan(root)
    features = store.load_features()
    systems = store.load_systems()
    routes = store.load_routes()
    report = ValidationRunner(snapshot, features, systems, routes).run()
    gen = DocsGenerator(root, snapshot, features, systems, routes, validation=report)
    result = gen.generate_drift_report()
    console.print(f"[cyan]{ARROW} {result.path.relative_to(root)}[/cyan] ({result.reason})")
    if report.error_count:
        raise typer.Exit(code=1)


# ---------------------------------------------------------------------------
# architecture-report
# ---------------------------------------------------------------------------


@app.command("architecture-report")
def architecture_report(repo: Path | None = typer.Option(None)) -> None:
    """Print a compact, factual architecture summary."""
    root = _resolve_root(repo)
    store = _store(root)
    snapshot = store.load_snapshot() or _scan(root)
    _, report = build_dependency_graph(snapshot)

    table = Table(title="Architecture overview")
    table.add_column("Layer")
    table.add_column("Files", justify="right")
    layers: dict[str, int] = {}
    for f in snapshot.files:
        key = f.layer or f.role.value
        layers[key] = layers.get(key, 0) + 1
    for k, v in sorted(layers.items()):
        table.add_row(k, str(v))
    console.print(table)

    console.print(f"\n[bold]Edges:[/bold] {report.edge_count}    [bold]Cycles:[/bold] {len(report.cycles)}")

    if report.hotspots:
        ht = Table(title="Top coupling hotspots", show_lines=False)
        ht.add_column("Path", overflow="fold")
        ht.add_column("Score", justify="right")
        for path, score in report.hotspots[:8]:
            ht.add_row(path, str(score))
        console.print(ht)


# ---------------------------------------------------------------------------
# context-report
# ---------------------------------------------------------------------------


@app.command("context-report")
def context_report(repo: Path | None = typer.Option(None)) -> None:
    """Print the AI onboarding context to stdout."""
    root = _resolve_root(repo)
    target = root / "CURRENT_AI_CONTEXT.md"
    if not target.exists():
        console.print("[yellow]CURRENT_AI_CONTEXT.md does not exist; run `context-engine generate` first.[/yellow]")
        raise typer.Exit(code=1)
    sys.stdout.write(target.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# graph
# ---------------------------------------------------------------------------


@app.command()
def graph(
    repo: Path | None = typer.Option(None),
    fmt: str = typer.Option("mermaid", "--format", "-f", help="mermaid | dot | feature-mermaid"),
    out: Path | None = typer.Option(None, "--out", "-o", help="Optional output file."),
) -> None:
    """Export a dependency or feature graph."""
    root = _resolve_root(repo)
    store = _store(root)
    snapshot = store.load_snapshot() or _scan(root)
    if fmt == "mermaid":
        g, _ = build_dependency_graph(snapshot)
        text = export_graph_mermaid(g)
    elif fmt == "dot":
        g, _ = build_dependency_graph(snapshot)
        text = export_graph_dot(g)
    elif fmt == "feature-mermaid":
        features = store.load_features().features
        g = build_feature_graph(snapshot, features)
        text = export_feature_graph_mermaid(g)
    else:
        raise typer.BadParameter("Unknown format. Use mermaid | dot | feature-mermaid.")
    if out:
        out.write_text(text, encoding="utf-8", newline="\n")
        console.print(f"[cyan]{ARROW} {out}[/cyan]")
    else:
        sys.stdout.write(text)


# ---------------------------------------------------------------------------
# watch
# ---------------------------------------------------------------------------


@app.command()
def watch(repo: Path | None = typer.Option(None)) -> None:
    """Watch the working tree and regenerate context on change."""
    from ..watchers import FileWatcher

    root = _resolve_root(repo)
    console.print(f"[bold]Watching[/bold] {root} (Ctrl+C to stop)")

    def _on_change(paths: list[str]) -> None:
        relevant = [p for p in paths if _is_interesting(p)]
        if not relevant:
            return
        console.print(f"[dim]{RELOAD} {len(relevant)} change(s) detected; rescanning...[/dim]")
        try:
            snapshot = _scan(root)
            store = _store(root)
            store.save_snapshot(snapshot)
            ManifestGenerator(store, snapshot).refresh()
            features = store.load_features()
            systems = store.load_systems()
            routes = store.load_routes()
            validation = ValidationRunner(snapshot, features, systems, routes).run()
            DocsGenerator(root, snapshot, features, systems, routes, validation=validation).generate_all()
            CursorRulesGenerator(root, snapshot, features, systems, routes).generate()
            console.print(f"[green]{OK} regenerated[/green] (errors={validation.error_count}, warnings={validation.warning_count})")
        except Exception as exc:  # noqa: BLE001
            console.print(f"[red]{FAIL} regeneration failed:[/red] {exc}")

    watcher = FileWatcher(root, _on_change)
    watcher.run_forever()


def _is_interesting(path: str) -> bool:
    p = path.replace("\\", "/")
    if any(seg in p for seg in ("/node_modules/", "/dist/", "/.git/", "/.vite/")):
        return False
    return any(
        p.endswith(ext)
        for ext in (".ts", ".tsx", ".js", ".jsx", ".md", ".mdc", ".yaml", ".yml", ".json", ".css")
    )


if __name__ == "__main__":  # pragma: no cover
    app()
