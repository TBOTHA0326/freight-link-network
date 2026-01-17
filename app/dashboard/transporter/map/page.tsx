'use client';

import { useEffect, useState } from 'react';
import { getApprovedLoads } from '@/database/queries/loads';
import type { MapLoad, LoadWithCompany } from '@/database/types';
import { Map, List } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import LoadMap from '@/components/LoadMap';
import Link from 'next/link';

export default function TransporterMapPage() {
  const [loads, setLoads] = useState<MapLoad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadsData = await getApprovedLoads();
        // Convert LoadWithCompany to MapLoad
        const mapLoads: MapLoad[] = loadsData.map((load: LoadWithCompany) => ({
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
          company_name: load.company_name || 'Unknown',
        }));
        setLoads(mapLoads);
      } catch (err) {
        console.error('Error fetching loads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // For map display, we show all approved loads
  const filteredLoads = loads;

  if (loading) {
    return <SectionLoading />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <Map className="w-7 h-7" />
            Load Map
          </h1>
          <p className="text-gray-600 mt-1">
            View approved loads on the map ({filteredLoads.length} loads)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* List View Link */}
          <Link
            href="/dashboard/transporter/loads"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <List className="w-5 h-5" />
            List View
          </Link>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[500px]">
        {filteredLoads.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Loads to Display</h2>
              <p className="text-gray-500">
                No approved loads with coordinates available.
              </p>
            </div>
          </div>
        ) : (
          <LoadMap loads={filteredLoads} />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#06082C]"></div>
            <span className="text-gray-600">Pickup Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#9B2640]"></div>
            <span className="text-gray-600">Delivery Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
