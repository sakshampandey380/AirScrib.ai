@echo off
setlocal

cd /d "%~dp0backend"
set WATCHFILES_FORCE_POLLING=true
set "BACKEND_PORT=%~1"

if "%BACKEND_PORT%"=="" set "BACKEND_PORT=8010"

echo Starting AirScribe backend on http://127.0.0.1:%BACKEND_PORT%
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port %BACKEND_PORT% --reload
