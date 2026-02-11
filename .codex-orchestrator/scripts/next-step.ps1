param(
  [Parameter(Mandatory = $true)]
  [string]$RunId
)

$ErrorActionPreference = "Stop"

$orchestratorRoot = Split-Path -Parent $PSScriptRoot
$runPath = Join-Path $orchestratorRoot ("runs\" + $RunId + "\run.json")

if (-not (Test-Path $runPath)) {
  throw "Run not found: $RunId"
}

$run = Get-Content -Path $runPath -Raw | ConvertFrom-Json
$tasks = @($run.tasks | Where-Object { $null -ne $_ })
$activeTask = $null
if ($run.currentTaskId) {
  $activeTask = $tasks | Where-Object { $_.taskId -eq $run.currentTaskId } | Select-Object -First 1
}

$output = [ordered]@{
  runId = $run.runId
  status = $run.status
  phase = $run.phase
  taskId = $run.currentTaskId
  nextRole = ""
  reason = ""
  suggestedCommand = ""
}

if ($run.status -eq "COMPLETE" -or $run.phase -eq "COMPLETE") {
  $output.nextRole = "STOP"
  $output.reason = "Run complete"
  $output.suggestedCommand = ".\.codex-orchestrator\scripts\status.ps1 -RunId $RunId"
} elseif ($run.status -eq "BLOCKED" -or $run.phase -eq "BLOCKED") {
  $output.nextRole = "ESCALATE"
  $output.reason = "At least one task is blocked"
  $output.suggestedCommand = ".\.codex-orchestrator\scripts\status.ps1 -RunId $RunId"
} elseif ($run.phase -eq "PLANNING") {
  $output.nextRole = "PLANNER"
  $output.reason = "No execution started"
  $output.suggestedCommand = ".\.codex-orchestrator\scripts\add-task.ps1 -RunId $RunId -Title '<title>' -AcceptanceCriteria '<criterion>' -Tests '<command>'"
} elseif ($run.phase -eq "EXECUTION") {
  if ($activeTask -and $activeTask.status -eq "IN_PROGRESS") {
    $output.nextRole = "EXECUTOR"
    $output.reason = "Active task in progress"
    $output.suggestedCommand = ".\.codex-orchestrator\scripts\record-fix.ps1 -RunId $RunId -TaskId $($activeTask.taskId) -Notes 'implementation complete'"
  } else {
    $nextPending = $tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($nextPending) {
      $output.nextRole = "COORDINATOR"
      $output.reason = "Need to start next pending task"
      $output.suggestedCommand = ".\.codex-orchestrator\scripts\start-task.ps1 -RunId $RunId -TaskId $($nextPending.taskId)"
    } else {
      $output.nextRole = "REVIEWER"
      $output.reason = "No pending tasks found; verify completion state"
      $output.suggestedCommand = ".\.codex-orchestrator\scripts\status.ps1 -RunId $RunId"
    }
  }
} elseif ($run.phase -eq "REVIEW") {
  $output.nextRole = "REVIEWER"
  $output.reason = "Awaiting review decision"
  if ($run.currentTaskId) {
    $output.suggestedCommand = ".\.codex-orchestrator\scripts\record-review.ps1 -RunId $RunId -TaskId $($run.currentTaskId) -Result PASS -Evidence '<evidence>'"
  } else {
    $output.suggestedCommand = ".\.codex-orchestrator\scripts\status.ps1 -RunId $RunId"
  }
} elseif ($run.phase -eq "REMEDIATION") {
  $output.nextRole = "FIXER"
  $output.reason = "Reviewer failed current task"
  if ($run.currentTaskId) {
    $output.suggestedCommand = ".\.codex-orchestrator\scripts\record-fix.ps1 -RunId $RunId -TaskId $($run.currentTaskId) -Notes 'fixed findings'"
  } else {
    $output.suggestedCommand = ".\.codex-orchestrator\scripts\status.ps1 -RunId $RunId"
  }
} else {
  $output.nextRole = "COORDINATOR"
  $output.reason = "Unknown phase, inspect state"
  $output.suggestedCommand = ".\.codex-orchestrator\scripts\status.ps1 -RunId $RunId"
}

$output | ConvertTo-Json -Depth 10
