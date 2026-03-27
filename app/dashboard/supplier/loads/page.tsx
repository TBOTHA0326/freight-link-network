"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, PlusCircle, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import SectionCard from "@/components/SectionCard";
import ConfirmModal from "@/components/ConfirmModal";
import { getLoadsByCompany, deleteLoad } from "@/database/queries/loads";
import type { Load, LoadStatus } from "@/database/types";

const STATUS_FILTERS: { label: string; value: LoadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In Transit", value: "in_transit" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

export default function SupplierLoadsPage() {
  const { profile } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [filter, setFilter] = useState<LoadStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoads = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const data = await getLoadsByCompany(profile.company_id);
      setLoads(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [profile?.company_id]);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  const filtered = filter === "all" ? loads : loads.filter((l) => l.status === filter);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteLoad(deleteId);
      setLoads((prev) => prev.filter((l) => l.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete load.");
    } finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader title="My Loads" subtitle="Manage your freight postings" icon={Package}
        action={
          <Link href="/dashboard/supplier/loads/new" className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <PlusCircle size={16} />Post Load
          </Link>
        }
      />
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
          <AlertCircle size={16} className="text-red-500 mt-0.5" /><p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? "bg-[#06082C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f.label} <span className="ml-1 text-xs opacity-70">{f.value === "all" ? loads.length : loads.filter((l) => l.status === f.value).length}</span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No loads found" message={filter === "all" ? "Post your first freight load." : `No ${filter} loads.`}
            action={filter === "all" ? <Link href="/dashboard/supplier/loads/new" className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors"><PlusCircle size={15} />Post a Load</Link> : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((load) => (
              <div key={load.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{load.title}</h3>
                    <StatusBadge status={load.status} />
                    {load.is_hazardous && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Hazardous</span>}
                    {load.is_cross_border && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Cross-border</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    {load.pickup_city ?? "—"} → {load.delivery_city ?? "—"}
                    {load.pickup_date && ` · ${new Date(load.pickup_date).toLocaleDateString("en-ZA")}`}
                    {load.cargo_type && ` · ${load.cargo_type}`}
                    {load.weight_tons && ` · ${load.weight_tons}t`}
                  </p>
                  {load.budget_amount && <p className="text-xs font-medium text-gray-700 mt-1">R {load.budget_amount.toLocaleString("en-ZA")}</p>}
                  {load.rejection_reason && <p className="text-xs text-red-600 mt-1">Reason: {load.rejection_reason}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(load.status === "pending" || load.status === "rejected") && (
                    <>
                      <Link href={`/dashboard/supplier/loads/${load.id}/edit`} className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors" title="Edit"><Pencil size={15} /></Link>
                      <button onClick={() => setDeleteId(load.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <ConfirmModal isOpen={!!deleteId} title="Delete Load" message="Are you sure you want to delete this load? This cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmLabel={deleting ? "Deleting..." : "Delete"} destructive />
    </div>
  );
}
