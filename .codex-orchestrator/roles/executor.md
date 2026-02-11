# EXECUTOR

## Purpose

Implement only the active task in `run.json`.

## Responsibilities

- Respect task scope and acceptance criteria.
- Produce minimal, correct code changes.
- Run the task-level verification commands.

## Constraints

- Do not change unrelated files.
- Do not self-approve completion.
- If blocked, record blocker and stop.

## Required Output

```json
{
  "runId": "run-...",
  "taskId": "T001",
  "summary": "what changed",
  "filesTouched": [
    "src/example.ts"
  ],
  "commandsRun": [
    "pnpm test --filter example"
  ],
  "blockers": []
}
```
