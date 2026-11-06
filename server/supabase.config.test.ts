import { describe, expect, it } from "vitest";

describe("Supabase configuration", () => {
  it("accepts the configured server secret at the Auth settings endpoint", async () => {
    const url = process.env.SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;

    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(secret).toMatch(/^sb_secret_/);

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
      },
    });

    expect(response.ok).toBe(true);
    const body = await response.json() as Record<string, unknown>;
    expect(body).toBeTypeOf("object");
  }, 30_000);
});
