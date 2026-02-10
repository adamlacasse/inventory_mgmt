# Agent Collaboration Guide

This file defines how AI agents should work in this repository.

## Goal

Ship reliable inventory functionality quickly without regressions in compliance-critical flows.

## Team Mode

- Current mode is solo development led by `@adamlacasse`.
- Do not assume fixed AI-agent role ownership unless explicitly assigned in writing.
- Treat `MODULE_OWNERSHIP.md` as informational until role assignments are introduced.
- Do not change `.github/CODEOWNERS` or ownership docs unless requested.

## Ground Rules

- Work from a task file in `tasks/`.
- Keep changes scoped to the task acceptance criteria.
- Do not modify unrelated files.
- Prefer editing inside one module boundary per task.
- Add or update tests for behavior changes.
- Preserve transaction locking and inventory validation behavior.

## Module Boundaries

- `apps/web`: presentation and route handlers only
- `packages/domain`: business rules, validation, and pure logic
- `packages/db`: persistence schema and migration changes
- `packages/ui`: reusable components without business logic

## Required PR Evidence

- Task ID and acceptance criteria
- Risk notes for inventory/locking behavior
- Commands run with result summary
- Screenshots for UI changes

## Do Not Merge If

- Outtake can exceed on-hand units
- Locked transactions are mutable without explicit unlock flow
- Product uniqueness (`name + category + lot`) is broken
- Tests for changed behavior are missing

## Branching Convention

- `task/TASK-###-short-name`

## Commit Convention

- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
