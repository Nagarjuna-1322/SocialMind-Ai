import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerInstagramRoutes } from "./instagram";
import { addPost, generateContent, getBrand, getDashboard, getMemoryOverview, hindsightHealth, listPosts, reflect, retainMemory, runStrategy, searchMemory, updateBrand, seedDemoData } from "./socialmind";

function asyncRoute(handler: (req: express.Request, res: express.Response) => Promise<unknown>) {
  return (req: express.Request, res: express.Response) => handler(req, res).catch(error => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.status(400).json({ error: message });
  });
}

export function createApp(options: { vercel?: boolean } = {}) {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Vercel may mount api/index.ts with the /api prefix removed. Normalize that
  // shape so the existing /api/* route contract works in both environments.
  if (options.vercel) {
    app.use((req, _res, next) => {
      if (!req.path.startsWith("/api")) {
        req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
      }
      next();
    });
  }

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerInstagramRoutes(app);

  app.get("/api/dashboard", asyncRoute(async (_req, res) => res.json(await getDashboard())));
  app.get("/api/posts", asyncRoute(async (req, res) => res.json(await listPosts({ platform: String(req.query.platform || ""), topic: String(req.query.topic || ""), contentType: String(req.query.contentType || ""), search: String(req.query.search || "") }))));
  app.post("/api/posts", asyncRoute(async (req, res) => res.status(201).json(await addPost(req.body))));
  app.post("/api/posts/import", asyncRoute(async (_req, res) => res.json(await seedDemoData())));
  app.get("/api/analytics", asyncRoute(async (_req, res) => res.json((await getDashboard()).analytics)));
  app.post("/api/strategy", asyncRoute(async (req, res) => res.json(await runStrategy(String(req.body.query || req.body.question || "What should we post next week?")))));
  app.post("/api/content/generate", asyncRoute(async (req, res) => res.json(await generateContent(req.body))));
  app.get("/api/memory", asyncRoute(async (_req, res) => res.json(await getMemoryOverview())));
  app.post("/api/memory/retain", asyncRoute(async (req, res) => res.json(await retainMemory({ content: String(req.body.content || req.body.memory || ""), context: req.body.context ? String(req.body.context) : undefined, documentId: req.body.documentId ? String(req.body.documentId) : undefined, sourcePostIds: Array.isArray(req.body.sourcePostIds) ? req.body.sourcePostIds.map(String) : undefined }))));
  app.post("/api/memory/recall", asyncRoute(async (req, res) => res.json(await searchMemory(String(req.body.query || "")))));
  app.post("/api/memory/reflect", asyncRoute(async (req, res) => res.json(await reflect(String(req.body.query || "")))));
  app.post("/api/memory/search", asyncRoute(async (req, res) => res.json(await searchMemory(String(req.body.query || "")))));
  app.get("/api/hindsight/health", asyncRoute(async (_req, res) => {
    const result = await hindsightHealth();
    res.status(result.connected ? 200 : 503).json(result);
  }));
  app.get("/api/brand", asyncRoute(async (_req, res) => res.json(await getBrand())));
  app.post("/api/brand", asyncRoute(async (req, res) => res.json(await updateBrand(req.body))));

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  return app;
}
