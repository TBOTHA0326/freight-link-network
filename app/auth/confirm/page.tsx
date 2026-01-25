'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the full URL including hash
        const fullUrl = window.location.href;
        
        // Check for hash params first (Supabase often sends tokens here)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorInHash = hashParams.get('error');
        const errorDescInHash = hashParams.get('error_description');

        // Also check query params
        const searchParams = new URLSearchParams(window.location.search);
        const codeParam = searchParams.get('code') ?? searchParams.get('token');

        // If a PKCE/code param was provided, forward to the server callback which
        // can exchange the code for a session using the server-side Supabase client.
        if (codeParam) {
          console.log('Forwarding code/token to server callback for exchange', { codeParam });
          window.location.href = `/auth/callback${window.location.search}`;
          return;
        }

        const tokenHash = searchParams.get('token_hash');
        const tokenType = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('Auth confirm - URL:', fullUrl);
        console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, errorInHash });
        console.log('Query params:', { tokenHash, tokenType, error });

        // Handle explicit errors
        if (error || errorInHash) {
          console.error('Auth error:', error || errorInHash, errorDescription || errorDescInHash);
          setStatus('error');
          setMessage(errorDescription || errorDescInHash || 'Verification failed');
          return;
        }

        // If we have access_token and refresh_token in hash (this is the default Supabase flow)
        if (accessToken && refreshToken) {
          console.log('Setting session from hash tokens...');
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

          console.log('Session set successfully!');
          setStatus('success');
          setMessage('Email verified! Redirecting...');
          setTimeout(() => router.push('/auth/verified'), 1500);
          return;
        }

        // If we have token_hash in query params (alternative flow)
        if (tokenHash && tokenType) {
          console.log('Verifying OTP...');
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
          setMessage('Email verified! Redirecting...');
          setTimeout(() => router.push('/auth/verified'), 1500);
          return;
        }

        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('User already has session');
          setStatus('success');
          setMessage('Already verified! Redirecting...');
          setTimeout(() => router.push('/auth/verified'), 1500);
          return;
        }

        // No valid params found
        console.log('No valid auth params found in URL');
        setStatus('error');
        setMessage('Invalid or expired verification link. Please try signing up again.');

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
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 relative flex items-center justify-center">
              <Image
                src="/FLNSITELOGO.png"
                alt="Freight Link Network"
                width={40}
                height={40}
                className="object-contain"
              />
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
                  {message}
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
                <div className="space-y-3">
                  <Link
                    href="/register"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#06082C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0a0f4a] transition-colors"
                  >
                    Try Signing Up Again
                  </Link>
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-[#06082C] py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Go to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
