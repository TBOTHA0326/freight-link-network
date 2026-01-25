'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Truck, Eye, EyeOff, AlertCircle, Check, Mail, ArrowRight, Home } from 'lucide-react';
import { signUp } from '@/database/queries/auth';
import type { UserRole } from '@/database/types';

function RegisterForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Form data
  const [role, setRole] = useState<UserRole>('transporter');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Get role from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'transporter' || roleParam === 'supplier') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp(email, password, fullName, role);
      
      // With email confirmation disabled, user should have a session immediately
      if (result.session) {
        // Redirect to appropriate dashboard
        window.location.href = role === 'supplier' 
          ? '/dashboard/supplier' 
          : '/dashboard/transporter';
      } else if (result.user && !result.session) {
        // Fallback: If email confirmation is still enabled, show message
        setRegistrationComplete(true);
      } else {
        setError('Registration completed but no session created. Please try logging in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
  ];

  // Show email verification screen after successful registration
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
      <Link href="/" aria-label="Back to home" className="absolute left-4 top-4 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-[#06082C] font-semibold shadow-md hover:bg-gray-100 transition-colors">
        <Home className="w-4 h-4" />
        <span className="ml-1">Home</span>
      </Link>

        {/* Email Verification Message */}
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              {/* Mail Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>

              {/* Message */}
              <h1 className="text-2xl font-bold text-[#06082C] mb-3">
                Check Your Email
              </h1>
              <p className="text-gray-600 mb-2">
                We&apos;ve sent a verification link to:
              </p>
              <p className="font-semibold text-[#06082C] mb-6">
                {email}
              </p>
              <p className="text-gray-600 mb-8">
                Click the link in the email to verify your account and complete 
                your registration. The link will expire in 24 hours.
              </p>

              {/* Tips */}
              <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
                <h3 className="font-semibold text-[#06082C] mb-3">Didn&apos;t receive the email?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Check your spam or junk folder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Make sure you entered the correct email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Wait a few minutes and try again</span>
                  </li>
                </ul>
              </div>

              {/* Back to Login */}
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#06082C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0a0f4a] transition-colors"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Support Link */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need help?{' '}
                  <Link href="/contact" className="text-[#06082C] font-medium hover:underline">
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Link href="/" aria-label="Back to home" className="absolute left-4 top-4 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-[#06082C] font-semibold shadow-md hover:bg-gray-100 transition-colors">
        <Home className="w-4 h-4" />
        <span className="ml-1">Home</span>
      </Link>


      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step >= 1 ? 'bg-[#06082C] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-12 h-1 ${step >= 2 ? 'bg-[#06082C]' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step >= 2 ? 'bg-[#06082C] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#06082C] mb-2">
                {step === 1 ? 'Choose Your Role' : 'Create Your Account'}
              </h1>
              <p className="text-gray-600">
                {step === 1
                  ? 'Select how you want to use Freight Link Network'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {step === 1 ? (
              /* Step 1: Role Selection */
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setRole('transporter');
                    setStep(2);
                  }}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    role === 'transporter'
                      ? 'border-[#06082C] bg-[#06082C]/5'
                      : 'border-gray-200 hover:border-[#06082C]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#06082C]/10 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-[#06082C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#06082C] mb-1">
                        I&apos;m a Transporter
                      </h3>
                      <p className="text-sm text-gray-600">
                        I have trucks and want to find loads to transport
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setRole('supplier');
                    setStep(2);
                  }}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    role === 'supplier'
                      ? 'border-[#06082C] bg-[#06082C]/5'
                      : 'border-gray-200 hover:border-[#06082C]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#9B2640]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#9B2640]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#06082C] mb-1">
                        I&apos;m a Supplier
                      </h3>
                      <p className="text-sm text-gray-600">
                        I have goods that need to be transported
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              /* Step 2: Account Details */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs ${
                          req.met ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="#" className="text-[#06082C] hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-[#06082C] hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#06082C] font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06082C]"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
