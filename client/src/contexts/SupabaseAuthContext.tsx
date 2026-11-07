import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectUrl, loadSupabaseClient } from "@/lib/supabase";

type AuthResult = { error: string | null };
type SupabaseAuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  recovery: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);
function messageFor(error: unknown) { return error instanceof Error ? error.message : "Something went wrong. Please try again."; }

async function syncProfile(session: Session | null) {
  if (!session?.access_token) return;
  try {
    await fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${session.access_token}` } });
  } catch {
    // Profile persistence should not block an otherwise valid Supabase session.
  }
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);

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
        void syncProfile(data.session);
        setLoading(false);
      });
      const listener = client.auth.onAuthStateChange((event, nextSession) => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY") setRecovery(true);
        setSession(nextSession);
        void syncProfile(nextSession);
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
    recovery,
    signIn: async (email, password) => {
      try { const result = await (await loadSupabaseClient()).auth.signInWithPassword({ email, password }); return { error: result.error?.message ?? null }; }
      catch (nextError) { return { error: messageFor(nextError) }; }
    },
    signUp: async (email, password) => {
      try {
        const result = await (await loadSupabaseClient()).auth.signUp({ email, password, options: { emailRedirectTo: getAuthRedirectUrl() } });
        return { error: result.error?.message ?? null, needsEmailConfirmation: !result.data.session };
      } catch (nextError) { return { error: messageFor(nextError), needsEmailConfirmation: false }; }
    },
    signInWithOAuth: async provider => {
      try {
        const result = await (await loadSupabaseClient()).auth.signInWithOAuth({ provider, options: { redirectTo: getAuthRedirectUrl() } });
        return { error: result.error?.message ?? null };
      } catch (nextError) { return { error: messageFor(nextError) }; }
    },
    resetPassword: async email => {
      try {
        const result = await (await loadSupabaseClient()).auth.resetPasswordForEmail(email, { redirectTo: getAuthRedirectUrl() });
        return { error: result.error?.message ?? null };
      } catch (nextError) { return { error: messageFor(nextError) }; }
    },
    resendVerification: async email => {
      try {
        const result = await (await loadSupabaseClient()).auth.resend({ type: "signup", email, options: { emailRedirectTo: getAuthRedirectUrl() } });
        return { error: result.error?.message ?? null };
      } catch (nextError) { return { error: messageFor(nextError) }; }
    },
    updatePassword: async password => {
      try {
        const result = await (await loadSupabaseClient()).auth.updateUser({ password });
        return { error: result.error?.message ?? null };
      } catch (nextError) { return { error: messageFor(nextError) }; }
    },
    signOut: async () => {
      try { const result = await (await loadSupabaseClient()).auth.signOut(); return { error: result.error?.message ?? null }; }
      catch (nextError) { return { error: messageFor(nextError) }; }
    },
  }), [configured, error, loading, recovery, session]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error("useSupabaseAuth must be used inside SupabaseAuthProvider");
  return context;
}
