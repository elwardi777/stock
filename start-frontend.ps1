# DFL Fresh — Start React + Vite Frontend on Windows (No Docker)
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ProjectRoot "frontend"
$NodeModules = Join-Path $FrontendDir "node_modules"
$EnvFile = Join-Path $FrontendDir ".env"
$EnvExample = Join-Path $FrontendDir ".env.example"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  DFL Fresh - Demarrage Frontend React  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. Check Node.js and npm installation
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERREUR] Node.js n'est pas installe ou absent du PATH." -ForegroundColor Red
    Write-Host "Installez Node.js LTS depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
$nodeVer = node --version
$npmVer = npm --version
Write-Host "[OK] Node.js $nodeVer | npm $npmVer" -ForegroundColor Cyan

Set-Location $FrontendDir

# Ensure .env exists
if (-not (Test-Path $EnvFile) -and (Test-Path $EnvExample)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "[INFO] Fichier frontend\.env cree depuis .env.example" -ForegroundColor Yellow
}

# 2 & 3. Check / Install npm dependencies
if (-not (Test-Path $NodeModules)) {
    Write-Host "[INFO] Installation des dependances npm..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[OK] Dependances npm presentes (frontend\node_modules)" -ForegroundColor Cyan
}

# 4 & 5. Start Vite development server and display URL
Write-Host ""
Write-Host "Frontend URL : http://localhost:5173" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arreter le serveur." -ForegroundColor Gray
Write-Host ""

npm run dev

