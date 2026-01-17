// =============================================
// MAPBOX UTILITIES - Map Configuration & Helpers
// =============================================

import mapboxgl from 'mapbox-gl';
import type { MapLoad } from '@/database/types';

// Set Mapbox access token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export function initializeMapbox() {
  if (MAPBOX_ACCESS_TOKEN) {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  }
}

// Default map center (South Africa)
export const DEFAULT_CENTER: [number, number] = [25.0, -29.0];
export const DEFAULT_ZOOM = 5;

// Map style
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

// Brand colors for markers
export const MARKER_COLORS: Record<string, string> = {
  pending: '#FFA500', // Orange
  approved: '#06082C', // Primary blue
  rejected: '#9B2640', // Primary red
  in_transit: '#10B981', // Green
  completed: '#6B7280', // Gray
  cancelled: '#EF4444', // Red
};

// Create map instance
export function createMap(
  container: HTMLElement,
  options?: Partial<mapboxgl.MapOptions>
): mapboxgl.Map {
  initializeMapbox();
  
  return new mapboxgl.Map({
    container,
    style: MAP_STYLE,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    ...options,
  });
}

// Create a popup for load marker
export function createLoadPopup(load: MapLoad): mapboxgl.Popup {
  const statusColor = MARKER_COLORS[load.status] || MARKER_COLORS.pending;
  const trailerTypes = load.required_trailer_type?.join(', ') || 'Any';
  
  const html = `
    <div class="p-3 min-w-[200px]">
      <h3 class="font-bold text-[#06082C] text-lg mb-2">${load.title}</h3>
      <div class="space-y-1 text-sm">
        <p><strong>From:</strong> ${load.pickup_city || 'N/A'}, ${load.pickup_province || ''}</p>
        <p><strong>To:</strong> ${load.delivery_city || 'N/A'}, ${load.delivery_province || ''}</p>
        <p><strong>Cargo:</strong> ${load.cargo_type || 'N/A'}</p>
        <p><strong>Trailer Type:</strong> ${trailerTypes}</p>
        <p><strong>Budget:</strong> R${(load.budget_amount || 0).toLocaleString()}</p>
        <p><strong>Company:</strong> ${load.company_name}</p>
        <p>
          <span 
            class="inline-block px-2 py-1 rounded text-xs text-white"
            style="background-color: ${statusColor}"
          >
            ${load.status.toUpperCase()}
          </span>
        </p>
      </div>
    </div>
  `;

  return new mapboxgl.Popup({ offset: 25 }).setHTML(html);
}

// Create marker element
export function createMarkerElement(status: string): HTMLElement {
  const el = document.createElement('div');
  const color = MARKER_COLORS[status as keyof typeof MARKER_COLORS] || MARKER_COLORS.pending;
  
  el.className = 'marker';
  el.style.cssText = `
    width: 30px;
    height: 30px;
    background-color: ${color};
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.2s;
  `;
  
  el.onmouseenter = () => {
    el.style.transform = 'scale(1.2)';
  };
  el.onmouseleave = () => {
    el.style.transform = 'scale(1)';
  };

  return el;
}

// Add load markers to map
export function addLoadMarkers(
  map: mapboxgl.Map,
  loads: MapLoad[],
  existingMarkers: mapboxgl.Marker[] = []
): mapboxgl.Marker[] {
  // Remove existing markers
  existingMarkers.forEach(marker => marker.remove());
  
  const markers: mapboxgl.Marker[] = [];

  loads.forEach(load => {
    // Add pickup location marker
    if (load.pickup_lat && load.pickup_lng) {
      const el = createMarkerElement(load.status);
      const popup = createLoadPopup(load);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([load.pickup_lng, load.pickup_lat])
        .setPopup(popup)
        .addTo(map);
      
      markers.push(marker);
    }

    // Add delivery location marker with different style
    if (load.delivery_lat && load.delivery_lng) {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background-color: #9B2640;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <p class="font-semibold">Delivery: ${load.delivery_city}, ${load.delivery_province}</p>
          <p class="text-sm">${load.title}</p>
        </div>
      `);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([load.delivery_lng, load.delivery_lat])
        .setPopup(popup)
        .addTo(map);
      
      markers.push(marker);
    }
  });

  // Fit map to show all markers
  if (markers.length > 0) {
    const bounds = new mapboxgl.LngLatBounds();
    
    loads.forEach(load => {
      if (load.pickup_lat && load.pickup_lng) {
        bounds.extend([load.pickup_lng, load.pickup_lat]);
      }
      if (load.delivery_lat && load.delivery_lng) {
        bounds.extend([load.delivery_lng, load.delivery_lat]);
      }
    });

    map.fitBounds(bounds, { padding: 50, maxZoom: 10 });
  }

  return markers;
}

// Draw route line between two points
export function drawRoute(
  map: mapboxgl.Map,
  from: [number, number],
  to: [number, number],
  routeId: string = 'route'
): void {
  // Remove existing route if any
  if (map.getSource(routeId)) {
    map.removeLayer(routeId);
    map.removeSource(routeId);
  }

  map.addSource(routeId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [from, to],
      },
    },
  });

  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#06082C',
      'line-width': 3,
      'line-dasharray': [2, 2],
    },
  });
}

// Geocode an address using Mapbox Geocoding API
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn('Mapbox access token not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=ZA&limit=1`
    );

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Calculate distance between two points (haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
