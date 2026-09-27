import { describe, expect, it } from "vitest";
import { calculateAnalytics } from "./socialmind";

const post = (overrides: Record<string, unknown> = {}) => ({
  postId: "P001",
  date: new Date("2026-01-10T12:00:00Z"),
  platform: "Instagram",
  topic: "Generative AI",
  contentType: "Tutorial",
  caption: "A practical guide",
  views: 1000,
  reach: 1000,
  likes: 50,
  comments: 20,
  shares: 10,
  engagementRate: 8,
  postingTime: "18:00",
  audienceResponse: "Audience requested more practical examples.",
  ...overrides,
});

describe("SocialMind analytics", () => {
  it("calculates KPIs and ranks performance groups from stored posts", () => {
    const result = calculateAnalytics([
      post(),
      post({ postId: "P002", topic: "Python", contentType: "Reel", engagementRate: 4, platform: "LinkedIn", date: new Date("2026-02-11T12:00:00Z") }),
      post({ postId: "P003", topic: "Generative AI", engagementRate: 10, postingTime: "19:00", date: new Date("2026-02-20T12:00:00Z") }),
    ] as any);

    expect(result.totalPosts).toBe(3);
    expect(result.totalReach).toBe(3000);
    expect(result.averageEngagementRate).toBeCloseTo(7.333, 2);
    expect(result.bestTopic).toBe("Generative AI");
    expect(result.bestContentType).toBe("Tutorial");
    expect(result.topicPerformance[0]).toMatchObject({ label: "Generative AI", posts: 2 });
    expect(result.platformPerformance).toHaveLength(2);
    expect(result.trend).toHaveLength(2);
  });

  it("returns an honest empty-state analytics result for no data", () => {
    const result = calculateAnalytics([]);
    expect(result.totalPosts).toBe(0);
    expect(result.totalReach).toBe(0);
    expect(result.averageEngagementRate).toBe(0);
    expect(result.bestTopic).toBe("Not enough data");
    expect(result.insights[0]).toContain("Import posts");
  });
});
