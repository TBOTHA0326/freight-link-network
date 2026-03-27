import type { AddressSuggestion } from "@/database/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
const COUNTRY_FILTER = "ZA,NA,ZW,MZ,BW,LS,SZ";

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=${COUNTRY_FILTER}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch {
    return null;
  }
}

export async function searchAddresses(
  query: string
): Promise<AddressSuggestion[]> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=${COUNTRY_FILTER}&limit=5&types=address,place,locality,neighborhood`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map(
      (f: { id: string; place_name: string; center: [number, number] }) => ({
        id: f.id,
        place_name: f.place_name,
        lat: f.center[1],
        lng: f.center[0],
      })
    );
  } catch {
    return [];
  }
}
