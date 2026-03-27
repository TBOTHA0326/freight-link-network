"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle, Upload, X, CheckCircle2, FileText } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import StepIndicator from "@/components/StepIndicator";
import ProgressRing from "@/components/ProgressRing";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { createCompany } from "@/database/queries/companies";
import { updateProfile, getProfile } from "@/database/queries/auth";
import { uploadDocument } from "@/database/queries/documents";
import { supabase } from "@/lib/supabaseClient";
import { SA_PROVINCES, DOCUMENT_CATEGORY_LABELS, type DocumentCategory } from "@/database/types";
import type { AddressSuggestion } from "@/database/types";

const steps = [{ label: "Company Info" }, { label: "Documents" }];

// The 4 required documents — each gets its own dedicated upload slot
const DOCUMENT_SLOTS: { category: DocumentCategory; required: boolean; hint: string }[] = [
  { category: "cipc",         required: true,  hint: "Company registration certificate from CIPC" },
  { category: "tax_document", required: true,  hint: "Valid tax clearance certificate or PIN" },
  { category: "id_document",  required: true,  hint: "Director / owner ID document or passport" },
  { category: "registration", required: false, hint: "Any other company registration document" },
];

interface DocSlotState {
  file: File | null;
  progress: number;   // 0–100, used while uploading
  uploaded: boolean;  // true once successfully saved to DB
  error: string | null;
}

function emptySlot(): DocSlotState {
  return { file: null, progress: 0, uploaded: false, error: null };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // One slot state per document slot
  const [slots, setSlots] = useState<DocSlotState[]>(DOCUMENT_SLOTS.map(emptySlot));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1 form
  const [form, setForm] = useState({
    name: "", registration_number: "", tax_number: "",
    address: "", city: "", province: "", postal_code: "",
    country: "South Africa", phone: "", email: profile?.email ?? "",
    website: "", does_cross_border: false,
    lat: null as number | null, lng: null as number | null,
  });

  const handleAddressSelect = useCallback((value: string, suggestion?: AddressSuggestion) => {
    setForm((prev) => ({ ...prev, address: value, lat: suggestion?.lat ?? null, lng: suggestion?.lng ?? null }));
  }, []);

  const handleStep1Next = async () => {
    if (!form.name.trim()) { setError("Company name is required."); return; }

    let resolvedUserId = user?.id;
    let resolvedRole = profile?.role;
    if (!resolvedUserId) {
      const { data } = await supabase.auth.getUser();
      resolvedUserId = data.user?.id;
      if (resolvedUserId) {
        const p = await getProfile(resolvedUserId);
        resolvedRole = p?.role;
      }
    }
    if (!resolvedUserId) { setError("Not authenticated. Please sign in again."); return; }

    setSaving(true);
    setError(null);
    try {
      const company = await createCompany(
        { ...form, lat: form.lat ?? undefined, lng: form.lng ?? undefined, place_id: undefined },
        resolvedRole === "supplier" ? "supplier" : "transporter",
        resolvedUserId
      );
      await updateProfile(resolvedUserId, { company_id: company.id });
      setCompanyId(company.id);
      void refreshProfile().catch(() => {});
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company info.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (index: number, file: File) => {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, file, progress: 0, uploaded: false, error: null } : s));
  };

  const handleRemove = (index: number) => {
    setSlots((prev) => prev.map((s, i) => i === index ? emptySlot() : s));
    if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = "";
  };

  const handleSubmit = async () => {
    const requiredMissing = DOCUMENT_SLOTS.some((slot, i) => slot.required && !slots[i].file);
    if (requiredMissing) {
      setError("Please upload all 3 required documents (CIPC, Tax Document, ID Document) before submitting.");
      return;
    }

    let resolvedUserId = user?.id;
    if (!resolvedUserId) {
      const { data } = await supabase.auth.getUser();
      resolvedUserId = data.user?.id;
    }
    if (!resolvedUserId || !companyId) { setError("Missing session data. Please refresh and try again."); return; }

    setSubmitting(true);
    setError(null);

    // Upload each slot that has a file, one at a time with progress simulation
    for (let i = 0; i < DOCUMENT_SLOTS.length; i++) {
      const slot = slots[i];
      if (!slot.file) continue;

      const slotDef = DOCUMENT_SLOTS[i];
      const title = DOCUMENT_CATEGORY_LABELS[slotDef.category];

      // Animate progress to 80% while uploading
      const progressInterval = setInterval(() => {
        setSlots((prev) => prev.map((s, idx) =>
          idx === i && s.progress < 80 ? { ...s, progress: s.progress + 10 } : s
        ));
      }, 150);

      try {
        await uploadDocument(companyId, slotDef.category, title, slot.file, resolvedUserId);
        clearInterval(progressInterval);
        setSlots((prev) => prev.map((s, idx) =>
          idx === i ? { ...s, progress: 100, uploaded: true, error: null } : s
        ));
      } catch (err) {
        clearInterval(progressInterval);
        const msg = err instanceof Error ? err.message : "Upload failed";
        setSlots((prev) => prev.map((s, idx) =>
          idx === i ? { ...s, progress: 0, error: msg } : s
        ));
        setError(`Failed to upload ${title}. Please try again.`);
        setSubmitting(false);
        return;
      }
    }

    // All uploads done — mark as pending_final_approval
    try {
      await updateProfile(resolvedUserId, { registration_status: "pending_final_approval" });
      void refreshProfile().catch(() => {});
      router.push("/register/review-pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  const uploadedCount = slots.filter((s) => s.file !== null).length;
  const requiredCount = DOCUMENT_SLOTS.filter((s) => s.required).length;
  const requiredDone = DOCUMENT_SLOTS.filter((s, i) => s.required && slots[i].file !== null).length;

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block bg-[#06082C] rounded-xl px-4 py-2">
            <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={140} height={35} style={{ height: "auto" }} className="object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Company Setup</h1>
          <p className="text-sm text-gray-500">Complete your company profile to activate your account.</p>
        </div>

        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={step} />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── STEP 1: Company Info ── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Logistics (Pty) Ltd" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input type="text" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} placeholder="2024/123456/07" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                <input type="text" value={form.tax_number} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} placeholder="9012345678" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <AddressAutocomplete label="Business Address" value={form.address} onChange={handleAddressSelect} placeholder="Search your business address..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Johannesburg" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className={`${inputCls} bg-white`}>
                  <option value="">Select province</option>
                  {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input type="text" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="2000" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 11 000 0000" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@company.co.za" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://www.company.co.za" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.does_cross_border} onChange={(e) => setForm({ ...form, does_cross_border: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-[#06082C]" />
                  <span className="text-sm font-medium text-gray-700">We operate cross-border routes (Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, Eswatini)</span>
                </label>
              </div>
            </div>
            <button
              onClick={handleStep1Next}
              disabled={saving}
              className="w-full mt-8 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : "Next: Upload Documents"}
            </button>
          </div>
        )}

        {/* ── STEP 2: Document Uploads ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Compliance Documents</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Upload each document below. <span className="text-red-500 font-medium">* Required</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{requiredDone}/{requiredCount} required</p>
                <p className="text-xs text-gray-400">{uploadedCount}/{DOCUMENT_SLOTS.length} total</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {DOCUMENT_SLOTS.map((slot, i) => {
                const state = slots[i];
                const isUploading = submitting && state.progress > 0 && state.progress < 100;
                const isDone = state.uploaded || (submitting && state.progress === 100);

                return (
                  <div
                    key={slot.category}
                    className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      isDone ? "border-green-200 bg-green-50" :
                      state.error ? "border-red-200 bg-red-50" :
                      state.file ? "border-[#06082C]/20 bg-[#06082C]/5" :
                      "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {/* Progress Ring */}
                    <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {isDone ? (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 size={22} className="text-green-600" />
                        </div>
                      ) : state.file && !submitting ? (
                        <div className="w-12 h-12 rounded-full bg-[#06082C]/10 flex items-center justify-center">
                          <FileText size={20} className="text-[#06082C]" />
                        </div>
                      ) : (isUploading || (submitting && state.file)) ? (
                        <div className="relative">
                          <ProgressRing progress={state.progress} size={48} strokeWidth={4} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#06082C]">
                            {state.progress}%
                          </span>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Upload size={18} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Label & file info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900">
                          {DOCUMENT_CATEGORY_LABELS[slot.category]}
                        </p>
                        {slot.required && <span className="text-red-500 text-sm">*</span>}
                      </div>
                      {state.file ? (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{state.file.name}</p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">{slot.hint}</p>
                      )}
                      {state.error && <p className="text-xs text-red-600 mt-0.5">{state.error}</p>}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isDone && (
                        <>
                          {state.file && !submitting && (
                            <button
                              type="button"
                              onClick={() => handleRemove(i)}
                              title="Remove"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                          {!submitting && (
                            <label className="cursor-pointer">
                              <input
                                ref={(el) => { fileInputRefs.current[i] = el; }}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileSelect(i, f);
                                }}
                              />
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                                state.file
                                  ? "border border-gray-200 text-gray-600 hover:bg-gray-100"
                                  : "bg-[#06082C] text-white hover:bg-[#0a0e40]"
                              }`}>
                                <Upload size={12} />
                                {state.file ? "Replace" : "Upload"}
                              </span>
                            </label>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(0)}
                disabled={submitting}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || requiredDone < requiredCount}
                className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" />Uploading...</> : "Submit for Review"}
              </button>
            </div>

            {requiredDone < requiredCount && !submitting && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Upload all required (*) documents to continue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
