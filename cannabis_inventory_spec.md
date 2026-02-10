# Cannabis Inventory Management System - Specification Document

**Client:** Tony (Vermont legal cannabis retailer)  
**Developer:** [Your name]  
**Date:** February 9, 2026  
**Project Type:** Prototype → Production system

---

## Executive Summary

Tony currently uses Ninox (low-code database tool) for inventory management but has hit technical limitations. He needs a clean, functional inventory system that handles:

- Product intake (receiving inventory)
- Product outtake (sales/depletion)
- Real-time inventory tracking by product, category, and lot number
- Transaction locking for compliance/audit purposes

**Key constraint:** Tony is non-technical and needs something simple and intuitive.

---

## Business Context

- **Industry:** Legal cannabis retail (Vermont)
- **Regulatory requirements:** Seed-to-sale tracking, lot-level traceability, transaction audit trail
- **User:** Single operator (Tony), potentially 1-2 staff members
- **Current pain points:**
  - Ninox is too complex/fragile for his needs
  - AI-generated code creating technical issues rather than solving business problems
  - Lacks clear understanding of what he actually needs

---

## Core Requirements

### 1. Product Master Data

- **Product Names** (e.g., "Blue Dream", "Gummy Bears")
- **Product Categories** (e.g., "Flower", "Edibles", "Concentrates")
- **Lot Numbers** (batch/tracking numbers for compliance)
- Products are uniquely identified by combination of Name + Category + Lot

### 2. Intake Management (Receiving Inventory)

- Record date of intake
- Select products (or create new product entries)
- Specify lot number for each line item
- Enter quantity/units received
- Optional notes field
- **Lock transaction after save** (prevent accidental edits)
- Edit capability (unlock and modify if needed)

### 3. Outtake Management (Sales/Depletion)

- Record date of outtake
- Optional customer name/ID
- Select from available inventory only
- Specify quantity sold/depleted
- Optional notes field
- **Lock transaction after save**
- Edit capability

### 4. Inventory Tracking

- Real-time calculation: `Units on Hand = Total Intake - Total Outtake` (per product/lot)
- View current inventory (filterable by category, product, lot)
- Low stock alerts (nice-to-have for prototype)
- Show only products with inventory > 0

### 5. Transaction History & Audit Trail

- View all intake transactions
- View all outtake transactions
- Cannot delete locked transactions
- Track who made changes (if multi-user)

### 6. Reporting (Basic)

- Current inventory report (exportable to CSV)
- Sales history by date range
- Intake history by date range
- Inventory value (if cost tracking added later)

---

## Data Model (Simplified)

### Tables/Entities

#### 1. Products

- `id` (primary key)
- `product_name` (text)
- `product_category` (text)
- `lot_number` (text)
- `created_at` (timestamp)
- **Unique constraint:** (product_name, product_category, lot_number)
- **Computed field:** `units_on_hand` (calculated from intake/outtake items)

#### 2. Intake_Transactions

- `id` (primary key)
- `date` (date)
- `notes` (text, optional)
- `saved` (boolean, default false)
- `created_at` (timestamp)

#### 3. Intake_Items (child of Intake_Transactions)

- `id` (primary key)
- `intake_transaction_id` (foreign key)
- `product_id` (foreign key to Products)
- `units` (number/decimal)

#### 4. Outtake_Transactions

- `id` (primary key)
- `date` (date)
- `customer` (text, optional)
- `notes` (text, optional)
- `saved` (boolean, default false)
- `created_at` (timestamp)

#### 5. Outtake_Items (child of Outtake_Transactions)

- `id` (primary key)
- `outtake_transaction_id` (foreign key)
- `product_id` (foreign key to Products)
- `units` (number/decimal)

#### Optional: Product_Categories (lookup table)

- `id`
- `category_name` (text, unique)

#### Optional: Admin/Users (if multi-user needed later)

- `id`
- `username`
- `role`

---

## Key Business Rules

1. **Transaction Locking**
   - Once an intake/outtake is "saved", fields become read-only
   - "Edit" button unlocks the transaction
   - Cannot delete saved transactions (only archive/void)

2. **Inventory Validation**
   - Cannot sell more units than available in inventory
   - Outtake items can only select from products with `units_on_hand > 0`

3. **Product Creation**
   - Products are auto-created when first intake is saved
   - Same product + category + different lot = new product record

4. **Data Integrity**
   - All intake/outtake items must reference a valid product
   - Units must be > 0
   - Saved transactions cannot have orphaned items

---

## Prototype Scope (MVP - Days 1-2)

### Must Have

- [ ] Product master list (view, add, edit)
- [ ] Create intake transaction with line items
- [ ] Create outtake transaction with line items
- [ ] Lock/unlock transactions (saved flag)
- [ ] Current inventory view with filtering
- [ ] Basic calculation: units on hand per product
- [ ] Simple, clean UI that Tony can navigate

### Should Have (time permitting)

- [ ] Transaction history view
- [ ] CSV export of current inventory
- [ ] Low stock indicator (< 10 units or configurable)
- [ ] Search/filter products by name or category

### Won't Have (v1)

- Multi-user authentication
- Advanced reporting/analytics
- Barcode scanning
- Integration with POS systems
- Cost/pricing tracking
- Automated compliance reporting

---

## Technical Stack Options

### Option A: Modern Full-Stack (Recommended)

- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend:** Next.js API routes + Prisma ORM
- **Database:** PostgreSQL (via Supabase or local)
- **Deployment:** Vercel (free tier)
- **Why:** Fast development, scales easily, Tony can access via web browser

### Option B: Simple Python Web App

- **Frontend:** HTML + htmx + Tailwind
- **Backend:** FastAPI or Flask
- **Database:** SQLite (local) or PostgreSQL
- **Deployment:** Simple VPS or local network
- **Why:** Lightweight, can run on cheap hardware, less JS complexity

### Option C: Desktop App (if Tony prefers local)

- **Framework:** Electron + React or Tauri + React
- **Database:** SQLite
- **Why:** Works offline, no hosting needed, more "app-like" feel

---

## User Interface Guidelines

### Design Principles

- **Simple over clever:** Tony is non-technical
- **Clear labels:** "Add Intake", "Record Sale", not "Create Transaction"
- **Minimal clicks:** Common actions accessible in 1-2 clicks
- **Visual feedback:** Clear save confirmations, error messages
- **Mobile-friendly:** Tony might use tablet/phone in shop

### Key Screens

1. **Dashboard/Home**
   - Current inventory summary
   - Quick links to add intake/outtake
   - Recent transactions

2. **Add Intake**
   - Date picker
   - Add product lines (search or create new)
   - Lot number entry per line
   - Units received
   - Save button (locks transaction)

3. **Add Outtake**
   - Date picker
   - Customer field (optional)
   - Select from available inventory (filtered picker)
   - Units sold
   - Save button

4. **Current Inventory**
   - Table: Product | Category | Lot | Units on Hand
   - Filters: Category, search by name
   - Export to CSV button

5. **Transaction History**
   - Tabs: Intakes | Outtakes
   - List view with date, items, status
   - Edit button (unlocks if needed)

---

## Migration from Ninox

If Tony has existing data in Ninox:

1. Export Ninox data to CSV
2. Create data import script
3. Map Ninox fields to new schema
4. Validate imported data
5. Run in parallel for 1-2 weeks before full cutover

---

## Success Metrics (Prototype Demo)

Tony should be able to:

1. Add a new product intake in < 2 minutes
2. Record a sale in < 1 minute
3. Check current inventory for a product in < 30 seconds
4. Understand how to use the system without a manual

---

## Next Steps

1. **Choose tech stack** (discuss with Tony if he has preferences/constraints)
2. **Build prototype** (1-2 days)
3. **Demo to Tony** with dummy data
4. **Gather feedback** on UI/workflow
5. **Scope production version** with pricing
6. **Data migration plan** (if proceeding)

---

## Questions for Tony (Optional - if you get a chance)

- Do you need this accessible from multiple locations, or just one computer?
- Do you have any employees who will use this, or just you?
- What device do you primarily use? (Computer, tablet, phone)
- Do you have existing data in Ninox that needs to be migrated?
- Are there any Vermont-specific compliance reports you need to generate?
- Do you track product costs/pricing, or just quantities?

---

## Cannabis-Specific Considerations (Future)

While not in prototype scope, be aware Tony may eventually need:

- THC/CBD percentage tracking
- Expiration date tracking
- Waste/disposal logging
- Transfer manifests (if sending to other locations)
- Integration with Vermont's tracking system (if required)
- Age verification logging for sales
- Medical vs recreational differentiation

---

## Notes from Original Ninox Document

- Tony's current system has excessive complexity around "return-type mismatches"
- He's been fighting technical issues rather than solving business problems
- The "Save" and "Edit" pattern is important to him (transaction locking)
- He thinks in terms of "lines" (intake items, outtake items)
- Uses references/IDs rather than text matching for data integrity
- Has a "Rebuild Products" function suggesting data integrity issues

**Key insight:** Tony needs something that "just works" without him understanding databases, foreign keys, or type systems.

---

## Contact & Project Files

- **This spec:** `cannabis_inventory_spec.md`
- **Original Ninox reference:** `Ninox_GBIT_Minimal_Reference_Build.pdf`
- **Prototype repo:** [To be created]
- **Demo URL:** [To be deployed]

---

**Document Version:** 1.0  
**Last Updated:** February 9, 2026
