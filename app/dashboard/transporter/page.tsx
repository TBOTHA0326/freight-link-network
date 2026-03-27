"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Truck, Package, Users, Layers, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getApprovedLoads } from "@/database/queries/loads";
import { getTrucks } from "@/database/queries/trucks";
import { getTrailers } from "@/database/queries/trailers";
import { getDrivers } from "@/database/queries/drivers";
import type { Load } from "@/database/types";

export default function TransporterDashboard() {
  const { profile } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [counts, setCounts] = useState({ trucks: 0, trailers: 0, drivers: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [loadsData, trucks, trailers, drivers] = await Promise.all([
        getApprovedLoads(),
        getTrucks(profile.company_id),
        getTrailers(profile.company_id),
        getDrivers(profile.company_id),
      ]);
      setLoads(loadsData.slice(0, 6));
      setCounts({ trucks: trucks.length, trailers: trailers.length, drivers: drivers.length });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [profile?.company_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <PageHeader
        title="Transporter Dashboard"
        subtitle={`Welcome back, ${profile?.full_name ?? "there"}!`}
        icon={TrendingUp}
        action={
          <Link href="/dashboard/transporter/loads" className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Package size={16} />Browse Loads
          </Link>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Available Loads" value={loads.length} icon={Package} color="#06082C" />
        <StatCard label="My Trucks" value={counts.trucks} icon={Truck} color="#059669" />
        <StatCard label="My Trailers" value={counts.trailers} icon={Layers} color="#3b82f6" />
        <StatCard label="My Drivers" value={counts.drivers} icon={Users} color="#d97706" />
      </div>
      <SectionCard title="Available Loads" subtitle="Recently approved loads you can accept">
        {loading ? (
          <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" /></div>
        ) : loads.length === 0 ? (
          <EmptyState icon={Package} title="No available loads" message="Check back soon for new freight loads." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Load</th>
                  <th className="hidden sm:table-cell text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Route</th>
                  <th className="hidden sm:table-cell text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Pickup Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loads.map((load) => (
                  <tr key={load.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-gray-900">{load.title}</p>
                      {load.cargo_type && <p className="text-xs text-gray-400">{load.cargo_type}{load.weight_tons ? ` · ${load.weight_tons}t` : ""}</p>}
                    </td>
                    <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-500">{load.pickup_city ?? "—"} → {load.delivery_city ?? "—"}</td>
                    <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-500">{load.pickup_date ? new Date(load.pickup_date).toLocaleDateString("en-ZA") : "—"}</td>
                    <td className="py-3 text-sm font-medium text-gray-700">{load.budget_amount ? `R ${load.budget_amount.toLocaleString("en-ZA")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link href="/dashboard/transporter/loads" className="text-sm text-[#06082C] font-medium hover:underline">View all available loads →</Link>
        </div>
      </SectionCard>
    </div>
  );
}
