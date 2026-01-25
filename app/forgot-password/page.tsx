'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { resetPassword } from '@/database/queries/auth';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Link href="/" aria-label="Back to home" className="absolute left-4 top-4 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-[#06082C] font-semibold shadow-md hover:bg-gray-100 transition-colors">
          <Home className="w-4 h-4" />
          <span className="ml-1">Home</span>
        </Link>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-[#06082C] mb-3">
                Check Your Email
              </h1>
              
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Check your inbox and follow the instructions to reset your password.
              </p>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#06082C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0a0f4a] transition-colors"
                >
                  Back to Sign In
                </Link>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-[#06082C] py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Try Different Email
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
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
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-[#06082C] mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-600">
                No worries! Enter your email address and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#06082C] font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-[#06082C] mb-2">
                Loading...
              </h1>
              <p className="text-gray-600">
                Please wait while we load the form.
              </p>
            </div>
          </div>
        </main>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}