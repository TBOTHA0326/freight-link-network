"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck, PlusCircle, Pencil, Trash2, AlertCircle, Loader2, CheckCircle2,
  FileText, ExternalLink, Upload, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import StatusBadge from "@/components/StatusBadge";
import DocUploadForm from "@/components/admin/DocUploadForm";
import { getTrucks, createTruck, updateTruck, deleteTruck } from "@/database/queries/trucks";
import { getDocumentsByCompany, getDocumentUrl } from "@/database/queries/documents";
import { DOCUMENT_CATEGORY_LABELS, type DocumentRecord } from "@/database/types";
import type { Truck as TruckType, TruckFormInput } from "@/database/types";

const TRUCK_CATS = ["truck_registration", "roadworthy", "brake_test", "other"] as const;
const emptyForm: TruckFormInput = { registration_number: "", make: "", model: "", year: "", horse_type: "", number_of_axles: "" };

export default function TrucksPage() {
  const { user, profile } = useAuth();
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TruckFormInput>(emptyForm);
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
        getTrucks(profile.company_id),
        getDocumentsByCompany(profile.company_id),
      ]);
      setTrucks(t);
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

  const openEdit = (truck: TruckType) => {
    setEditId(truck.id);
    setForm({ registration_number: truck.registration_number, make: truck.make ?? "", model: truck.model ?? "", year: truck.year?.toString() ?? "", horse_type: truck.horse_type ?? "", number_of_axles: truck.number_of_axles?.toString() ?? "" });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.registration_number.trim()) { setError("Registration number is required."); return; }
    if (!user || !profile?.company_id) return;
    setSaving(true); setError(null);
    try {
      if (editId) {
        const updated = await updateTruck(editId, form);
        setTrucks((prev) => prev.map((t) => t.id === editId ? updated : t));
      } else {
        const created = await createTruck(form, profile.company_id, user.id);
        setTrucks((prev) => [created, ...prev]);
      }
      setShowForm(false); setEditId(null); setForm(emptyForm);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTruck(deleteId);
      setTrucks((prev) => prev.filter((t) => t.id !== deleteId));
      setDocuments((prev) => prev.filter((d) => d.truck_id !== deleteId));
    } catch { setError("Failed to delete truck."); }
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
        title="My Trucks"
        subtitle="Manage your fleet and upload truck documents"
        icon={Truck}
        action={
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle size={16} />Add Truck
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
        <SectionCard title={editId ? "Edit Truck" : "Add Truck"}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number <span className="text-red-500">*</span></label>
              <input type="text" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} placeholder="CA 123-456" className={inputCls} />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Make</label><input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Volvo" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Model</label><input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="FH16" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><input type="number" min="1990" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2022" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Horse Type</label><input type="text" value={form.horse_type} onChange={(e) => setForm({ ...form, horse_type: e.target.value })} placeholder="e.g. 6x4" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Axles</label><input type="number" min="2" max="6" value={form.number_of_axles} onChange={(e) => setForm({ ...form, number_of_axles: e.target.value })} placeholder="3" className={inputCls} /></div>
            <div className="md:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : <><CheckCircle2 size={15} />{editId ? "Save Changes" : "Add Truck"}</>}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard>
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : trucks.length === 0 ? (
          <EmptyState icon={Truck} title="No trucks added" message="Add your first truck to get started." action={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors"><PlusCircle size={15} />Add Truck</button>} />
        ) : (
          <div className="space-y-3">
            {trucks.map((truck) => {
              const truckDocs = documents.filter((d) => d.truck_id === truck.id);
              const isOpen = docsOpen.has(truck.id);
              return (
                <div key={truck.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-[#06082C]/10 flex items-center justify-center flex-shrink-0">
                      <Truck size={14} className="text-[#06082C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{truck.registration_number}</p>
                      <p className="text-xs text-gray-500">
                        {[truck.make, truck.model].filter(Boolean).join(" ") || "—"}
                        {truck.year ? ` · ${truck.year}` : ""}
                        {truck.horse_type ? ` · ${truck.horse_type}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(truck)} className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(truck.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      <button
                        onClick={() => toggleDocs(truck.id)}
                        className="flex items-center gap-1.5 ml-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText size={12} />
                        {truckDocs.length} doc{truckDocs.length !== 1 ? "s" : ""}
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                      {truckDocs.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No documents uploaded for this truck yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {truckDocs.map((doc) => (
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
                          onClick={() => setUploadOpen(uploadOpen === truck.id ? null : truck.id)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
                        >
                          <Upload size={14} />
                          {uploadOpen === truck.id ? "Cancel Upload" : "Upload Document"}
                        </button>
                        {uploadOpen === truck.id && user && profile?.company_id && (
                          <DocUploadForm
                            companyId={profile.company_id}
                            userId={user.id}
                            categories={[...TRUCK_CATS]}
                            extra={{ truck_id: truck.id }}
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
        title="Delete Truck"
        message="Are you sure you want to remove this truck and all its documents?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
