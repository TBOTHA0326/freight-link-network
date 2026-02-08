'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabaseClient';
import type { Profile } from '@/database/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Only retry on actual network errors, not missing profile
        if (error.code === 'PGRST116') {
          // No profile found - this is normal for new users
          return;
        }
        
        // Retry once on network errors with shorter delay
        if (retryCount === 0 && (error.message.includes('network') || error.message.includes('fetch'))) {
          await new Promise(resolve => setTimeout(resolve, 300));
          return fetchProfile(userId, 1);
        }
        
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      // Only retry on network errors
      if (retryCount === 0 && err instanceof TypeError) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return fetchProfile(userId, 1);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // If we get a refresh token error, clear the stale session
          // so the user can sign in fresh instead of being stuck
          if (
            error.message?.includes('Refresh Token') ||
            error.message?.includes('refresh_token') ||
            error.message?.includes('Invalid') ||
            error.code === 'bad_jwt'
          ) {
            await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        
        setLoading(false);
      } catch (err) {
        // Clear bad session on any unexpected error
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    // Safety timeout — if getInitialSession hangs for 8 seconds, force
    // loading to false so the app doesn't stay stuck on a spinner forever
    const safetyTimer = setTimeout(() => {
      setLoading((current) => {
        if (current) {
          // Session check hung — clear everything so user can sign in
          supabase.auth.signOut({ scope: 'local' }).catch(() => {});
          setSession(null);
          setUser(null);
          setProfile(null);
          return false;
        }
        return current;
      });
    }, 8000);

    getInitialSession().finally(() => clearTimeout(safetyTimer));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        try {
          // On TOKEN_REFRESHED failure or SIGNED_OUT, clear everything
          if (event === 'TOKEN_REFRESHED' && !session) {
            setSession(null);
            setUser(null);
            setProfile(null);
            return;
          }

          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch {
          // Silently handle auth state change errors
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
