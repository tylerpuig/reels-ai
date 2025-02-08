import {
  integer,
  pgTable,
  varchar,
  timestamp,
  text,
  boolean,
  primaryKey,
  index,
  vector,
  date,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table
export const usersTable = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Listings table
export const listingsTable = pgTable(
  "listings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    price: integer("price").notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    zip: varchar("zip", { length: 10 }).notNull(),
    beds: integer("beds").notNull(),
    baths: integer("baths").notNull(),
    sqft: integer("sqft").notNull(),
    description: text("description"),
    agentName: varchar("agent_name", { length: 255 }).notNull(),
    agentPhoto: varchar("agent_photo", { length: 255 }),
    agentPhone: varchar("agent_phone", { length: 20 }),
    agentAgency: varchar("agent_agency", { length: 255 }),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (listings) => [
    index("listing_user_idx").on(listings.userId),
    index("listing_embedding_idx").using(
      "hnsw",
      listings.embedding.op("vector_cosine_ops")
    ),
  ]
);

// Listing images table
export const listingImagesTable = pgTable(
  "listing_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    listingId: integer("listing_id")
      .references(() => listingsTable.id, { onDelete: "cascade" })
      .notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (images) => [index("listing_images_listing_idx").on(images.listingId)]
);

// Videos table
export const videosTable = pgTable(
  "videos",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    videoUrl: varchar("video_url", { length: 255 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
    duration: integer("duration"),
    viewCount: integer("view_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    listingId: integer("listing_id")
      .references(() => listingsTable.id, { onDelete: "cascade" })
      .notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (videos) => [
    index("video_user_idx").on(videos.userId),
    index("video_embedding_idx").using(
      "hnsw",
      videos.embedding.op("vector_cosine_ops")
    ),
  ]
);
export const adsTable = pgTable(
  "ads",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: integer("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    bidAmount: decimal("bid_amount", { precision: 8, scale: 2 }).notNull(), // Cost per 1000 impressions
    dailyBudget: decimal("daily_budget", { precision: 12, scale: 2 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (ads) => [
    index("ads_user_idx").on(ads.userId),
    index("ads_video_idx").on(ads.videoId),
  ]
);

// Daily ad impressions table
export const adDailyImpressionsTable = pgTable(
  "ad_daily_impressions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    adId: integer("ad_id")
      .references(() => adsTable.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    impressions: integer("impressions").default(0).notNull(),
    clicks: integer("clicks").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (impressions) => [
    index("ad_impressions_ad_date_idx").on(impressions.adId, impressions.date),
  ]
);

// Comments table
export const commentsTable = pgTable(
  "comments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    videoId: integer("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (comments) => [
    index("comment_video_idx").on(comments.videoId),
    index("comment_user_idx").on(comments.userId),
  ]
);

// Video likes table
export const videoLikesTable = pgTable(
  "video_likes",
  {
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: integer("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (videoLikes) => [
    primaryKey({ columns: [videoLikes.userId, videoLikes.videoId] }),
    index("video_likes_video_idx").on(videoLikes.videoId),
  ]
);

export const likedListingsTable = pgTable(
  "liked_listings",
  {
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    listingId: integer("listing_id")
      .references(() => listingsTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (listingLikes) => [
    primaryKey({ columns: [listingLikes.userId, listingLikes.listingId] }),
    index("listing_likes_listing_idx").on(listingLikes.listingId),
  ]
);

// Comment likes table
export const commentLikesTable = pgTable(
  "comment_likes",
  {
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    commentId: integer("comment_id")
      .references(() => commentsTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (commentLikes) => [
    primaryKey({ columns: [commentLikes.userId, commentLikes.commentId] }),
    index("comment_likes_comment_idx").on(commentLikes.commentId),
  ]
);

// User video interactions
export const userVideoInteractionsTable = pgTable(
  "user_video_interactions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: integer("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    watchTime: integer("watch_time").default(0),
    watchPercentage: integer("watch_percentage").default(0),
    liked: boolean("liked").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (interactions) => [
    index("interaction_user_idx").on(interactions.userId),
    index("interaction_video_idx").on(interactions.videoId),
  ]
);

export const conversationsTable = pgTable(
  "conversations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // The user who initiated the conversation
    initiatorId: varchar("initiator_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    // The user receiving the conversation (e.g., the agent)
    recipientId: varchar("recipient_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    // Optional reference to a listing if the conversation is about a specific property
    listingId: integer("listing_id").references(() => listingsTable.id, {
      onDelete: "cascade",
    }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (conversations) => [
    index("conversation_initiator_idx").on(conversations.initiatorId),
    index("conversation_recipient_idx").on(conversations.recipientId),
    index("conversation_listing_idx").on(conversations.listingId),
    // Index for ordering conversations by latest message
    index("conversation_last_message_idx").on(conversations.lastMessageAt),
  ]
);

// Messages table
export const messagesTable = pgTable(
  "messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    conversationId: integer("conversation_id")
      .references(() => conversationsTable.id, { onDelete: "cascade" })
      .notNull(),
    senderId: varchar("sender_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    read: boolean("read").default(false).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (messages) => [
    index("message_conversation_idx").on(messages.conversationId),
    index("message_sender_idx").on(messages.senderId),
    // Index for ordering messages within a conversation
    index("message_conversation_time_idx").on(
      messages.conversationId,
      messages.createdAt
    ),
  ]
);
