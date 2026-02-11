param(
  [Parameter(Mandatory = $true)]
  [string]$RunId,
  [Parameter(Mandatory = $true)]
  [string]$TaskId,
  [Parameter(Mandatory = $true)]
  [ValidateSet("PASS", "FAIL")]
  [string]$Result,
  [string[]]$Findings = @(),
  [string[]]$Evidence = @(),
  [string]$Reviewer = "REVIEWER"
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
if ($task.status -eq "DONE" -and $Result -eq "PASS") {
  throw "Task already DONE: $TaskId"
}

$nowUtc = (Get-Date).ToUniversalTime().ToString("o")
$iteration = [int]$task.reviewIterations + 1
$task.reviewIterations = $iteration
$task.lastReviewerResult = $Result
$task.findings = @($Findings)
$task.evidence = @($Evidence)
$task.updatedAtUtc = $nowUtc

$reviews = @($task.reviews | Where-Object { $null -ne $_ })
$reviews += [ordered]@{
  atUtc = $nowUtc
  reviewer = $Reviewer
  result = $Result
  iteration = $iteration
  findings = @($Findings)
  evidence = @($Evidence)
}
$task.reviews = $reviews

if ($Result -eq "PASS") {
  $task.status = "DONE"
  $run.currentTaskId = $null
  $run.phase = "EXECUTION"
} else {
  if ($iteration -ge [int]$run.maxReviewIterations) {
    $task.status = "BLOCKED"
    $run.phase = "BLOCKED"
    $run.status = "BLOCKED"
    $run.currentTaskId = $TaskId
  } else {
    $task.status = "REVIEW_FAILED"
    $run.phase = "REMEDIATION"
    $run.status = "ACTIVE"
    $run.currentTaskId = $TaskId
  }
}

$taskArray = @($tasks | Where-Object { $null -ne $_ })
$allDone = $taskArray.Count -gt 0 -and (($taskArray | Where-Object { $_.status -ne "DONE" }).Count -eq 0)
if ($allDone) {
  $run.status = "COMPLETE"
  $run.phase = "COMPLETE"
  $run.currentTaskId = $null
}

$run.updatedAtUtc = $nowUtc
$run.tasks = $tasks

$history = @($run.history | Where-Object { $null -ne $_ })
$history += [ordered]@{
  atUtc = $nowUtc
  role = $Reviewer
  action = "REVIEW_RECORDED"
  notes = "$TaskId $Result iteration=$iteration"
}
$run.history = $history

$run | ConvertTo-Json -Depth 100 | Set-Content -Path $runPath -Encoding UTF8

Write-Output "Review recorded: $TaskId $Result (iteration $iteration)"
