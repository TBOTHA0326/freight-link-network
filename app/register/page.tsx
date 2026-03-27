"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, AlertCircle, Truck, Package, ChevronRight } from "lucide-react";
import { signUp } from "@/database/queries/auth";
import StepIndicator from "@/components/StepIndicator";

const steps = [{ label: "Role" }, { label: "Details" }];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"transporter" | "supplier" | null>(null);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", full_name: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleNext = () => {
    if (!role) { setError("Please select a role."); return; }
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!role) return;
    setLoading(true);
    setError(null);
    try {
      await signUp({ email: form.email, password: form.password, full_name: form.full_name, phone: form.phone, role });
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#06082C] flex-col justify-between p-12">
        <Link href="/">
          <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={160} height={40} className="object-contain" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Join Freight Link Network</h2>
          <p className="text-white/60 leading-relaxed">Create your account and start connecting with logistics partners across South Africa.</p>
          <div className="mt-8 space-y-4">
            {["Free to register", "Verified companies only", "SA-wide coverage", "Cross-border support"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} Freight Link Network</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-block bg-[#06082C] rounded-xl px-4 py-2">
              <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={140} height={35} style={{ height: "auto" }} className="object-contain" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
            <p className="text-sm text-gray-500 mb-6">Join South Africa&apos;s logistics network.</p>

            <div className="mb-8">
              <StepIndicator steps={steps} currentStep={step} />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 mb-3">I am a:</p>
                {[
                  { value: "supplier" as const, icon: Package, title: "Supplier", desc: "I have freight loads that need to be transported." },
                  { value: "transporter" as const, icon: Truck, title: "Transporter", desc: "I have trucks and want to carry freight loads." },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => { setRole(r.value); setError(null); }}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      role === r.value ? "border-[#06082C] bg-[#06082C]/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${role === r.value ? "bg-[#06082C]" : "bg-gray-100"}`}>
                      <r.icon size={20} className={role === r.value ? "text-white" : "text-gray-500"} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{r.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleRoleNext}
                  className="w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    placeholder="John Smith"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="you@company.co.za"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+27 82 000 0000"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      placeholder="Min. 8 characters"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Account"}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#06082C] font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
