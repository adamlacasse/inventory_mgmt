# TASK-016: Current Inventory CSV Export API

## Context

The product specification calls for basic inventory export. MVP needs a simple CSV endpoint for current inventory so operators can produce shareable records.

## Scope

- In scope:
  - Implement current inventory CSV endpoint.
  - Reuse inventory snapshot/filter logic to ensure CSV matches UI/API totals.
  - Set correct headers for CSV download.
  - Add tests for CSV format and filtered exports.
- Out of scope:
  - Advanced report templates.
  - Scheduled/report email delivery.

## Files To Touch

- `apps/web/app/api/reports/*`
- `apps/web/src/*` (CSV formatter/utilities)
- `apps/web/tests/*` (CSV route tests)
- `packages/domain/src/modules/reporting/*` (only if reporting service contract is implemented here)

## Acceptance Criteria

1. Endpoint returns CSV with columns: `Product Name,Category,Lot,Units On Hand`.
2. CSV rows match current inventory snapshot logic for the same filters.
3. Response headers set content type and downloadable filename.
4. Empty inventory exports include headers and zero data rows.
5. Tests verify formatting, escaping, header row, and filter parity with snapshot API.

## Test Plan

- Unit:
  - Add CSV formatter tests for quoting/escaping edge cases.
- Integration:
  - Add API tests comparing CSV row count to inventory API row count.
- E2E:
  - N/A (CSV button flow validated in UI/e2e tasks).

## Risk Assessment

- Functional risk: Medium.
- Data risk: Medium.
- Compliance risk: Medium (export inaccuracies can misstate inventory).

## Rollback Plan

Revert report route and formatter changes; keep inventory API unaffected.
