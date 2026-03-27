"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { createLoad } from "@/database/queries/loads";
import { getAllUsers } from "@/database/queries/registrations";
import { getCompanyWithOwner } from "@/database/queries/companies";
import { SA_PROVINCES, TRAILER_TYPE_LABELS, type TrailerType } from "@/database/types";
import type { Profile } from "@/database/types";

const TRAILER_TYPES = Object.keys(TRAILER_TYPE_LABELS) as TrailerType[];

export default function AdminNewLoadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Profile[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [form, setForm] = useState({
    title: "", description: "", cargo_type: "", weight_tons: "", contact_phone: "", internal_notes: "",
    pickup_address: "", pickup_city: "", pickup_province: "", pickup_country: "South Africa",
    pickup_lat: null as number | null, pickup_lng: null as number | null, pickup_place_id: "",
    pickup_date: "", pickup_time_window: "",
    delivery_address: "", delivery_city: "", delivery_province: "", delivery_country: "South Africa",
    delivery_lat: null as number | null, delivery_lng: null as number | null, delivery_place_id: "",
    delivery_date: "", delivery_time_window: "",
    required_trailer_type: [] as TrailerType[],
    budget_amount: "", special_instructions: "", is_hazardous: false, is_cross_border: false,
  });

  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const all = await getAllUsers();
      setSuppliers(all.filter((p) => p.role === "supplier" && p.registration_status === "active"));
    } catch { setError("Failed to load suppliers."); }
    finally { setLoadingSuppliers(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSupplierChange = async (userId: string) => {
    setSelectedSupplierId(userId);
    if (!userId) { setSelectedCompanyId(null); return; }
    const supplier = suppliers.find((s) => s.id === userId);
    if (supplier?.company_id) {
      try {
        const company = await getCompanyWithOwner(supplier.company_id);
        setSelectedCompanyId(company?.id ?? null);
      } catch { setSelectedCompanyId(null); }
    } else {
      setSelectedCompanyId(null);
    }
  };

  const toggleTrailerType = (t: TrailerType) => setForm((p) => ({
    ...p,
    required_trailer_type: p.required_trailer_type.includes(t) ? p.required_trailer_type.filter((x) => x !== t) : [...p.required_trailer_type, t],
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Load title is required."); return; }
    if (!form.pickup_address.trim()) { setError("Pickup address is required."); return; }
    if (!form.delivery_address.trim()) { setError("Delivery address is required."); return; }
    if (!user) { setError("Not authenticated."); return; }
    setLoading(true); setError(null);
    try {
      await createLoad(form, selectedCompanyId, user.id);
      router.push("/admin/loads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create load.");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]";

  return (
    <div>
      <PageHeader title="Create Load" subtitle="Post a load on behalf of a supplier" icon={PlusCircle}
        action={<Link href="/admin/loads" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors"><ArrowLeft size={15} />Back</Link>}
      />
      {error && <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6"><AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p></div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Assign to Supplier" subtitle="Optional — leave blank to post as admin">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Company</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              disabled={loadingSuppliers}
              className={`${inputCls} bg-white`}
            >
              <option value="">— Admin (no supplier) —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name ?? s.email}</option>
              ))}
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Load Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Load Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 20 Tons Steel Coils — JHB to DBN" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
              <input type="text" value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })} placeholder="e.g. Steel Coils" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (tons)</label>
              <input type="number" min="0" step="0.1" value={form.weight_tons} onChange={(e) => setForm({ ...form, weight_tons: e.target.value })} placeholder="20" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+27 82 000 0000" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (ZAR)</label>
              <input type="number" min="0" value={form.budget_amount} onChange={(e) => setForm({ ...form, budget_amount: e.target.value })} placeholder="15000" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea rows={2} value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} placeholder="Admin-only notes..." className={`${inputCls} resize-none`} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Pickup Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <AddressAutocomplete label="Pickup Address" required value={form.pickup_address}
                onChange={(v, s) => setForm((p) => ({ ...p, pickup_address: v, pickup_lat: s?.lat ?? p.pickup_lat, pickup_lng: s?.lng ?? p.pickup_lng }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.pickup_city} onChange={(e) => setForm({ ...form, pickup_city: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <select value={form.pickup_province} onChange={(e) => setForm({ ...form, pickup_province: e.target.value })} className={`${inputCls} bg-white`}>
                <option value="">Select</option>
                {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
              <input type="date" value={form.pickup_date} onChange={(e) => setForm({ ...form, pickup_date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
              <input type="text" value={form.pickup_time_window} onChange={(e) => setForm({ ...form, pickup_time_window: e.target.value })} placeholder="e.g. 07:00 – 10:00" className={inputCls} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Delivery Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <AddressAutocomplete label="Delivery Address" required value={form.delivery_address}
                onChange={(v, s) => setForm((p) => ({ ...p, delivery_address: v, delivery_lat: s?.lat ?? p.delivery_lat, delivery_lng: s?.lng ?? p.delivery_lng }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.delivery_city} onChange={(e) => setForm({ ...form, delivery_city: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <select value={form.delivery_province} onChange={(e) => setForm({ ...form, delivery_province: e.target.value })} className={`${inputCls} bg-white`}>
                <option value="">Select</option>
                {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
              <input type="text" value={form.delivery_time_window} onChange={(e) => setForm({ ...form, delivery_time_window: e.target.value })} placeholder="e.g. 14:00 – 17:00" className={inputCls} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Requirements">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Trailer Types</label>
              <div className="flex flex-wrap gap-2">
                {TRAILER_TYPES.map((t) => (
                  <button type="button" key={t} onClick={() => toggleTrailerType(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.required_trailer_type.includes(t) ? "bg-[#06082C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {TRAILER_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea rows={2} value={form.special_instructions} onChange={(e) => setForm({ ...form, special_instructions: e.target.value })} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_hazardous} onChange={(e) => setForm({ ...form, is_hazardous: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-[#06082C]" />
                <span className="text-sm text-gray-700">Contains hazardous materials (HAZCHEM)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_cross_border} onChange={(e) => setForm({ ...form, is_cross_border: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-[#06082C]" />
                <span className="text-sm text-gray-700">Cross-border load</span>
              </label>
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-4">
          <Link href="/admin/loads" className="flex-1 text-center py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</Link>
          <button type="submit" disabled={loading} className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 size={16} className="animate-spin" />Creating...</> : "Create Load"}
          </button>
        </div>
      </form>
    </div>
  );
}
