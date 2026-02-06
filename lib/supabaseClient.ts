// =============================================
// SUPABASE CLIENT - Browser & Server Clients
// =============================================

import { createBrowserClient } from '@supabase/ssr';

// Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables in development
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Please check your .env.local file or Vercel environment settings.');
}

// Singleton instance for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

// Create a Supabase client for browser-side operations
// Uses singleton pattern to avoid creating multiple clients
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  
  // Return existing client if already created (singleton)
  if (browserClient) {
    return browserClient;
  }
  
  browserClient = createBrowserClient<any>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

// Export singleton for convenience (backward compatibility)
// This is safe because createClient() uses singleton pattern
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a proxy that throws on access - defers error until actual use
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get() {
        throw new Error('Supabase environment variables are not configured');
      }
    });
  }
  return createClient();
})();
