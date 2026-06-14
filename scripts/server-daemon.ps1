#requires -Version 5.1
# Runner веб-сервера многоагентной системы (node Backend/server.js).
# Запускается задачей Task Scheduler "MultiAgentServer" при входе в систему.
# Блокируется на время жизни node, поэтому задача остаётся "Running".
# Защита от дублей: если порт уже слушается — выходит без повторного запуска.
$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot 'server-logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

# Простая ротация: текущий лог -> .prev, пишем заново
$logFile = Join-Path $logDir 'server.log'
if (Test-Path $logFile) { Move-Item -Path $logFile -Destination (Join-Path $logDir 'server.log.prev') -Force }

function Log($msg) { "[$(Get-Date -Format o)] $msg" | Out-File -FilePath $logFile -Append -Encoding utf8 }

$port = if ($env:PORT) { [int]$env:PORT } else { 38731 }

# Защита от дублей — порт уже занят
$busy = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($busy) {
  Log "Порт $port уже слушается (PID $($busy.OwningProcess -join ',')). Повторный запуск не требуется."
  exit 0
}

$nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeExe) {
  foreach ($c in @("$env:ProgramFiles\nodejs\node.exe", "$env:LOCALAPPDATA\Programs\nodejs\node.exe")) {
    if (Test-Path $c) { $nodeExe = $c; break }
  }
}
if (-not $nodeExe) { Log 'FATAL: node не найден'; exit 127 }

Log "node=$nodeExe; запуск Backend\server.js на порту $port"
Set-Location $projectRoot

& $nodeExe 'Backend\server.js' *>> $logFile
$rc = $LASTEXITCODE
Log "server.js завершился, exit=$rc"
exit $rc
