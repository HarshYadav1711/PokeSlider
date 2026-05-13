"""Context Engine CLI.

Four commands. Everything else got cut.

    context-engine scan       AST scan, refresh evidence, persist snapshot.
    context-engine generate   Regenerate the 4 context artifacts.
    context-engine validate   Print issues; exit non-zero on errors.
    context-engine watch      Watch and regenerate on changes.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from . import __version__
from .cache import FileCache
from .generator import generate_all, refresh_evidence
from .registry import load_features, load_snapshot, save_snapshot
from .scanner import scan as scan_repo
from .schemas import Snapshot
from .validator import IssueLevel, error_count, validate as _run_validators, warning_count
from .watcher import watch as watch_loop

app = typer.Typer(
    add_completion=False, no_args_is_help=True, rich_markup_mode="rich",
    help="Truthful context for the PokeSlider repository.",
)


def _make_console() -> Console:
    if os.name == "nt":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
        except Exception:
            pass
        return Console(legacy_windows=False, force_terminal=True)
    return Console()


console = _make_console()

OK, WARN, FAIL, ARROW = "[OK]", "[!]", "[X]", "->"


# ---------------------------------------------------------------------------
# Path discovery
# ---------------------------------------------------------------------------


def _repo_root(start: Path | None = None) -> Path:
    cur = (start or Path.cwd()).resolve()
    for candidate in [cur, *cur.parents]:
        if (candidate / ".git").exists() or (candidate / "package.json").exists():
            return candidate
    return cur


def _metadata_root(root: Path) -> Path:
    d = root / "project-metadata"
    d.mkdir(parents=True, exist_ok=True)
    (d / "features").mkdir(exist_ok=True)
    (d / "current-state").mkdir(exist_ok=True)
    return d


def _cache_path(root: Path) -> Path:
    return root / "project-metadata" / ".cache" / "file-cache.json"


# ---------------------------------------------------------------------------
# Root callback
# ---------------------------------------------------------------------------


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
# scan
# ---------------------------------------------------------------------------


@app.command()
def scan(
    repo: Path | None = typer.Option(None, help="Repo root (defaults to autodetect)."),
    no_cache: bool = typer.Option(False, "--no-cache", help="Bypass the file cache."),
) -> Snapshot:
    """Scan the repo, refresh manifest evidence, persist a snapshot."""
    root = _repo_root(repo)
    metadata = _metadata_root(root)
    cache = None if no_cache else FileCache(_cache_path(root))
    snap = scan_repo(root, cache=cache)
    features = load_features(metadata)
    refreshed = refresh_evidence(metadata, snap, features)
    save_snapshot(metadata, snap)

    t = Table(title="Scan summary", show_lines=False)
    t.add_column("Metric")
    t.add_column("Value", justify="right")
    t.add_row("Files", str(len(snap.files)))
    t.add_row("TS / TSX", str(sum(1 for f in snap.files if f.path.endswith((".ts", ".tsx")))))
    t.add_row("Parser errors", str(len(snap.parser_errors)))
    t.add_row("Manifest updates", str(len(refreshed)))
    t.add_row("Commit", (snap.git_commit or "-")[:10])
    t.add_row("Branch", snap.git_branch or "-")
    console.print(t)
    if snap.parser_errors:
        console.print(f"[yellow]{WARN} {len(snap.parser_errors)} parser error(s).[/yellow]")
    return snap


# ---------------------------------------------------------------------------
# generate
# ---------------------------------------------------------------------------


@app.command()
def generate(repo: Path | None = typer.Option(None)) -> None:
    """Regenerate PROJECT_CONTEXT / FEATURE_TRACKER / CURRENT_AI_CONTEXT / .mdc."""
    root = _repo_root(repo)
    metadata = _metadata_root(root)
    snap = load_snapshot(metadata)
    if snap is None:
        snap = scan_repo(root, cache=FileCache(_cache_path(root)))
        save_snapshot(metadata, snap)
    features = load_features(metadata)
    refresh_evidence(metadata, snap, features)
    issues = _run_validators(snap, features)
    results = generate_all(root, snap, features, issues=issues)

    t = Table(title="Generation summary", show_lines=False)
    t.add_column("Path", overflow="fold")
    t.add_column("Action")
    for r in results:
        t.add_row(str(r.path.relative_to(root)), r.reason)
    console.print(t)

    errs = error_count(issues)
    if errs:
        console.print(f"[red]{FAIL} {errs} validation error(s) — run `context-engine validate` for detail.[/red]")
        raise typer.Exit(code=1)


# ---------------------------------------------------------------------------
# validate
# ---------------------------------------------------------------------------


@app.command(name="validate")
def validate_cmd(
    repo: Path | None = typer.Option(None, "--repo", help="Repo root (defaults to autodetect)."),
    fail_on_warning: bool = typer.Option(False, help="Exit non-zero on warnings too."),
) -> None:
    """Run the three structural checks and print results."""
    root = _repo_root(repo)
    metadata = _metadata_root(root)
    snap = load_snapshot(metadata)
    if snap is None:
        snap = scan_repo(root, cache=FileCache(_cache_path(root)))
        save_snapshot(metadata, snap)
    features = load_features(metadata)
    issues = _run_validators(snap, features)

    if not issues:
        console.print(f"[green]{OK} No issues.[/green]")
        return

    for issue in issues:
        colour = "red" if issue.level == IssueLevel.error else "yellow"
        console.print(
            f"[{colour}][{issue.level.value.upper()}][/{colour}] {issue.code} — {issue.message}"
            + (f" [dim](target: {issue.target})[/dim]" if issue.target else "")
        )
        if issue.suggestion:
            console.print(f"  [dim]{ARROW} {issue.suggestion}[/dim]")

    errs = error_count(issues)
    warns = warning_count(issues)
    console.print(f"\n[bold]{errs}[/bold] errors, [bold]{warns}[/bold] warnings.")
    if errs or (fail_on_warning and warns):
        raise typer.Exit(code=1)


# ---------------------------------------------------------------------------
# watch
# ---------------------------------------------------------------------------


@app.command()
def watch(repo: Path | None = typer.Option(None)) -> None:
    """Watch the repo and regenerate context on change."""
    root = _repo_root(repo)
    metadata = _metadata_root(root)
    console.print(f"[bold]Watching[/bold] {root} (Ctrl+C to stop)")

    def _on_change() -> None:
        try:
            cache = FileCache(_cache_path(root))
            snap = scan_repo(root, cache=cache)
            save_snapshot(metadata, snap)
            features = load_features(metadata)
            refresh_evidence(metadata, snap, features)
            issues = _run_validators(snap, features)
            generate_all(root, snap, features, issues=issues)
            console.print(
                f"[green]{OK}[/green] regenerated "
                f"(errors={error_count(issues)}, warnings={warning_count(issues)})"
            )
        except Exception as exc:  # noqa: BLE001
            console.print(f"[red]{FAIL} regeneration failed:[/red] {exc}")

    watch_loop(root, _on_change)


if __name__ == "__main__":  # pragma: no cover
    app()
