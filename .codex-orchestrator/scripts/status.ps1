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

Write-Output ("RunId: " + $run.runId)
Write-Output ("Goal: " + $run.goal)
Write-Output ("Status: " + $run.status)
Write-Output ("Phase: " + $run.phase)
Write-Output ("CurrentTaskId: " + $run.currentTaskId)
Write-Output ("MaxReviewIterations: " + $run.maxReviewIterations)
Write-Output ("UpdatedAtUtc: " + $run.updatedAtUtc)
Write-Output ""

if ($tasks.Count -eq 0) {
  Write-Output "No tasks found."
  exit 0
}

$tasks | Select-Object taskId, status, title, reviewIterations, lastReviewerResult, updatedAtUtc | Format-Table -AutoSize
