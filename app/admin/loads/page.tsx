"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, CheckCircle2, XCircle, Loader2, AlertCircle, PlusCircle, Truck, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { getLoads, createInTransitLoad, deleteLoad } from "@/database/queries/loads";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import type { Load, LoadStatus } from "@/database/types";

const FILTERS: { label: string; value: LoadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "In Transit", value: "in_transit" },
  { label: "Completed", value: "completed" },
];

export default function AdminLoadsPage() {
  const { user } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [filter, setFilter] = useState<LoadStatus | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showInTransitForm, setShowInTransitForm] = useState(false);
  const [inTransitTitle, setInTransitTitle] = useState("");
  const [inTransitDesc, setInTransitDesc] = useState("");
  const [savingInTransit, setSavingInTransit] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoads();
      setLoads(data);
    } catch (err) { setError("Failed to load loads."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  const handleApprove = async (loadId: string) => {
    setProcessing(loadId);
    try {
      await supabase.rpc("review_load", { load_id: loadId, new_status: "approved", reason: null });
      setLoads((prev) => prev.map((l) => l.id === loadId ? { ...l, status: "approved" as LoadStatus } : l));
    } catch { setError("Failed to approve load."); }
    finally { setProcessing(null); }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) { setError("Enter a rejection reason."); return; }
    setProcessing(rejectId);
    try {
      await supabase.rpc("review_load", { load_id: rejectId, new_status: "rejected", reason: rejectReason });
      setLoads((prev) => prev.map((l) => l.id === rejectId ? { ...l, status: "rejected" as LoadStatus, rejection_reason: rejectReason } : l));
      setRejectId(null); setRejectReason("");
    } catch { setError("Failed to reject load."); }
    finally { setProcessing(null); }
  };

  const handleCreateInTransit = async () => {
    if (!inTransitTitle.trim() || !user) return;
    setSavingInTransit(true);
    try {
      const load = await createInTransitLoad(inTransitTitle.trim(), inTransitDesc.trim() || null, user.id);
      setLoads((prev) => [load, ...prev]);
      setShowInTransitForm(false);
      setInTransitTitle("");
      setInTransitDesc("");
    } catch { setError("Failed to create in-transit load."); }
    finally { setSavingInTransit(false); }
  };

  const handleDeleteLoad = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteLoad(deleteId);
      setLoads((prev) => prev.filter((l) => l.id !== deleteId));
      setDeleteId(null);
    } catch { setError("Failed to delete load."); }
    finally { setDeleting(false); }
  };

  const filtered = filter === "all" ? loads : loads.filter((l) => l.status === filter);

  return (
    <div>
      <PageHeader title="Loads" subtitle="Review and manage all freight loads" icon={Package}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInTransitForm(true)}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Truck size={15} />In Transit
            </button>
            <Link href="/admin/loads/new" className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <PlusCircle size={15} />Post a Load
            </Link>
          </div>
        }
      />
      {error && <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6"><AlertCircle size={16} className="text-red-500 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}
      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? "bg-[#06082C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f.label} <span className="ml-1 text-xs opacity-70">{f.value === "all" ? loads.length : loads.filter((l) => l.status === f.value).length}</span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No loads" message="No loads match this filter." />
        ) : (
          <div className="space-y-3">
            {filtered.map((load) => (
              <div key={load.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{load.title}</h3>
                    <StatusBadge status={load.status} />
                    {load.is_hazardous && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Hazmat</span>}
                    {load.is_cross_border && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Cross-border</span>}
                  </div>
                  {(load.pickup_city || load.delivery_city) ? (
                    <p className="text-xs text-gray-500">
                      {load.pickup_city ?? "—"} → {load.delivery_city ?? "—"}
                      {load.cargo_type && ` · ${load.cargo_type}`}
                      {load.weight_tons && ` · ${load.weight_tons}t`}
                      {load.pickup_date && ` · ${new Date(load.pickup_date).toLocaleDateString("en-ZA")}`}
                    </p>
                  ) : load.description ? (
                    <p className="text-xs text-gray-500">{load.description}</p>
                  ) : null}
                  {load.budget_amount && <p className="text-xs font-medium text-gray-700 mt-1">R {load.budget_amount.toLocaleString("en-ZA")}</p>}
                  {load.rejection_reason && <p className="text-xs text-red-600 mt-1">Rejected: {load.rejection_reason}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {load.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(load.id)} disabled={processing === load.id}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {processing === load.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}Approve
                      </button>
                      <button onClick={() => setRejectId(load.id)}
                        className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <XCircle size={12} />Reject
                      </button>
                    </>
                  )}
                  {load.status === "in_transit" && (
                    <button onClick={() => setDeleteId(load.id)}
                      className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      <Trash2 size={12} />Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Reject Load</h3>
            <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm">Cancel</button>
              <button onClick={handleReject} disabled={!!processing} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {processing ? <><Loader2 size={14} className="animate-spin" />Rejecting...</> : "Reject Load"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete In-Transit Load"
        message="Are you sure you want to delete this load? This cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        destructive
        onConfirm={handleDeleteLoad}
        onCancel={() => setDeleteId(null)}
      />

      {showInTransitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInTransitForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Truck size={15} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Create In-Transit Load</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inTransitTitle}
                  onChange={(e) => setInTransitTitle(e.target.value)}
                  placeholder="e.g. Johannesburg → Durban — Steel coils"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={inTransitDesc}
                  onChange={(e) => setInTransitDesc(e.target.value)}
                  placeholder="Brief notes about this load…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowInTransitForm(false); setInTransitTitle(""); setInTransitDesc(""); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInTransit}
                disabled={!inTransitTitle.trim() || savingInTransit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {savingInTransit ? <><Loader2 size={14} className="animate-spin" />Creating...</> : <><Truck size={14} />Create In Transit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
