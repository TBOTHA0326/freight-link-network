'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Package, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { SectionLoading } from '@/components/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalLoads: number;
  pendingDocuments: number;
  pendingLoads: number;
  approvedLoads: number;
  transporterCompanies: number;
  supplierCompanies: number;
}

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts in parallel
        const [
          { count: usersCount },
          { count: companiesCount },
          { count: loadsCount },
          { count: pendingDocsCount },
          { count: pendingLoadsCount },
          { count: approvedLoadsCount },
          { count: transporterCount },
          { count: supplierCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('loads').select('*', { count: 'exact', head: true }),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('loads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('loads').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('companies').select('*', { count: 'exact', head: true }).eq('company_type', 'transporter'),
          supabase.from('companies').select('*', { count: 'exact', head: true }).eq('company_type', 'supplier'),
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalCompanies: companiesCount || 0,
          totalLoads: loadsCount || 0,
          pendingDocuments: pendingDocsCount || 0,
          pendingLoads: pendingLoadsCount || 0,
          approvedLoads: approvedLoadsCount || 0,
          transporterCompanies: transporterCount || 0,
          supplierCompanies: supplierCount || 0,
        });

        // Fetch recent pending items
        const { data: pendingLoads } = await supabase
          .from('loads')
          .select(`
            id,
            title,
            created_at,
            company:companies(name)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: pendingDocs } = await supabase
          .from('documents')
          .select(`
            id,
            title,
            category,
            created_at,
            company:companies(name)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        // Combine and sort by date
        const combined = [
          ...(pendingLoads || []).map((l: any) => ({ ...l, type: 'load' })),
          ...(pendingDocs || []).map((d: any) => ({ ...d, type: 'document' })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setRecentActivity(combined.slice(0, 8));
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <SectionLoading />;
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {profile?.full_name || 'Admin'}. Here&apos;s an overview of your platform.
        </p>
      </div>

      {/* Pending Items Alert */}
      {stats && (stats.pendingDocuments > 0 || stats.pendingLoads > 0) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Items Pending Review</p>
            <p className="text-yellow-700 text-sm">
              {stats.pendingDocuments} document(s) and {stats.pendingLoads} load(s) awaiting approval.
            </p>
          </div>
          <Link
            href="/admin/dashboard/approvals"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#06082C]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#06082C]" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Users</span>
          </div>
          <p className="text-3xl font-bold text-[#06082C]">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#9B2640]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#9B2640]" />
            </div>
            <span className="text-sm font-medium text-gray-600">Companies</span>
          </div>
          <p className="text-3xl font-bold text-[#9B2640]">{stats?.totalCompanies || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.transporterCompanies} Transporters, {stats?.supplierCompanies} Suppliers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Loads</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats?.totalLoads || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.approvedLoads} approved
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {(stats?.pendingDocuments || 0) + (stats?.pendingLoads || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.pendingDocuments} docs, {stats?.pendingLoads} loads
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/dashboard/approvals"
          className="bg-gradient-to-br from-[#9B2640] to-[#7a1e33] text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Approvals</h3>
              <p className="text-white/80 text-sm">Review pending items</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto" />
          </div>
        </Link>

        <Link
          href="/admin/dashboard/transporters"
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#06082C]/10 rounded-lg">
              <Building2 className="w-6 h-6 text-[#06082C]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#06082C]">Transporters</h3>
              <p className="text-gray-500 text-sm">Manage transport companies</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-gray-400" />
          </div>
        </Link>

        <Link
          href="/admin/dashboard/suppliers"
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#06082C]/10 rounded-lg">
              <Building2 className="w-6 h-6 text-[#06082C]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#06082C]">Suppliers</h3>
              <p className="text-gray-500 text-sm">Manage supplier companies</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#06082C]">Pending Items</h2>
          <Link
            href="/admin/dashboard/approvals"
            className="text-sm font-medium text-[#9B2640] hover:underline"
          >
            View All
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500">All caught up! No pending items.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      item.type === 'load' ? 'bg-[#9B2640]/10' : 'bg-[#06082C]/10'
                    }`}>
                      {item.type === 'load' ? (
                        <Package className="w-5 h-5 text-[#9B2640]" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#06082C]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-[#06082C] truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.company?.name || 'Unknown Company'} • {
                          new Date(item.created_at).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex-shrink-0">
                    {item.type === 'load' ? 'Load' : 'Document'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
