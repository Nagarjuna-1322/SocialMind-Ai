import { useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { user, loading, recovery, error } = useSupabaseAuth();
  useEffect(() => {
    const recoveryHash = window.location.hash.includes("type=recovery");
    if (recovery || recoveryHash) setLocation("/reset-password");
    else if (!loading && user) setLocation("/");
    else if (!loading && error) setLocation(`/login?error=${encodeURIComponent(error)}`);
  }, [error, loading, recovery, setLocation, user]);
  return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-5"><div className="rounded-3xl border border-[#e7e8ef] bg-white p-10 text-center shadow-[0_24px_70px_rgba(31,35,61,0.08)]"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9e8ff] text-[#5b5ce2]"><Sparkles className="h-5 w-5" /></div><h1 className="mt-6 font-display text-2xl font-semibold">Finishing sign in…</h1><p className="mt-2 text-sm text-[#7b7f91]">Verifying your secure Supabase session.</p><Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-[#5b5ce2]" /></div></div>;
}
