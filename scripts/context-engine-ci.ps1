<#
.SYNOPSIS
    Run the Context Intelligence Engine in CI / pre-commit mode.

.DESCRIPTION
    1. Scans the repo.
    2. Refreshes manifests + regenerates docs.
    3. Runs validators.
    4. Fails if validation errors are present, OR if any tracked generated
       file differs from what is committed (indicates the contributor
       forgot to run `context-engine generate`).
#>

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    if (-not (Get-Command context-engine -ErrorAction SilentlyContinue)) {
        Write-Host "Installing context-engine (editable)..." -ForegroundColor Cyan
        python -m pip install --quiet -e "./tools/context-engine"
    }

    Write-Host "→ scan" -ForegroundColor Cyan
    context-engine scan | Out-Host

    Write-Host "→ generate" -ForegroundColor Cyan
    context-engine generate | Out-Host

    Write-Host "→ validate" -ForegroundColor Cyan
    context-engine validate
    if ($LASTEXITCODE -ne 0) {
        Write-Error "context-engine validation failed."
        exit 1
    }

    Write-Host "→ git diff check (generated artifacts must be committed)" -ForegroundColor Cyan
    $generatedPaths = @(
        "PROJECT_CONTEXT.md",
        "FEATURE_TRACKER.md",
        "CURRENT_AI_CONTEXT.md",
        "DRIFT_REPORT.md",
        "docs/generated",
        "docs/graphs",
        ".cursor/rules/context-engine.mdc",
        "project-metadata"
    )
    $diff = git diff --name-only -- @generatedPaths
    if ($diff) {
        Write-Host "Generated artifacts are out of date. Run `context-engine generate` and commit:" -ForegroundColor Red
        Write-Host $diff
        exit 1
    }

    Write-Host "✓ context engine clean" -ForegroundColor Green
}
finally {
    Pop-Location
}
