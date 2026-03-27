"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Truck, ArrowLeft, CheckCircle2, XCircle, FileText, ExternalLink,
  Loader2, AlertCircle, UserCheck, Plus, Upload, ChevronDown, ChevronUp,
  Layers, Users, X, Archive, Download,
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
import { getTrucks, createTruck } from "@/database/queries/trucks";
import { getTrailers, createTrailer } from "@/database/queries/trailers";
import { getDrivers, createDriver } from "@/database/queries/drivers";
import { getTruckPacks, uploadTruckPack, getTruckPackUrl, type TruckPack } from "@/database/queries/truck_packs";
import { sendAccountActivated, sendSetupRejected } from "@/lib/email";
import {
  DOCUMENT_CATEGORY_LABELS, TRAILER_TYPE_LABELS,
  type DocumentRecord as Document, type DocumentStatus,
  type Truck as TruckType, type Trailer, type Driver,
  type TruckFormInput, type TrailerFormInput, type DriverFormInput,
  type TrailerType,
} from "@/database/types";
import type { Profile } from "@/database/types";

// ─── Category sets ────────────────────────────────────────────────────────────

const COMPANY_CATS = ["cipc", "tax_document", "id_document", "registration", "other"] as const;
const TRUCK_CATS = ["truck_registration", "roadworthy", "brake_test", "other"] as const;
const TRAILER_CATS = ["trailer_registration", "roadworthy", "other"] as const;
const DRIVER_CATS = ["drivers_license", "pdp", "passport", "id_document", "other"] as const;

// ─── Inline doc list ─────────────────────────────────────────────────────────

function DocRow({
  doc,
  onReview,
  onView,
}: {
  doc: Document;
  onReview: (id: string, status: DocumentStatus) => void;
  onView: (path: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <FileText size={14} className="text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
        <p className="text-xs text-gray-500">{DOCUMENT_CATEGORY_LABELS[doc.category]}</p>
      </div>
      <StatusBadge status={doc.status} />
      <button onClick={() => onView(doc.file_path)} className="p-1.5 text-gray-400 hover:text-[#06082C] transition-colors"><ExternalLink size={14} /></button>
      {doc.status !== "approved" && <button onClick={() => onReview(doc.id, "approved")} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Approve"><CheckCircle2 size={14} /></button>}
      {doc.status !== "rejected" && <button onClick={() => onReview(doc.id, "rejected")} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Reject"><XCircle size={14} /></button>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const BLANK_TRUCK: TruckFormInput = { registration_number: "", make: "", model: "", year: "", horse_type: "", number_of_axles: "" };
const BLANK_TRAILER: TrailerFormInput = { registration_number: "", trailer_type: "tautliner", make: "", model: "", year: "", length_meters: "", payload_capacity_tons: "" };
const BLANK_DRIVER: DriverFormInput = { first_name: "", last_name: "", id_number: "", license_number: "", license_expiry: "", phone: "", email: "" };

export default function AdminTransporterDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<ReturnType<typeof Object.assign> | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [truckPacks, setTruckPacks] = useState<TruckPack[]>([]);
  const [showPackUpload, setShowPackUpload] = useState(false);
  const [packName, setPackName] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [packFile, setPackFile] = useState<File | null>(null);
  const [uploadingPack, setUploadingPack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Upload panel open for: 'company' | truck.id | trailer.id | driver.id | null
  const [uploadOpen, setUploadOpen] = useState<string | null>(null);

  // Add forms
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [truckForm, setTruckForm] = useState<TruckFormInput>(BLANK_TRUCK);
  const [savingTruck, setSavingTruck] = useState(false);

  const [showAddTrailer, setShowAddTrailer] = useState(false);
  const [trailerForm, setTrailerForm] = useState<TrailerFormInput>(BLANK_TRAILER);
  const [savingTrailer, setSavingTrailer] = useState(false);

  const [showAddDriver, setShowAddDriver] = useState(false);
  const [driverForm, setDriverForm] = useState<DriverFormInput>(BLANK_DRIVER);
  const [savingDriver, setSavingDriver] = useState(false);

  // Expanded doc panels per entity
  const [docsOpen, setDocsOpen] = useState<Set<string>>(new Set());
  const toggleDocs = (id: string) =>
    setDocsOpen((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const p = await getProfile(userId);
      setProfile(p);
      if (p?.company_id) {
        const [c, docs, t, tr, d, packs] = await Promise.all([
          getCompanyWithOwner(p.company_id),
          getDocumentsByCompany(p.company_id),
          getTrucks(p.company_id),
          getTrailers(p.company_id),
          getDrivers(p.company_id),
          getTruckPacks(p.company_id),
        ]);
        setCompany(c); setDocuments(docs); setTrucks(t); setTrailers(tr); setDrivers(d); setTruckPacks(packs);
      }
    } catch { setError("Failed to load data."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleAddTruck = async () => {
    if (!company || !user || !truckForm.registration_number.trim()) {
      setError("Registration number is required."); return;
    }
    setSavingTruck(true);
    try {
      const truck = await createTruck(truckForm, company.id, user.id);
      setTrucks((prev) => [truck, ...prev]);
      setTruckForm(BLANK_TRUCK);
      setShowAddTruck(false);
    } catch { setError("Failed to add truck."); }
    finally { setSavingTruck(false); }
  };

  const handleAddTrailer = async () => {
    if (!company || !user || !trailerForm.registration_number.trim()) {
      setError("Registration number is required."); return;
    }
    setSavingTrailer(true);
    try {
      const trailer = await createTrailer(trailerForm, company.id, user.id);
      setTrailers((prev) => [trailer, ...prev]);
      setTrailerForm(BLANK_TRAILER);
      setShowAddTrailer(false);
    } catch { setError("Failed to add trailer."); }
    finally { setSavingTrailer(false); }
  };

  const handleAddDriver = async () => {
    if (!company || !user || !driverForm.first_name.trim() || !driverForm.last_name.trim()) {
      setError("First and last name are required."); return;
    }
    setSavingDriver(true);
    try {
      const driver = await createDriver(driverForm, company.id, user.id);
      setDrivers((prev) => [driver, ...prev]);
      setDriverForm(BLANK_DRIVER);
      setShowAddDriver(false);
    } catch { setError("Failed to add driver."); }
    finally { setSavingDriver(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-gray-400" /></div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">Profile not found.</div>;

  const canActivate = profile.registration_status === "pending_final_approval" || profile.registration_status === "rejected";
  const companyDocs = documents.filter((d) => !d.truck_id && !d.trailer_id && !d.driver_id);

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="space-y-6">
      <PageHeader title={profile.full_name ?? profile.email} subtitle="Transporter account details" icon={Truck}
        action={<Link href="/admin/transporters" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors"><ArrowLeft size={15} />Back</Link>}
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
            <div className="flex items-center gap-3"><p className="text-sm font-medium text-gray-900">{profile.full_name ?? "—"}</p><StatusBadge status={profile.registration_status} /></div>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          <div className="flex gap-3">
            {canActivate && (
              <button onClick={handleActivate} disabled={activating} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
                {activating ? <><Loader2 size={15} className="animate-spin" />Activating...</> : <><UserCheck size={15} />Activate Account</>}
              </button>
            )}
            {profile.registration_status !== "rejected" && (
              <button onClick={() => setShowRejectForm(!showRejectForm)} className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                <XCircle size={15} />Reject
              </button>
            )}
          </div>
        </div>
        {showRejectForm && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Rejection reason..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] resize-none mb-3" />
            <button onClick={handleReject} disabled={rejecting} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2">
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
            <div><p className="text-xs text-gray-400 mb-0.5">Cross-border</p><p className="text-gray-700">{company.does_cross_border ? "Yes" : "No"}</p></div>
          </div>
        </SectionCard>
      )}

      {/* ── Company Documents ── */}
      {company && (
        <SectionCard title="Company Documents" subtitle="Review and upload compliance documents">
          <div className="space-y-3">
            {companyDocs.length === 0 && uploadOpen !== "company" && (
              <p className="text-sm text-gray-400 text-center py-4">No company documents uploaded yet.</p>
            )}
            {companyDocs.map((doc) => (
              <DocRow key={doc.id} doc={doc} onReview={handleReviewDoc} onView={handleViewDoc} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setUploadOpen(uploadOpen === "company" ? null : "company")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
            >
              <Upload size={14} />
              {uploadOpen === "company" ? "Cancel Upload" : "Upload Document"}
            </button>
            {uploadOpen === "company" && user && (
              <DocUploadForm
                companyId={company.id}
                userId={user.id}
                categories={[...COMPANY_CATS]}
                onUploaded={(doc) => { setDocuments((prev) => [doc, ...prev]); setUploadOpen(null); }}
              />
            )}
          </div>
        </SectionCard>
      )}

      {/* ── Trucks ── */}
      {company && (
        <SectionCard
          title={`Trucks (${trucks.length})`}
          subtitle="Add and manage fleet trucks"
        >
          {/* Add truck toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddTruck(!showAddTruck)}
              className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {showAddTruck ? <X size={14} /> : <Plus size={14} />}
              {showAddTruck ? "Cancel" : "Add Truck"}
            </button>
          </div>

          {/* Add truck form */}
          {showAddTruck && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <p className="text-sm font-semibold text-gray-800">New Truck</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Reg. Number <span className="text-[#9B2640]">*</span></label>
                  <input className={inputCls} placeholder="e.g. CA 123-456" value={truckForm.registration_number} onChange={(e) => setTruckForm((f) => ({ ...f, registration_number: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Make</label>
                  <input className={inputCls} placeholder="e.g. Volvo" value={truckForm.make} onChange={(e) => setTruckForm((f) => ({ ...f, make: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <input className={inputCls} placeholder="e.g. FH16" value={truckForm.model} onChange={(e) => setTruckForm((f) => ({ ...f, model: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Year</label>
                  <input className={inputCls} type="number" placeholder="e.g. 2020" value={truckForm.year} onChange={(e) => setTruckForm((f) => ({ ...f, year: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Horse Type</label>
                  <input className={inputCls} placeholder="e.g. 6x4" value={truckForm.horse_type} onChange={(e) => setTruckForm((f) => ({ ...f, horse_type: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>No. of Axles</label>
                  <input className={inputCls} type="number" min="2" max="6" placeholder="2–6" value={truckForm.number_of_axles} onChange={(e) => setTruckForm((f) => ({ ...f, number_of_axles: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddTruck} disabled={savingTruck} className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
                {savingTruck ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Save Truck
              </button>
            </div>
          )}

          {/* Truck list */}
          {trucks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No trucks added yet.</p>
          ) : (
            <div className="space-y-3">
              {trucks.map((truck) => {
                const truckDocs = documents.filter((d) => d.truck_id === truck.id);
                const isOpen = docsOpen.has(truck.id);
                const uploadingThis = uploadOpen === truck.id;
                return (
                  <div key={truck.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#06082C] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{truck.registration_number}</p>
                          <p className="text-xs text-gray-500">{[truck.make, truck.model, truck.year].filter(Boolean).join(" ") || "—"}{truck.horse_type ? ` · ${truck.horse_type}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{truckDocs.length} doc{truckDocs.length !== 1 ? "s" : ""}</span>
                        <button
                          onClick={() => toggleDocs(truck.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#06082C] hover:text-[#9B2640] transition-colors px-2 py-1 rounded-lg hover:bg-white"
                        >
                          {isOpen ? <><ChevronUp size={13} />Hide</> : <><ChevronDown size={13} />Details</>}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-4 py-3 space-y-2">
                        {truckDocs.length === 0 && !uploadingThis && (
                          <p className="text-xs text-gray-400 py-1">No documents for this truck.</p>
                        )}
                        {truckDocs.map((doc) => (
                          <DocRow key={doc.id} doc={doc} onReview={handleReviewDoc} onView={handleViewDoc} />
                        ))}
                        <div className="pt-2">
                          <button
                            onClick={() => setUploadOpen(uploadingThis ? null : truck.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
                          >
                            <Upload size={12} />
                            {uploadingThis ? "Cancel" : "Upload Document"}
                          </button>
                          {uploadingThis && user && (
                            <DocUploadForm
                              companyId={company.id}
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
      )}

      {/* ── Trailers ── */}
      {company && (
        <SectionCard title={`Trailers (${trailers.length})`} subtitle="Add and manage fleet trailers">
          <div className="mb-4">
            <button
              onClick={() => setShowAddTrailer(!showAddTrailer)}
              className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {showAddTrailer ? <X size={14} /> : <Plus size={14} />}
              {showAddTrailer ? "Cancel" : "Add Trailer"}
            </button>
          </div>

          {showAddTrailer && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <p className="text-sm font-semibold text-gray-800">New Trailer</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Reg. Number <span className="text-[#9B2640]">*</span></label>
                  <input className={inputCls} placeholder="e.g. CA 789-012" value={trailerForm.registration_number} onChange={(e) => setTrailerForm((f) => ({ ...f, registration_number: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Trailer Type <span className="text-[#9B2640]">*</span></label>
                  <select className={inputCls} value={trailerForm.trailer_type} onChange={(e) => setTrailerForm((f) => ({ ...f, trailer_type: e.target.value as TrailerType }))}>
                    {Object.entries(TRAILER_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Make</label>
                  <input className={inputCls} placeholder="e.g. SA Truck Bodies" value={trailerForm.make} onChange={(e) => setTrailerForm((f) => ({ ...f, make: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <input className={inputCls} placeholder="Model" value={trailerForm.model} onChange={(e) => setTrailerForm((f) => ({ ...f, model: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Year</label>
                  <input className={inputCls} type="number" placeholder="e.g. 2019" value={trailerForm.year} onChange={(e) => setTrailerForm((f) => ({ ...f, year: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Length (m)</label>
                  <input className={inputCls} type="number" step="0.1" placeholder="e.g. 13.6" value={trailerForm.length_meters} onChange={(e) => setTrailerForm((f) => ({ ...f, length_meters: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Payload (tons)</label>
                  <input className={inputCls} type="number" step="0.1" placeholder="e.g. 30" value={trailerForm.payload_capacity_tons} onChange={(e) => setTrailerForm((f) => ({ ...f, payload_capacity_tons: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddTrailer} disabled={savingTrailer} className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
                {savingTrailer ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Save Trailer
              </button>
            </div>
          )}

          {trailers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No trailers added yet.</p>
          ) : (
            <div className="space-y-3">
              {trailers.map((trailer) => {
                const trailerDocs = documents.filter((d) => d.trailer_id === trailer.id);
                const isOpen = docsOpen.has(trailer.id);
                const uploadingThis = uploadOpen === trailer.id;
                return (
                  <div key={trailer.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#06082C] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Layers size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{trailer.registration_number}</p>
                          <p className="text-xs text-gray-500">{TRAILER_TYPE_LABELS[trailer.trailer_type]}{trailer.payload_capacity_tons ? ` · ${trailer.payload_capacity_tons}t` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{trailerDocs.length} doc{trailerDocs.length !== 1 ? "s" : ""}</span>
                        <button onClick={() => toggleDocs(trailer.id)} className="inline-flex items-center gap-1 text-xs font-medium text-[#06082C] hover:text-[#9B2640] transition-colors px-2 py-1 rounded-lg hover:bg-white">
                          {isOpen ? <><ChevronUp size={13} />Hide</> : <><ChevronDown size={13} />Details</>}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-4 py-3 space-y-2">
                        {trailerDocs.length === 0 && !uploadingThis && <p className="text-xs text-gray-400 py-1">No documents for this trailer.</p>}
                        {trailerDocs.map((doc) => (
                          <DocRow key={doc.id} doc={doc} onReview={handleReviewDoc} onView={handleViewDoc} />
                        ))}
                        <div className="pt-2">
                          <button onClick={() => setUploadOpen(uploadingThis ? null : trailer.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors">
                            <Upload size={12} />{uploadingThis ? "Cancel" : "Upload Document"}
                          </button>
                          {uploadingThis && user && (
                            <DocUploadForm
                              companyId={company.id}
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
      )}

      {/* ── Drivers ── */}
      {company && (
        <SectionCard title={`Drivers (${drivers.length})`} subtitle="Add and manage fleet drivers">
          <div className="mb-4">
            <button
              onClick={() => setShowAddDriver(!showAddDriver)}
              className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {showAddDriver ? <X size={14} /> : <Plus size={14} />}
              {showAddDriver ? "Cancel" : "Add Driver"}
            </button>
          </div>

          {showAddDriver && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <p className="text-sm font-semibold text-gray-800">New Driver</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>First Name <span className="text-[#9B2640]">*</span></label>
                  <input className={inputCls} placeholder="First name" value={driverForm.first_name} onChange={(e) => setDriverForm((f) => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Last Name <span className="text-[#9B2640]">*</span></label>
                  <input className={inputCls} placeholder="Last name" value={driverForm.last_name} onChange={(e) => setDriverForm((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>ID Number</label>
                  <input className={inputCls} placeholder="SA ID number" value={driverForm.id_number} onChange={(e) => setDriverForm((f) => ({ ...f, id_number: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>License Number</label>
                  <input className={inputCls} placeholder="License number" value={driverForm.license_number} onChange={(e) => setDriverForm((f) => ({ ...f, license_number: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>License Expiry</label>
                  <input className={inputCls} type="date" value={driverForm.license_expiry} onChange={(e) => setDriverForm((f) => ({ ...f, license_expiry: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} placeholder="+27…" value={driverForm.phone} onChange={(e) => setDriverForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} type="email" placeholder="driver@example.com" value={driverForm.email} onChange={(e) => setDriverForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddDriver} disabled={savingDriver} className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
                {savingDriver ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Save Driver
              </button>
            </div>
          )}

          {drivers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No drivers added yet.</p>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver) => {
                const driverDocs = documents.filter((d) => d.driver_id === driver.id);
                const isOpen = docsOpen.has(driver.id);
                const uploadingThis = uploadOpen === driver.id;
                return (
                  <div key={driver.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#9B2640] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{driver.first_name} {driver.last_name}</p>
                          <p className="text-xs text-gray-500">{driver.license_number ? `PDP: ${driver.license_number}` : "No license on file"}{driver.license_expiry ? ` · Exp. ${new Date(driver.license_expiry).toLocaleDateString("en-ZA")}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{driverDocs.length} doc{driverDocs.length !== 1 ? "s" : ""}</span>
                        <button onClick={() => toggleDocs(driver.id)} className="inline-flex items-center gap-1 text-xs font-medium text-[#06082C] hover:text-[#9B2640] transition-colors px-2 py-1 rounded-lg hover:bg-white">
                          {isOpen ? <><ChevronUp size={13} />Hide</> : <><ChevronDown size={13} />Details</>}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-4 py-3 space-y-2">
                        {driverDocs.length === 0 && !uploadingThis && <p className="text-xs text-gray-400 py-1">No documents for this driver.</p>}
                        {driverDocs.map((doc) => (
                          <DocRow key={doc.id} doc={doc} onReview={handleReviewDoc} onView={handleViewDoc} />
                        ))}
                        <div className="pt-2">
                          <button onClick={() => setUploadOpen(uploadingThis ? null : driver.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors">
                            <Upload size={12} />{uploadingThis ? "Cancel" : "Upload Document"}
                          </button>
                          {uploadingThis && user && (
                            <DocUploadForm
                              companyId={company.id}
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
      )}

      {/* ── Truck Packs ── */}
      {company && (
        <SectionCard
          title={`Truck Packs (${truckPacks.length})`}
          subtitle="Bundled PDF documentation packages — upload or download on behalf of the transporter"
        >
          {/* Upload toggle */}
          <div className="mb-4">
            <button
              onClick={() => { setShowPackUpload(!showPackUpload); setPackName(""); setPackDesc(""); setPackFile(null); }}
              className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {showPackUpload ? <><X size={14} />Cancel</> : <><Upload size={14} />Upload Pack</>}
            </button>
          </div>

          {/* Upload form */}
          {showPackUpload && user && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <p className="text-sm font-semibold text-gray-800">New Truck Pack</p>
              <div>
                <label className={labelCls}>Pack Name <span className="text-[#9B2640]">*</span></label>
                <input className={inputCls} placeholder="e.g. CA 123-456 Full Pack — March 2026" value={packName} onChange={(e) => setPackName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={2} className={`${inputCls} resize-none`} placeholder="Brief note about what's included…" value={packDesc} onChange={(e) => setPackDesc(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>PDF File <span className="text-[#9B2640]">*</span></label>
                <label className="block cursor-pointer">
                  <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => setPackFile(e.target.files?.[0] ?? null)} />
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#06082C] hover:text-[#06082C] transition-colors">
                    <Upload size={14} className="flex-shrink-0" />
                    <span className="truncate">{packFile ? packFile.name : "Choose PDF file…"}</span>
                  </div>
                </label>
              </div>
              <button
                disabled={!packFile || !packName.trim() || uploadingPack}
                onClick={async () => {
                  if (!packFile || !packName.trim()) return;
                  setUploadingPack(true);
                  try {
                    const pack = await uploadTruckPack(company.id, packName.trim(), packDesc.trim() || null, packFile, user.id);
                    setTruckPacks((prev) => [pack, ...prev]);
                    setShowPackUpload(false); setPackName(""); setPackDesc(""); setPackFile(null);
                  } catch { setError("Failed to upload truck pack."); }
                  finally { setUploadingPack(false); }
                }}
                className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                {uploadingPack ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload Pack
              </button>
            </div>
          )}

          {truckPacks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No truck packs uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {truckPacks.map((pack) => (
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
                  <button
                    onClick={async () => {
                      const url = await getTruckPackUrl(pack.file_path);
                      if (url) window.open(url, "_blank");
                    }}
                    className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
                  >
                    <Download size={13} />Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
