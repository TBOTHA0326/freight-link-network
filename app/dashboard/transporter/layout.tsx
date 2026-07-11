"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TransporterLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) { router.push("/login"); return; }
    if (profile.role !== "transporter") { router.push("/login"); return; }
    if (profile.registration_status !== "active") {
      if (profile.registration_status === "approved_pending_setup") router.push("/onboarding");
      else if (profile.registration_status === "pending_final_approval") router.push("/register/review-pending");
      else router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== "transporter" || profile.registration_status !== "active") {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="pt-16 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto animate-page-in">
          {children}
        </div>
      </main>
    </div>
  );
}
