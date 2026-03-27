# Finance Ledger — Design Spec
_Date: 2026-03-27_

## Overview

A general-purpose, admin-only payment/invoice tracking ledger. Admins can create records to track financial activity (invoices, payments, etc.) with optional links to existing loads and companies. Statuses are fully configurable from the Settings page — no code release needed to add a new status.

---

## Database Schema (`0017_payment_tracking.sql`)

### `payment_statuses`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `label` | TEXT NOT NULL | e.g. "Waiting for Payment" |
| `color` | TEXT NOT NULL | Hex string e.g. `#f59e0b` |
| `sort_order` | INTEGER DEFAULT 0 | Controls dropdown/filter order |
| `created_at` | TIMESTAMPTZ | `now()` |

RLS: admin only (all operations).

**Seed defaults:**
| Label | Color |
|---|---|
| Invoiced | `#6366f1` (indigo) |
| Waiting for Payment | `#f59e0b` (amber) |
| Payment Received | `#10b981` (emerald) |
| In Progress | `#3b82f6` (blue) |
| Overdue | `#ef4444` (red) |
| Cancelled | `#6b7280` (gray) |

### `payment_records`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | TEXT NOT NULL | Free-text label for the record |
| `description` | TEXT | Optional notes |
| `amount` | DECIMAL(12,2) | Optional ZAR amount |
| `status_id` | UUID NOT NULL | FK → `payment_statuses(id)` ON DELETE RESTRICT |
| `load_id` | UUID | FK → `loads(id)` ON DELETE SET NULL (optional) |
| `company_id` | UUID | FK → `companies(id)` ON DELETE SET NULL (optional) |
| `created_by` | UUID | FK → `auth.users(id)` |
| `created_at` | TIMESTAMPTZ | `now()` |
| `updated_at` | TIMESTAMPTZ | `now()`, updated by trigger |

RLS: admin only (all operations).
`update_updated_at()` trigger applied.
`ON DELETE RESTRICT` on `status_id` — DB prevents deleting a status still in use.

---

## Query Layer

### `database/queries/payment_statuses.ts`
- `getPaymentStatuses()` — ordered by `sort_order ASC`
- `createPaymentStatus(label, color)` — appends with next sort_order
- `updatePaymentStatus(id, { label?, color?, sort_order? })`
- `deletePaymentStatus(id)` — throws if records reference it (DB enforces)

### `database/queries/payment_records.ts`
- `getPaymentRecords()` — joined with `payment_statuses` (label, color), `companies` (name), `loads` (title), ordered by `created_at DESC`
- `createPaymentRecord(input)` — input: `{ name, description?, amount?, status_id, load_id?, company_id? }`
- `updatePaymentRecord(id, input)`
- `deletePaymentRecord(id)`

---

## Pages & Components

### `app/admin/finance/page.tsx`
- `PageHeader` title="Finance" subtitle="Payment and invoice tracking" icon=`ReceiptText`
- Action button: "Add Record" → opens modal
- Status filter tabs (All + one per status, with count)
- Table columns: Name | Status (colored badge) | Company | Load | Amount | Date | Actions
- Add/Edit modal fields:
  - Name (required text input)
  - Status (dropdown from `payment_statuses`)
  - Amount ZAR (optional number input)
  - Company (optional select from all companies)
  - Load (optional select from all loads)
  - Description/Notes (optional textarea)
- Delete via `ConfirmModal`

### `app/admin/settings/page.tsx` — new section
- "Payment Statuses" section added below existing sections (still behind password gate)
- Lists statuses with colored dot, label, reorder buttons (↑/↓), edit (inline), delete
- Color selection: preset palette of 12 colors (no free-form hex — keeps badges consistent)
- "Add Status" inline form at bottom
- Delete error: if status has records, show "Still used by X records — reassign them first"

### `components/Sidebar.tsx`
- Add to `adminNav`: `{ label: "Finance", href: "/admin/finance", icon: ReceiptText }` between Loads and Suppliers

---

## UI Pattern
- Follows existing admin page conventions (PageHeader, SectionCard, StatusBadge pattern)
- Status badges rendered inline using the saved `color` hex as background tint (e.g. `bg-[color]/10 text-[color]`)
- All data fetched client-side with `useCallback` + `useEffect` pattern
- Mutations update local state directly (never use RPC return value to update state)

---

## Migration
File: `supabase/migrations/0017_payment_tracking.sql`
Run manually in Supabase SQL editor after implementation.

---

## Out of Scope
- Supplier/transporter visibility of records (admin-only by design)
- PDF export or reporting
- Email notifications for payment status changes
- Drag-to-reorder statuses (↑/↓ buttons only)
