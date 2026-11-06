import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading, configured, error: configError, signIn, signUp } = useSupabaseAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setLocation("/");
  }, [setLocation, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setFormError(null);
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) return setFormError(result.error);
    if (mode === "signup" && "needsEmailConfirmation" in result && result.needsEmailConfirmation) {
      setMessage("Account created. Check your email to confirm your account, then sign in.");
      setMode("signin");
      return;
    }
    setLocation("/");
  };

  return <div className="flex min-h-screen bg-[#f7f8fb] text-[#20212d]">
    <div className="hidden w-[43%] flex-col justify-between bg-[#151a28] p-10 text-white lg:flex">
      <div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7ee8c2] text-[#15231f]"><Sparkles className="h-5 w-5" /></div><div><div className="font-display text-xl font-semibold">SocialMind</div><div className="text-[10px] uppercase tracking-[0.2em] text-[#8e96a9]">AI strategist</div></div></div><div className="mt-24 max-w-md"><div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7ee8c2]">Your content command center</div><h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-[-0.04em]">Turn every post into a smarter next move.</h1><p className="mt-6 text-base leading-7 text-[#b6bdcc]">Connect your workspace, understand what earns a response, and build your next content plan with confidence.</p></div></div>
      <div className="flex items-center gap-3 text-xs text-[#8e96a9]"><Check className="h-4 w-4 text-[#7ee8c2]" /> Secure authentication powered by Supabase</div>
    </div>
    <main className="flex flex-1 items-center justify-center p-5 sm:p-8"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#151a28] text-[#7ee8c2]"><Sparkles className="h-5 w-5" /></div><div><div className="font-display text-xl font-semibold">SocialMind</div><div className="text-[10px] uppercase tracking-[0.2em] text-[#8e96a9]">AI strategist</div></div></div></div><div className="mb-8"><div className="eyebrow mb-3">Welcome to SocialMind</div><h2 className="font-display text-3xl font-semibold tracking-[-0.04em]">{mode === "signin" ? "Sign in to your workspace" : "Create your workspace account"}</h2><p className="mt-3 text-sm leading-6 text-[#7b7f91]">{mode === "signin" ? "Your analytics and content strategy are waiting." : "Start building a repeatable content system today."}</p></div>{(configError || formError) && <div className="mb-4 rounded-xl border border-[#f3d0d0] bg-[#fff8f8] p-3 text-sm leading-5 text-[#a54848]">{formError || configError}</div>}{message && <div className="mb-4 rounded-xl border border-[#ccefe0] bg-[#f2fff9] p-3 text-sm leading-5 text-[#197553]">{message}</div>}<form onSubmit={submit} className="space-y-4"><label className="block text-xs font-semibold text-[#626679]">Email address<div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a3b0]" /><input required type="email" autoComplete="email" className="input-shell pl-10" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" /></div></label><label className="block text-xs font-semibold text-[#626679]">Password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a3b0]" /><input required minLength={6} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} className="input-shell pl-10" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" /></div></label><Button type="submit" disabled={busy || loading || !configured} className="h-12 w-full gap-2 rounded-xl bg-[#5b5ce2] text-sm font-semibold text-white hover:bg-[#4e4fc9]">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{mode === "signin" ? "Sign in" : "Create account"}</Button></form><button className="mt-6 w-full text-center text-sm font-semibold text-[#5b5ce2] hover:underline" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setFormError(null); setMessage(null); }}>{mode === "signin" ? "New to SocialMind? Create an account" : "Already have an account? Sign in"}</button><p className="mt-8 text-center text-xs leading-5 text-[#a0a3b0]">By continuing, you agree to use SocialMind for your own workspace and content data.</p></div></main>
  </div>;
}
