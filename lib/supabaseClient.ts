// =============================================
// SUPABASE CLIENT - Browser & Server Clients
// =============================================

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/database/types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client for browser-side operations
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Export for convenience
export const supabase = createClient();
