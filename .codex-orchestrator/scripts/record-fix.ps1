param(
  [Parameter(Mandatory = $true)]
  [string]$RunId,
  [Parameter(Mandatory = $true)]
  [string]$TaskId,
  [Parameter(Mandatory = $true)]
  [string]$Notes,
  [string[]]$FilesTouched = @()
)

$ErrorActionPreference = "Stop"

$orchestratorRoot = Split-Path -Parent $PSScriptRoot
$runPath = Join-Path $orchestratorRoot ("runs\" + $RunId + "\run.json")

if (-not (Test-Path $runPath)) {
  throw "Run not found: $RunId"
}

$run = Get-Content -Path $runPath -Raw | ConvertFrom-Json
$tasks = @($run.tasks | Where-Object { $null -ne $_ })
$task = $tasks | Where-Object { $_.taskId -eq $TaskId } | Select-Object -First 1

if ($null -eq $task) {
  throw "Task not found: $TaskId"
}
if ($task.status -eq "DONE") {
  throw "Task already DONE: $TaskId"
}
if ($task.status -eq "BLOCKED") {
  throw "Task is BLOCKED: $TaskId"
}

$nowUtc = (Get-Date).ToUniversalTime().ToString("o")
$task.status = "IN_PROGRESS"
$task.updatedAtUtc = $nowUtc
$task.filesTouched = @($task.filesTouched + $FilesTouched | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)

$run.currentTaskId = $TaskId
$run.phase = "REVIEW"
$run.status = "ACTIVE"
$run.updatedAtUtc = $nowUtc
$run.tasks = $tasks

$history = @($run.history | Where-Object { $null -ne $_ })
$history += [ordered]@{
  atUtc = $nowUtc
  role = "FIXER"
  action = "FIX_RECORDED"
  notes = "$TaskId $Notes"
}
$run.history = $history

$run | ConvertTo-Json -Depth 100 | Set-Content -Path $runPath -Encoding UTF8

Write-Output "Fix recorded for: $TaskId"
