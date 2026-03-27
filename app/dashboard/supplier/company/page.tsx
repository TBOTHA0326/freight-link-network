"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Loader2, AlertCircle, CheckCircle2, Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { getCompany, updateCompany } from "@/database/queries/companies";
import { getDocumentsByCompany, uploadDocument, deleteDocument, getDocumentUrl } from "@/database/queries/documents";
import { DOCUMENT_CATEGORY_LABELS, SA_PROVINCES, type DocumentCategory, type DocumentRecord as Document } from "@/database/types";
import type { Company } from "@/database/types";

const UPLOAD_CATEGORIES: DocumentCategory[] = ["cipc", "tax_document", "id_document", "registration", "other"];

export default function SupplierCompanyPage() {
  const { user, profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleteDocPath, setDeleteDocPath] = useState<string | null>(null);
  const [uploadCat, setUploadCat] = useState<DocumentCategory>("cipc");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", registration_number: "", tax_number: "", address: "", city: "", province: "", postal_code: "", phone: "", email: "", website: "", does_cross_border: false });

  const fetchData = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [c, docs] = await Promise.all([getCompany(profile.company_id), getDocumentsByCompany(profile.company_id)]);
      if (c) {
        setCompany(c);
        setForm({ name: c.name, registration_number: c.registration_number ?? "", tax_number: c.tax_number ?? "", address: c.address ?? "", city: c.city ?? "", province: c.province ?? "", postal_code: c.postal_code ?? "", phone: c.phone ?? "", email: c.email ?? "", website: c.website ?? "", does_cross_border: c.does_cross_border });
      }
      setDocuments(docs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [profile?.company_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.company_id) return;
    setSaving(true); setError(null); setSuccess(false);
    try {
      await updateCompany(profile.company_id, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim() || !user || !profile?.company_id) { setError("Fill in title and select a file."); return; }
    setUploading(true); setError(null);
    try {
      const doc = await uploadDocument(profile.company_id, uploadCat, uploadTitle, uploadFile, user.id);
      setDocuments((prev) => [doc, ...prev]);
      setUploadTitle(""); setUploadFile(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploading(false); }
  };

  const handleDeleteDoc = async () => {
    if (!deleteDocId || !deleteDocPath) return;
    try {
      await deleteDocument(deleteDocId, deleteDocPath);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDocId));
    } catch { setError("Failed to delete document."); }
    finally { setDeleteDocId(null); setDeleteDocPath(null); }
  };

  const handleViewDoc = async (filePath: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]";

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" subtitle="Manage your company information and documents" icon={Building2} />
      {error && <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl"><AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p></div>}
      {success && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl"><CheckCircle2 size={16} className="text-green-500" /><p className="text-sm text-green-700">Saved successfully.</p></div>}
      <SectionCard title="Company Information">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label><input type="text" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label><input type="text" value={form.tax_number} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} className={inputCls} /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
            <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className={`${inputCls} bg-white`}>
              <option value="">Select</option>{SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls} /></div>
          <div className="md:col-span-2"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.does_cross_border} onChange={(e) => setForm({ ...form, does_cross_border: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-[#06082C]" /><span className="text-sm text-gray-700">Operates cross-border routes</span></label></div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={saving} className="bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
              {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </SectionCard>
      <SectionCard title="Documents" subtitle="Upload and manage your compliance documents">
        <div className="bg-gray-50 rounded-xl p-5 mb-5 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Upload New Document</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={uploadCat} onChange={(e) => setUploadCat(e.target.value as DocumentCategory)} className={`${inputCls} bg-white`}>
                {UPLOAD_CATEGORIES.map((c) => <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Title</label><input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Document title" className={inputCls} /></div>
          </div>
          <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#06082C] transition-colors">
            <Upload size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-500 truncate">{uploadFile ? uploadFile.name : "Click to choose file..."}</span>
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
          </label>
          <button onClick={handleUpload} disabled={uploading} className="w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? <><Loader2 size={15} className="animate-spin" />Uploading...</> : <><Upload size={15} />Upload Document</>}
          </button>
        </div>
        {documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents" message="Upload your compliance documents above." />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p><p className="text-xs text-gray-500">{DOCUMENT_CATEGORY_LABELS[doc.category]}</p></div>
                <StatusBadge status={doc.status} />
                <button onClick={() => handleViewDoc(doc.file_path)} className="p-1.5 text-gray-400 hover:text-[#06082C] transition-colors"><ExternalLink size={14} /></button>
                <button onClick={() => { setDeleteDocId(doc.id); setDeleteDocPath(doc.file_path); }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <ConfirmModal isOpen={!!deleteDocId} title="Delete Document" message="Permanently delete this document?" onConfirm={handleDeleteDoc} onCancel={() => { setDeleteDocId(null); setDeleteDocPath(null); }} confirmLabel="Delete" destructive />
    </div>
  );
}
