'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { getLoadsByCompany, deleteLoad } from '@/database/queries/loads';
import type { Company, Load, LoadStatus } from '@/database/types';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Calendar,
  Weight,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { SectionLoading } from '@/components/LoadingSpinner';

export default function SupplierLoadsPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoadStatus | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        setCompany(companyData);

        if (companyData) {
          const loadsData = await getLoadsByCompany(companyData.id);
          setLoads(loadsData);
          setFilteredLoads(loadsData);
        }
      } catch (err) {
        console.error('Error fetching loads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...loads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (load) =>
          load.title.toLowerCase().includes(query) ||
          load.pickup_city?.toLowerCase().includes(query) ||
          load.delivery_city?.toLowerCase().includes(query) ||
          load.cargo_type?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((load) => load.status === filterStatus);
    }

    setFilteredLoads(filtered);
  }, [searchQuery, filterStatus, loads]);

  const handleDelete = async (loadId: string) => {
    if (!confirm('Are you sure you want to delete this load?')) return;

    try {
      await deleteLoad(loadId);
      setLoads(loads.filter((l) => l.id !== loadId));
    } catch (err) {
      console.error('Error deleting load:', err);
      alert('Failed to delete load');
    }
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

  if (loading) {
    return <SectionLoading />;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Company Found</h2>
        <p className="text-gray-500 mb-6">Please set up your company profile first.</p>
        <Link
          href="/dashboard/supplier/company"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
        >
          Setup Company
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <Package className="w-7 h-7" />
            My Loads
          </h1>
          <p className="text-gray-600 mt-1">Manage your posted loads</p>
        </div>
        <Link
          href="/dashboard/supplier/loads/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#9B2640] text-white rounded-lg font-medium hover:bg-[#7a1e33] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Post New Load
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Title, City, or Load Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LoadStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Map View Link */}
          <Link
            href="/dashboard/supplier/map"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
          >
            <MapPin className="w-5 h-5" />
            View on Map
          </Link>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredLoads.length} of {loads.length} loads
      </div>

      {/* Loads List */}
      {filteredLoads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Loads Found</h2>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Post your first load to get started.'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link
              href="/dashboard/supplier/loads/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#9B2640] text-white rounded-lg font-medium hover:bg-[#7a1e33] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Post Your First Load
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoads.map((load) => (
            <div
              key={load.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Load Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#9B2640]/10 rounded-lg flex-shrink-0">
                      <Package className="w-6 h-6 text-[#9B2640]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-[#06082C]">{load.title}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusColor(
                            load.status
                          )}`}
                        >
                          {load.status.replace('_', ' ')}
                        </span>
                        {load.is_cross_border && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Cross-border
                          </span>
                        )}
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="truncate">
                          {load.pickup_city}, {load.pickup_province}
                        </span>
                        <ArrowRight className="w-4 h-4 flex-shrink-0" />
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="truncate">
                          {load.delivery_city}, {load.delivery_province}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        {load.cargo_type && (
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {load.cargo_type}
                          </span>
                        )}
                        {load.weight_tons && (
                          <span className="flex items-center gap-1">
                            <Weight className="w-4 h-4" />
                            {load.weight_tons} tons
                          </span>
                        )}
                        {load.pickup_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(load.pickup_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex flex-col items-end gap-3 lg:ml-6">
                  {load.budget_amount && (
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Budget</span>
                      <p className="text-xl font-bold text-[#06082C]">
                        R{load.budget_amount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {(load.status === 'pending' || load.status === 'rejected') && (
                      <Link
                        href={`/dashboard/supplier/loads/${load.id}/edit`}
                        className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Load"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                    )}
                    {load.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(load.id)}
                        className="p-2 text-gray-400 hover:text-[#9B2640] hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Load"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
