# Finance Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only Finance page for tracking payment/invoice records with configurable statuses managed from Settings.

**Architecture:** Two new Supabase tables (`payment_statuses`, `payment_records`) with admin-only RLS. Query layer follows existing patterns in `database/queries/`. Finance page at `/admin/finance` uses the same card/table pattern as other admin pages. Settings page gets a new Payment Statuses section behind the existing password gate.

**Tech Stack:** Next.js App Router, Supabase JS (`supabase.from()`), Tailwind CSS v4, Lucide React, TypeScript strict mode.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `supabase/migrations/0017_payment_tracking.sql` | Tables, RLS, seed data |
| Modify | `database/types.ts` | Add `PaymentStatus`, `PaymentRecord`, `PaymentRecordRow`, `PaymentRecordFormInput` |
| Modify | `database/queries/companies.ts` | Add `getAllCompanies()` helper |
| Create | `database/queries/payment_statuses.ts` | CRUD + reorder for statuses |
| Create | `database/queries/payment_records.ts` | CRUD with joins for records |
| Modify | `components/Sidebar.tsx` | Add Finance nav item |
| Create | `app/admin/finance/page.tsx` | Main ledger page |
| Modify | `app/admin/settings/page.tsx` | Add Payment Statuses management section |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/0017_payment_tracking.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/0017_payment_tracking.sql

-- Payment Statuses (admin-configurable dropdown values)
CREATE TABLE IF NOT EXISTS payment_statuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  color       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_payment_statuses" ON payment_statuses
  FOR ALL USING (is_admin());

-- Payment Records (the ledger entries)
CREATE TABLE IF NOT EXISTS payment_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  amount      DECIMAL(12,2),
  status_id   UUID NOT NULL REFERENCES payment_statuses(id) ON DELETE RESTRICT,
  load_id     UUID REFERENCES loads(id) ON DELETE SET NULL,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_payment_records" ON payment_records
  FOR ALL USING (is_admin());

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default statuses
INSERT INTO payment_statuses (label, color, sort_order) VALUES
  ('Invoiced',            '#6366f1', 0),
  ('Waiting for Payment', '#f59e0b', 1),
  ('Payment Received',    '#10b981', 2),
  ('In Progress',         '#3b82f6', 3),
  ('Overdue',             '#ef4444', 4),
  ('Cancelled',           '#6b7280', 5)
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Run in Supabase SQL editor**

Open Supabase dashboard → SQL Editor → paste and run the migration. Verify both tables appear in Table Editor with the 6 seeded statuses in `payment_statuses`.

---

## Task 2: TypeScript Types

**Files:**
- Modify: `database/types.ts` (append before the Constants section at line ~381)

- [ ] **Step 1: Add types**

Insert the following block into `database/types.ts` just before the `// ============================================================` line that precedes `// Constants`:

```typescript
export interface PaymentStatus {
  id: string;
  label: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  name: string;
  description: string | null;
  amount: number | null;
  status_id: string;
  load_id: string | null;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// PaymentRecord with joined fields returned by getPaymentRecords()
export interface PaymentRecordRow extends PaymentRecord {
  status: { id: string; label: string; color: string };
  company: { name: string } | null;
  load: { title: string } | null;
}

export interface PaymentRecordFormInput {
  name: string;
  description: string;
  amount: string;       // string for controlled input, parsed to number on save
  status_id: string;
  load_id: string;      // empty string = no link
  company_id: string;   // empty string = no link
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors related to the new types.

- [ ] **Step 3: Commit**

```bash
git add database/types.ts supabase/migrations/0017_payment_tracking.sql
git commit -m "feat: add PaymentStatus and PaymentRecord types + migration"
```

---

## Task 3: getAllCompanies Helper

**Files:**
- Modify: `database/queries/companies.ts`

- [ ] **Step 1: Add the function**

Append to the end of `database/queries/companies.ts`:

```typescript
export async function getAllCompanies(): Promise<Pick<Company, "id" | "name" | "company_type">[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, company_type")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Pick<Company, "id" | "name" | "company_type">[];
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add database/queries/companies.ts
git commit -m "feat: add getAllCompanies helper"
```

---

## Task 4: payment_statuses Query File

**Files:**
- Create: `database/queries/payment_statuses.ts`

- [ ] **Step 1: Write the file**

```typescript
import { supabase } from "@/lib/supabaseClient";
import type { PaymentStatus } from "@/database/types";

export async function getPaymentStatuses(): Promise<PaymentStatus[]> {
  const { data, error } = await supabase
    .from("payment_statuses")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentStatus[];
}

export async function createPaymentStatus(label: string, color: string): Promise<PaymentStatus> {
  const { data: existing } = await supabase
    .from("payment_statuses")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = existing ? existing.sort_order + 1 : 0;
  const { data, error } = await supabase
    .from("payment_statuses")
    .insert({ label, color, sort_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return data as PaymentStatus;
}

export async function updatePaymentStatus(
  id: string,
  updates: Partial<Pick<PaymentStatus, "label" | "color" | "sort_order">>
): Promise<PaymentStatus> {
  const { data, error } = await supabase
    .from("payment_statuses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentStatus;
}

export async function deletePaymentStatus(id: string): Promise<void> {
  const { error } = await supabase
    .from("payment_statuses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getPaymentRecordCountForStatus(statusId: string): Promise<number> {
  const { count, error } = await supabase
    .from("payment_records")
    .select("id", { count: "exact", head: true })
    .eq("status_id", statusId);
  if (error) throw error;
  return count ?? 0;
}

// Swap sort_order between two adjacent statuses for ↑/↓ reordering.
// Pass the full sorted statuses array so we can find the neighbour.
export async function swapPaymentStatusOrder(
  id: string,
  direction: "up" | "down",
  statuses: PaymentStatus[]
): Promise<void> {
  const index = statuses.findIndex((s) => s.id === id);
  if (index === -1) return;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= statuses.length) return;
  const current = statuses[index];
  const target = statuses[targetIndex];
  await Promise.all([
    supabase.from("payment_statuses").update({ sort_order: target.sort_order }).eq("id", current.id),
    supabase.from("payment_statuses").update({ sort_order: current.sort_order }).eq("id", target.id),
  ]);
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add database/queries/payment_statuses.ts
git commit -m "feat: add payment_statuses query layer"
```

---

## Task 5: payment_records Query File

**Files:**
- Create: `database/queries/payment_records.ts`

- [ ] **Step 1: Write the file**

```typescript
import { supabase } from "@/lib/supabaseClient";
import type { PaymentRecordRow, PaymentRecord, PaymentRecordFormInput } from "@/database/types";

export async function getPaymentRecords(): Promise<PaymentRecordRow[]> {
  const { data, error } = await supabase
    .from("payment_records")
    .select(`
      *,
      status:payment_statuses(id, label, color),
      company:companies(name),
      load:loads(title)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentRecordRow[];
}

export async function createPaymentRecord(
  input: PaymentRecordFormInput,
  userId: string
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("payment_records")
    .insert({
      name: input.name.trim(),
      description: input.description.trim() || null,
      amount: input.amount ? parseFloat(input.amount) : null,
      status_id: input.status_id,
      load_id: input.load_id || null,
      company_id: input.company_id || null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PaymentRecord;
}

export async function updatePaymentRecord(
  id: string,
  input: PaymentRecordFormInput
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("payment_records")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      amount: input.amount ? parseFloat(input.amount) : null,
      status_id: input.status_id,
      load_id: input.load_id || null,
      company_id: input.company_id || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentRecord;
}

export async function deletePaymentRecord(id: string): Promise<void> {
  const { error } = await supabase.from("payment_records").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add database/queries/payment_records.ts
git commit -m "feat: add payment_records query layer"
```

---

## Task 6: Sidebar Nav Item

**Files:**
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: Add ReceiptText to imports and Finance to adminNav**

In `components/Sidebar.tsx`, add `ReceiptText` to the lucide-react import line:

```typescript
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Building2,
  Map,
  Settings,
  LogOut,
  ChevronRight,
  FileCheck,
  Layers,
  UserCheck,
  ShieldCheck,
  PlusCircle,
  MessageSquare,
  Archive,
  ReceiptText,
} from "lucide-react";
```

Then in `adminNav`, add the Finance item between "Post a Load" and "Suppliers":

```typescript
const adminNav: NavItem[] = [
  { label: "Dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
  { label: "Approvals",    href: "/admin/approvals",    icon: FileCheck },
  { label: "Loads",        href: "/admin/loads",        icon: Package },
  { label: "Post a Load",  href: "/admin/loads/new",    icon: PlusCircle },
  { label: "Finance",      href: "/admin/finance",      icon: ReceiptText },
  { label: "Suppliers",    href: "/admin/suppliers",    icon: Building2 },
  { label: "Transporters", href: "/admin/transporters", icon: Truck },
  { label: "Users",        href: "/admin/users",        icon: UserCheck },
  { label: "Inquiries",    href: "/admin/inquiries",    icon: MessageSquare },
  { label: "Map",          href: "/admin/map",          icon: Map },
  { label: "Settings",     href: "/admin/settings",     icon: Settings },
];
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: add Finance nav item to admin sidebar"
```

---

## Task 7: Finance Page

**Files:**
- Create: `app/admin/finance/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ReceiptText, PlusCircle, Pencil, Trash2, AlertCircle,
  Loader2, X, CheckCircle2, Building2, Package,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { getPaymentRecords, createPaymentRecord, updatePaymentRecord, deletePaymentRecord } from "@/database/queries/payment_records";
import { getPaymentStatuses } from "@/database/queries/payment_statuses";
import { getLoads } from "@/database/queries/loads";
import { getAllCompanies } from "@/database/queries/companies";
import type { PaymentRecordRow, PaymentStatus, PaymentRecordFormInput, Load, Company } from "@/database/types";

const emptyForm: PaymentRecordFormInput = {
  name: "", description: "", amount: "", status_id: "", load_id: "", company_id: "",
};

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]";

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}

export default function FinancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PaymentRecordRow[]>([]);
  const [statuses, setStatuses] = useState<PaymentStatus[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [companies, setCompanies] = useState<Pick<Company, "id" | "name" | "company_type">[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentRecordFormInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, stats, lds, cos] = await Promise.all([
        getPaymentRecords(),
        getPaymentStatuses(),
        getLoads(),
        getAllCompanies(),
      ]);
      setRecords(recs);
      setStatuses(stats);
      setLoads(lds);
      setCompanies(cos);
    } catch (err) {
      setError("Failed to load data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, status_id: statuses[0]?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (rec: PaymentRecordRow) => {
    setEditId(rec.id);
    setForm({
      name: rec.name,
      description: rec.description ?? "",
      amount: rec.amount != null ? String(rec.amount) : "",
      status_id: rec.status_id,
      load_id: rec.load_id ?? "",
      company_id: rec.company_id ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.status_id || !user) return;
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updatePaymentRecord(editId, form);
        // Refresh to get joined fields updated
        const updated = await getPaymentRecords();
        setRecords(updated);
      } else {
        await createPaymentRecord(form, user.id);
        const updated = await getPaymentRecords();
        setRecords(updated);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePaymentRecord(deleteId);
      setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    } catch {
      setError("Failed to delete record.");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = filter === "all" ? records : records.filter((r) => r.status_id === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        subtitle="Payment and invoice tracking"
        icon={ReceiptText}
        action={
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle size={15} />Add Record
          </button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      )}

      <SectionCard>
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-[#06082C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            All <span className="ml-1 text-xs opacity-70">{records.length}</span>
          </button>
          {statuses.map((s) => {
            const count = records.filter((r) => r.status_id === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s.id ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={filter === s.id ? { backgroundColor: s.color } : undefined}
              >
                {s.label} <span className="ml-1 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No records"
            message={filter === "all" ? "Add your first payment or invoice record." : "No records with this status."}
            action={filter === "all" ? (
              <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors">
                <PlusCircle size={15} />Add Record
              </button>
            ) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Company</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Load</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Date</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{rec.name}</p>
                      {rec.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{rec.description}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill label={rec.status.label} color={rec.status.color} />
                    </td>
                    <td className="py-3 pr-4">
                      {rec.company ? (
                        <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Building2 size={11} className="text-gray-400" />{rec.company.name}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {rec.load ? (
                        <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Package size={11} className="text-gray-400" />{rec.load.title}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {rec.amount != null
                        ? <span className="font-medium text-gray-800">R {rec.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(rec.created_at).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(rec)} className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(rec.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">{editId ? "Edit Record" : "Add Record"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Invoice #1042 — Transporter ABC" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                <select value={form.status_id} onChange={(e) => setForm({ ...form, status_id: e.target.value })} className={inputCls}>
                  <option value="">Select status…</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ZAR) <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="e.g. 15000.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className={inputCls}>
                  <option value="">No company linked</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Load <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={form.load_id} onChange={(e) => setForm({ ...form, load_id: e.target.value })} className={inputCls}>
                  <option value="">No load linked</option>
                  {loads.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} placeholder="Any additional context…" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={!form.name.trim() || !form.status_id || saving} className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><CheckCircle2 size={14} />{editId ? "Save Changes" : "Add Record"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Record"
        message="Permanently delete this payment record? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/finance/page.tsx
git commit -m "feat: add Finance ledger page"
```

---

## Task 8: Settings — Payment Statuses Section

**Files:**
- Modify: `app/admin/settings/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `app/admin/settings/page.tsx`, add to the existing import list:

```typescript
import { useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import {
  getPaymentStatuses, createPaymentStatus, updatePaymentStatus,
  deletePaymentStatus, getPaymentRecordCountForStatus, swapPaymentStatusOrder,
} from "@/database/queries/payment_statuses";
import type { PaymentStatus } from "@/database/types";
```

The existing import line is:
```typescript
import { useState } from "react";
```
Change it to:
```typescript
import { useState, useEffect, useCallback } from "react";
```

- [ ] **Step 2: Add state and handlers inside AdminSettingsPage (after the existing state declarations)**

Add these after `const [saved, setSaved] = useState(false);`:

```typescript
// Payment Statuses state
const [statuses, setStatuses] = useState<PaymentStatus[]>([]);
const [statusError, setStatusError] = useState<string | null>(null);
const [newLabel, setNewLabel] = useState("");
const [newColor, setNewColor] = useState("#6366f1");
const [addingStatus, setAddingStatus] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [editLabel, setEditLabel] = useState("");
const [editColor, setEditColor] = useState("");

const COLOR_PALETTE = [
  { label: "Indigo",   value: "#6366f1" },
  { label: "Blue",     value: "#3b82f6" },
  { label: "Sky",      value: "#0ea5e9" },
  { label: "Teal",     value: "#14b8a6" },
  { label: "Emerald",  value: "#10b981" },
  { label: "Amber",    value: "#f59e0b" },
  { label: "Orange",   value: "#f97316" },
  { label: "Red",      value: "#ef4444" },
  { label: "Rose",     value: "#f43f5e" },
  { label: "Purple",   value: "#a855f7" },
  { label: "Gray",     value: "#6b7280" },
  { label: "Slate",    value: "#475569" },
];

const fetchStatuses = useCallback(async () => {
  try { setStatuses(await getPaymentStatuses()); }
  catch { setStatusError("Failed to load statuses."); }
}, []);

useEffect(() => { if (unlocked) fetchStatuses(); }, [unlocked, fetchStatuses]);

const handleAddStatus = async () => {
  if (!newLabel.trim()) return;
  try {
    const created = await createPaymentStatus(newLabel.trim(), newColor);
    setStatuses((prev) => [...prev, created]);
    setNewLabel(""); setNewColor("#6366f1");
  } catch { setStatusError("Failed to add status."); }
};

const handleStartEdit = (s: PaymentStatus) => {
  setEditingId(s.id); setEditLabel(s.label); setEditColor(s.color);
};

const handleSaveEdit = async () => {
  if (!editingId || !editLabel.trim()) return;
  try {
    await updatePaymentStatus(editingId, { label: editLabel.trim(), color: editColor });
    setStatuses((prev) => prev.map((s) => s.id === editingId ? { ...s, label: editLabel.trim(), color: editColor } : s));
    setEditingId(null);
  } catch { setStatusError("Failed to update status."); }
};

const handleDeleteStatus = async (id: string) => {
  try {
    const count = await getPaymentRecordCountForStatus(id);
    if (count > 0) {
      setStatusError(`Cannot delete — ${count} record${count !== 1 ? "s" : ""} still use this status. Reassign them first.`);
      return;
    }
    await deletePaymentStatus(id);
    setStatuses((prev) => prev.filter((s) => s.id !== id));
  } catch { setStatusError("Failed to delete status."); }
};

const handleReorder = async (id: string, direction: "up" | "down") => {
  try {
    await swapPaymentStatusOrder(id, direction, statuses);
    await fetchStatuses();
  } catch { setStatusError("Failed to reorder."); }
};
```

- [ ] **Step 3: Add the Payment Statuses SectionCard to the unlocked return**

Insert just before the final `<div className="flex justify-end">` Save button at the bottom of the unlocked return:

```tsx
<SectionCard title="Payment Statuses" subtitle="Configure the dropdown options for the Finance ledger">
  {statusError && (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
      <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-red-700 flex-1">{statusError}</p>
      <button onClick={() => setStatusError(null)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
    </div>
  )}
  <div className="space-y-2 mb-4">
    {statuses.map((s, i) => (
      <div key={s.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
        {editingId === s.id ? (
          <>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              autoFocus
            />
            <div className="flex gap-1 flex-shrink-0">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setEditColor(c.value)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${editColor === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle2 size={14} /></button>
            <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><X size={14} /></button>
          </>
        ) : (
          <>
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-sm font-medium text-gray-800">{s.label}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => handleReorder(s.id, "up")} disabled={i === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronUp size={13} /></button>
              <button onClick={() => handleReorder(s.id, "down")} disabled={i === statuses.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronDown size={13} /></button>
              <button onClick={() => handleStartEdit(s)} className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={13} /></button>
              <button onClick={() => handleDeleteStatus(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>

  {/* Add new status */}
  <div className="flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl">
    <input
      type="text"
      value={newLabel}
      onChange={(e) => setNewLabel(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
      placeholder="New status label…"
      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
    />
    <div className="flex gap-1 flex-shrink-0">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => setNewColor(c.value)}
          title={c.label}
          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
          style={{ backgroundColor: c.value }}
        />
      ))}
    </div>
    <button
      onClick={handleAddStatus}
      disabled={!newLabel.trim() || addingStatus}
      className="p-1.5 bg-[#06082C] text-white rounded-lg hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
    >
      <Plus size={14} />
    </button>
  </div>
</SectionCard>
```

Also add the missing icon imports to the top-level import line in settings. The full lucide import becomes:

```typescript
import { useState, useEffect, useCallback } from "react";
import {
  Settings, Mail, Globe, Shield, CheckCircle2, Lock, Eye, EyeOff,
  AlertCircle, Plus, Trash2, ChevronUp, ChevronDown, Pencil, X,
} from "lucide-react";
```

- [ ] **Step 4: Verify lint passes**

```bash
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/settings/page.tsx
git commit -m "feat: add Payment Statuses management to admin settings"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Migration ✓, types ✓, payment_statuses queries ✓, payment_records queries ✓, sidebar nav ✓, finance page ✓, settings section ✓
- [x] **No placeholders:** All steps contain complete code
- [x] **Type consistency:** `PaymentRecordFormInput` defined in Task 2, used in Tasks 5 and 7. `PaymentStatus` used across Tasks 4, 7, 8. `PaymentRecordRow` returned by `getPaymentRecords()` and consumed in Finance page.
- [x] **ON DELETE RESTRICT:** migration enforces it; settings delete handler checks count before attempting delete to give user-friendly error
- [x] **RLS:** admin-only policies on both tables — no transporter/supplier access
