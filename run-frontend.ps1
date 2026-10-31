param(
    [string]$ApiPort = "8010"
)

Set-Location $PSScriptRoot
cmd /c ".\run-frontend.bat $ApiPort"
