import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { addPost, generateContent, getBrand, getDashboard, getMemoryOverview, hindsightHealth, listPosts, reflect, retainMemory, runStrategy, searchMemory, updateBrand, seedDemoData } from "../socialmind";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function asyncRoute(handler: (req: express.Request, res: express.Response) => Promise<unknown>) {
  return (req: express.Request, res: express.Response) => handler(req, res).catch(error => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.status(400).json({ error: message });
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

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
  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
