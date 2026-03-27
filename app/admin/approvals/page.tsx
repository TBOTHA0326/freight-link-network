"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileCheck, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { getSetupSubmissions, getPendingRegistrations, rejectRegistration } from "@/database/queries/registrations";
import type { Profile } from "@/database/types";

export default function ApprovalsPage() {
  const [tab, setTab] = useState<"setup" | "legacy">("setup");
  const [setups, setSetups] = useState<Profile[]>([]);
  const [legacy, setLegacy] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([getSetupSubmissions(), getPendingRegistrations()]);
      setSetups(s);
      setLegacy(l);
    } catch (err) { setError("Failed to load approvals."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) { setError("Please enter a rejection reason."); return; }
    setProcessing(true);
    try {
      await rejectRegistration(rejectId, rejectReason);
      setSetups((prev) => prev.filter((p) => p.id !== rejectId));
      setLegacy((prev) => prev.filter((p) => p.id !== rejectId));
      setRejectId(null);
      setRejectReason("");
    } catch { setError("Failed to reject."); }
    finally { setProcessing(false); }
  };

  const current = tab === "setup" ? setups : legacy;

  return (
    <div>
      <PageHeader title="Approvals" subtitle="Review pending registrations and setups" icon={FileCheck} />
      {error && <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6"><AlertCircle size={16} className="text-red-500 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab("setup")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "setup" ? "bg-[#06082C] text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
          Setup Submissions <span className="ml-1.5 text-xs opacity-70">{setups.length}</span>
        </button>
        <button onClick={() => setTab("legacy")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "legacy" ? "bg-[#06082C] text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
          Legacy Pending <span className="ml-1.5 text-xs opacity-70">{legacy.length}</span>
        </button>
      </div>

      <SectionCard>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : current.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All clear!" message="No pending approvals at this time." />
        ) : (
          <div className="space-y-3">
            {current.map((p) => (
              <div key={p.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-[#9B2640] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">{(p.full_name ?? p.email).slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-gray-900">{p.full_name ?? "—"}</p>
                    <span className="capitalize text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{p.role}</span>
                    <StatusBadge status={p.registration_status} />
                  </div>
                  <p className="text-xs text-gray-500">{p.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Registered {new Date(p.created_at).toLocaleDateString("en-ZA")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tab === "setup" && (
                    <Link href={p.role === "transporter" ? `/admin/transporters/${p.id}` : `/admin/suppliers/${p.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#06082C] hover:bg-[#0a0e40] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle2 size={12} />Review & Activate
                    </Link>
                  )}
                  <button onClick={() => setRejectId(p.id)}
                    className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    <XCircle size={12} />Reject
                  </button>
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
            <h3 className="text-base font-semibold text-gray-900 mb-4">Reject Registration</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection <span className="text-red-500">*</span></label>
            <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Provide a clear reason for rejection..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button onClick={handleReject} disabled={processing} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {processing ? <><Loader2 size={14} className="animate-spin" />Rejecting...</> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
