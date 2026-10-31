@echo off
setlocal

for %%p in (8000 8001 8002 8003 8004 8010 8011 8012 8013 8014 5173 5174 5175 5176 5177) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
    echo Stopping process %%a on port %%p
    taskkill /PID %%a /F >nul 2>&1
  )
)

echo AirScribe ports have been cleaned up.
