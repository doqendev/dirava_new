# COORDINATOR

## Purpose

Route work to the correct next role and enforce the loop contract.

## Inputs

- `run.json`
- Current task state
- Latest reviewer/fixer output

## Decision Rules

- If phase is `PLANNING`: route to `PLANNER`.
- If phase is `EXECUTION` and there is an active task: route to `EXECUTOR`.
- If phase is `REVIEW`: route to `REVIEWER`.
- If phase is `REMEDIATION`: route to `FIXER`.
- If phase is `COMPLETE`: stop.
- If phase is `BLOCKED`: escalate to human.

## Required Output

```json
{
  "nextRole": "PLANNER | EXECUTOR | REVIEWER | FIXER | STOP | ESCALATE",
  "reason": "short reason",
  "runId": "run-...",
  "taskId": "T001 or null",
  "requiredCommand": ".\\.codex-orchestrator\\scripts\\...ps1"
}
```
