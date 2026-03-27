"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers, PlusCircle, Pencil, Trash2, AlertCircle, Loader2, CheckCircle2,
  FileText, ExternalLink, Upload, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import StatusBadge from "@/components/StatusBadge";
import DocUploadForm from "@/components/admin/DocUploadForm";
import { getTrailers, createTrailer, updateTrailer, deleteTrailer } from "@/database/queries/trailers";
import { getDocumentsByCompany, getDocumentUrl } from "@/database/queries/documents";
import { DOCUMENT_CATEGORY_LABELS, TRAILER_TYPE_LABELS, type DocumentRecord, type TrailerType, type Trailer, type TrailerFormInput } from "@/database/types";

const TRAILER_CATS = ["trailer_registration", "roadworthy", "other"] as const;
const TRAILER_TYPES = Object.keys(TRAILER_TYPE_LABELS) as TrailerType[];
const emptyForm: TrailerFormInput = { registration_number: "", trailer_type: "flatbed", make: "", model: "", year: "", length_meters: "", payload_capacity_tons: "" };

export default function TrailersPage() {
  const { user, profile } = useAuth();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TrailerFormInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docsOpen, setDocsOpen] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [t, d] = await Promise.all([
        getTrailers(profile.company_id),
        getDocumentsByCompany(profile.company_id),
      ]);
      setTrailers(t);
      setDocuments(d);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [profile?.company_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleDocs = (id: string) => {
    setDocsOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setUploadOpen(null); }
      else next.add(id);
      return next;
    });
  };

  const openEdit = (trailer: Trailer) => {
    setEditId(trailer.id);
    setForm({ registration_number: trailer.registration_number, trailer_type: trailer.trailer_type, make: trailer.make ?? "", model: trailer.model ?? "", year: trailer.year?.toString() ?? "", length_meters: trailer.length_meters?.toString() ?? "", payload_capacity_tons: trailer.payload_capacity_tons?.toString() ?? "" });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.registration_number.trim()) { setError("Registration number is required."); return; }
    if (!user || !profile?.company_id) return;
    setSaving(true); setError(null);
    try {
      if (editId) {
        const updated = await updateTrailer(editId, form);
        setTrailers((prev) => prev.map((t) => t.id === editId ? updated : t));
      } else {
        const created = await createTrailer(form, profile.company_id, user.id);
        setTrailers((prev) => [created, ...prev]);
      }
      setShowForm(false); setEditId(null); setForm(emptyForm);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTrailer(deleteId);
      setTrailers((prev) => prev.filter((t) => t.id !== deleteId));
      setDocuments((prev) => prev.filter((d) => d.trailer_id !== deleteId));
    } catch { setError("Failed to delete trailer."); }
    finally { setDeleteId(null); }
  };

  const handleViewDoc = async (filePath: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Trailers"
        subtitle="Manage your trailer fleet and upload trailer documents"
        icon={Layers}
        action={
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle size={16} />Add Trailer
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

      {showForm && (
        <SectionCard title={editId ? "Edit Trailer" : "Add Trailer"}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number <span className="text-red-500">*</span></label>
              <input type="text" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} placeholder="CA 789-012" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trailer Type <span className="text-red-500">*</span></label>
              <select value={form.trailer_type} onChange={(e) => setForm({ ...form, trailer_type: e.target.value as TrailerType })} className={`${inputCls} bg-white`}>
                {TRAILER_TYPES.map((t) => <option key={t} value={t}>{TRAILER_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Make</label><input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Model</label><input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><input type="number" min="1990" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Length (m)</label><input type="number" min="0" step="0.1" value={form.length_meters} onChange={(e) => setForm({ ...form, length_meters: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payload (tons)</label><input type="number" min="0" step="0.1" value={form.payload_capacity_tons} onChange={(e) => setForm({ ...form, payload_capacity_tons: e.target.value })} className={inputCls} /></div>
            <div className="md:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : <><CheckCircle2 size={15} />{editId ? "Save Changes" : "Add Trailer"}</>}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard>
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : trailers.length === 0 ? (
          <EmptyState icon={Layers} title="No trailers added" message="Add your first trailer to get started." action={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors"><PlusCircle size={15} />Add Trailer</button>} />
        ) : (
          <div className="space-y-3">
            {trailers.map((trailer) => {
              const trailerDocs = documents.filter((d) => d.trailer_id === trailer.id);
              const isOpen = docsOpen.has(trailer.id);
              return (
                <div key={trailer.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-[#06082C]/10 flex items-center justify-center flex-shrink-0">
                      <Layers size={14} className="text-[#06082C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{trailer.registration_number}</p>
                      <p className="text-xs text-gray-500">
                        {TRAILER_TYPE_LABELS[trailer.trailer_type]}
                        {trailer.make || trailer.model ? ` · ${[trailer.make, trailer.model].filter(Boolean).join(" ")}` : ""}
                        {trailer.payload_capacity_tons ? ` · ${trailer.payload_capacity_tons}t` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(trailer)} className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(trailer.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      <button
                        onClick={() => toggleDocs(trailer.id)}
                        className="flex items-center gap-1.5 ml-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText size={12} />
                        {trailerDocs.length} doc{trailerDocs.length !== 1 ? "s" : ""}
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                      {trailerDocs.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No documents uploaded for this trailer yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {trailerDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                              <FileText size={14} className="text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                                <p className="text-xs text-gray-500">{DOCUMENT_CATEGORY_LABELS[doc.category]}</p>
                              </div>
                              <StatusBadge status={doc.status} />
                              <button onClick={() => handleViewDoc(doc.file_path)} className="p-1.5 text-gray-400 hover:text-[#06082C] transition-colors"><ExternalLink size={14} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => setUploadOpen(uploadOpen === trailer.id ? null : trailer.id)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
                        >
                          <Upload size={14} />
                          {uploadOpen === trailer.id ? "Cancel Upload" : "Upload Document"}
                        </button>
                        {uploadOpen === trailer.id && user && profile?.company_id && (
                          <DocUploadForm
                            companyId={profile.company_id}
                            userId={user.id}
                            categories={[...TRAILER_CATS]}
                            extra={{ trailer_id: trailer.id }}
                            onUploaded={(doc) => { setDocuments((prev) => [doc, ...prev]); setUploadOpen(null); }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Trailer"
        message="Remove this trailer and all its documents from your fleet?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
