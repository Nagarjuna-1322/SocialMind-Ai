import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("production Supabase site URL", () => {
  it("points to a reachable SocialMind auth endpoint", async () => {
    expect(ENV.supabaseSiteUrl).toMatch(/^https:\/\//);
    const response = await fetch(`${ENV.supabaseSiteUrl}/api/auth/config`, { signal: AbortSignal.timeout(5000) });
    expect(response.ok).toBe(true);
  });
});
