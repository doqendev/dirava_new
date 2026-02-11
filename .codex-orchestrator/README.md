# Codex Role-Switched Orchestrator

Standalone orchestration system for a single Codex session with explicit role switching.
This is separate from `.omc` and does not depend on any existing plugin state.

## Goals

- Replicate a team-like workflow with one Codex instance.
- Enforce deterministic `PASS` or `FAIL` review gates.
- Keep run state on disk so loops are resumable.

## Workflow

1. `ARCHITECT` and `CRITIC` align scope and risks (optional but recommended).
2. `PLANNER` decomposes the goal into testable tasks.
3. `EXECUTOR` implements one task.
4. `REVIEWER` validates and returns `PASS` or `FAIL`.
5. `FIXER` handles reviewer findings.
6. Repeat `REVIEWER <-> FIXER` until `PASS` or max iterations.
7. Continue with next task until all tasks are `DONE`.

## Directory Layout

```text
.codex-orchestrator/
  README.md
  loop-contract.md
  roles/
    coordinator.md
    architect.md
    critic.md
    planner.md
    executor.md
    reviewer.md
    fixer.md
  templates/
    planner-output.json
    review-output.json
    fix-output.json
  scripts/
    new-run.ps1
    list-runs.ps1
    add-task.ps1
    start-task.ps1
    record-fix.ps1
    record-review.ps1
    next-step.ps1
    status.ps1
  runs/
    .gitkeep
```

## Quick Start

```powershell
.\.codex-orchestrator\scripts\new-run.ps1 -Goal "Implement X end to end"
.\.codex-orchestrator\scripts\list-runs.ps1
.\.codex-orchestrator\scripts\add-task.ps1 -RunId run-20260211-120000 -Title "Task title" -AcceptanceCriteria "A", "B" -Tests "pnpm test"
.\.codex-orchestrator\scripts\start-task.ps1 -RunId run-20260211-120000 -TaskId T001
.\.codex-orchestrator\scripts\record-fix.ps1 -RunId run-20260211-120000 -TaskId T001 -Notes "Applied changes"
.\.codex-orchestrator\scripts\record-review.ps1 -RunId run-20260211-120000 -TaskId T001 -Result PASS -Evidence "pnpm test: pass"
.\.codex-orchestrator\scripts\next-step.ps1 -RunId run-20260211-120000
.\.codex-orchestrator\scripts\status.ps1 -RunId run-20260211-120000
```

## Operating Rules

- Reviewer is the only role that can close a task (`PASS`).
- Fixer only addresses reviewer findings, no scope creep.
- Every task must include acceptance criteria and at least one verification command.
- If a task hits max review iterations, mark `BLOCKED` and escalate.
