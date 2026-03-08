# TASK-036: Tailwind CSS + shadcn/ui Styling Refactor

## Status
In progress — 2026-03-08

## Goal
Replace the hand-rolled BEM CSS in `globals.css` with Tailwind CSS v4 + shadcn/ui components. The result should be a polished, consistent, accessible UI that is far easier to extend going forward.

## Constraints
- Zero changes to server logic, API routes, Prisma schema, or tests
- All quality gates must still pass after the refactor (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`)
- Preserve brand colors (charcoal `#1c252c`, amber `hsla(42,100%,63%)`, cream bg `#f9f7f4`) and the Cormorant Infant serif font
- Project uses **Biome** for lint/format (not ESLint/Prettier) — shadcn output must pass Biome

## Files Touched

### New / config
- `apps/web/postcss.config.mjs` — Tailwind v4 PostCSS plugin
- `apps/web/src/lib/utils.ts` — `cn()` helper
- `apps/web/components.json` — shadcn config

### Modified
- `apps/web/package.json` — add Tailwind + shadcn deps
- `apps/web/app/globals.css` — replace BEM rules with Tailwind directives + brand theme vars
- `apps/web/app/layout.tsx`
- `apps/web/app/login/page.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/admin/users/AdminUsersClient.tsx`
- `apps/web/src/modules/auth/LogoutButton.tsx`
- `apps/web/src/modules/inventory/InventoryPageView.tsx`
- `apps/web/src/modules/intake/IntakePageView.tsx`
- `apps/web/src/modules/outtake/OuttakePageView.tsx`
- `apps/web/src/modules/history/HistoryPageView.tsx`
- `apps/web/src/modules/products/ProductPageView.tsx`

### New shadcn components (generated into `apps/web/src/components/ui/`)
- button, input, label, select, textarea, table, badge, card, alert, checkbox, separator

---

## Phase 1 — Tooling Setup

### 1.1 Install Tailwind v4 + shadcn
```bash
cd apps/web
pnpm add tailwindcss @tailwindcss/postcss postcss
pnpm dlx shadcn@latest init  # interactive: choose neutral base, CSS vars, src/ dir
```

### 1.2 PostCSS config
Create `apps/web/postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

### 1.3 globals.css
Replace BEM rules with:
```css
@import "tailwindcss";

/* Brand theme */
@theme {
  --color-charcoal: #1c252c;
  --color-amber: hsla(42.13, 100%, 63.14%, 1);
  --color-cream: #f9f7f4;
  --font-serif: "Cormorant Infant", Georgia, serif;
}
```
Keep Google Fonts import and any reset rules.

### 1.4 cn() utility
`apps/web/src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 1.5 shadcn components.json
Configure alias paths to match the project structure (`@/src/...`).

---

## Phase 2 — Install shadcn Components

Run for each:
```bash
pnpm dlx shadcn@latest add button input label select textarea table badge card alert checkbox separator
```

Generated into: `apps/web/src/components/ui/`

---

## Phase 3 — Component Migration

### 3a layout.tsx
- Use Tailwind utility classes directly on `<header>`, `<nav>`, links
- Sticky charcoal header, amber brand text, white/muted nav links with amber hover
- Retain all existing links, logo image, admin conditional, SpeedInsights

### 3b login/page.tsx + LogoutButton.tsx
- Centered login card using `<Card>` from shadcn
- `<Input>` + `<Label>` + `<Button>` from shadcn
- Logo image centered above form
- LogoutButton: use shadcn `<Button variant="ghost">`

### 3c InventoryPageView.tsx
- `<Alert>` for low-stock banner (destructive variant) and clear banner (green tint via className)
- `<Input>` for filters, `<Checkbox>` for low-stock-only
- `<Table>` + `<TableHeader>` + `<TableBody>` + `<TableRow>` + `<TableHead>` + `<TableCell>`
- `<Badge>` for stock status (red/green variants)
- Filter row: flex row with gap

### 3d IntakePageView.tsx
- Page heading + description
- `<Card>` wrapping each line item article
- `<Input>`, `<Label>`, `<Select>`, `<Textarea>` from shadcn
- `<Button>` for add line / remove line / submit
- Error/success as `<Alert>`

### 3e OuttakePageView.tsx
- Same pattern as Intake
- `<Select>` for product/inventory picker
- `<Button variant="destructive">` for Remove Line where appropriate

### 3f HistoryPageView.tsx
- Filter controls in a `<Card>`
- Each transaction as a `<Card>` with header (type badge, ID, date, lock status)
- `<Table>` for line items inside each card
- Lock/Unlock as `<Button>` with appropriate variant
- `<Badge>` for transaction type (intake = blue-tinted, outtake = amber-tinted)

### 3g ProductPageView.tsx
- Create product form in a `<Card>`
- Products list as `<Table>`
- Edit form appearing inline or in a second `<Card>`
- `<Button variant="outline">` for Edit, `<Button>` for Save/Create

### 3h app/page.tsx (home)
- Check current content; style with Tailwind if needed

### 3i AdminUsersClient.tsx
- Add User form in a `<Card>`
- Users table with `<Badge>` for role, status text colored with Tailwind classes
- Edit role inline with `<Select>` + save/cancel `<Button>`s
- Deactivate as `<Button variant="destructive">`

---

## Phase 4 — Cleanup & Verification

1. Delete all BEM rules from `globals.css` (keep only `@import "tailwindcss"`, `@theme`, Google font import, and any global resets)
2. Verify no orphaned `className="xxx-yyy"` BEM references remain
3. Run quality gates:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm test:e2e
   ```
4. Fix any Biome lint issues in generated shadcn files (typically: missing `type` on buttons, unused imports, non-null assertions)

---

## Definition of Done
- All pages render with Tailwind + shadcn styling
- Brand identity preserved (charcoal, amber, Cormorant Infant)
- Zero BEM class names remain
- All quality gates pass
- No server logic or test files modified
