param(
  [Parameter(Mandatory = $true)]
  [string]$Goal,
  [string]$RunId = ("run-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
  [int]$MaxReviewIterations = 5
)

$ErrorActionPreference = "Stop"

$orchestratorRoot = Split-Path -Parent $PSScriptRoot
$runRoot = Join-Path $orchestratorRoot ("runs\" + $RunId)

if (Test-Path $runRoot) {
  throw "Run already exists: $RunId"
}

New-Item -ItemType Directory -Path $runRoot -Force | Out-Null

$nowUtc = (Get-Date).ToUniversalTime().ToString("o")
$runData = [ordered]@{
  runId = $RunId
  goal = $Goal
  createdAtUtc = $nowUtc
  updatedAtUtc = $nowUtc
  status = "ACTIVE"
  phase = "PLANNING"
  maxReviewIterations = $MaxReviewIterations
  currentTaskId = $null
  tasks = @()
  history = @(
    [ordered]@{
      atUtc = $nowUtc
      role = "SYSTEM"
      action = "RUN_CREATED"
      notes = "New run created"
    }
  )
}

$runPath = Join-Path $runRoot "run.json"
$journalPath = Join-Path $runRoot "journal.md"

$runData | ConvertTo-Json -Depth 50 | Set-Content -Path $runPath -Encoding UTF8
Set-Content -Path $journalPath -Encoding UTF8 -Value @"
# $RunId

Goal: $Goal

## Notes

"@

Write-Output "Created run: $RunId"
Write-Output "State file: $runPath"
