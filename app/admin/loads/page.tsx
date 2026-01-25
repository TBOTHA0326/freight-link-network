'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Calendar,
  Building2,
  Plus
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

interface Load {
  id: string;
  title: string;
  status: string;
  pickup_city: string | null;
  pickup_province: string | null;
  delivery_city: string | null;
  delivery_province: string | null;
  pickup_date: string | null;
  created_at: string;
  company?: {
    name: string;
  };
}

export default function AdminLoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoads(data || []);
    } catch (err) {
      console.error('Error fetching loads:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLoadStatus = async (loadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('loads')
        .update({ status })
        .eq('id', loadId);

      if (error) throw error;
      
      setLoads(loads.map(l => 
        l.id === loadId ? { ...l, status } : l
      ));
    } catch (err) {
      console.error('Error updating load status:', err);
    }
  };

  const filteredLoads = loads.filter(load => {
    const matchesSearch = load.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && load.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Package className="w-4 h-4" /> In Transit
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock className="w-4 h-4" /> Pending
          </span>
        );
    }
  };

  if (loading) return <SectionLoading />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <Package className="w-7 h-7" />
            All Loads
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and review all loads on the platform
          </p>
        </div>
        <Link
          href="/admin/loads/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg hover:bg-[#0a0e40] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Load
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search loads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-[#06082C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Loads</p>
          <p className="text-2xl font-bold text-[#06082C]">{loads.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {loads.filter(l => l.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {loads.filter(l => l.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {loads.filter(l => l.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Load</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Route</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Supplier</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLoads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No loads found
                </td>
              </tr>
            ) : (
              filteredLoads.map((load) => (
                <tr key={load.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{load.title}</p>
                      {load.pickup_date && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(load.pickup_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-green-500" />
                        {load.pickup_city || 'N/A'}{load.pickup_province && `, ${load.pickup_province}`}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {load.delivery_city || 'N/A'}{load.delivery_province && `, ${load.delivery_province}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {(load.company as { name: string } | null)?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(load.status)}
                  </td>
                  <td className="px-6 py-4">
                    {load.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateLoadStatus(load.id, 'approved')}
                          className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateLoadStatus(load.id, 'rejected')}
                          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
