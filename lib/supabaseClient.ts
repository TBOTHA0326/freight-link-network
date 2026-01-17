// =============================================
// SUPABASE CLIENT - Browser & Server Clients
// =============================================

import { createBrowserClient } from '@supabase/ssr';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client for browser-side operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  return createBrowserClient<any>(supabaseUrl, supabaseAnonKey);
}

// Export for convenience
export const supabase = createClient();
