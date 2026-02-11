$ErrorActionPreference = "Stop"

$orchestratorRoot = Split-Path -Parent $PSScriptRoot
$runsRoot = Join-Path $orchestratorRoot "runs"

if (-not (Test-Path $runsRoot)) {
  Write-Output "No runs directory found."
  exit 0
}

$runJsonFiles = Get-ChildItem -Path $runsRoot -Recurse -Filter "run.json" -File
if (-not $runJsonFiles -or $runJsonFiles.Count -eq 0) {
  Write-Output "No runs found."
  exit 0
}

$rows = @()
foreach ($file in $runJsonFiles) {
  try {
    $run = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
    $rows += [PSCustomObject]@{
      RunId = $run.runId
      Status = $run.status
      Phase = $run.phase
      CurrentTaskId = $run.currentTaskId
      UpdatedAtUtc = $run.updatedAtUtc
      Goal = $run.goal
    }
  } catch {
    $rows += [PSCustomObject]@{
      RunId = Split-Path -Parent $file.FullName
      Status = "INVALID_JSON"
      Phase = ""
      CurrentTaskId = ""
      UpdatedAtUtc = ""
      Goal = ""
    }
  }
}

$rows | Sort-Object UpdatedAtUtc -Descending | Format-Table -AutoSize
