# Loop Contract

This file defines the strict state machine for the single-Codex role-switched loop.

## Roles

- `COORDINATOR`: Picks next role and ensures protocol compliance.
- `ARCHITECT`: Refines technical approach and risk controls.
- `CRITIC`: Challenges weak assumptions, enforces quality bars.
- `PLANNER`: Converts goal into concrete tasks.
- `EXECUTOR`: Implements exactly one active task.
- `REVIEWER`: Returns `PASS` or `FAIL` with evidence.
- `FIXER`: Resolves reviewer findings only.

## Task States

- `PENDING`
- `IN_PROGRESS`
- `REVIEW_FAILED`
- `DONE`
- `BLOCKED`

## Run Phases

- `PLANNING`
- `EXECUTION`
- `REVIEW`
- `REMEDIATION`
- `COMPLETE`
- `BLOCKED`

## State Transitions

- `PENDING -> IN_PROGRESS`: `start-task.ps1`
- `IN_PROGRESS -> REVIEW`: `record-fix.ps1`
- `REVIEW -> DONE`: `record-review.ps1 -Result PASS`
- `REVIEW -> REVIEW_FAILED`: `record-review.ps1 -Result FAIL`
- `REVIEW_FAILED -> IN_PROGRESS`: `record-fix.ps1`
- `REVIEW_FAILED -> BLOCKED`: automatic on max review iterations

## Review Gate Rules

- Reviewer output must include:
  - Explicit `PASS` or `FAIL`
  - Findings (if fail)
  - Evidence commands and outcomes
- A task cannot be marked `DONE` without reviewer `PASS`.
- If reviewer fails a task and max iterations are reached, task becomes `BLOCKED`.

## Completion Rules

- Run becomes `COMPLETE` only when all tasks are `DONE`.
- No role may claim completion without current run state proving completion.
