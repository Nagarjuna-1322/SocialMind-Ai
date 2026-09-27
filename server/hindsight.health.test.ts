import { describe, expect, it } from "vitest";
import { hindsightHealth } from "./socialmind";

describe("Hindsight health integration", () => {
  it("authenticates against the configured SocialMind bank", async () => {
    const result = await hindsightHealth();
    expect(result.connected, result.message).toBe(true);
    expect(result.bankId).toBe(process.env.HINDSIGHT_BANK_ID || "socialmind-demo");
    expect(result.message).toBe("Hindsight connection successful");
  }, 30_000);
});
