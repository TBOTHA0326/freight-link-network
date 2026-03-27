"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, MapPin, Calendar, Weight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import { getApprovedLoads } from "@/database/queries/loads";
import { TRAILER_TYPE_LABELS } from "@/database/types";
import type { Load } from "@/database/types";

export default function TransporterLoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovedLoads();
      setLoads(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  const filtered = loads.filter((l) =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
    (l.pickup_city ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (l.delivery_city ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (l.cargo_type ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Available Loads" subtitle="Browse approved freight loads" icon={Package} />
      <SectionCard>
        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city, or cargo type..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No loads found" message={search ? "Try a different search term." : "No approved loads available right now."} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((load) => (
              <div key={load.id} className="border border-gray-100 rounded-xl p-5 hover:border-[#06082C]/20 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">{load.title}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    {load.is_hazardous && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Hazmat</span>}
                    {load.is_cross_border && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Cross-border</span>}
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="flex-shrink-0 text-green-500" />
                    <span>{load.pickup_address ?? load.pickup_city ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="flex-shrink-0 text-[#9B2640]" />
                    <span>{load.delivery_address ?? load.delivery_city ?? "—"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {load.pickup_date && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(load.pickup_date).toLocaleDateString("en-ZA")}</span>}
                  {load.weight_tons && <span className="flex items-center gap-1"><Weight size={11} />{load.weight_tons}t</span>}
                  {load.cargo_type && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{load.cargo_type}</span>}
                </div>
                {load.required_trailer_type && load.required_trailer_type.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {load.required_trailer_type.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-[#06082C]/8 text-[#06082C] text-xs rounded-full font-medium">{TRAILER_TYPE_LABELS[t]}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {load.budget_amount ? `R ${load.budget_amount.toLocaleString("en-ZA")}` : "Budget on request"}
                  </span>
                  {load.contact_phone && (
                    <a href={`tel:${load.contact_phone}`} className="text-xs text-[#06082C] font-medium hover:underline">{load.contact_phone}</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
