# Overnight Ralph Loop

## Purpose

Run a bounded overnight delivery loop that continues task execution while protecting compliance-critical inventory behavior.

## Preconditions

- `main` is clean before starting.
- Task files are present in `tasks/` with clear acceptance criteria.
- Dependencies are installed (`pnpm install`).
- Environment is configured (`.env` from `.env.example`).

## Suggested Task Order

1. `tasks/TASK-002-intake-transaction-creation-with-line-items.md`
2. `tasks/TASK-003-outtake-transaction-creation-with-inventory-guardrails.md`
3. `tasks/TASK-004-transaction-lock-unlock-flow.md`
4. `tasks/TASK-005-current-inventory-table-with-filters.md`

## Copy/Paste Prompt

```text
You are running an overnight Ralph loop in this repository.

Primary objective:
- Complete queued task files sequentially, one task per branch, without regressions.

Hard constraints:
- Follow AGENTS.md exactly.
- Work from one task file at a time in tasks/.
- Keep changes scoped to the task acceptance criteria.
- Prefer one module boundary per task.
- Add or update tests for behavior changes.
- Never allow:
  - outtake above units on hand
  - mutation of locked transactions without explicit unlock flow
  - broken product uniqueness (name + category + lot)

Execution loop for each task:
1) Open the task file and restate acceptance criteria.
2) Create branch: task/TASK-###-short-name
3) Implement only in listed files.
4) Add/update tests required by the task.
5) Run:
   - pnpm typecheck
   - pnpm test
   - pnpm test:e2e
   - pnpm db:migrate:status
6) If all pass:
   - Commit with conventional commit message.
   - Push branch to origin.
   - If GitHub CLI is available, open a PR with required evidence.
   - If GitHub CLI is not available, write PR-ready evidence to a markdown file under docs/runbooks/overnight-reports/.
   - Write a handoff note including:
     - task ID
     - acceptance criteria checklist
     - risk notes for inventory/locking behavior
     - commands run with result summary
     - screenshots for UI changes
7) Move to the next task.

Stop conditions (exit loop and report):
- Any merge-blocking invariant is violated.
- The same failing gate repeats twice for the same task.
- Required task acceptance criteria cannot be met without expanding scope.
- Unexpected unrelated file changes appear.

Output format after each task:
- Branch name
- Commit SHA
- Pass/fail for each quality gate
- Remaining risks
- Next recommended task
```

## Autonomous Mode (No Human In Loop)

Use this mode when you want unattended execution after one kickoff action.

1. Ensure `main` is clean and push the latest commit.
2. Start a persistent session and prevent sleep:

```bash
tmux new -s ralph
caffeinate -dimsu
```

3. Start your coding agent in repo root and paste the prompt above.
4. Let the agent run all queued tasks sequentially.
5. Review in the morning by checking:
   - pushed `task/TASK-###-*` branches
   - PRs (if auto-created)
   - `docs/runbooks/overnight-reports/` handoff notes

No Claude/ChatGPT CLI libraries are required. One agent runner is enough.

## Operator Notes

- Do not auto-merge overnight; keep auto-push + auto-PR only.
- Keep a maximum of one in-flight branch per task file.
- Re-run `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm db:migrate:status` before merging any overnight branch.
