"use client";

import { useState, useEffect, useCallback } from "react";
import { Map } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getMapLoads } from "@/database/queries/loads";
import type { MapLoad } from "@/database/types";
import dynamic from "next/dynamic";

const LoadMap = dynamic(() => import("@/components/LoadMap"), { ssr: false, loading: () => <div className="h-[600px] bg-gray-100 rounded-xl animate-pulse" /> });

export default function TransporterMapPage() {
  const [loads, setLoads] = useState<MapLoad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMapLoads("transporter");
      setLoads(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  return (
    <div>
      <PageHeader title="Load Map" subtitle="Geographic view of available freight loads" icon={Map} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-50">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#06082C] rounded-full animate-spin" />
          </div>
        ) : (
          <LoadMap loads={loads} height="600px" />
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        {loads.length} approved load{loads.length !== 1 ? "s" : ""} with location data. Green = pickup, Red = delivery.
      </p>
    </div>
  );
}
