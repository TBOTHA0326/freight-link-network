"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, PlusCircle, Pencil, Trash2, AlertCircle, Loader2, CheckCircle2,
  FileText, ExternalLink, Upload, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import StatusBadge from "@/components/StatusBadge";
import DocUploadForm from "@/components/admin/DocUploadForm";
import { getDrivers, createDriver, updateDriver, deleteDriver } from "@/database/queries/drivers";
import { getDocumentsByCompany, getDocumentUrl } from "@/database/queries/documents";
import { DOCUMENT_CATEGORY_LABELS, type DocumentRecord, type Driver, type DriverFormInput } from "@/database/types";

const DRIVER_CATS = ["drivers_license", "pdp", "passport", "id_document", "other"] as const;
const emptyForm: DriverFormInput = { first_name: "", last_name: "", id_number: "", license_number: "", license_expiry: "", phone: "", email: "" };

export default function DriversPage() {
  const { user, profile } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DriverFormInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docsOpen, setDocsOpen] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [d, docs] = await Promise.all([
        getDrivers(profile.company_id),
        getDocumentsByCompany(profile.company_id),
      ]);
      setDrivers(d);
      setDocuments(docs);
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

  const openEdit = (driver: Driver) => {
    setEditId(driver.id);
    setForm({ first_name: driver.first_name, last_name: driver.last_name, id_number: driver.id_number ?? "", license_number: driver.license_number ?? "", license_expiry: driver.license_expiry ?? "", phone: driver.phone ?? "", email: driver.email ?? "" });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) { setError("First and last name are required."); return; }
    if (!user || !profile?.company_id) return;
    setSaving(true); setError(null);
    try {
      if (editId) {
        const updated = await updateDriver(editId, form);
        setDrivers((prev) => prev.map((d) => d.id === editId ? updated : d));
      } else {
        const created = await createDriver(form, profile.company_id, user.id);
        setDrivers((prev) => [created, ...prev]);
      }
      setShowForm(false); setEditId(null); setForm(emptyForm);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDriver(deleteId);
      setDrivers((prev) => prev.filter((d) => d.id !== deleteId));
      setDocuments((prev) => prev.filter((d) => d.driver_id !== deleteId));
    } catch { setError("Failed to delete driver."); }
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
        title="My Drivers"
        subtitle="Manage your driver roster and upload driver documents"
        icon={Users}
        action={
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle size={16} />Add Driver
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
        <SectionCard title={editId ? "Edit Driver" : "Add Driver"}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label><input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label><input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label><input type="text" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">License Number</label><input type="text" value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label><input type="date" value={form.license_expiry} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
            <div className="md:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : <><CheckCircle2 size={15} />{editId ? "Save Changes" : "Add Driver"}</>}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard>
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : drivers.length === 0 ? (
          <EmptyState icon={Users} title="No drivers added" message="Add your first driver to your roster." action={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors"><PlusCircle size={15} />Add Driver</button>} />
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => {
              const driverDocs = documents.filter((d) => d.driver_id === driver.id);
              const isOpen = docsOpen.has(driver.id);
              return (
                <div key={driver.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-[#9B2640]/10 flex items-center justify-center flex-shrink-0">
                      <Users size={14} className="text-[#9B2640]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{driver.first_name} {driver.last_name}</p>
                      <p className="text-xs text-gray-500">
                        {driver.license_number ? `License: ${driver.license_number}` : "No license on file"}
                        {driver.license_expiry ? ` · Exp. ${new Date(driver.license_expiry).toLocaleDateString("en-ZA")}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(driver)} className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(driver.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      <button
                        onClick={() => toggleDocs(driver.id)}
                        className="flex items-center gap-1.5 ml-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText size={12} />
                        {driverDocs.length} doc{driverDocs.length !== 1 ? "s" : ""}
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                      {driverDocs.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No documents uploaded for this driver yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {driverDocs.map((doc) => (
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
                          onClick={() => setUploadOpen(uploadOpen === driver.id ? null : driver.id)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
                        >
                          <Upload size={14} />
                          {uploadOpen === driver.id ? "Cancel Upload" : "Upload Document"}
                        </button>
                        {uploadOpen === driver.id && user && profile?.company_id && (
                          <DocUploadForm
                            companyId={profile.company_id}
                            userId={user.id}
                            categories={[...DRIVER_CATS]}
                            extra={{ driver_id: driver.id }}
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
        title="Delete Driver"
        message="Remove this driver and all their documents from your roster?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
