<#
.SYNOPSIS
    Run the lightweight Context Engine in CI / pre-commit mode.
#>

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    if (-not (Get-Command context-engine -ErrorAction SilentlyContinue)) {
        Write-Host "Installing context-engine (editable)..." -ForegroundColor Cyan
        python -m pip install --quiet -e "./tools/context-engine"
    }

    Write-Host "-> scan" -ForegroundColor Cyan
    context-engine scan | Out-Host

    Write-Host "-> generate" -ForegroundColor Cyan
    context-engine generate | Out-Host

    Write-Host "-> validate" -ForegroundColor Cyan
    context-engine validate
    if ($LASTEXITCODE -ne 0) {
        Write-Error "context-engine validation failed."
        exit 1
    }

    Write-Host "-> git diff check (generated artifacts must be committed)" -ForegroundColor Cyan
    $generatedPaths = @(
        "PROJECT_CONTEXT.md",
        "FEATURE_TRACKER.md",
        "CURRENT_AI_CONTEXT.md",
        ".cursor/rules/context-engine.mdc",
        "project-metadata/features",
        "project-metadata/current-state"
    )
    $diff = git diff --name-only -- @generatedPaths
    if ($diff) {
        Write-Host "Generated artifacts are out of date. Run 'context-engine generate' and commit:" -ForegroundColor Red
        Write-Host $diff
        exit 1
    }

    Write-Host "OK context engine clean" -ForegroundColor Green
}
finally {
    Pop-Location
}
