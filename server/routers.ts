import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { addPost, generateContent, getBrand, getDashboard, getMemoryOverview, listPosts, runStrategy, seedDemoData, searchMemory, updateBrand } from "./socialmind";

const postInput = z.object({
  postId: z.string().min(2).max(64),
  date: z.string(),
  platform: z.string().min(1),
  topic: z.string().min(1),
  contentType: z.string().min(1),
  caption: z.string().min(1),
  views: z.coerce.number().int().min(0),
  reach: z.coerce.number().int().min(0),
  likes: z.coerce.number().int().min(0),
  comments: z.coerce.number().int().min(0),
  shares: z.coerce.number().int().min(0),
  postingTime: z.string().min(1),
  audienceResponse: z.string().min(1),
  engagementRate: z.coerce.number().min(0).optional(),
});

const brandInput = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  brandTone: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  contentGoals: z.array(z.string()).min(1),
  preferredFormats: z.array(z.string()).min(1),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  socialmind: router({
    dashboard: publicProcedure.query(() => getDashboard()),
    posts: publicProcedure.input(z.object({ platform: z.string().optional(), topic: z.string().optional(), contentType: z.string().optional(), search: z.string().optional() }).optional()).query(({ input }) => listPosts(input || {})),
    seed: publicProcedure.mutation(() => seedDemoData()),
    addPost: publicProcedure.input(postInput).mutation(({ input }) => addPost({ ...input, date: new Date(input.date) })),
    strategy: publicProcedure.input(z.object({ question: z.string().min(3) })).mutation(({ input }) => runStrategy(input.question)),
    generateContent: publicProcedure.input(z.object({ objective: z.string().min(1), topic: z.string().min(1), format: z.string().min(1), audience: z.string().min(1), tone: z.string().min(1) })).mutation(({ input }) => generateContent(input)),
    memory: publicProcedure.query(() => getMemoryOverview()),
    searchMemory: publicProcedure.input(z.object({ query: z.string().min(2) })).mutation(({ input }) => searchMemory(input.query)),
    brand: publicProcedure.query(() => getBrand()),
    updateBrand: publicProcedure.input(brandInput).mutation(({ input }) => updateBrand(input)),
  }),
});

export type AppRouter = typeof appRouter;
