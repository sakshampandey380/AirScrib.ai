@echo off
setlocal

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"
set "API_PORT=%~1"

if "%API_PORT%"=="" set "API_PORT=8010"

cd /d "%FRONTEND%"
set "VITE_API_URL=http://127.0.0.1:%API_PORT%/api"

echo Starting AirScribe frontend on http://127.0.0.1:5173
echo Using backend API: %VITE_API_URL%
npm.cmd run dev -- --host 127.0.0.1 --port 5173
