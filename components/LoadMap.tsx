"use client";

import { useEffect, useRef } from "react";
import type { MapLoad } from "@/database/types";

interface LoadMapProps {
  loads: MapLoad[];
  height?: string;
}

// Generate a smooth arc between two points using intermediate bezier-style points
function buildArc(
  from: [number, number],
  to: [number, number],
  steps = 64
): [number, number][] {
  const coords: [number, number][] = [];
  // Midpoint elevated slightly for a curved feel
  const midLng = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;
  // Perpendicular offset — pulls the arc away from the straight line
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const curvature = 0.2;
  const ctrlLng = midLng - dy * curvature;
  const ctrlLat = midLat + dx * curvature;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    // Quadratic bezier
    const lng = u * u * from[0] + 2 * u * t * ctrlLng + t * t * to[0];
    const lat = u * u * from[1] + 2 * u * t * ctrlLat + t * t * to[1];
    coords.push([lng, lat]);
  }
  return coords;
}

export default function LoadMap({ loads, height = "500px" }: LoadMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    async function initMap() {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      // Guard again after async imports — component may have unmounted
      if (!mapContainerRef.current) return;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [25.0, -29.0],
        zoom: 5,
      });
      mapRef.current = map;

      map.on("load", () => {
        // Add a GeoJSON source + layer for the active route line
        map.addSource("active-route", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Soft glow layer underneath
        map.addLayer({
          id: "active-route-glow",
          type: "line",
          source: "active-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#06082C",
            "line-width": 8,
            "line-opacity": 0.12,
          },
        });

        // Main dashed route line
        map.addLayer({
          id: "active-route-line",
          type: "line",
          source: "active-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#06082C",
            "line-width": 2.5,
            "line-dasharray": [2, 3],
            "line-opacity": 0.85,
          },
        });

        const clearRoute = () => {
          (map.getSource("active-route") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: [],
          });
        };

        const drawRoute = (from: [number, number], to: [number, number]) => {
          const arc = buildArc(from, to);
          (map.getSource("active-route") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: arc },
              },
            ],
          });
        };

        // Click on map background clears the route
        map.on("click", clearRoute);

        loads.forEach((load) => {
          const hasPickup = load.pickup_lat != null && load.pickup_lng != null;
          const hasDelivery = load.delivery_lat != null && load.delivery_lng != null;
          const hasBoth = hasPickup && hasDelivery;

          const popupHtml = `
            <div style="padding:8px;min-width:200px;">
              <strong style="font-size:13px;">${load.title}</strong>
              ${load.company_name ? `<p style="font-size:11px;color:#9ca3af;margin:2px 0 0;">Posted by: ${load.company_name}</p>` : ""}
              <p style="font-size:12px;color:#6b7280;margin:4px 0 0;">
                From: ${load.pickup_city ?? load.pickup_address ?? "—"}<br/>
                To: ${load.delivery_city ?? load.delivery_address ?? "—"}
              </p>
              ${load.cargo_type ? `<p style="font-size:11px;color:#6b7280;margin:2px 0 0;">${load.cargo_type}${load.weight_tons ? ` · ${load.weight_tons} tons` : ""}</p>` : ""}
              <span style="font-size:11px;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:4px;">${load.status.replace("_", " ")}</span>
              ${load.is_hazardous ? `<span style="font-size:11px;background:#ffedd5;color:#9a3412;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:4px;margin-left:4px;">Hazmat</span>` : ""}
              ${load.is_cross_border ? `<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:4px;margin-left:4px;">Cross-border</span>` : ""}
            </div>
          `;

          // Pickup marker — brand blue pin with solid white dot
          if (hasPickup) {
            const pickupEl = document.createElement("div");
            pickupEl.style.cursor = "pointer";
            pickupEl.innerHTML = `
              <svg width="22" height="30" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg"
                style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35)); display:block;">
                <path d="M10 0C4.477 0 0 4.477 0 10C0 17.5 10 28 10 28C10 28 20 17.5 20 10C20 4.477 15.523 0 10 0Z" fill="#06082C"/>
                <circle cx="10" cy="10" r="4" fill="white"/>
              </svg>`;

            const pickupMarker = new mapboxgl.Marker({ element: pickupEl, anchor: "bottom" })
              .setLngLat([load.pickup_lng!, load.pickup_lat!])
              .setPopup(new mapboxgl.Popup({ offset: [0, -4], className: 'popup-pickup' }).setHTML(popupHtml))
              .addTo(map);

            if (hasBoth) {
              pickupEl.addEventListener("click", (e) => {
                e.stopPropagation();
                drawRoute(
                  [load.pickup_lng!, load.pickup_lat!],
                  [load.delivery_lng!, load.delivery_lat!]
                );
                pickupMarker.togglePopup();
              });
            }
          }

          // Delivery marker — brand red pin with hollow white ring
          if (hasDelivery) {
            const deliveryEl = document.createElement("div");
            deliveryEl.style.cursor = "pointer";
            deliveryEl.innerHTML = `
              <svg width="22" height="30" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg"
                style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35)); display:block;">
                <path d="M10 0C4.477 0 0 4.477 0 10C0 17.5 10 28 10 28C10 28 20 17.5 20 10C20 4.477 15.523 0 10 0Z" fill="#9B2640"/>
                <circle cx="10" cy="10" r="4" fill="none" stroke="white" stroke-width="2"/>
              </svg>`;

            const deliveryMarker = new mapboxgl.Marker({ element: deliveryEl, anchor: "bottom" })
              .setLngLat([load.delivery_lng!, load.delivery_lat!])
              .setPopup(new mapboxgl.Popup({ offset: [0, -4], className: 'popup-delivery' }).setHTML(popupHtml))
              .addTo(map);

            if (hasBoth) {
              deliveryEl.addEventListener("click", (e) => {
                e.stopPropagation();
                drawRoute(
                  [load.pickup_lng!, load.pickup_lat!],
                  [load.delivery_lng!, load.delivery_lat!]
                );
                deliveryMarker.togglePopup();
              });
            }
          }
        });
      });
    }

    initMap();

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [loads]);

  return (
    <div ref={mapContainerRef} style={{ height }} className="rounded-xl overflow-hidden" />
  );
}
