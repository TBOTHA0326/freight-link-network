"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Archive, PlusCircle, Trash2, Download, AlertCircle, Loader2, Upload, X, XCircle,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import {
  getTruckPacks, uploadTruckPack, deleteTruckPack, getTruckPackUrl,
  type TruckPack,
} from "@/database/queries/truck_packs";

export default function TruckPacksPage() {
  const { user, profile } = useAuth();
  const [packs, setPacks] = useState<TruckPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; filePath: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPacks = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try { setPacks(await getTruckPacks(profile.company_id)); }
    catch { setError("Failed to load truck packs."); }
    finally { setLoading(false); }
  }, [profile?.company_id]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const handleUpload = async () => {
    if (!file || !name.trim() || !user || !profile?.company_id) return;
    setUploading(true); setError(null);
    try {
      const pack = await uploadTruckPack(
        profile.company_id,
        name.trim(),
        description.trim() || null,
        file,
        user.id
      );
      setPacks((prev) => [pack, ...prev]);
      setName(""); setDescription(""); setFile(null); setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally { setUploading(false); }
  };

  const handleDownload = async (filePath: string) => {
    const url = await getTruckPackUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTruckPack(deleteTarget.id, deleteTarget.filePath);
      setPacks((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch { setError("Failed to delete truck pack."); }
    finally { setDeleteTarget(null); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Truck Packs"
        subtitle="Upload bundled PDF documentation packages for your fleet"
        icon={Archive}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            {showForm ? <><XCircle size={16} />Cancel</> : <><PlusCircle size={16} />Upload Pack</>}
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
        <SectionCard title="Upload Truck Pack" subtitle="Bundle all documents for a truck into a single PDF">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pack Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CA 123-456 Full Pack — March 2026"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief note about what's included…"
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF File <span className="text-red-500">*</span>
              </label>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <div className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#06082C] hover:text-[#06082C] transition-colors">
                  <Upload size={16} className="flex-shrink-0" />
                  <span className="truncate">{file ? file.name : "Choose PDF file…"}</span>
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowForm(false); setName(""); setDescription(""); setFile(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || !name.trim() || uploading}
                className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {uploading ? <><Loader2 size={15} className="animate-spin" />Uploading...</> : <><Upload size={15} />Upload Pack</>}
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="My Truck Packs"
        subtitle="Bundled PDF documentation packages — visible to admins for review"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" />
          </div>
        ) : packs.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No truck packs uploaded"
            message="Upload a bundled PDF with all relevant documents for a truck — brake tests, roadworthy, registration, and driver docs."
            action={
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors"
              >
                <PlusCircle size={15} />Upload Pack
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {packs.map((pack) => (
              <div key={pack.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#06082C]/10 flex items-center justify-center flex-shrink-0">
                  <Archive size={18} className="text-[#06082C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{pack.name}</p>
                  {pack.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{pack.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pack.file_name}
                    {pack.file_size ? ` · ${(pack.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                    {" · "}{new Date(pack.created_at).toLocaleDateString("en-ZA")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(pack.file_path)}
                    className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: pack.id, filePath: pack.file_path })}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Truck Pack"
        message="This will permanently delete this truck pack and the PDF file. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
