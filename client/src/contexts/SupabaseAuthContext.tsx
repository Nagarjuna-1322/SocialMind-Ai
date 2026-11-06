import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { loadSupabaseClient } from "@/lib/supabase";

type SupabaseAuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<{ error: string | null }>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    void loadSupabaseClient().then(client => {
      if (!active) return;
      setConfigured(true);
      void client.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session);
        setLoading(false);
      });
      const listener = client.auth.onAuthStateChange((_event, nextSession) => {
        if (active) setSession(nextSession);
      });
      unsubscribe = () => listener.data.subscription.unsubscribe();
    }).catch(nextError => {
      if (!active) return;
      setError(messageFor(nextError));
      setLoading(false);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const value = useMemo<SupabaseAuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    configured,
    error,
    signIn: async (email, password) => {
      try {
        const client = await loadSupabaseClient();
        const result = await client.auth.signInWithPassword({ email, password });
        return { error: result.error?.message ?? null };
      } catch (nextError) { return { error: messageFor(nextError) }; }
    },
    signUp: async (email, password) => {
      try {
        const client = await loadSupabaseClient();
        const result = await client.auth.signUp({ email, password });
        return { error: result.error?.message ?? null, needsEmailConfirmation: !result.data.session };
      } catch (nextError) { return { error: messageFor(nextError), needsEmailConfirmation: false }; }
    },
    signOut: async () => {
      try {
        const client = await loadSupabaseClient();
        const result = await client.auth.signOut();
        return { error: result.error?.message ?? null };
      } catch (nextError) { return { error: messageFor(nextError) }; }
    },
  }), [configured, error, loading, session]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error("useSupabaseAuth must be used inside SupabaseAuthProvider");
  return context;
}
