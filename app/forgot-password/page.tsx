"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { sendPasswordResetEmail } from "@/database/queries/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-block bg-[#06082C] rounded-xl px-4 py-2 mb-8">
          <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={140} height={35} style={{ height: "auto" }} className="object-contain" />
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email Sent</h1>
              <p className="text-sm text-gray-500 mb-6">Check your inbox for a password reset link.</p>
              <Link href="/login" className="block w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-[#06082C]/10 rounded-xl flex items-center justify-center mb-5">
                <Mail size={22} className="text-[#06082C]" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                <Link href="/login" className="text-[#06082C] font-medium hover:underline">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
