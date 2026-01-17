// =============================================
// AUTH CALLBACK - Handle Email Confirmation Redirects
// =============================================

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Get various possible auth parameters
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/auth/verified';

  // If there's an error from Supabase, redirect to error page
  if (error) {
    console.error('Auth error from Supabase:', error, error_description);
    return NextResponse.redirect(new URL('/auth/error', requestUrl.origin));
  }

  // If no server-side params, redirect to client-side handler
  // This handles cases where tokens are in the hash fragment
  if (!code && !token_hash) {
    return NextResponse.redirect(new URL('/auth/confirm', requestUrl.origin));
  }

  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Handle email confirmation with token_hash (email link verification)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
    });

    if (!verifyError) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    
    console.error('OTP verification error:', verifyError);
    return NextResponse.redirect(new URL('/auth/error', requestUrl.origin));
  }

  // Handle PKCE flow with code
  if (code) {
    const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!codeError) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    
    console.error('Code exchange error:', codeError);
    return NextResponse.redirect(new URL('/auth/error', requestUrl.origin));
  }

  // Fallback to error page
  return NextResponse.redirect(new URL('/auth/error', requestUrl.origin));
}
