"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, AlertCircle, Truck } from "lucide-react";
import { signIn } from "@/database/queries/auth";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await signIn(email, password);
      const user = data.user;
      if (!user) throw new Error("Login failed. Please try again.");

      // Get profile for routing
      const { getProfile } = await import("@/database/queries/auth");
      const profile = await getProfile(user.id);
      if (!profile) throw new Error("Could not load profile.");

      void refreshProfile().catch(() => {});

      const { registration_status: status, role } = profile;
      if (status === "approved_pending_setup") return router.push("/onboarding");
      if (status === "pending_final_approval") return router.push("/register/review-pending");
      if (status === "rejected") return router.push("/register/rejected");
      if (role === "admin") return router.push("/admin/dashboard");
      if (role === "supplier") return router.push("/dashboard/supplier");
      if (role === "transporter") return router.push("/dashboard/transporter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#06082C] flex-col justify-between p-12">
        <Link href="/">
          <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={160} height={40} className="object-contain" />
        </Link>
        <div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <Truck size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome back to Freight Link Network</h2>
          <p className="text-white/60 leading-relaxed">South Africa&apos;s trusted platform for connecting freight suppliers and transporters.</p>
        </div>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} Freight Link Network</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-block bg-[#06082C] rounded-xl px-4 py-2">
              <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={140} height={35} style={{ height: "auto" }} className="object-contain" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
            <p className="text-sm text-gray-500 mb-8">Enter your credentials to access your account.</p>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#06082C] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#06082C] font-medium hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
