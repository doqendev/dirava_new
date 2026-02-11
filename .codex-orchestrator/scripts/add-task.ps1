param(
  [Parameter(Mandatory = $true)]
  [string]$RunId,
  [Parameter(Mandatory = $true)]
  [string]$Title,
  [string]$Description = "",
  [string[]]$AcceptanceCriteria = @(),
  [string[]]$Tests = @(),
  [string[]]$Dependencies = @()
)

$ErrorActionPreference = "Stop"

$orchestratorRoot = Split-Path -Parent $PSScriptRoot
$runPath = Join-Path $orchestratorRoot ("runs\" + $RunId + "\run.json")

if (-not (Test-Path $runPath)) {
  throw "Run not found: $RunId"
}

$run = Get-Content -Path $runPath -Raw | ConvertFrom-Json
$tasks = @($run.tasks | Where-Object { $null -ne $_ })
$nextIndex = $tasks.Count + 1
$taskId = "T{0:d3}" -f $nextIndex
$nowUtc = (Get-Date).ToUniversalTime().ToString("o")

$task = [ordered]@{
  taskId = $taskId
  title = $Title
  description = $Description
  status = "PENDING"
  acceptanceCriteria = @($AcceptanceCriteria)
  tests = @($Tests)
  dependencies = @($Dependencies)
  reviewIterations = 0
  lastReviewerResult = $null
  findings = @()
  evidence = @()
  filesTouched = @()
  reviews = @()
  createdAtUtc = $nowUtc
  updatedAtUtc = $nowUtc
}

$tasks += $task
$run.tasks = $tasks
$run.updatedAtUtc = $nowUtc

$history = @($run.history | Where-Object { $null -ne $_ })
$history += [ordered]@{
  atUtc = $nowUtc
  role = "PLANNER"
  action = "TASK_ADDED"
  notes = "$taskId $Title"
}
$run.history = $history

$run | ConvertTo-Json -Depth 100 | Set-Content -Path $runPath -Encoding UTF8

Write-Output "Added task: $taskId"
