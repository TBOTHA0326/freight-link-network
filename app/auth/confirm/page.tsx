'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if we have hash params (Supabase sends tokens in hash fragment)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Also check query params
        const searchParams = new URLSearchParams(window.location.search);
        const tokenHash = searchParams.get('token_hash');
        const tokenType = searchParams.get('type');
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle explicit errors
        if (error) {
          console.error('Auth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Verification failed');
          return;
        }

        // If we have access_token in hash (implicit flow)
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to establish session');
            return;
          }

          setStatus('success');
          setTimeout(() => router.push('/auth/verified'), 1000);
          return;
        }

        // If we have token_hash in query params
        if (tokenHash && tokenType) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: tokenType as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
          });

          if (verifyError) {
            console.error('Verify OTP error:', verifyError);
            setStatus('error');
            setMessage(verifyError.message || 'Verification failed');
            return;
          }

          setStatus('success');
          setTimeout(() => router.push('/auth/verified'), 1000);
          return;
        }

        // If we have code (PKCE flow)
        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);

          if (codeError) {
            console.error('Code exchange error:', codeError);
            setStatus('error');
            setMessage(codeError.message || 'Verification failed');
            return;
          }

          setStatus('success');
          setTimeout(() => router.push('/auth/verified'), 1000);
          return;
        }

        // Check if user is already authenticated (email auto-confirmed)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => router.push('/auth/verified'), 1000);
          return;
        }

        // No valid params found
        setStatus('error');
        setMessage('Invalid or expired verification link');

      } catch (err) {
        console.error('Confirmation error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-10 h-10 bg-[#06082C] rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#06082C]">
              Freight Link Network
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-[#06082C] mb-3">
                  Verifying Your Email
                </h1>
                <p className="text-gray-600">
                  {message}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#06082C] mb-3">
                  Email Verified!
                </h1>
                <p className="text-gray-600">
                  Redirecting you...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#06082C] mb-3">
                  Verification Failed
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-[#06082C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0a0f4a] transition-colors"
                >
                  Go to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
