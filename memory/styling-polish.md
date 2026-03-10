# UI Styling Polish — Change Record

All styling lives in `apps/web/app/globals.css` plus inline styles in `packages/ui/src/` components.
No Tailwind. No CSS modules. No new libraries.

---

## Architectural Context

The app has two styling surfaces that must be kept in sync:

| Surface | Where | Affects |
|---|---|---|
| CSS classes | `apps/web/app/globals.css` | Any element using `.section-card`, `.btn-brand`, etc. |
| Inline styles | `packages/ui/src/SectionCard.tsx`, `FilterToolbar.tsx` | Components rendered via `@inventory/ui` package |

**If you change a visual property in `globals.css`, check whether the same property is hardcoded in a `packages/ui` component.** This caused a bug in round 1 where border-radius and card header contrast were updated in CSS but the actual form cards (Intake, History, Products) still showed the old values because they use `<SectionCard>` from the package.

---

## Design Decisions

**Brand palette:**
- Charcoal `#1c252c` — primary backgrounds, text, button fills
- Amber `#fdc740` — accent, hover states, active indicators
- Cream `#f9f7f4` — page background

**Nav active state:** Uses `box-shadow: inset 0 -2px 0 var(--color-org-amber)` (bottom border) rather than a background tint. Rationale: on the dark charcoal header, a background tint at any reasonable opacity is nearly invisible. A 2px bottom border reads clearly.

**Inactive nav links** are set to 60% white (not 75%) so the contrast between active (amber) and inactive is stronger.

**Nav hover** goes to 95% white (not amber). Amber is reserved exclusively for "active page" to avoid ambiguity.

**Badges** use `border-radius: 9999px` (pill) — chosen over a fixed radius to match modern SaaS conventions and to look intentional at varying text lengths.

**h1 font:** Cormorant Infant at `font-weight: 600`, `font-size: 2.25rem`. The 600 weight is included in the Google Fonts import. At lower weights the serif looks too delicate at page-heading size.

**Button heights:** All three main buttons (`btn-brand`, `btn-outline`, `btn-danger-outline`) are normalized to `8px` vertical padding + `line-height: 1.4`. Previously `btn-brand` was taller, causing misaligned action rows.

---

## Round 1 — Initial Polish (10 items, all complete)

### 1. Border-radius modernization
**Files:** `globals.css`, `packages/ui/src/SectionCard.tsx`, `packages/ui/src/FilterToolbar.tsx`
- Cards, modals, login: `4px` → `8px`
- Inputs: `4px` → `6px`
- Buttons: `4px` → `6px`
- Badges: `4px` → `9999px` (pill)
- Note: had to fix both `globals.css` AND the package inline styles (see architecture note above)

### 2. Active nav link indicator
**Files:** `apps/web/src/components/NavLinks.tsx` (new), `apps/web/app/layout.tsx`, `globals.css`
- Extracted nav links from `layout.tsx` (Server Component) into `NavLinks.tsx` (Client Component) to use `usePathname()`
- Home uses `exact: true` match; all other links use `startsWith`
- Active class: `nav-link-active` — initially a background tint, later revised (see Round 2)

### 3. Normalize button heights
**Files:** `globals.css`, `apps/web/src/modules/history/HistoryPageView.tsx`
- `btn-brand`: `10px 20px` → `8px 18px` + `line-height: 1.4`
- `btn-outline`, `btn-danger-outline`: `6px 12px` → `8px 14px` + `line-height: 1.4`
- Removed inline `style={{ padding: "6px 12px" }}` override on the Lock button in HistoryPageView

### 4. Section card header contrast
**Files:** `globals.css`, `packages/ui/src/SectionCard.tsx`
- Background: `rgba(28,37,44,0.02)` → `rgba(28,37,44,0.05)`
- Text: `rgba(28,37,44,0.5)` → `rgba(28,37,44,0.75)`
- Fixed in both CSS class and package inline styles

### 5. Module card call-to-action arrow
**Files:** `apps/web/app/page.tsx`, `globals.css`
- Added `<span class="module-card-arrow">→</span>` inside each card
- Arrow is muted by default, animates to amber + `translateX(3px)` on hover

### 6. Page title hierarchy
**Files:** `globals.css`
- `h1`: `font-size: 2rem`, `line-height: 1.2` (later revised to `2.25rem` + `font-weight: 600` in Round 2)
- `.page-subtitle`: `font-size: 0.9375rem`, `line-height: 1.5`, `margin-top: 6px`

### 7. Table alternating row tint
**Files:** `globals.css`
- `.row-odd`: `rgba(28,37,44,0.02)` → `rgba(28,37,44,0.035)` (was imperceptible)

### 8. Body typography baseline
**Files:** `globals.css`
- Added to `body`: `font-family` (system stack), `font-size: 15px`, `line-height: 1.5`, `-webkit-font-smoothing: antialiased`

### 9. Filter toolbar + table grouping
**Files:** `apps/web/src/modules/inventory/InventoryPageView.tsx`, `apps/web/src/modules/history/HistoryPageView.tsx`, `globals.css`
- Added `.filter-table-group` CSS class: `flex-direction: column; gap: 12px`
- Wrapped FilterToolbar + data table in both page views to tighten their relationship visually

### 10. Export CSV moved out of primary nav
**Files:** `apps/web/app/layout.tsx`
- Moved `Export CSV` link to after the `nav-divider`, alongside Admin/Logout
- Rationale: it's a utility action, not a page navigation destination

---

## Round 2 — Contrast and Visual Weight (after screenshot review)

Triggered by: user feedback that "navbar has no contrast" after seeing a screenshot.

### Nav active state redesigned
**Files:** `globals.css`
- Replaced `background-color: rgba(253,199,64,0.1)` with `box-shadow: inset 0 -2px 0 var(--color-org-amber)`
- Inactive links: `rgba(255,255,255,0.75)` → `rgba(255,255,255,0.6)` (darker = stronger active/inactive contrast)
- Hover: changed from amber to `rgba(255,255,255,0.95)` (amber reserved for active-only)
- Added `font-weight: 500` to nav links
- Nav gap: `4px` → `2px`

### Package component inline styles fixed
**Files:** `packages/ui/src/SectionCard.tsx`, `packages/ui/src/FilterToolbar.tsx`
- Found that round 1 CSS changes never reached these components (they use inline styles)
- Fixed `borderRadius: "4px"` → `"8px"` in both
- Fixed SectionCard heading background and text color to match round 1 intent

### h1 weight and size
**Files:** `globals.css`
- `font-size: 2rem` → `2.25rem`
- Added `font-weight: 600` (Cormorant Infant 600 weight is included in the Google Fonts import)

### Module card label
**Files:** `globals.css`
- Added explicit `font-size: 1rem` to `.module-card-label`

---

## Open Questions / Future Work

- The `packages/ui` components are a maintenance hazard — their inline styles duplicate values from `globals.css` tokens. Long-term, they should either accept className props or consume CSS custom properties directly.
- `Export CSV` in the nav still renders as a plain text link. A small icon would visually distinguish it as a download action.
- No dark mode support exists. The Primer ThemeProvider is set to `colorMode="day"` permanently.
- Mobile nav wrapping: at narrow widths the nav links wrap to a second line. A hamburger or collapsing nav has not been addressed.
