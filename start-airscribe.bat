@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "BACKEND_HOST=127.0.0.1"
set "FRONTEND_HOST=127.0.0.1"

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
  echo Backend virtual environment not found at "%BACKEND%\.venv".
  echo Create it first using: python -m venv backend\.venv
  pause
  exit /b 1
)

if not exist "%FRONTEND%\node_modules" (
  echo Frontend dependencies not found.
  echo Run: cd frontend ^&^& npm install
  pause
  exit /b 1
)

for /f %%p in ('powershell -NoProfile -Command "$used = ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()).Port; $port = 8010; while($used -contains $port){ $port++ }; $port"') do set "BACKEND_PORT=%%p"
for /f %%p in ('powershell -NoProfile -Command "$used = ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()).Port; $port = 5173; while($used -contains $port){ $port++ }; $port"') do set "FRONTEND_PORT=%%p"

if "%BACKEND_PORT%"=="" (
  echo Could not resolve a backend port.
  pause
  exit /b 1
)

if "%FRONTEND_PORT%"=="" (
  echo Could not resolve a frontend port.
  pause
  exit /b 1
)

start "AirScribe AI Backend" cmd /k "cd /d %BACKEND% && set WATCHFILES_FORCE_POLLING=true && .venv\Scripts\python.exe -m uvicorn app.main:app --host %BACKEND_HOST% --port %BACKEND_PORT% --reload"
start "AirScribe AI Frontend" cmd /k "cd /d %FRONTEND% && set VITE_API_URL=http://%BACKEND_HOST%:%BACKEND_PORT%/api && npm.cmd run dev -- --host %FRONTEND_HOST% --port %FRONTEND_PORT%"

timeout /t 4 /nobreak >nul

echo AirScribe AI is starting.
echo Frontend: http://%FRONTEND_HOST%:%FRONTEND_PORT%
echo Backend:  http://%BACKEND_HOST%:%BACKEND_PORT%
