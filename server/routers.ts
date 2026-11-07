import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { disconnectInstagram, getInstagramStatus, syncInstagramMedia } from "./instagram";
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
    dashboard: protectedProcedure.query(({ ctx }) => getDashboard(ctx.user.openId)),
    posts: protectedProcedure.input(z.object({ platform: z.string().optional(), topic: z.string().optional(), contentType: z.string().optional(), search: z.string().optional() }).optional()).query(({ input, ctx }) => listPosts(input || {}, ctx.user.openId)),
    seed: protectedProcedure.mutation(({ ctx }) => seedDemoData(ctx.user.openId)),
    addPost: protectedProcedure.input(postInput).mutation(({ input, ctx }) => addPost({ ...input, date: new Date(input.date) }, ctx.user.openId)),
    strategy: protectedProcedure.input(z.object({ question: z.string().min(3) })).mutation(({ input, ctx }) => runStrategy(input.question, ctx.user.openId)),
    generateContent: protectedProcedure.input(z.object({ objective: z.string().min(1), topic: z.string().min(1), format: z.string().min(1), audience: z.string().min(1), tone: z.string().min(1) })).mutation(({ input, ctx }) => generateContent(input, ctx.user.openId)),
    memory: protectedProcedure.query(({ ctx }) => getMemoryOverview(ctx.user.openId)),
    searchMemory: protectedProcedure.input(z.object({ query: z.string().min(2) })).mutation(({ input, ctx }) => searchMemory(input.query, ctx.user.openId)),
    brand: protectedProcedure.query(({ ctx }) => getBrand(ctx.user.openId)),
    updateBrand: protectedProcedure.input(brandInput).mutation(({ input, ctx }) => updateBrand(input, ctx.user.openId)),
    instagramStatus: protectedProcedure.query(({ ctx }) => getInstagramStatus(ctx.user.openId)),
    syncInstagram: protectedProcedure.mutation(({ ctx }) => syncInstagramMedia(ctx.user.openId)),
    disconnectInstagram: protectedProcedure.mutation(({ ctx }) => disconnectInstagram(ctx.user.openId)),
  }),
});

export type AppRouter = typeof appRouter;
