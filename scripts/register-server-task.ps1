#requires -Version 5.1
# Регистрирует Windows-задачу "MultiAgentServer" — автозапуск веб-сервера при входе в систему.
# Запускать ОДНОКРАТНО от имени пользователя (не от Admin), чтобы задача работала под текущей учёткой.
# Удаление: schtasks /Delete /TN "MultiAgentServer" /F

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$psScript = Join-Path $projectRoot 'scripts\server-daemon.ps1'
if (-not (Test-Path $psScript)) { throw "Не найден $psScript" }

$taskName = 'MultiAgentServer'

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$psScript`""

# Триггер: при входе текущего пользователя в систему
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# Long-running демон: без лимита времени, не плодим копии, поднимаем при доступности
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Seconds 0)

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'Multi-agent web server (Express): автозапуск Backend/server.js при входе в систему.'

try { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue } catch {}
Register-ScheduledTask -TaskName $taskName -InputObject $task | Out-Null
Write-Output "Задача '$taskName' зарегистрирована. Автозапуск при входе в систему."

Write-Output ""
Write-Output "Проверка:   Get-ScheduledTask -TaskName $taskName | Get-ScheduledTaskInfo"
Write-Output "Запустить:  Start-ScheduledTask -TaskName $taskName"
Write-Output "Остановить: Stop-ScheduledTask -TaskName $taskName"
Write-Output "Удалить:    schtasks /Delete /TN $taskName /F"
Write-Output "Логи:       $projectRoot\server-logs\server.log"
