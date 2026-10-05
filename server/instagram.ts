import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Express, Request, Response } from "express";
import * as cookie from "cookie";
import { addPost } from "./socialmind";
import { deleteInstagramConnection, getInstagramConnection, upsertInstagramConnection, upsertInstagramPost } from "./db";
import { ENV } from "./_core/env";
import type { InsertSocialPost } from "../drizzle/schema";

const WORKSPACE_KEY = process.env.INSTAGRAM_WORKSPACE_KEY || "technova";
const STATE_COOKIE = "socialmind_instagram_state";
const STATE_MAX_AGE = 10 * 60;
const GRAPH_BASE = "https://graph.instagram.com";
const OAUTH_BASE = "https://www.instagram.com/oauth/authorize";
const TOKEN_ENDPOINT = "https://api.instagram.com/oauth/access_token";
const REQUIRED_SCOPES = ["instagram_business_basic", "instagram_business_manage_insights"];

type InstagramProfile = { id: string; username?: string; account_type?: string; media_count?: number };
type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  permalink?: string;
};
type InstagramInsight = { name: string; values?: Array<{ value?: number }> };

function isConfigured() {
  return Boolean(ENV.instagramAppId && ENV.instagramAppSecret && ENV.instagramRedirectUri && ENV.cookieSecret);
}

function cryptoKey() {
  if (!ENV.cookieSecret) throw new Error("JWT_SECRET is required to encrypt Instagram tokens");
  return createHash("sha256").update(ENV.cookieSecret).digest();
}

function encryptToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cryptoKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

function decryptToken(value: string) {
  const [iv, authTag, encrypted] = value.split(".");
  if (!iv || !authTag || !encrypted) throw new Error("Invalid encrypted Instagram token");
  const decipher = createDecipheriv("aes-256-gcm", cryptoKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

function cookieOptions(req: Request, maxAge: number) {
  const secure = req.protocol === "https" || String(req.headers["x-forwarded-proto"] || "").split(",").includes("https");
  return { httpOnly: true, secure, sameSite: secure ? "none" as const : "lax" as const, path: "/", maxAge };
}

function serializeStateCookie(value: string, options: ReturnType<typeof cookieOptions>) {
  return `${STATE_COOKIE}=${encodeURIComponent(value)}; Max-Age=${options.maxAge}; Path=${options.path}; SameSite=${options.sameSite === "none" ? "None" : "Lax"}${options.httpOnly ? "; HttpOnly" : ""}${options.secure ? "; Secure" : ""}`;
}

function requireConfigured() {
  if (!isConfigured()) throw new Error("Instagram is not configured. Add INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI, and JWT_SECRET on the server.");
}

async function instagramFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, GRAPH_BASE);
  url.searchParams.set("access_token", token);
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) throw new Error(body.error?.message || `Instagram API request failed (${response.status})`);
  return body as T;
}

async function exchangeCode(code: string) {
  const form = new URLSearchParams({ client_id: ENV.instagramAppId, client_secret: ENV.instagramAppSecret, grant_type: "authorization_code", redirect_uri: ENV.instagramRedirectUri, code });
  const response = await fetch(TOKEN_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error_message || !body.data?.[0]?.access_token) throw new Error(body.error_message || "Instagram token exchange failed");
  const shortLived = body.data[0].access_token as string;
  const userId = String(body.data[0].user_id);
  const longLivedUrl = new URL("/access_token", GRAPH_BASE);
  longLivedUrl.searchParams.set("grant_type", "ig_exchange_token");
  longLivedUrl.searchParams.set("client_secret", ENV.instagramAppSecret);
  longLivedUrl.searchParams.set("access_token", shortLived);
  const longResponse = await fetch(longLivedUrl);
  const longBody = await longResponse.json().catch(() => ({}));
  if (!longResponse.ok || !longBody.access_token) throw new Error(longBody.error_message || "Instagram long-lived token exchange failed");
  return { accessToken: String(longBody.access_token), userId, expiresIn: Number(longBody.expires_in || 0) };
}

export async function getInstagramStatus() {
  const connection = await getInstagramConnection(WORKSPACE_KEY);
  if (!connection) return { configured: isConfigured(), connected: false, status: isConfigured() ? "not_connected" : "not_configured", username: null, accountType: null, lastSyncedAt: null, postCount: 0 };
  return { configured: isConfigured(), connected: true, status: "connected", username: connection.username, accountType: connection.accountType, lastSyncedAt: connection.lastSyncedAt, postCount: 0 };
}

export function registerInstagramRoutes(app: Express) {
  app.get("/api/instagram/connect", (req: Request, res: Response) => {
    try {
      requireConfigured();
      const state = randomBytes(24).toString("base64url");
      res.setHeader("Set-Cookie", serializeStateCookie(state, cookieOptions(req, STATE_MAX_AGE)));
      const url = new URL(OAUTH_BASE);
      url.searchParams.set("client_id", ENV.instagramAppId);
      url.searchParams.set("redirect_uri", ENV.instagramRedirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", REQUIRED_SCOPES.join(","));
      url.searchParams.set("state", state);
      url.searchParams.set("force_reauth", "false");
      res.redirect(302, url.toString());
    } catch (error) {
      res.status(503).json({ error: error instanceof Error ? error.message : "Instagram is not configured" });
    }
  });

  app.get("/api/instagram/callback", async (req: Request, res: Response) => {
    const query = req.query as Record<string, string | undefined>;
    const cookies = cookie.parse(req.headers.cookie || "");
    const state = query.state;
    const code = query.code;
    if (!state || state !== cookies[STATE_COOKIE]) {
      res.status(403).send("Instagram connection could not be verified. Please try again.");
      return;
    }
    res.setHeader("Set-Cookie", serializeStateCookie("", cookieOptions(req, 0)));
    if (query.error) {
      res.redirect(302, "/settings?instagram=denied");
      return;
    }
    if (!code) {
      res.status(400).send("Instagram authorization code is missing.");
      return;
    }
    try {
      requireConfigured();
      const token = await exchangeCode(code);
      const profile = await instagramFetch<InstagramProfile>(`/${token.userId}?fields=id,username,account_type,media_count`, token.accessToken);
      await upsertInstagramConnection({ workspaceKey: WORKSPACE_KEY, instagramUserId: token.userId, username: profile.username || `Instagram user ${token.userId}`, accountType: profile.account_type || null, accessTokenEncrypted: encryptToken(token.accessToken), tokenExpiresAt: token.expiresIn ? new Date(Date.now() + token.expiresIn * 1000) : null, lastSyncedAt: null });
      res.redirect(302, "/settings?instagram=connected");
    } catch (error) {
      console.error("[Instagram] OAuth callback failed", error instanceof Error ? error.message : "unknown error");
      res.redirect(302, "/settings?instagram=error");
    }
  });

  app.get("/api/instagram/status", async (_req, res) => {
    try { res.json(await getInstagramStatus()); }
    catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "Instagram status failed" }); }
  });

  app.post("/api/instagram/disconnect", async (_req, res) => {
    try { await deleteInstagramConnection(WORKSPACE_KEY); res.json({ success: true }); }
    catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "Instagram disconnect failed" }); }
  });

  app.post("/api/instagram/sync", async (_req, res) => {
    try { res.json(await syncInstagramMedia()); }
    catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Instagram sync failed" }); }
  });
}

export async function syncInstagramMedia() {
  requireConfigured();
  const connection = await getInstagramConnection(WORKSPACE_KEY);
  if (!connection) throw new Error("Connect an Instagram professional account before syncing posts.");
  const token = decryptToken(connection.accessTokenEncrypted);
  const mediaResponse = await instagramFetch<{ data?: InstagramMedia[] }>(`/${connection.instagramUserId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=50`, token);
  const media = mediaResponse.data || [];
  let imported = 0;
  for (const item of media) {
    const postId = `IG_${item.id}`.slice(0, 64);
    const caption = item.caption?.trim() || "Instagram post imported without a caption.";
    const hashtags = caption.match(/#[\w-]+/g);
    const topic = (hashtags?.[0]?.replace(/^#/, "") || caption.split(/\s+/).slice(0, 6).join(" ") || "Instagram content").slice(0, 120);
    const contentType = item.media_type === "VIDEO" ? "Reel" : item.media_type === "CAROUSEL_ALBUM" ? "Carousel" : "Image";
    const date = item.timestamp ? new Date(item.timestamp) : new Date();
    const likes = Number(item.like_count || 0);
    const comments = Number(item.comments_count || 0);
    const post: InsertSocialPost = { postId, date, platform: "Instagram", topic, contentType, caption, views: 0, reach: 0, likes, comments, shares: 0, engagementRate: 0, postingTime: date.toISOString().slice(11, 16), audienceResponse: `Imported from @${connection.username}. Likes and comments are available from Instagram; reach and shares require an approved insights scope.`, createdAt: new Date() };
    await upsertInstagramPost(post);
    imported += 1;
  }
  const now = new Date();
  await upsertInstagramConnection({ workspaceKey: WORKSPACE_KEY, instagramUserId: connection.instagramUserId, username: connection.username, accountType: connection.accountType, accessTokenEncrypted: connection.accessTokenEncrypted, tokenExpiresAt: connection.tokenExpiresAt, lastSyncedAt: now });
  return { success: true, imported, syncedAt: now, username: connection.username, note: "Instagram posts are now part of SocialMind analytics. Reach and share metrics remain zero unless the account has approved insights access." };
}

export async function disconnectInstagram() {
  await deleteInstagramConnection(WORKSPACE_KEY);
  return { success: true } as const;
}
