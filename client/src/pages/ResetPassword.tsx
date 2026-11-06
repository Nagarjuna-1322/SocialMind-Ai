import { FormEvent, useState } from "react";
import { Check, KeyRound, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { updatePassword } = useSupabaseAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true); setError(null);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.error) return setError(result.error);
    setLocation("/");
  };

  return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-5"><div className="w-full max-w-md rounded-3xl border border-[#e7e8ef] bg-white p-7 shadow-[0_24px_70px_rgba(31,35,61,0.08)] sm:p-10"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9e8ff] text-[#5b5ce2]"><KeyRound className="h-5 w-5" /></div><div className="eyebrow mt-7">Secure recovery</div><h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Choose a new password</h1><p className="mt-3 text-sm leading-6 text-[#737789]">Use a strong password you don’t reuse elsewhere.</p>{error && <div className="mt-5 rounded-xl bg-[#fff8f8] p-3 text-sm text-[#a54848]">{error}</div>}<form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-xs font-semibold text-[#626679]">New password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a3b0]" /><input required minLength={6} type="password" autoComplete="new-password" className="input-shell pl-10" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" /></div></label><label className="block text-xs font-semibold text-[#626679]">Confirm password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a3b0]" /><input required minLength={6} type="password" autoComplete="new-password" className="input-shell pl-10" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repeat your new password" /></div></label><Button type="submit" disabled={busy} className="h-11 w-full gap-2 rounded-xl bg-[#5b5ce2]"><Check className="h-4 w-4" />{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}</Button></form><div className="mt-7 flex items-center gap-2 text-xs text-[#a0a3b0]"><Sparkles className="h-3.5 w-3.5 text-[#7777ee]" />Your account stays protected by Supabase Auth.</div></div></div>;
}
