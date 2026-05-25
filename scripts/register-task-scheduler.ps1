#requires -Version 5.1
# Регистрирует Windows-задачу "IntelScoutDaily" — запуск каждый день в 09:00.
# Запускать ОДНОКРАТНО от имени пользователя (не от Admin), чтобы задача работала под текущей учёткой.
# Удаление: schtasks /Delete /TN "IntelScoutDaily" /F

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$psScript = Join-Path $projectRoot 'scripts\intel-scout-daily.ps1'
$psSync = Join-Path $projectRoot 'scripts\intel-scout-sync.ps1'

if (-not (Test-Path $psScript)) { throw "Не найден $psScript" }
if (-not (Test-Path $psSync)) { throw "Не найден $psSync" }

$taskName = 'IntelScoutDaily'
$runAt = '09:00'
$syncTaskName = 'IntelScoutSync'

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$psScript`""

$trigger = New-ScheduledTaskTrigger -Daily -At $runAt

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'Intel-Scout daily: ingest, dedup, filter, digest, deliver to chief, send to Telegram.'

try { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue } catch {}
Register-ScheduledTask -TaskName $taskName -InputObject $task | Out-Null
Write-Output "Задача '$taskName' зарегистрирована. Запуск ежедневно в $runAt."

# Sync feedback каждые 30 минут с 09:00 до 23:00
$syncAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$psSync`""
$syncTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date "09:15") `
  -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Hours 14)
$syncSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 3)
$syncTask = New-ScheduledTask -Action $syncAction -Trigger $syncTrigger -Settings $syncSettings `
  -Principal $principal -Description 'Intel-Scout sync: pull operator reactions from Telegram into decisions store.'

try { Unregister-ScheduledTask -TaskName $syncTaskName -Confirm:$false -ErrorAction SilentlyContinue } catch {}
Register-ScheduledTask -TaskName $syncTaskName -InputObject $syncTask | Out-Null
Write-Output "Задача '$syncTaskName' зарегистрирована. Запуск каждые 30 минут с 09:15."

Write-Output ""
Write-Output "Проверка:   Get-ScheduledTask -TaskName $taskName,$syncTaskName"
Write-Output "Запустить:  Start-ScheduledTask -TaskName $taskName"
Write-Output "Удалить:    schtasks /Delete /TN $taskName /F; schtasks /Delete /TN $syncTaskName /F"
