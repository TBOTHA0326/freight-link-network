"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocument } from "@/database/queries/documents";
import { DOCUMENT_CATEGORY_LABELS, type DocumentCategory, type DocumentRecord } from "@/database/types";

interface Props {
  companyId: string;
  userId: string;
  categories: DocumentCategory[];
  extra?: { truck_id?: string; trailer_id?: string; driver_id?: string };
  onUploaded: (doc: DocumentRecord) => void;
}

export default function DocUploadForm({ companyId, userId, categories, extra, onUploaded }: Props) {
  const [category, setCategory] = useState<DocumentCategory>(categories[0]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const doc = await uploadDocument(companyId, category, title.trim() || file.name, file, userId, extra);
      onUploaded(doc);
      setTitle("");
      setFile(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title <span className="text-gray-400">(auto from filename)</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional custom title"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#06082C] hover:text-[#06082C] transition-colors truncate">
            <Upload size={14} className="flex-shrink-0" />
            <span className="truncate">{file ? file.name : "Choose file…"}</span>
          </div>
        </label>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload
        </button>
      </div>
      {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
    </div>
  );
}
