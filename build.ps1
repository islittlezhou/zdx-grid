# Build glide-data-grid core package
# Usage: run .\build.ps1 from project root

$ErrorActionPreference = "Stop"

# Locate project root from script path (independent of cwd)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$coreDir     = Join-Path $projectRoot "packages\core"
$nodeBin     = Join-Path $projectRoot "node_modules\.bin"

if (-not (Test-Path $coreDir)) {
    Write-Error "packages/core not found: $coreDir"
    exit 1
}

# Prepend Git Bash and project local .bin to PATH
$env:PATH = "E:\git\Git\bin;E:\git\Git\usr\bin;$nodeBin;" + $env:PATH

Set-Location $coreDir

# Clean dist before build to avoid Windows "mv: Permission denied" when old dts is held by another process
$distDir = Join-Path $coreDir "dist"
if (Test-Path $distDir) {
    Write-Host "Cleaning old dist..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $distDir -ErrorAction SilentlyContinue
    if (Test-Path $distDir) {
        Write-Warning "Some files are locked. Close IDE .d.ts files, storybook, or watch processes, then retry."
        exit 1
    }
}

bash ./build.sh
