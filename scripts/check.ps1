# Runs every check that CI runs. Stops at the first failure.
$root = Split-Path -Parent $PSScriptRoot
$py = "$root\backend\.venv\Scripts\python.exe"

function Step($name, [scriptblock]$cmd) {
    Write-Host "`n== $name ==" -ForegroundColor Cyan
    & $cmd
    if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: $name" -ForegroundColor Red; exit 1 }
}

Set-Location "$root\backend"
Step "Django system check"       { & $py manage.py check }
Step "Migrations are committed"  { & $py manage.py makemigrations --check --dry-run }
Step "Backend tests"             { & $py -m pytest -q }
Set-Location "$root\frontend"
Step "TypeScript"                { npx tsc -p tsconfig.app.json --noEmit }
Step "Production build"          { npm run build }
Write-Host "`nAll checks passed." -ForegroundColor Green
