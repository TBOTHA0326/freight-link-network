"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Mail, Building2, Loader2, Trash2, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import {
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
  type ContactSubmission,
} from "@/database/queries/contact";

const STATUS_STYLES: Record<ContactSubmission["status"], string> = {
  new: "bg-blue-50 text-blue-700 border border-blue-200",
  read: "bg-gray-100 text-gray-600 border border-gray-200",
  replied: "bg-green-50 text-green-700 border border-green-200",
};

const STATUS_LABELS: Record<ContactSubmission["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

const ROLE_COLORS: Record<string, string> = {
  Supplier: "bg-[#9B2640]/10 text-[#9B2640]",
  Transporter: "bg-[#06082C]/10 text-[#06082C]",
  Other: "bg-gray-100 text-gray-600",
};

export default function AdminInquiriesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ContactSubmission["status"]>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContactSubmissions();
      setSubmissions(data);
    } catch {
      setError("Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-mark as read when opened
  const handleSelect = async (sub: ContactSubmission) => {
    setSelected(sub);
    if (sub.status === "new") {
      try {
        await updateContactStatus(sub.id, "read");
        setSubmissions((prev) =>
          prev.map((s) => s.id === sub.id ? { ...s, status: "read" } : s)
        );
        setSelected({ ...sub, status: "read" });
      } catch { /* silent */ }
    }
  };

  const handleStatusChange = async (id: string, status: ContactSubmission["status"]) => {
    setUpdating(id);
    try {
      await updateContactStatus(id, status);
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdating(id);
    try {
      await deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      setError("Failed to delete.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);
  const newCount = submissions.filter((s) => s.status === "new").length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Inquiries"
        subtitle="Messages submitted via the public contact form"
        icon={MessageSquare}
        action={
          <button onClick={fetchData} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
            <RefreshCw size={14} />Refresh
          </button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={16} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "new", "read", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[#06082C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? `All (${submissions.length})` : f === "new" ? `New (${newCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries"
          message={filter === "all" ? "No contact form submissions yet." : `No ${filter} inquiries.`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelect(sub)}
                className={`w-full text-left p-4 rounded-xl border transition-all shadow-sm cursor-pointer group ${
                  selected?.id === sub.id
                    ? "border-[#06082C] bg-[#06082C]/5 shadow-md"
                    : sub.status === "new"
                    ? "border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:shadow-md hover:-translate-y-px"
                    : "border-gray-200 bg-white hover:border-[#06082C]/30 hover:shadow-md hover:-translate-y-px"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {sub.status === "new" && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    <p className={`text-sm text-gray-900 truncate ${sub.status === "new" ? "font-bold" : "font-semibold"}`}>
                      {sub.name}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${STATUS_STYLES[sub.status]}`}>
                    {STATUS_LABELS[sub.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1.5 truncate">{sub.email}</p>
                <p className={`text-xs line-clamp-2 leading-relaxed mb-2 ${sub.status === "new" ? "text-gray-600" : "text-gray-400"}`}>
                  {sub.message}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-300">
                    {new Date(sub.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <span className="text-xs text-[#06082C] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <SectionCard title="Inquiry Detail">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-sm text-[#06082C] hover:text-[#9B2640] transition-colors flex items-center gap-1.5 mt-0.5"
                      >
                        <Mail size={13} />
                        {selected.email}
                      </a>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[selected.status]}`}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selected.company && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 size={14} className="text-gray-400" />
                        {selected.company}
                      </div>
                    )}
                    {selected.role && (
                      <div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[selected.role] ?? "bg-gray-100 text-gray-600"}`}>
                          {selected.role}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 col-span-2">
                      Received {new Date(selected.created_at).toLocaleString("en-ZA")}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Message</p>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                      {selected.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-gray-100">
                    <a
                      href={`mailto:${selected.email}?subject=Re: Your Freight Link Network Inquiry`}
                      className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Mail size={14} />
                      Reply via Email
                    </a>

                    {selected.status !== "replied" && (
                      <button
                        onClick={() => handleStatusChange(selected.id, "replied")}
                        disabled={updating === selected.id}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        {updating === selected.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Mark as Replied
                      </button>
                    )}

                    {selected.status === "replied" && (
                      <button
                        onClick={() => handleStatusChange(selected.id, "read")}
                        disabled={updating === selected.id}
                        className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={14} />
                        Reopen
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selected.id)}
                      disabled={updating === selected.id}
                      className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ml-auto"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </SectionCard>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm border border-gray-100 rounded-2xl bg-gray-50">
                Select an inquiry to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
