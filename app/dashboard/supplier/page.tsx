'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { getLoadsByCompany } from '@/database/queries/loads';
import type { Company, Load, LoadStatus } from '@/database/types';
import { 
  Package, 
  Plus, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  MapPin 
} from 'lucide-react';
import Link from 'next/link';
import { SectionLoading } from '@/components/LoadingSpinner';

export default function SupplierDashboardPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        setCompany(companyData);

        if (companyData) {
          const loadsData = await getLoadsByCompany(companyData.id);
          setLoads(loadsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <SectionLoading />;
  }

  // Calculate stats
  const stats = {
    total: loads.length,
    pending: loads.filter((l) => l.status === 'pending').length,
    approved: loads.filter((l) => l.status === 'approved').length,
    completed: loads.filter((l) => l.status === 'completed').length,
  };

  const getStatusColor = (status: LoadStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C]">
          Welcome back, {profile?.full_name || 'Supplier'}
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your loads and shipments from your supplier dashboard.
        </p>
      </div>

      {/* Company Setup Alert */}
      {!company && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Complete your company setup</p>
            <p className="text-yellow-700 text-sm">
              Set up your company profile to start posting loads.
            </p>
          </div>
          <Link
            href="/dashboard/supplier/company"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Setup Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#06082C]/10 rounded-lg">
              <Package className="w-5 h-5 text-[#06082C]" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Loads</span>
          </div>
          <p className="text-3xl font-bold text-[#06082C]">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Approved</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/supplier/loads/new"
          className="bg-gradient-to-br from-[#9B2640] to-[#7a1e33] text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Post a New Load</h3>
              <p className="text-white/80 text-sm">Create a new load for transporters to view</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto" />
          </div>
        </Link>

        <Link
          href="/dashboard/supplier/company"
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#06082C]/10 rounded-lg">
              <Building2 className="w-6 h-6 text-[#06082C]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#06082C]">
                {company ? 'Update Company' : 'Setup Company'}
              </h3>
              <p className="text-gray-500 text-sm">
                {company ? 'Manage your company profile' : 'Create your company profile'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Recent Loads */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#06082C]">Recent Loads</h2>
          <Link
            href="/dashboard/supplier/loads"
            className="text-sm font-medium text-[#9B2640] hover:underline"
          >
            View All
          </Link>
        </div>

        {loads.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No loads posted yet.</p>
            {company && (
              <Link
                href="/dashboard/supplier/loads/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#9B2640] text-white rounded-lg text-sm font-medium hover:bg-[#7a1e33] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Your First Load
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {loads.slice(0, 5).map((load) => (
              <div key={load.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 bg-[#9B2640]/10 rounded-lg flex-shrink-0">
                      <Package className="w-5 h-5 text-[#9B2640]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-[#06082C] truncate">{load.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {load.pickup_city} → {load.delivery_city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex-shrink-0 ${getStatusColor(
                      load.status
                    )}`}
                  >
                    {load.status.replace('_', ' ')}
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
