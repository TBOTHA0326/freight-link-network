'use client';

import { useEffect, useState } from 'react';
import { getLoadsByCompany } from '@/database/queries/loads';
import { getCurrentUserCompany } from '@/database/queries/companies';
import type { Company, Load, MapLoad } from '@/database/types';
import { Map, List, Filter } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import LoadMap from '@/components/LoadMap';
import Link from 'next/link';

export default function SupplierMapPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
        console.error('Error fetching loads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLoads = loads.filter((load) => {
    if (filterStatus === 'all') return true;
    return load.status === filterStatus;
  });

  // Convert Load to MapLoad for the map component
  const mapLoads: MapLoad[] = filteredLoads.map((load) => ({
    id: load.id,
    title: load.title,
    budget_amount: load.budget_amount,
    pickup_city: load.pickup_city,
    pickup_province: load.pickup_province,
    pickup_lat: load.pickup_lat,
    pickup_lng: load.pickup_lng,
    delivery_city: load.delivery_city,
    delivery_province: load.delivery_province,
    delivery_lat: load.delivery_lat,
    delivery_lng: load.delivery_lng,
    cargo_type: load.cargo_type,
    required_trailer_type: load.required_trailer_type,
    status: load.status,
    company_name: company?.name || 'My Company',
  }));

  if (loading) {
    return <SectionLoading />;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Company Found</h2>
        <p className="text-gray-500">Please set up your company profile first.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <Map className="w-7 h-7" />
            My Loads Map
          </h1>
          <p className="text-gray-600 mt-1">
            View your loads on the map ({mapLoads.length} loads)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* List View Link */}
          <Link
            href="/dashboard/supplier/loads"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <List className="w-5 h-5" />
            List View
          </Link>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[500px]">
        {mapLoads.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Loads to Display</h2>
              <p className="text-gray-500">
                {filterStatus !== 'all'
                  ? 'Try changing your filter settings.'
                  : 'Post your first load to see it on the map.'}
              </p>
            </div>
          </div>
        ) : (
          <LoadMap loads={mapLoads} />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Status Colors</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#06082C]"></div>
            <span className="text-gray-600">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">In Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
