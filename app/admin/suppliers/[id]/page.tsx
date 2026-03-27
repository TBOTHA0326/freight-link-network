"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, ArrowLeft, CheckCircle2, XCircle, FileText, ExternalLink,
  Loader2, AlertCircle, UserCheck, Upload, X,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import DocUploadForm from "@/components/admin/DocUploadForm";
import { useAuth } from "@/components/AuthProvider";
import { getProfile } from "@/database/queries/auth";
import { getCompanyWithOwner } from "@/database/queries/companies";
import { getDocumentsByCompany, reviewDocument, getDocumentUrl } from "@/database/queries/documents";
import { activateUser, rejectRegistration } from "@/database/queries/registrations";
import { sendAccountActivated, sendSetupRejected } from "@/lib/email";
import { DOCUMENT_CATEGORY_LABELS, type DocumentRecord as Document, type DocumentStatus } from "@/database/types";
import type { Profile } from "@/database/types";

const COMPANY_CATS = ["cipc", "tax_document", "id_document", "registration", "other"] as const;

export default function AdminSupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<ReturnType<typeof Object.assign> | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const p = await getProfile(userId);
      setProfile(p);
      if (p?.company_id) {
        const [c, docs] = await Promise.all([
          getCompanyWithOwner(p.company_id),
          getDocumentsByCompany(p.company_id),
        ]);
        setCompany(c);
        setDocuments(docs);
      }
    } catch { setError("Failed to load data."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // suppress unused router warning — keep for future navigation
  void router;

  const handleReviewDoc = async (docId: string, status: DocumentStatus) => {
    try {
      await reviewDocument(docId, status);
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status } : d));
    } catch { setError("Failed to review document."); }
  };

  const handleActivate = async () => {
    if (!profile) return;
    setActivating(true);
    try {
      await activateUser(profile.id);
      setProfile((prev) => prev ? { ...prev, registration_status: "active" } : prev);
      sendAccountActivated(profile.email, profile.full_name ?? profile.email);
    } catch { setError("Failed to activate account."); }
    finally { setActivating(false); }
  };

  const handleReject = async () => {
    if (!profile || !rejectReason.trim()) { setError("Enter a rejection reason."); return; }
    setRejecting(true);
    try {
      await rejectRegistration(profile.id, rejectReason);
      setProfile((prev) => prev ? { ...prev, registration_status: "rejected" } : prev);
      sendSetupRejected(profile.email, profile.full_name ?? profile.email, rejectReason);
      setShowRejectForm(false);
    } catch { setError("Failed to reject."); }
    finally { setRejecting(false); }
  };

  const handleViewDoc = async (filePath: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-gray-400" /></div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">Profile not found.</div>;

  const canActivate = profile.registration_status === "pending_final_approval" || profile.registration_status === "rejected";

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile.full_name ?? profile.email}
        subtitle="Supplier account details"
        icon={Building2}
        action={
          <Link href="/admin/suppliers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
            <ArrowLeft size={15} />Back
          </Link>
        }
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={16} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      )}

      {/* ── Account Status ── */}
      <SectionCard title="Account Status">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-gray-900">{profile.full_name ?? "—"}</p>
              <StatusBadge status={profile.registration_status} />
            </div>
            <p className="text-sm text-gray-500">{profile.email}</p>
            {profile.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
          </div>
          <div className="flex gap-3">
            {canActivate && (
              <button
                onClick={handleActivate}
                disabled={activating}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {activating ? <><Loader2 size={15} className="animate-spin" />Activating...</> : <><UserCheck size={15} />Activate Account</>}
              </button>
            )}
            {profile.registration_status !== "rejected" && (
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                <XCircle size={15} />Reject
              </button>
            )}
          </div>
        </div>
        {showRejectForm && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rejection reason</label>
            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] resize-none mb-3"
            />
            <button
              onClick={handleReject}
              disabled={rejecting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {rejecting ? <><Loader2 size={14} className="animate-spin" />Rejecting...</> : "Confirm Rejection"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Company Info ── */}
      {company && (
        <SectionCard title="Company Information">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs text-gray-400 mb-0.5">Company Name</p><p className="font-medium text-gray-900">{company.name}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Reg. Number</p><p className="text-gray-700">{company.registration_number ?? "—"}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Tax Number</p><p className="text-gray-700">{company.tax_number ?? "—"}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">City / Province</p><p className="text-gray-700">{[company.city, company.province].filter(Boolean).join(", ") || "—"}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="text-gray-700">{company.phone ?? "—"}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Cross-border</p><p className="text-gray-700">{company.does_cross_border ? "Yes" : "No"}</p></div>
          </div>
        </SectionCard>
      )}

      {/* ── Documents ── */}
      <SectionCard
        title="Compliance Documents"
        subtitle="Review, approve, and upload documents on behalf of the supplier"
      >
        {documents.length === 0 && !showUpload ? (
          <div className="text-center py-8 text-gray-400 text-sm">No documents uploaded yet.</div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-500">{DOCUMENT_CATEGORY_LABELS[doc.category]}</p>
                </div>
                <StatusBadge status={doc.status} />
                <button onClick={() => handleViewDoc(doc.file_path)} className="p-1.5 text-gray-400 hover:text-[#06082C] transition-colors">
                  <ExternalLink size={14} />
                </button>
                {doc.status !== "approved" && (
                  <button onClick={() => handleReviewDoc(doc.id, "approved")} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Approve">
                    <CheckCircle2 size={14} />
                  </button>
                )}
                {doc.status !== "rejected" && (
                  <button onClick={() => handleReviewDoc(doc.id, "rejected")} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Reject">
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload section */}
        {company && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
            >
              <Upload size={14} />
              {showUpload ? "Cancel Upload" : "Upload Document"}
            </button>
            {showUpload && user && (
              <DocUploadForm
                companyId={company.id}
                userId={user.id}
                categories={[...COMPANY_CATS]}
                onUploaded={(doc) => {
                  setDocuments((prev) => [doc, ...prev]);
                  setShowUpload(false);
                }}
              />
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
