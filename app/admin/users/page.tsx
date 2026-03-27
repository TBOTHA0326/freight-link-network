"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Loader2, AlertCircle, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getAllUsers } from "@/database/queries/registrations";
import type { Profile, UserRole, RegistrationStatus } from "@/database/types";

const ROLE_FILTERS: { label: string; value: UserRole | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Transporters", value: "transporter" },
  { label: "Suppliers", value: "supplier" },
  { label: "Admins", value: "admin" },
];

const STATUS_FILTERS: { label: string; value: RegistrationStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending Setup", value: "approved_pending_setup" },
  { label: "Pending Approval", value: "pending_final_approval" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllUsers();
      setProfiles(all);
    } catch { setError("Failed to load users."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = profiles.filter((p) => {
    if (roleFilter !== "all" && p.role !== roleFilter) return false;
    if (statusFilter !== "all" && p.registration_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(p.full_name ?? "").toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader title="Users" subtitle="All platform users" icon={Users} />
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
          <AlertCircle size={16} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] bg-white text-gray-700"
          >
            {ROLE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | "all")}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] bg-white text-gray-700"
          >
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-400 mb-4">{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</p>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" message="No users match the current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">{p.full_name ?? "—"}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{p.email}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge status={p.registration_status} /></td>
                    <td className="py-3 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString("en-ZA")}</td>
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
