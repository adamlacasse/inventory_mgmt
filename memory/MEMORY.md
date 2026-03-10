# Organizize — Claude Memory

## Project Overview
Inventory management app for Tony's Vermont legal cannabis retail (GeeBees).
Stack: Next.js 15 App Router, Prisma, Primer React v38, custom global CSS, pnpm monorepo.

## Key File Paths
- `apps/web/app/globals.css` — all custom CSS (single file, no CSS modules, no Tailwind)
- `apps/web/app/layout.tsx` — app shell: sticky header, nav, page wrapper
- `apps/web/app/page.tsx` — home dashboard (module cards)
- `apps/web/src/components/NavLinks.tsx` — client component for active nav state
- `apps/web/src/modules/` — page-level views (intake, outtake, inventory, history, products)
- `packages/ui/src/` — shared components: SectionCard, FilterToolbar, StatusBanner, StatusBadge, EmptyState

## Styling Approach
- Pure global CSS (`globals.css`) + Primer React — NO Tailwind, NO CSS modules.
- Brand tokens: `--color-org-charcoal: #1c252c`, `--color-org-amber: #fdc740`, `--color-org-cream: #f9f7f4`.
- h1 uses Cormorant Infant (Google Fonts, weight 300/400/600/700); body uses system font stack.

## ⚠️ Critical Architecture Note
`packages/ui` components (`SectionCard`, `FilterToolbar`) use **hardcoded inline styles**, not CSS classes.
Changes to `.section-card` or `.filter-toolbar` in `globals.css` do NOT affect these components.
Any visual change to those components must be made directly in their `.tsx` files.

## Styling History
See [styling-polish.md](styling-polish.md) for the full record of what was done, why, and current status.

## User Preferences
- No new libraries or frameworks for styling work.
- Document tasks before implementing so future agents can continue.
- Always update this memory after completing styling work.
