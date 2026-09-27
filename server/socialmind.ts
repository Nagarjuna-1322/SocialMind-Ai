import { HindsightClient } from "@vectorize-io/hindsight-client";
import { and, desc, eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { brands, memoryEvents, socialPosts } from "../drizzle/schema";

type BrandProfile = {
  id?: number;
  name: string;
  industry: string;
  targetAudience: string;
  brandTone: string;
  platforms: string[];
  contentGoals: string[];
  preferredFormats: string[];
};

type SocialPost = {
  id?: number;
  postId: string;
  date: Date;
  platform: string;
  topic: string;
  contentType: string;
  caption: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  postingTime: string;
  audienceResponse: string;
};

type MemoryItem = { id?: string; text: string; type?: string; date?: string; sourcePostIds?: string[] };

const defaultBrand: BrandProfile = {
  name: "TechNova",
  industry: "Technology Education",
  targetAudience: "Developers and technology professionals",
  brandTone: "Professional, educational, practical",
  platforms: ["Instagram", "LinkedIn", "X"],
  contentGoals: ["Education", "Audience growth", "Engagement"],
  preferredFormats: ["Reel", "Tutorial", "Carousel"],
};

const fallback = {
  brand: { ...defaultBrand },
  posts: [] as SocialPost[],
  events: [] as Array<{ id: number; operation: "retain" | "recall" | "reflect"; status: string; summary: string; query?: string; sourcePostIds?: string[]; createdAt: Date }>,
};
let fallbackSeeded = false;
let bootstrapPromise: Promise<void> | null = null;

const hindsightBaseUrl = process.env.HINDSIGHT_BASE_URL?.trim();
const hindsightApiKey = process.env.HINDSIGHT_API_KEY?.trim();
const hindsightBankId = process.env.HINDSIGHT_BANK_ID?.trim() || "socialmind-technova";
const hindsightConfigured = Boolean(hindsightBaseUrl && hindsightApiKey);
let hindsightClient: HindsightClient | null = null;

function getHindsight() {
  if (!hindsightConfigured) return null;
  if (!hindsightClient) {
    hindsightClient = new HindsightClient({
      baseUrl: hindsightBaseUrl!,
      apiKey: hindsightApiKey,
      maxAttempts: 2,
      userAgent: "socialmind-ai/1.0",
    });
  }
  return hindsightClient;
}

export async function hindsightHealth() {
  const memory = getHindsight();
  if (!memory) {
    return { connected: false, bankId: hindsightBankId, message: "Hindsight API key or base URL is not configured." };
  }
  try {
    // A bank profile read is an authenticated, bank-specific round trip. It
    // verifies both the API key and the configured bank ID without writing data.
    await memory.getBankProfile(hindsightBankId);
    return { connected: true, bankId: hindsightBankId, message: "Hindsight connection successful" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hindsight connection failed";
    return { connected: false, bankId: hindsightBankId, message: `Hindsight unavailable: ${message}` };
  }
}

async function verifyHindsightBank() {
  const memory = getHindsight();
  if (!memory) return null;
  try {
    await memory.getBankProfile(hindsightBankId);
    return memory;
  } catch {
    try {
      await memory.createBank(hindsightBankId, {
        name: "SocialMind demo",
        reflectMission: "Help TechNova decide what to publish next using remembered content outcomes and audience preferences.",
        retainMission: "Retain concrete social post metrics, audience responses, brand preferences, and source post IDs.",
        enableObservations: true,
      });
      return memory;
    } catch (error) {
      console.warn("[Hindsight] bank verification failed", error instanceof Error ? error.message : "unknown error");
      return null;
    }
  }
}

function parseJsonList(value: string | null | undefined, fallbackValue: string[]) {
  try {
    const parsed = JSON.parse(value || "null");
    return Array.isArray(parsed) ? parsed.map(String) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function brandFromRow(row: typeof brands.$inferSelect): BrandProfile {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    targetAudience: row.targetAudience,
    brandTone: row.brandTone,
    platforms: parseJsonList(row.platforms, defaultBrand.platforms),
    contentGoals: parseJsonList(row.contentGoals, defaultBrand.contentGoals),
    preferredFormats: parseJsonList(row.preferredFormats, defaultBrand.preferredFormats),
  };
}

function postFromRow(row: typeof socialPosts.$inferSelect): SocialPost {
  return {
    id: row.id,
    postId: row.postId,
    date: row.date,
    platform: row.platform,
    topic: row.topic,
    contentType: row.contentType,
    caption: row.caption,
    views: row.views,
    reach: row.reach,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    engagementRate: Number(row.engagementRate || 0),
    postingTime: row.postingTime,
    audienceResponse: row.audienceResponse,
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function readSeedPosts(): SocialPost[] {
  const candidates = [
    join(process.cwd(), "server/data/sample_social_data.csv"),
    join(process.cwd(), "dist/data/sample_social_data.csv"),
  ];
  const file = candidates.find(path => {
    try {
      readFileSync(path);
      return true;
    } catch {
      return false;
    }
  });
  if (!file) return [];
  const lines = readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift() || "");
  return lines.map(line => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const reach = Number(row.reach || row.views || 0);
    const computedRate = reach > 0 ? ((Number(row.likes) + Number(row.comments) + Number(row.shares)) / reach) * 100 : 0;
    return {
      postId: row.post_id,
      date: new Date(`${row.date}T12:00:00Z`),
      platform: row.platform,
      topic: row.topic,
      contentType: row.content_type,
      caption: row.caption,
      views: Number(row.views || 0),
      reach,
      likes: Number(row.likes || 0),
      comments: Number(row.comments || 0),
      shares: Number(row.shares || 0),
      engagementRate: Number(row.engagement_rate || computedRate.toFixed(2)),
      postingTime: row.posting_time,
      audienceResponse: row.audience_response,
    };
  });
}

async function recordMemoryEvent(event: { operation: "retain" | "recall" | "reflect"; status: string; summary: string; query?: string; sourcePostIds?: string[] }) {
  const db = await getDb();
  const source = event.sourcePostIds?.join(",") || null;
  if (db) {
    await db.insert(memoryEvents).values({
      operation: event.operation,
      status: event.status,
      summary: event.summary,
      query: event.query || null,
      sourcePostIds: source,
    });
  } else {
    fallback.events.unshift({ ...event, id: Date.now(), createdAt: new Date() });
  }
}

async function ensureBrand(): Promise<BrandProfile> {
  const db = await getDb();
  if (!db) return fallback.brand;
  const rows = await db.select().from(brands).limit(1);
  if (rows[0]) return brandFromRow(rows[0]);
  const inserted = await db.insert(brands).values({
    name: defaultBrand.name,
    industry: defaultBrand.industry,
    targetAudience: defaultBrand.targetAudience,
    brandTone: defaultBrand.brandTone,
    platforms: JSON.stringify(defaultBrand.platforms),
    contentGoals: JSON.stringify(defaultBrand.contentGoals),
    preferredFormats: JSON.stringify(defaultBrand.preferredFormats),
  });
  return { ...defaultBrand, id: Number(inserted[0]?.insertId || 1) };
}

async function getPostsInternal() {
  const db = await getDb();
  if (!db) {
    if (!fallbackSeeded) fallback.posts.push(...readSeedPosts());
    fallbackSeeded = true;
    return fallback.posts;
  }
  const rows = await db.select().from(socialPosts).orderBy(desc(socialPosts.date));
  return rows.map(postFromRow);
}

export async function getBrand() {
  return ensureBrand();
}

export async function updateBrand(input: BrandProfile) {
  const db = await getDb();
  let saved: BrandProfile;
  if (!db) {
    fallback.brand = { ...fallback.brand, ...input };
    saved = fallback.brand;
  } else {
    const existing = await db.select().from(brands).limit(1);
    const payload = {
      name: input.name,
      industry: input.industry,
      targetAudience: input.targetAudience,
      brandTone: input.brandTone,
      platforms: JSON.stringify(input.platforms),
      contentGoals: JSON.stringify(input.contentGoals),
      preferredFormats: JSON.stringify(input.preferredFormats),
    };
    if (existing[0]) {
      await db.update(brands).set(payload).where(eq(brands.id, existing[0].id));
      saved = { ...input, id: existing[0].id };
    } else {
      const result = await db.insert(brands).values(payload);
      saved = { ...input, id: Number(result[0]?.insertId || 1) };
    }
  }
  const memory = await verifyHindsightBank();
  if (!memory) {
    await recordMemoryEvent({ operation: "retain", status: "unavailable", summary: `Brand profile ${saved.name} was saved, but Hindsight is not configured.` });
  } else {
    try {
      await memory.retain(hindsightBankId, `Brand profile for ${saved.name}: industry ${saved.industry}; target audience ${saved.targetAudience}; tone ${saved.brandTone}; platforms ${saved.platforms.join(", ")}; goals ${saved.contentGoals.join(", ")}; preferred formats ${saved.preferredFormats.join(", ")}.`, { context: "Stable brand preference", documentId: "brand-profile", tags: ["brand-profile", "preference"] });
      await recordMemoryEvent({ operation: "retain", status: "retained", summary: `Brand profile ${saved.name} retained in Hindsight.` });
    } catch (error) {
      console.warn("[Hindsight] brand profile retain failed", error instanceof Error ? error.message : "unknown error");
      await recordMemoryEvent({ operation: "retain", status: "error", summary: `Brand profile ${saved.name} was saved, but Hindsight retain failed.` });
    }
  }
  return saved;
}

export async function listPosts(filters: { platform?: string; topic?: string; contentType?: string; search?: string } = {}) {
  const posts = await getPostsInternal();
  return posts.filter(post => {
    if (filters.platform && filters.platform !== "all" && post.platform !== filters.platform) return false;
    if (filters.topic && filters.topic !== "all" && post.topic !== filters.topic) return false;
    if (filters.contentType && filters.contentType !== "all" && post.contentType !== filters.contentType) return false;
    if (filters.search) {
      const haystack = `${post.postId} ${post.topic} ${post.caption} ${post.audienceResponse}`.toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });
}

export async function seedDemoData() {
  const seedPosts = readSeedPosts();
  const db = await getDb();
  const brand = await ensureBrand();
  if (!seedPosts.length) return { created: 0, retained: false, memoryStatus: "unavailable" as const };
  if (!db) {
    if (!fallback.posts.length) fallback.posts.push(...seedPosts);
    fallbackSeeded = true;
  } else {
    const existing = await db.select({ postId: socialPosts.postId }).from(socialPosts);
    const existingIds = new Set(existing.map(row => row.postId));
    const missing = seedPosts.filter(post => !existingIds.has(post.postId));
    if (missing.length) {
      await db.insert(socialPosts).values(missing.map(post => ({
        postId: post.postId,
        date: post.date,
        platform: post.platform,
        topic: post.topic,
        contentType: post.contentType,
        caption: post.caption,
        views: post.views,
        reach: post.reach,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        engagementRate: post.engagementRate,
        postingTime: post.postingTime,
        audienceResponse: post.audienceResponse,
      })));
    }
  }
  const memory = await verifyHindsightBank();
  if (!memory) {
    await recordMemoryEvent({ operation: "retain", status: "unavailable", summary: `Loaded ${seedPosts.length} historical posts into the database; Hindsight is not configured.` });
    return { created: seedPosts.length, retained: false, memoryStatus: "unavailable" as const };
  }
  try {
    await memory.retainBatch(hindsightBankId, [
      {
        content: `Brand profile: ${brand.name} is a ${brand.industry} brand targeting ${brand.targetAudience}. Tone: ${brand.brandTone}. Goals: ${brand.contentGoals.join(", ")}. Preferred formats: ${brand.preferredFormats.join(", ")}.`,
        context: "Stable brand preference",
        document_id: "brand-profile",
        tags: ["brand-profile"],
      },
      ...seedPosts.map(post => ({
        content: `${brand.name} published post ${post.postId} on ${post.date.toISOString().slice(0, 10)} on ${post.platform}. Topic: ${post.topic}. Format: ${post.contentType}. Caption: ${post.caption} It received ${post.views} views and ${post.reach} reach, with ${post.likes} likes, ${post.comments} comments, and ${post.shares} shares. Engagement rate: ${post.engagementRate.toFixed(2)}%. Audience response: ${post.audienceResponse}`,
        context: "Historical social performance",
        document_id: post.postId,
        timestamp: post.date,
        metadata: { post_id: post.postId, platform: post.platform, topic: post.topic, content_type: post.contentType },
        tags: ["social-post", post.platform.toLowerCase(), post.topic.toLowerCase().replace(/\s+/g, "-")],
      })),
    ], { async: true });
    await recordMemoryEvent({ operation: "retain", status: "retained", summary: `Retain requested for ${seedPosts.length} historical posts and brand preferences in Hindsight.`, sourcePostIds: seedPosts.slice(0, 8).map(post => post.postId) });
    return { created: seedPosts.length, retained: true, memoryStatus: "connected" as const };
  } catch (error) {
    console.warn("[Hindsight] retain batch failed", error instanceof Error ? error.message : "unknown error");
    await recordMemoryEvent({ operation: "retain", status: "error", summary: "Database import succeeded, but Hindsight retain failed. Check Hindsight credentials and service health." });
    return { created: seedPosts.length, retained: false, memoryStatus: "error" as const };
  }
}

async function ensureSeeded() {
  const db = await getDb();
  if (!db) {
    if (!fallback.posts.length) await seedDemoData();
    return;
  }
  const rows = await db.select({ id: socialPosts.id }).from(socialPosts).limit(1);
  if (rows.length) return;
  if (!bootstrapPromise) bootstrapPromise = seedDemoData().then(() => undefined).finally(() => { bootstrapPromise = null; });
  await bootstrapPromise;
}

function groupBy(posts: SocialPost[], key: (post: SocialPost) => string) {
  const groups = new Map<string, SocialPost[]>();
  for (const post of posts) {
    const label = key(post);
    groups.set(label, [...(groups.get(label) || []), post]);
  }
  return groups;
}

function performanceRows(posts: SocialPost[], key: (post: SocialPost) => string) {
  return Array.from(groupBy(posts, key).entries()).map(([label, values]) => ({
    label,
    posts: values.length,
    reach: values.reduce((sum, post) => sum + post.reach, 0),
    engagementRate: values.reduce((sum, post) => sum + post.engagementRate, 0) / values.length,
  })).sort((a, b) => b.engagementRate - a.engagementRate);
}

export function calculateAnalytics(posts: SocialPost[]) {
  const safePosts = posts.filter(post => Number.isFinite(post.engagementRate));
  const trend = Array.from(groupBy(safePosts, post => post.date.toISOString().slice(0, 7)).entries()).map(([month, values]) => ({
    month,
    engagementRate: values.reduce((sum, post) => sum + post.engagementRate, 0) / values.length,
    reach: values.reduce((sum, post) => sum + post.reach, 0),
  })).sort((a, b) => a.month.localeCompare(b.month));
  const topicPerformance = performanceRows(safePosts, post => post.topic);
  const contentTypePerformance = performanceRows(safePosts, post => post.contentType);
  const platformPerformance = performanceRows(safePosts, post => post.platform);
  const postingTimePerformance = performanceRows(safePosts, post => post.postingTime);
  const topPosts = [...safePosts].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5);
  const bottomPosts = [...safePosts].sort((a, b) => a.engagementRate - b.engagementRate).slice(0, 5);
  const bestTopic = topicPerformance[0]?.label || "Not enough data";
  const bestContentType = contentTypePerformance[0]?.label || "Not enough data";
  const insights = safePosts.length === 0 ? ["Import posts to start learning from your audience."] : [
    `${bestTopic} leads topic performance at ${topicPerformance[0]?.engagementRate.toFixed(1)}% average engagement.`,
    `${bestContentType} is the strongest format at ${contentTypePerformance[0]?.engagementRate.toFixed(1)}%.`,
    `${postingTimePerformance[0]?.label || "No window"} is the highest-performing posting window in this dataset.`,
    `${safePosts.filter(post => /tutorial|practical/i.test(post.audienceResponse)).length} posts generated requests for more practical education.`,
  ];
  return {
    totalPosts: safePosts.length,
    totalReach: safePosts.reduce((sum, post) => sum + post.reach, 0),
    totalViews: safePosts.reduce((sum, post) => sum + post.views, 0),
    averageEngagementRate: safePosts.length ? safePosts.reduce((sum, post) => sum + post.engagementRate, 0) / safePosts.length : 0,
    bestTopic,
    bestContentType,
    trend,
    topicPerformance,
    contentTypePerformance,
    platformPerformance,
    postingTimePerformance,
    topPosts,
    bottomPosts,
    insights,
  };
}

function extractPostIds(text: string) {
  return Array.from(new Set(text.match(/P\d{3}/g) || []));
}

async function recallMemory(query: string): Promise<{ status: "connected" | "unavailable" | "error"; items: MemoryItem[]; text?: string }> {
  const memory = await verifyHindsightBank();
  if (!memory) {
    await recordMemoryEvent({ operation: "recall", status: "unavailable", summary: "Memory service unavailable; no Hindsight recall was performed.", query });
    return { status: "unavailable", items: [] };
  }
  try {
    const result = await memory.recall(hindsightBankId, query, { budget: "mid", maxTokens: 3000, includeChunks: true });
    const items = (result.results || []).slice(0, 8).map(item => ({ id: item.id, text: item.text || "", type: item.type ?? undefined, date: item.occurred_start ?? undefined, sourcePostIds: extractPostIds(item.text || "") }));
    await recordMemoryEvent({ operation: "recall", status: "retrieved", summary: `Retrieved ${items.length} Hindsight memories for “${query}”.`, query, sourcePostIds: items.flatMap(item => item.sourcePostIds || []) });
    return { status: "connected", items };
  } catch (error) {
    console.warn("[Hindsight] recall failed", error instanceof Error ? error.message : "unknown error");
    await recordMemoryEvent({ operation: "recall", status: "error", summary: "Hindsight recall failed; the strategy response is marked with a memory error.", query });
    return { status: "error", items: [] };
  }
}

async function reflectMemory(query: string) {
  const memory = await verifyHindsightBank();
  if (!memory) {
    await recordMemoryEvent({ operation: "reflect", status: "unavailable", summary: "Memory service unavailable; no Hindsight reflect was performed.", query });
    return { status: "unavailable" as const, text: "" };
  }
  try {
    const result = await memory.reflect(hindsightBankId, query, { budget: "low", includeFacts: true });
    const sourcePostIds = (result.based_on?.memories || []).flatMap((item: { text: string }) => extractPostIds(item.text));
    await recordMemoryEvent({ operation: "reflect", status: "synthesized", summary: "Hindsight reflect synthesized a strategy answer from retained brand memories.", query, sourcePostIds });
    return { status: "connected" as const, text: result.text || "" };
  } catch (error) {
    console.warn("[Hindsight] reflect failed", error instanceof Error ? error.message : "unknown error");
    await recordMemoryEvent({ operation: "reflect", status: "error", summary: "Hindsight reflect failed; the strategy response is marked with a memory error.", query });
    return { status: "error" as const, text: "" };
  }
}

function parseJsonResponse(content: string) {
  try { return JSON.parse(content); } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
}

async function generateWithLLM<T>(prompt: string, schema: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are SocialMind AI, a precise marketing strategist. Only use the evidence provided. Return JSON that follows the requested schema. Do not invent performance data." },
        { role: "user", content: prompt },
      ],
      maxTokens: 1100,
      responseFormat: { type: "json_schema", json_schema: { name: "socialmind_output", schema, strict: true } },
    });
    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return null;
    return parseJsonResponse(content) as T | null;
  } catch (error) {
    console.warn("[LLM] generation unavailable", error instanceof Error ? error.message : "unknown error");
    return null;
  }
}

export async function runStrategy(question: string) {
  await ensureSeeded();
  const [brand, posts] = await Promise.all([getBrand(), getPostsInternal()]);
  const analytics = calculateAnalytics(posts);
  const recall = await recallMemory(question);
  const reflect = await reflectMemory(`${question}\nBrand: ${brand.name}; audience: ${brand.targetAudience}; tone: ${brand.brandTone}.`);
  const evidence = recall.items.length ? recall.items : analytics.topPosts.slice(0, 4).map(post => ({ id: post.postId, text: `${post.postId}: ${post.topic} ${post.contentType} at ${post.engagementRate.toFixed(2)}% engagement; ${post.audienceResponse}`, type: "database-evidence", sourcePostIds: [post.postId] }));
  const prompt = `Question: ${question}\nBrand: ${JSON.stringify(brand)}\nAnalytics: ${JSON.stringify({ averageEngagementRate: analytics.averageEngagementRate, bestTopic: analytics.bestTopic, bestContentType: analytics.bestContentType, topicPerformance: analytics.topicPerformance.slice(0, 5), contentTypePerformance: analytics.contentTypePerformance.slice(0, 5), postingTimePerformance: analytics.postingTimePerformance.slice(0, 5) })}\nHindsight recall evidence: ${JSON.stringify(recall.items)}\nHindsight reflect: ${reflect.text}\nReturn a concise, actionable recommendation for next week.`;
  const llm = await generateWithLLM<{
    summary: string; topics: string[]; formats: string[]; windows: string[]; ideas: string[]; avoid: string[]; reasoning: string[];
  }>(prompt, {
    type: "object",
    properties: { summary: { type: "string" }, topics: { type: "array", items: { type: "string" } }, formats: { type: "array", items: { type: "string" } }, windows: { type: "array", items: { type: "string" } }, ideas: { type: "array", items: { type: "string" } }, avoid: { type: "array", items: { type: "string" } }, reasoning: { type: "array", items: { type: "string" } } },
    required: ["summary", "topics", "formats", "windows", "ideas", "avoid", "reasoning"],
  });
  const topics = analytics.topicPerformance.slice(0, 3).map(row => row.label);
  const formats = analytics.contentTypePerformance.slice(0, 3).map(row => row.label);
  const windows = analytics.postingTimePerformance.slice(0, 3).map(row => row.label);
  const result = llm || {
    summary: `${brand.name} should lean into ${topics[0] || "practical education"} with ${formats[0] || "tutorial-led content"}. The recommendation is grounded in ${analytics.totalPosts} historical posts and ${recall.items.length} Hindsight memories retrieved for this question.`,
    topics,
    formats,
    windows,
    ideas: topics.slice(0, 3).map(topic => `A practical ${topic} walkthrough with one concrete takeaway and a question for the audience.`),
    avoid: analytics.bottomPosts.slice(0, 2).map(post => `Avoid repeating the ${post.topic} / ${post.contentType} pattern from ${post.postId} without a stronger practical hook.`),
    reasoning: evidence.slice(0, 4).map(item => item.text),
  };
  return {
    question,
    brand,
    ...result,
    recommendation: result.summary,
    posting_times: result.windows,
    databaseAnalytics: {
      totalPosts: analytics.totalPosts,
      averageEngagementRate: analytics.averageEngagementRate,
      bestTopic: analytics.bestTopic,
      bestContentType: analytics.bestContentType,
      topPosts: analytics.topPosts.slice(0, 5),
    },
    hindsightMemories: recall.items,
    aiRecommendation: result.summary,
    evidence,
    memory_used: evidence.slice(0, 6),
    confidence: analytics.totalPosts >= 30 && recall.items.length ? "High" : analytics.totalPosts >= 10 ? "Medium" : "Low",
    memoryStatus: recall.status === "connected" || reflect.status === "connected" ? "connected" : recall.status,
    memoryUsed: evidence.slice(0, 6),
    reflectSummary: reflect.text,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateContent(input: { objective: string; topic: string; format: string; audience: string; tone: string }) {
  await ensureSeeded();
  const brand = await getBrand();
  const posts = await getPostsInternal();
  const analytics = calculateAnalytics(posts);
  const query = `Generate a ${input.format} post about ${input.topic} for ${input.audience}. Objective: ${input.objective}. Tone: ${input.tone}. Use historical audience responses and high-performing posts.`;
  const recall = await recallMemory(query);
  const evidence = recall.items.length ? recall.items : analytics.topPosts.slice(0, 3).map(post => ({ id: post.postId, text: `${post.postId} performed at ${post.engagementRate.toFixed(2)}% engagement. Audience: ${post.audienceResponse}`, sourcePostIds: [post.postId] }));
  const llm = await generateWithLLM<{ hook: string; caption: string; cta: string; hashtags: string[]; timing: string; why: string }>(`${query}\nBrand profile: ${JSON.stringify(brand)}\nEvidence: ${JSON.stringify(evidence)}`, {
    type: "object",
    properties: { hook: { type: "string" }, caption: { type: "string" }, cta: { type: "string" }, hashtags: { type: "array", items: { type: "string" } }, timing: { type: "string" }, why: { type: "string" } },
    required: ["hook", "caption", "cta", "hashtags", "timing", "why"],
  });
  const fallbackContent = {
    hook: `${input.topic}, without the jargon: one practical idea your team can use today.`,
    caption: `A practical ${input.topic} playbook for ${input.audience}: start with the problem, show the workflow, and finish with one measurable next step. Save this for your next build session.`,
    cta: "What would you add to this playbook? Share your use case below.",
    hashtags: [`#${input.topic.replace(/\s+/g, "")}`, "#TechNova", "#PracticalAI", "#LearnInPublic"],
    timing: analytics.postingTimePerformance[0]?.label || "Test 17:00–19:00 local time",
    why: `Matches ${brand.name}'s ${brand.brandTone.toLowerCase()} voice and builds on ${evidence.length} evidence items from the brand's performance history.`,
  };
  return { ...fallbackContent, ...(llm || {}), topic: input.topic, format: input.format, memoryStatus: recall.status, memoryUsed: evidence };
}

export async function addPost(input: Omit<SocialPost, "id" | "engagementRate"> & { engagementRate?: number }) {
  const reach = Math.max(0, Number(input.reach || 0));
  const engagementRate = input.engagementRate ?? (reach ? ((input.likes + input.comments + input.shares) / reach) * 100 : 0);
  const post: SocialPost = { ...input, engagementRate, date: new Date(input.date) };
  const db = await getDb();
  if (!db) {
    if (fallback.posts.some(item => item.postId === post.postId)) throw new Error("A post with this ID already exists.");
    fallback.posts.unshift(post);
  } else {
    await db.insert(socialPosts).values(post);
  }
  const brand = await getBrand();
  const memory = await verifyHindsightBank();
  if (!memory) {
    await recordMemoryEvent({ operation: "retain", status: "unavailable", summary: `Post ${post.postId} was saved, but Hindsight is not configured.`, sourcePostIds: [post.postId] });
  } else {
    try {
      await memory.retain(hindsightBankId, `${brand.name} published post ${post.postId} on ${post.date.toISOString().slice(0, 10)} on ${post.platform}. Topic: ${post.topic}. Format: ${post.contentType}. It received ${post.views} views, ${post.reach} reach, ${post.likes} likes, ${post.comments} comments and ${post.shares} shares, for ${post.engagementRate.toFixed(2)}% engagement. Audience response: ${post.audienceResponse}`, { context: "New post performance outcome", documentId: post.postId, timestamp: post.date, metadata: { post_id: post.postId, platform: post.platform, topic: post.topic, content_type: post.contentType }, tags: ["social-post", "new-learning"] });
      await recordMemoryEvent({ operation: "retain", status: "retained", summary: `New outcome for ${post.postId} retained in Hindsight.`, sourcePostIds: [post.postId] });
    } catch (error) {
      console.warn("[Hindsight] new post retain failed", error instanceof Error ? error.message : "unknown error");
      await recordMemoryEvent({ operation: "retain", status: "error", summary: `Post ${post.postId} was saved, but Hindsight retain failed.`, sourcePostIds: [post.postId] });
    }
  }
  return post;
}

export async function getMemoryOverview() {
  await ensureSeeded();
  const db = await getDb();
  let events: Array<{ id: number; operation: "retain" | "recall" | "reflect"; status: string; summary: string; query?: string | null; sourcePostIds?: string[]; createdAt: Date }> = [];
  if (db) {
    const rows = await db.select().from(memoryEvents).orderBy(desc(memoryEvents.createdAt)).limit(20);
    events = rows.map(row => ({ ...row, sourcePostIds: row.sourcePostIds ? row.sourcePostIds.split(",").filter(Boolean) : [] }));
  } else {
    events = fallback.events.slice(0, 20);
  }
  const memory = await verifyHindsightBank();
  let memories: MemoryItem[] = [];
  let status: "connected" | "unavailable" | "error" = memory ? "connected" : "unavailable";
  if (memory) {
    try {
      const response = await memory.listMemories(hindsightBankId, { limit: 18, offset: 0 });
      memories = (response.items || []).map(item => ({ id: item.id, text: item.text || "", type: item.fact_type ?? undefined, date: item.date ?? undefined, sourcePostIds: extractPostIds(item.text || "") }));
    } catch (error) {
      console.warn("[Hindsight] list memories failed", error instanceof Error ? error.message : "unknown error");
      status = "error";
    }
  }
  const learnedObservations = memories.filter(item => /observation|lesson|preference/i.test(item.type || ""));
  return { status, bankId: hindsightBankId, configured: hindsightConfigured, events, memories, learnedObservations, count: memories.length, lifecycle: ["RETAIN", "RECALL", "REFLECT"] };
}

export async function searchMemory(query: string) {
  const result = await recallMemory(query);
  return { ...result, query };
}

export async function retainMemory(input: { content: string; context?: string; documentId?: string; sourcePostIds?: string[] }) {
  const memory = await verifyHindsightBank();
  if (!memory) {
    await recordMemoryEvent({ operation: "retain", status: "unavailable", summary: "Memory service unavailable; no Hindsight retain was performed.", sourcePostIds: input.sourcePostIds });
    return { status: "unavailable" as const, retained: false, bankId: hindsightBankId };
  }
  try {
    await memory.retain(hindsightBankId, input.content, {
      context: input.context || "SocialMind learning",
      documentId: input.documentId,
      tags: ["socialmind", "manual-retain"],
    });
    await recordMemoryEvent({ operation: "retain", status: "retained", summary: "Memory retained in Hindsight.", sourcePostIds: input.sourcePostIds });
    return { status: "connected" as const, retained: true, bankId: hindsightBankId };
  } catch (error) {
    await recordMemoryEvent({ operation: "retain", status: "error", summary: `Hindsight retain failed: ${error instanceof Error ? error.message : "unknown error"}`, sourcePostIds: input.sourcePostIds });
    return { status: "error" as const, retained: false, bankId: hindsightBankId };
  }
}

export async function reflect(query: string) {
  return reflectMemory(query);
}

export async function getDashboard() {
  await ensureSeeded();
  const [brand, posts] = await Promise.all([getBrand(), getPostsInternal()]);
  return { brand, analytics: calculateAnalytics(posts), recentPosts: posts.slice(0, 6), memory: await getMemoryOverview() };
}
