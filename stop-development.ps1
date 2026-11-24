# DFL Fresh — Stop Local Development Servers (Backend & Frontend)
Write-Host "Arret des serveurs locaux DFL Fresh..." -ForegroundColor Yellow

$ports = @(8000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Arret de $($proc.ProcessName) (PID $($proc.Id)) sur le port $port..." -ForegroundColor Cyan
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "Aucun processus actif sur le port $port." -ForegroundColor Gray
    }
}

Write-Host "[OK] Serveurs de developpement arretes." -ForegroundColor Green

