import { double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  industry: varchar("industry", { length: 160 }).notNull(),
  targetAudience: text("targetAudience").notNull(),
  brandTone: text("brandTone").notNull(),
  platforms: text("platforms").notNull(),
  contentGoals: text("contentGoals").notNull(),
  preferredFormats: text("preferredFormats").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const socialPosts = mysqlTable("socialPosts", {
  id: int("id").autoincrement().primaryKey(),
  postId: varchar("postId", { length: 64 }).notNull().unique(),
  date: timestamp("date").notNull(),
  platform: varchar("platform", { length: 40 }).notNull(),
  topic: varchar("topic", { length: 120 }).notNull(),
  contentType: varchar("contentType", { length: 80 }).notNull(),
  caption: text("caption").notNull(),
  views: int("views").notNull().default(0),
  reach: int("reach").notNull().default(0),
  likes: int("likes").notNull().default(0),
  comments: int("comments").notNull().default(0),
  shares: int("shares").notNull().default(0),
  engagementRate: double("engagementRate").notNull().default(0),
  postingTime: varchar("postingTime", { length: 20 }).notNull(),
  audienceResponse: text("audienceResponse").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const memoryEvents = mysqlTable("memoryEvents", {
  id: int("id").autoincrement().primaryKey(),
  operation: mysqlEnum("operation", ["retain", "recall", "reflect"]).notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  summary: text("summary").notNull(),
  query: text("query"),
  sourcePostIds: text("sourcePostIds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const instagramConnections = mysqlTable("instagramConnections", {
  id: int("id").autoincrement().primaryKey(),
  workspaceKey: varchar("workspaceKey", { length: 120 }).notNull().unique(),
  instagramUserId: varchar("instagramUserId", { length: 120 }).notNull(),
  username: varchar("username", { length: 160 }).notNull(),
  accountType: varchar("accountType", { length: 40 }),
  accessTokenEncrypted: text("accessTokenEncrypted").notNull(),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;
export type MemoryEvent = typeof memoryEvents.$inferSelect;
export type InsertMemoryEvent = typeof memoryEvents.$inferInsert;
export type InstagramConnection = typeof instagramConnections.$inferSelect;
export type InsertInstagramConnection = typeof instagramConnections.$inferInsert;
