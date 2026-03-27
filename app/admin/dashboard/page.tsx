"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Package, Building2, Truck, Clock,
  CheckCircle2, TrendingUp, AlertCircle, ArrowRight, Activity,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getAdminDashboardStats } from "@/database/queries/registrations";
import type { DashboardStats } from "@/database/types";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try { setStats(await getAdminDashboardStats()); }
    catch (err) { setError("Failed to load stats."); console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <SkeletonBento />;

  return (
    <div className="space-y-4">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and key metrics" icon={LayoutDashboard} />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={16} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {stats && (
        <>
          {/* ── Bento Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* ① HERO — Total Loads (2×1) */}
            <motion.div
              {...fadeUp(0)}
              className="col-span-2 bg-gradient-to-br from-[#06082C] via-[#0d1036] to-[#141852] rounded-2xl p-6 flex flex-col min-h-[168px] shadow-lg"
            >
              <div className="flex items-start justify-between mb-auto">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Total Loads</p>
                  <p className="text-6xl font-bold text-white leading-none tracking-tight">{stats.total_loads}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-white/80" />
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {stats.approved_loads} approved
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  {stats.in_transit_loads} in transit
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
                  {stats.completed_loads} completed
                </span>
              </div>
            </motion.div>

            {/* ② Total Users */}
            <motion.div {...fadeUp(0.05)} className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col min-h-[168px] shadow-sm hover:shadow-md transition-all hover:-translate-y-px">
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Total Users</p>
                <div className="w-8 h-8 rounded-xl bg-[#06082C]/10 flex items-center justify-center">
                  <Users size={14} className="text-[#06082C]" />
                </div>
              </div>
              <p className="text-5xl font-bold text-gray-900 mt-3 leading-none">{stats.total_users}</p>
            </motion.div>

            {/* ③ Active Companies */}
            <motion.div {...fadeUp(0.1)} className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col min-h-[168px] shadow-sm hover:shadow-md transition-all hover:-translate-y-px">
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Active Cos</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Building2 size={14} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-5xl font-bold text-gray-900 mt-3 leading-none">{stats.active_companies}</p>
            </motion.div>

            {/* ④ Transporters */}
            <motion.div {...fadeUp(0.15)} className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-px">
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Transporters</p>
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Truck size={14} className="text-violet-600" />
                </div>
              </div>
              <p className="text-5xl font-bold text-gray-900 mt-3 leading-none">{stats.total_transporters}</p>
            </motion.div>

            {/* ⑤ Suppliers */}
            <motion.div {...fadeUp(0.2)} className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-px">
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Suppliers</p>
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Building2 size={14} className="text-rose-400" />
                </div>
              </div>
              <p className="text-5xl font-bold text-gray-900 mt-3 leading-none">{stats.total_suppliers}</p>
            </motion.div>

            {/* ⑥ Pending Approvals — amber when non-zero */}
            <motion.div
              {...fadeUp(0.25)}
              className={`col-span-1 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-px ${
                stats.pending_approvals > 0
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-auto">
                <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${stats.pending_approvals > 0 ? "text-amber-500" : "text-gray-400"}`}>
                  Pending
                </p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stats.pending_approvals > 0 ? "bg-amber-100" : "bg-gray-50"}`}>
                  <Clock size={14} className={stats.pending_approvals > 0 ? "text-amber-600" : "text-gray-400"} />
                </div>
              </div>
              <p className={`text-5xl font-bold mt-3 leading-none ${stats.pending_approvals > 0 ? "text-amber-700" : "text-gray-900"}`}>
                {stats.pending_approvals}
              </p>
              {stats.pending_approvals > 0 && (
                <Link href="/admin/approvals" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  Review now <ArrowRight size={11} />
                </Link>
              )}
            </motion.div>

            {/* ⑦ In Transit */}
            <motion.div {...fadeUp(0.3)} className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-px">
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">In Transit</p>
                <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                  <TrendingUp size={14} className="text-sky-400" />
                </div>
              </div>
              <p className="text-5xl font-bold text-gray-900 mt-3 leading-none">{stats.in_transit_loads}</p>
            </motion.div>

            {/* ⑧ Load Pipeline — wide (3 cols) */}
            <motion.div {...fadeUp(0.35)} className="col-span-2 lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">Load Pipeline</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Pending Review", value: stats.pending_loads ?? 0, bar: "bg-amber-300", track: "bg-amber-50", num: "text-amber-500" },
                  { label: "Approved",        value: stats.approved_loads,    bar: "bg-emerald-400", track: "bg-emerald-50", num: "text-emerald-600" },
                  { label: "In Transit",      value: stats.in_transit_loads,  bar: "bg-blue-400",    track: "bg-blue-50",    num: "text-blue-500" },
                  { label: "Completed",       value: stats.completed_loads,   bar: "bg-gray-200",    track: "bg-gray-50",    num: "text-gray-400" },
                ].map((item, i) => {
                  const total = Math.max(stats.total_loads, 1);
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <p className="text-xs text-gray-500 w-28 flex-shrink-0">{item.label}</p>
                      <div className={`flex-1 h-2 ${item.track} rounded-full overflow-hidden`}>
                        <motion.div
                          className={`h-full ${item.bar} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%` }}
                          transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                        />
                      </div>
                      <p className={`text-xs font-bold w-6 text-right tabular-nums ${item.num}`}>{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* ⑨ Approved — green gradient (1 col) */}
            <motion.div
              {...fadeUp(0.4)}
              className="col-span-2 lg:col-span-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col shadow-sm"
            >
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.15em]">Approved</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-5xl font-bold mt-3 leading-none text-emerald-700">{stats.approved_loads}</p>
              <p className="text-xs text-emerald-400 mt-2">loads ready for transit</p>
            </motion.div>

          </div>

          {/* ── Quick Actions row ────────────────────────────────────── */}
          <motion.div {...fadeUp(0.45)} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: "/admin/approvals", label: "Review Approvals", desc: `${stats.pending_approvals} pending`, icon: Clock, gradient: "from-amber-400 to-amber-500" },
                { href: "/admin/loads", label: "Manage Loads", desc: `${stats.pending_loads ?? 0} to review`, icon: Package, gradient: "from-blue-400 to-blue-500" },
                { href: "/admin/suppliers", label: "Suppliers", desc: `${stats.total_suppliers} registered`, icon: Building2, gradient: "from-[#b83050] to-[#9B2640]" },
                { href: "/admin/transporters", label: "Transporters", desc: `${stats.total_transporters} registered`, icon: Truck, gradient: "from-[#0d1247] to-[#06082C]" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <item.icon size={16} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

function SkeletonBento() {
  return (
    <div className="space-y-4">
      <div className="h-14 bg-white border border-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 h-[168px] bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-[168px] bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-[168px] bg-gray-100 rounded-2xl animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[120px] bg-gray-100 rounded-2xl animate-pulse" />
        ))}
        <div className="col-span-2 lg:col-span-3 h-[160px] bg-gray-100 rounded-2xl animate-pulse" />
        <div className="col-span-2 lg:col-span-1 h-[160px] bg-gray-100 rounded-2xl animate-pulse" />
      </div>
      <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  );
}
