"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Truck, Loader2, AlertCircle, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getAllUsers } from "@/database/queries/registrations";
import type { Profile } from "@/database/types";

export default function AdminTransportersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllUsers();
      setProfiles(all.filter((p) => p.role === "transporter"));
    } catch { setError("Failed to load transporters."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = profiles.filter((p) =>
    !search || (p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Transporters" subtitle="All registered transporter companies" icon={Truck} />
      {error && <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6"><AlertCircle size={16} className="text-red-500 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}
      <SectionCard>
        <div className="mb-5 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transporters..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Truck} title="No transporters found" message="No transporter accounts registered yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Registered</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">{p.full_name ?? "—"}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{p.email}</td>
                    <td className="py-3 pr-4"><StatusBadge status={p.registration_status} /></td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString("en-ZA")}</td>
                    <td className="py-3"><Link href={`/admin/transporters/${p.id}`} className="text-xs font-medium text-[#06082C] hover:underline">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
