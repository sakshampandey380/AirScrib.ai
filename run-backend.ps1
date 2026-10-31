param(
    [string]$Port = "8010"
)

Set-Location $PSScriptRoot
cmd /c ".\run-backend.bat $Port"
