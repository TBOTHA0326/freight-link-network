'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MapPin, 
  Filter,
  List
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import LoadMap from '@/components/LoadMap';
import type { MapLoad } from '@/database/types';
import Link from 'next/link';

export default function AdminMapPage() {
  const [loads, setLoads] = useState<MapLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'in_transit'>('all');

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .select(`
          id,
          title,
          status,
          pickup_city,
          pickup_province,
          pickup_lat,
          pickup_lng,
          delivery_city,
          delivery_province,
          delivery_lat,
          delivery_lng,
          cargo_type,
          budget_amount,
          required_trailer_type,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert to MapLoad type
      const mapLoads: MapLoad[] = (data || []).map((load: any) => ({
        id: load.id,
        title: load.title,
        status: load.status,
        pickup_city: load.pickup_city,
        pickup_province: load.pickup_province,
        pickup_lat: load.pickup_lat,
        pickup_lng: load.pickup_lng,
        delivery_city: load.delivery_city,
        delivery_province: load.delivery_province,
        delivery_lat: load.delivery_lat,
        delivery_lng: load.delivery_lng,
        cargo_type: load.cargo_type,
        budget_amount: load.budget_amount,
        required_trailer_type: load.required_trailer_type,
        company_name: load.company?.name || 'Admin Posted',
      }));
      
      setLoads(mapLoads);
    } catch (err) {
      console.error('Error fetching loads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter loads based on selection
  const filteredLoads = filter === 'all' 
    ? loads 
    : loads.filter(l => l.status === filter);

  // Only show loads that have coordinates
  const loadsWithCoords = filteredLoads.filter(l => l.pickup_lat && l.pickup_lng);

  if (loading) return <SectionLoading />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <MapPin className="w-7 h-7" />
            Load Map
          </h1>
          <p className="text-gray-600 mt-1">
            View all loads on an interactive map
          </p>
        </div>
        <Link
          href="/admin/loads"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <List className="w-5 h-5" />
          List View
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'in_transit'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-[#06082C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Loads' : f === 'in_transit' ? 'In Transit' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Showing {loadsWithCoords.length} of {filteredLoads.length} loads with coordinates
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mb-6">
        <LoadMap 
          loads={loadsWithCoords} 
          onRefresh={fetchLoads}
          loading={loading}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
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
          <p className="text-sm text-gray-600">With Coordinates</p>
          <p className="text-2xl font-bold text-blue-600">
            {loads.filter(l => l.pickup_lat && l.pickup_lng).length}
          </p>
        </div>
      </div>
    </div>
  );
}
