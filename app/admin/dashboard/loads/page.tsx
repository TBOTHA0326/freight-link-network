'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { updateLoadStatus } from '@/database/queries/loads';
import type { Load, LoadStatus } from '@/database/types';
import { 
  Package, 
  Search, 
  Filter,
  MapPin,
  ArrowRight,
  Calendar,
  Weight
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

interface LoadWithCompany extends Load {
  company?: { name: string };
}

export default function AdminLoadsPage() {
  const [loads, setLoads] = useState<LoadWithCompany[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<LoadWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoadStatus | 'all'>('all');

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .select(`*, company:companies(name)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoads((data as LoadWithCompany[]) || []);
      setFilteredLoads((data as LoadWithCompany[]) || []);
    } catch (err) {
      console.error('Error fetching loads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...loads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (load) =>
          load.title.toLowerCase().includes(query) ||
          load.pickup_city?.toLowerCase().includes(query) ||
          load.delivery_city?.toLowerCase().includes(query) ||
          load.company?.name.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((load) => load.status === filterStatus);
    }

    setFilteredLoads(filtered);
  }, [searchQuery, filterStatus, loads]);

  const handleStatusChange = async (loadId: string, newStatus: LoadStatus) => {
    try {
      await updateLoadStatus(loadId, newStatus);
      setLoads(loads.map((l) => (l.id === loadId ? { ...l, status: newStatus } : l)));
    } catch (err) {
      console.error('Error updating load status:', err);
      alert('Failed to update load status');
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Package className="w-7 h-7" />
          All Loads
        </h1>
        <p className="text-gray-600 mt-1">
          Manage all loads across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, city, or company..."
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
          <p className="text-gray-500">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No loads have been posted yet.'}
          </p>
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
                        {load.is_cross_border && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Cross-border
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        {load.company?.name || 'Unknown Company'}
                      </p>

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
                        {load.budget_amount && (
                          <span className="font-medium text-[#06082C]">
                            R{load.budget_amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <select
                    value={load.status}
                    onChange={(e) => handleStatusChange(load.id, e.target.value as LoadStatus)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${getStatusColor(
                      load.status
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
