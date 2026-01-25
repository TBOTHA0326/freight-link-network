'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { getApprovedLoadsForTransporters } from '@/database/queries/loads';
import type { Company, Load } from '@/database/types';
import { Package, MapPin, Calendar, Weight, ArrowRight, Filter, Search } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function TransporterLoadsPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrossOrder, setFilterCrossBorder] = useState<'all' | 'local' | 'cross-border'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        setCompany(companyData);

        const loadsData = await getApprovedLoadsForTransporters();
        setLoads(loadsData);
        setFilteredLoads(loadsData);
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

    // Cross-border filter
    if (filterCrossOrder === 'local') {
      filtered = filtered.filter((load) => !load.is_cross_border);
    } else if (filterCrossOrder === 'cross-border') {
      filtered = filtered.filter((load) => load.is_cross_border);
    }

    setFilteredLoads(filtered);
  }, [searchQuery, filterCrossOrder, loads]);

  if (loading) {
    return <SectionLoading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Package className="w-7 h-7" />
          Available Loads
        </h1>
        <p className="text-gray-600 mt-1">Browse and view approved loads from suppliers</p>
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

          {/* Cross-border Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCrossOrder}
              onChange={(e) => setFilterCrossBorder(e.target.value as typeof filterCrossOrder)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
            >
              <option value="all">All Loads</option>
              <option value="local">Local Only</option>
              <option value="cross-border">Cross-border Only</option>
            </select>
          </div>

          {/* Map View Link */}
          <Link
            href="/dashboard/transporter/map"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
          >
            <MapPin className="w-5 h-5" />
            View on Map
          </Link>
        </div>
      </div>

      {/* Company Alert */}
      {!company && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800">
            <strong>Note:</strong> Set up your company profile to access more features.
          </p>
        </div>
      )}

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
            {searchQuery || filterCrossOrder !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No approved loads available at the moment.'}
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

                      {/* Description */}
                      {load.description && (
                        <p className="mt-3 text-gray-600 line-clamp-2">{load.description}</p>
                      )}
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

                  {/* Trailer Types */}
                  {load.required_trailer_type && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {load.required_trailer_type.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize"
                        >
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
