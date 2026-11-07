import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
  siteUrl?: string;
};

let siteUrl = "";

export function getSupabaseClient() {
  return client;
}

export async function loadSupabaseClient() {
  if (client) return client;
  const response = await fetch("/api/auth/config");
  if (!response.ok) throw new Error("Supabase authentication is not configured.");
  const config = await response.json() as SupabaseConfig;
  if (!config.url || !config.publishableKey) throw new Error("Supabase authentication is not configured.");
  siteUrl = config.siteUrl?.replace(/\/$/, "") || window.location.origin;
  client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export function getAuthRedirectUrl() {
  return `${siteUrl || window.location.origin}/auth/callback`;
}

export type AuthSnapshot = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
};
