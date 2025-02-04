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
  decimal,
} from "drizzle-orm/pg-core";

// Users table
export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    zip: varchar("zip", { length: 10 }).notNull(),
    beds: integer("beds").notNull(),
    baths: decimal("baths", { precision: 3, scale: 1 }).notNull(),
    sqft: integer("sqft").notNull(),
    description: text("description"),
    agentName: varchar("agent_name", { length: 255 }).notNull(),
    agentPhoto: varchar("agent_photo", { length: 255 }),
    agentPhone: varchar("agent_phone", { length: 20 }),
    agentAgency: varchar("agent_agency", { length: 255 }),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (images) => [index("listing_images_listing_idx").on(images.listingId)]
);

// Videos table
export const videosTable = pgTable(
  "videos",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    listingId: integer("listing_id").references(() => listingsTable.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    videoUrl: varchar("video_url", { length: 255 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
    duration: integer("duration"),
    viewCount: integer("view_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (videos) => [
    index("video_user_idx").on(videos.userId),
    index("video_listing_idx").on(videos.listingId),
    index("video_embedding_idx").using(
      "hnsw",
      videos.embedding.op("vector_cosine_ops")
    ),
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
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: integer("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (videoLikes) => [
    primaryKey({ columns: [videoLikes.userId, videoLikes.videoId] }),
    index("video_likes_video_idx").on(videoLikes.videoId),
  ]
);

// Comment likes table
export const commentLikesTable = pgTable(
  "comment_likes",
  {
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    commentId: integer("comment_id")
      .references(() => commentsTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
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
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: integer("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    watchTime: integer("watch_time").default(0),
    watchPercentage: integer("watch_percentage").default(0),
    liked: boolean("liked").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (interactions) => [
    index("interaction_user_idx").on(interactions.userId),
    index("interaction_video_idx").on(interactions.videoId),
  ]
);
