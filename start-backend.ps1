# DFL Fresh — Start FastAPI Backend on Windows (No Docker)
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$VenvDir = Join-Path $BackendDir "venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$EnvFile = Join-Path $BackendDir ".env"
$EnvExample = Join-Path $BackendDir ".env.example"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  DFL Fresh - Demarrage Backend FastAPI " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. Check Python installation
$PythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PythonCmd = "py -3"
} else {
    Write-Host "[ERREUR] Python n'est pas installe ou absent du PATH." -ForegroundColor Red
    Write-Host "Installez Python 3.11+ depuis https://www.python.org/downloads/windows/" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Python detecte ($PythonCmd)" -ForegroundColor Cyan

# 2. Check / Create virtual environment
if (-not (Test-Path $VenvPython)) {
    Write-Host "[INFO] Environnement virtuel introuvable. Creation dans backend\venv..." -ForegroundColor Yellow
    Invoke-Expression "$PythonCmd -m venv `"$VenvDir`""
}
Write-Host "[OK] Environnement virtuel pret ($VenvDir)" -ForegroundColor Cyan

# 3. Activate virtual environment
$ActivateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
. $ActivateScript
Write-Host "[OK] Environnement virtuel active" -ForegroundColor Cyan

# 4. Check required dependencies
Set-Location $BackendDir
$prevErrorPref = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $VenvPython -c "import importlib.util, sys; mods = ['uvicorn','fastapi','motor','pymongo']; sys.exit(0 if all(importlib.util.find_spec(m) for m in mods) else 1)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Installation des dependances Python (requirements.txt)..." -ForegroundColor Yellow
    & $VenvPython -m pip install --upgrade pip
    & $VenvPython -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Echec de l'installation des dependances Python." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Dependances Python verifiees" -ForegroundColor Cyan
}
$ErrorActionPreference = $prevErrorPref

# Ensure .env exists
if (-not (Test-Path $EnvFile) -and (Test-Path $EnvExample)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "[INFO] Fichier backend\.env cree depuis .env.example" -ForegroundColor Yellow
}

# 5. Verify MongoDB availability
Write-Host "[INFO] Verification de MongoDB sur 127.0.0.1:27017..." -ForegroundColor Cyan
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
        Write-Host "[INFO] Le service MongoDB est arrete. Tentative de demarrage..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
    }
    Write-Host "[OK] Service Windows MongoDB actif" -ForegroundColor Green
} else {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $iar = $tcp.BeginConnect("127.0.0.1", 27017, $null, $null)
    $connected = $iar.AsyncWaitHandle.WaitOne(2000, $false)
    if ($connected) { try { $tcp.EndConnect($iar) } catch { $connected = $false } }
    $tcp.Close()
    if (-not $connected) {
        Write-Host "[ATTENTION] MongoDB ne repond pas sur 127.0.0.1:27017 !" -ForegroundColor Red
        Write-Host "Assurez-vous que MongoDB Community Server est installe et demarre." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] MongoDB accessible sur 127.0.0.1:27017" -ForegroundColor Green
}

# 6. Start FastAPI on port 8000
Write-Host ""
Write-Host "API FastAPI : http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger UI  : http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arreter le serveur." -ForegroundColor Gray
Write-Host ""

& $VenvPython -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

