#requires -Version 5.1
$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot 'Online-scout-logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

$stamp = (Get-Date).ToString('yyyy-MM-dd_HHmmss')
$logFile = Join-Path $logDir "cron-$stamp.log"

"[$(Get-Date -Format o)] starting" | Out-File -FilePath $logFile -Encoding utf8

$nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeExe) {
  foreach ($c in @("$env:ProgramFiles\nodejs\node.exe", "$env:LOCALAPPDATA\Programs\nodejs\node.exe")) {
    if (Test-Path $c) { $nodeExe = $c; break }
  }
}
if (-not $nodeExe) {
  "[$(Get-Date -Format o)] FATAL: node not found" | Out-File -FilePath $logFile -Append -Encoding utf8
  exit 127
}
"[$(Get-Date -Format o)] node=$nodeExe" | Out-File -FilePath $logFile -Append -Encoding utf8

Set-Location $projectRoot

& $nodeExe 'Backend\intel-scout\cli.js' '--sync' '--deliver' *>> $logFile
$rc = $LASTEXITCODE

"[$(Get-Date -Format o)] exit=$rc" | Out-File -FilePath $logFile -Append -Encoding utf8
exit $rc
