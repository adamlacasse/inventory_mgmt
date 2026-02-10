# Data Migration Runbook (Ninox)

## Planned Steps

1. Export Ninox data as CSV
2. Map Ninox fields to Prisma schema
3. Validate required keys and lot uniqueness
4. Dry-run import on staging DB
5. Reconcile counts with source data
6. Run parallel operations for 1-2 weeks
7. Cutover with backup snapshot

## Validation Checklist

- [ ] No orphan intake/outtake items
- [ ] Product uniqueness preserved
- [ ] Units are positive and balanced
- [ ] Sample rows manually verified
