'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createMap, addLoadMarkers } from '@/lib/mapbox';
import type { MapLoad } from '@/database/types';
import { RefreshCw } from 'lucide-react';

interface LoadMapProps {
  loads: MapLoad[];
  onRefresh?: () => void;
  loading?: boolean;
}

export default function LoadMap({ loads, onRefresh, loading = false }: LoadMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setMapError('Mapbox access token not configured');
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = createMap(mapContainer.current);
      
      map.current.on('load', () => {
        setMapReady(true);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map');
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when loads change
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Update markers
    markers.current = addLoadMarkers(map.current, loads, markers.current);
  }, [loads, mapReady]);

  if (mapError) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">{mapError}</p>
          <p className="text-sm text-gray-400">
            Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      )}

      {/* Load Count Badge */}
      <div className="absolute top-4 right-16 z-10 bg-[#06082C] text-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium">
        {loads.length} Load{loads.length !== 1 ? 's' : ''}
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200"
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#06082C]" />
          <span className="text-gray-600">Pickup Location (Approved)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FFA500]" />
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#9B2640]" />
          <span className="text-gray-600">Delivery Location</span>
        </div>
      </div>
    </div>
  );
}
