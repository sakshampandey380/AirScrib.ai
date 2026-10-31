$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$root = $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$backendLog = Join-Path $backendDir "backend.log"
$backendErrorLog = Join-Path $backendDir "backend-error.log"

function Get-FreePort([int]$StartPort) {
    $usedPorts = ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()).Port
    $port = $StartPort

    while ($usedPorts -contains $port) {
        $port++
    }

    return $port
}

$backendPort = Get-FreePort 8010
$frontendPort = Get-FreePort 5173

Remove-Item $backendLog, $backendErrorLog -Force -ErrorAction SilentlyContinue

$env:WATCHFILES_FORCE_POLLING = "true"
$backendProcess = Start-Process `
    -FilePath (Join-Path $backendDir ".venv\Scripts\python.exe") `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "$backendPort", "--reload" `
    -WorkingDirectory $backendDir `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError $backendErrorLog `
    -PassThru `
    -WindowStyle Hidden

$healthy = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 750
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$backendPort/api/health" -Method Get
        if ($response.status -eq "ok") {
            $healthy = $true
            break
        }
    } catch {
    }
}

if (-not $healthy) {
    Write-Host "Backend failed to start. Check logs:" -ForegroundColor Red
    Write-Host $backendLog
    Write-Host $backendErrorLog
    if (-not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force
    }
    exit 1
}

Write-Host "Backend running at http://127.0.0.1:$backendPort" -ForegroundColor Green
Write-Host "Frontend starting at http://127.0.0.1:$frontendPort" -ForegroundColor Green
Write-Host "Backend logs: $backendLog" -ForegroundColor DarkGray

try {
    Set-Location $frontendDir
    $env:VITE_API_URL = "http://127.0.0.1:$backendPort/api"
    npm.cmd run dev -- --host 127.0.0.1 --port $frontendPort
} finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
