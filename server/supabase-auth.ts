import type { Express, Request, Response } from "express";
import { verifyAuth } from "@supabase/server/core";
import { upsertSupabaseProfile } from "./db";
import { ENV } from "./_core/env";

function webRequestFromExpress(req: Request) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  return new Request(`${req.protocol}://${req.get("host") || "localhost"}${req.originalUrl}`, { headers });
}

export async function getSupabaseClaims(req: Request) {
  if (!ENV.supabaseUrl) return null;
  const { data, error } = await verifyAuth(webRequestFromExpress(req), {
    auth: "user",
    issuer: `${ENV.supabaseUrl.replace(/\/$/, "")}/auth/v1`,
    env: { url: ENV.supabaseUrl },
  });
  if (error || !data?.userClaims) return null;
  return data.userClaims;
}

function slugForUser(userId: string) {
  return `workspace-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18).toLowerCase() || "user"}`;
}

export async function syncSupabaseProfile(req: Request) {
  const claims = await getSupabaseClaims(req);
  if (!claims) return null;
  const metadata = claims.userMetadata || {};
  const displayName = String(metadata.full_name || metadata.name || claims.email?.split("@")[0] || "SocialMind user").slice(0, 160);
  const workspaceName = String(metadata.workspace_name || `${displayName}'s workspace`).slice(0, 160);
  const profile = await upsertSupabaseProfile({
    supabaseUserId: claims.id,
    workspaceId: 0,
    email: claims.email || null,
    displayName,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
  }, {
    ownerSupabaseUserId: claims.id,
    name: workspaceName,
    slug: slugForUser(claims.id),
  });
  return { ...profile, user: { id: claims.id, email: claims.email || null, displayName } };
}

export function registerSupabaseAuthRoutes(app: Express) {
  app.get("/api/auth/profile", async (req: Request, res: Response) => {
    try {
      const profile = await syncSupabaseProfile(req);
      if (!profile) return res.status(401).json({ error: "A valid Supabase session is required." });
      return res.json(profile);
    } catch (error) {
      console.error("[Supabase] profile sync failed", error instanceof Error ? error.message : "unknown error");
      return res.status(500).json({ error: "Could not persist the Supabase profile." });
    }
  });
}
