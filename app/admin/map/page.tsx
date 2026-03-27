"use client";

import { useState, useEffect, useCallback } from "react";
import { Map } from "lucide-react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import { getMapLoads } from "@/database/queries/loads";
import type { MapLoad } from "@/database/types";

const LoadMap = dynamic(() => import("@/components/LoadMap"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 rounded-xl animate-pulse" />,
});

export default function AdminMapPage() {
  const [loads, setLoads] = useState<MapLoad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMapLoads("admin");
      setLoads(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Map" subtitle="All loads across the network" icon={Map} />
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-50">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" />
          </div>
        ) : (
          <LoadMap loads={loads} height="600px" />
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">
        {loads.length} load{loads.length !== 1 ? "s" : ""} with location data. Green = pickup, Red = delivery.
      </p>
    </div>
  );
}
