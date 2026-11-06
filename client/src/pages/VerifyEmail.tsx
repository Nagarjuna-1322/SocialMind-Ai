import { useState } from "react";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { user, resendVerification } = useSupabaseAuth();
  const email = new URLSearchParams(window.location.search).get("email") || user?.email || "your email address";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (!email.includes("@")) return;
    setBusy(true); setError(null); setMessage(null);
    const result = await resendVerification(email);
    setBusy(false);
    if (result.error) setError(result.error);
    else setMessage("A fresh confirmation email is on its way.");
  };

  return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-5"><div className="w-full max-w-md rounded-3xl border border-[#e7e8ef] bg-white p-7 text-center shadow-[0_24px_70px_rgba(31,35,61,0.08)] sm:p-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e0f8ee] text-[#197553]"><Mail className="h-6 w-6" /></div><div className="eyebrow mt-6">One quick step</div><h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Check your inbox</h1><p className="mt-4 text-sm leading-6 text-[#737789]">We sent a confirmation link to <strong className="text-[#4d5061]">{email}</strong>. Confirm it to activate your SocialMind workspace.</p>{message && <div className="mt-5 rounded-xl bg-[#f2fff9] p-3 text-sm text-[#197553]">{message}</div>}{error && <div className="mt-5 rounded-xl bg-[#fff8f8] p-3 text-sm text-[#a54848]">{error}</div>}<div className="mt-7 space-y-3"><Button className="h-11 w-full gap-2 rounded-xl bg-[#5b5ce2]" onClick={() => setLocation("/login")}><CheckCircle2 className="h-4 w-4" />I’ve confirmed my email</Button><Button variant="outline" className="h-11 w-full gap-2 rounded-xl bg-white" disabled={busy} onClick={() => void resend}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Resend confirmation email</Button></div><Link href="/login" className="mt-6 inline-block text-xs font-semibold text-[#7777ee] hover:underline">Back to sign in</Link></div></div>;
}
