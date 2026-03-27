"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { getFinanceCategories, type FinanceCategory } from "@/database/queries/finance_categories";
import type { PaymentRecordRow, PaymentStatus, PaymentRecordFormInput, Load } from "@/database/types";

const emptyForm: PaymentRecordFormInput = {
  name: "", description: "", amount: "", status_id: "", load_id: "", company_name: "", category: "General",
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
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
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
      const [recs, stats, lds, cats] = await Promise.all([
        getPaymentRecords(),
        getPaymentStatuses(),
        getLoads(),
        getFinanceCategories(),
      ]);
      setRecords(recs);
      setStatuses(stats);
      setLoads(lds);
      setCategories(cats);
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
      company_name: rec.company_name ?? "",
      category: rec.category ?? "General",
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
      } else {
        await createPaymentRecord(form, user.id);
      }
      const updated = await getPaymentRecords();
      setRecords(updated);
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
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Company</th>
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
                      {rec.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{rec.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill label={rec.status.label} color={rec.status.color} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-600">{rec.category}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {rec.company_name ? (
                        <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Building2 size={11} className="text-gray-400" />{rec.company_name}
                        </span>
                      ) : rec.load ? (
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
                        <button
                          onClick={() => openEdit(rec)}
                          className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(rec.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
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
      {showForm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">{editId ? "Edit Record" : "Add Record"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Invoice #1042 — Transporter ABC"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status_id}
                  onChange={(e) => setForm({ ...form, status_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select status…</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (ZAR) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 15000.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company / Payee <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Caltex Johannesburg, ABC Trucking…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Load <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.load_id}
                  onChange={(e) => setForm({ ...form, load_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">No load linked</option>
                  {loads.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                  placeholder="Any additional context…"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.name.trim() || !form.status_id || saving}
                  className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {saving
                    ? <><Loader2 size={14} className="animate-spin" />Saving...</>
                    : <><CheckCircle2 size={14} />{editId ? "Save Changes" : "Add Record"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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
