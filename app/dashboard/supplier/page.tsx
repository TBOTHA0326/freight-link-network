"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, PlusCircle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getLoadsByCompany } from "@/database/queries/loads";
import type { Load } from "@/database/types";

export default function SupplierDashboard() {
  const { profile } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const data = await getLoadsByCompany(profile.company_id);
      setLoads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id]);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  const stats = {
    total: loads.length,
    pending: loads.filter((l) => l.status === "pending").length,
    approved: loads.filter((l) => l.status === "approved").length,
    inTransit: loads.filter((l) => l.status === "in_transit").length,
  };

  return (
    <div>
      <PageHeader
        title="Supplier Dashboard"
        subtitle={`Welcome back, ${profile?.full_name ?? "there"}!`}
        icon={TrendingUp}
        action={
          <Link href="/dashboard/supplier/loads/new" className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <PlusCircle size={16} />Post a Load
          </Link>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Loads" value={stats.total} icon={Package} color="#06082C" highlight />
        <StatCard label="Pending Review" value={stats.pending} icon={Clock} color="#d97706" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} color="#059669" />
        <StatCard label="In Transit" value={stats.inTransit} icon={TrendingUp} color="#3b82f6" />
      </div>
      <SectionCard title="Recent Loads" subtitle="Your latest freight postings">
        {loading ? (
          <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : loads.length === 0 ? (
          <EmptyState icon={Package} title="No loads yet" message="Post your first freight load to get started."
            action={<Link href="/dashboard/supplier/loads/new" className="inline-flex items-center gap-2 bg-[#06082C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a0e40] transition-colors"><PlusCircle size={15} />Post a Load</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Load</th>
                  <th className="hidden sm:table-cell text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Route</th>
                  <th className="hidden sm:table-cell text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Pickup Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loads.slice(0, 8).map((load) => (
                  <tr key={load.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-gray-900">{load.title}</p>
                      {load.cargo_type && <p className="text-xs text-gray-400">{load.cargo_type}</p>}
                    </td>
                    <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-500">{load.pickup_city ?? "—"} → {load.delivery_city ?? "—"}</td>
                    <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-500">{load.pickup_date ? new Date(load.pickup_date).toLocaleDateString("en-ZA") : "—"}</td>
                    <td className="py-3"><StatusBadge status={load.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loads.length > 8 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/dashboard/supplier/loads" className="text-sm text-[#06082C] font-medium hover:underline">View all {loads.length} loads →</Link>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
