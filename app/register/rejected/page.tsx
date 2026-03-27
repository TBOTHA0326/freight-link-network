"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { XCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function RejectedPage() {
  const { profile } = useAuth();
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.rejection_reason) setReason(profile.rejection_reason);
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-block bg-[#06082C] rounded-xl px-4 py-2 mb-8">
          <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={140} height={35} style={{ height: "auto" }} className="object-contain" />
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <XCircle size={28} className="text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Registration Not Approved</h1>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Unfortunately, your registration on Freight Link Network was not approved.
          </p>
          {reason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
              <p className="text-sm text-red-700">{reason}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mb-6">If you believe this is an error, please contact our support team.</p>
          <div className="space-y-3">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <RefreshCw size={15} />
              Apply Again
            </Link>
            <Link href="/login" className="block w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-center">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
