"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getProfile, signOut as signOutQuery } from "@/database/queries/auth";
import type { Profile } from "@/database/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const p = await getProfile(userId);
    setProfile(p);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const p = await getProfile(data.session.user.id);
      setProfile(p);
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutQuery();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    // 8-second safety timeout
    safetyTimerRef.current = setTimeout(async () => {
      if (loading) {
        await signOutQuery().catch(() => {});
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }, 8000);

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser.id).finally(() => {
          setLoading(false);
          if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        });
      } else {
        setLoading(false);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (event === "SIGNED_IN" && sessionUser) {
        void fetchProfile(sessionUser.id).catch(() => {});
      }
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
