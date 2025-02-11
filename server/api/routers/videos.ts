import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { and, eq, sql, desc, asc, cosineDistance } from "drizzle-orm";
import { generatePresignedUrl } from "../../integrations/s3.js";
import { getEmbeddingFromText } from "../../integrations/openai.js";

export const videosRouter = createTRPCRouter({
  getVideos: protectedProcedure
    .input(z.object({ skip: z.number(), userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const videos = await db
          .select({
            id: schema.videosTable.id,
            title: schema.videosTable.title,
            description: schema.videosTable.description,
            videoUrl: schema.videosTable.videoUrl,
            thumbnailUrl: schema.videosTable.thumbnailUrl,
            duration: schema.videosTable.duration,
            viewCount: schema.videosTable.viewCount,
            likeCount: schema.videosTable.likeCount,
            commentCount: schema.videosTable.commentCount,
            createdAt: schema.videosTable.createdAt,
            userId: schema.videosTable.userId,
            userImage: schema.usersTable.avatarUrl,
            userName: schema.usersTable.name,
            listingId: schema.videosTable.listingId,
            // Add a boolean field that will be true if the user has liked the video
            hasLiked: sql`CASE WHEN ${schema.videoLikesTable.userId} IS NOT NULL THEN true ELSE false END`,
          })
          .from(schema.videosTable)
          .leftJoin(
            schema.usersTable,
            eq(schema.videosTable.userId, schema.usersTable.id)
          )
          .leftJoin(
            schema.listingsTable,
            eq(schema.videosTable.listingId, schema.listingsTable.id)
          )
          .leftJoin(
            schema.videoLikesTable,
            and(
              eq(schema.videoLikesTable.videoId, schema.videosTable.id),
              eq(schema.videoLikesTable.userId, input.userId)
            )
          )
          .orderBy(desc(schema.videosTable.createdAt))
          .offset(input.skip);

        return videos;
      } catch (error) {
        console.log(error);
        return [];
      }
    }),
  modifyVideoLike: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        userId: z.string(),
        action: z.enum(["like", "unlike"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.action === "like") {
          console.log(input.userId);
          await db
            .update(schema.videosTable)
            .set({
              likeCount: sql`${schema.videosTable.likeCount} + 1`,
            })
            .where(eq(schema.videosTable.id, input.videoId));

          await db.insert(schema.videoLikesTable).values([
            {
              userId: input.userId,
              videoId: input.videoId,
            },
          ]);
        } else {
          await db
            .update(schema.videosTable)
            .set({
              likeCount: sql`${schema.videosTable.likeCount} - 1`,
            })
            .where(eq(schema.videosTable.id, input.videoId));

          await db
            .delete(schema.videoLikesTable)
            .where(eq(schema.videoLikesTable.userId, input.userId));
        }
      } catch (error) {
        console.log(error);
      }
    }),
  getVideo: protectedProcedure
    .input(
      z.object({
        skip: z.number(),
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Fetch single video with pagination
      const video = await db.query.videosTable.findFirst({
        offset: input.skip,
      });
      return video;
    }),
  getvideoComments: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // Fetch single video with pagination
      const comments = await db
        .select()
        .from(schema.commentsTable)
        .where(eq(schema.commentsTable.videoId, input.videoId))
        .leftJoin(
          schema.usersTable,
          eq(schema.commentsTable.userId, schema.usersTable.id)
        );
      return comments;
    }),
  createComment: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        content: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.insert(schema.commentsTable).values([
          {
            videoId: input.videoId,
            userId: input.userId,
            content: input.content,
          },
        ]);

        await db
          .update(schema.videosTable)
          .set({ commentCount: sql`${schema.videosTable.commentCount} + 1` })
          .where(eq(schema.videosTable.id, input.videoId));
      } catch (error) {
        console.log(error);
      }
    }),
  getVideoUploadUrl: protectedProcedure
    .input(
      z.object({
        videoFilename: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generatePresignedUrl(input.videoFilename);

      if (!result) {
        throw new Error("Failed to generate pre-signed URL");
      }

      return { uploadUrl: result.uploadUrl, fileUrl: result.fileUrl };
    }),
  newVideoEntry: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        url: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.insert(schema.videosTable).values([
          {
            userId: input.userId,
            listingId: 0,
            title: input.fileName,
            description: "",
            videoUrl: input.url,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
    }),
  getLikedVideos: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          id: schema.videosTable.id,
          title: schema.videosTable.title,
          videoUrl: schema.videosTable.videoUrl,
          thumbnailUrl: schema.videosTable.thumbnailUrl,
        })
        .from(schema.videoLikesTable)
        .where(eq(schema.videoLikesTable.userId, input.userId))
        .innerJoin(
          schema.videosTable,
          eq(schema.videosTable.id, schema.videoLikesTable.videoId)
        )
        .orderBy(desc(schema.videoLikesTable.createdAt))
        .limit(10);

      return results;
    }),
  unLikeVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.videoLikesTable)
        .where(
          and(
            eq(schema.videoLikesTable.userId, input.userId),
            eq(schema.videoLikesTable.videoId, input.videoId)
          )
        );
      // decrement the like count for the video
      await db
        .update(schema.videosTable)
        .set({ likeCount: sql`${schema.videosTable.likeCount} - 1` })
        .where(eq(schema.videosTable.id, input.videoId));
    }),
  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        videoId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.commentsTable)
        .where(eq(schema.commentsTable.id, input.commentId));

      await db
        .update(schema.videosTable)
        .set({
          commentCount: sql`${schema.videosTable.commentCount} - 1`,
        })
        .where(eq(schema.videosTable.id, input.videoId));
    }),
  getSimilarVideos: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input }) => {
      const embedding = await getEmbeddingFromText(input.text);
      if (!embedding) {
        throw new Error("Failed to generate embedding");
      }
      const similarity = sql<number>`1 - (${cosineDistance(
        schema.framesEmbeddingsTable.embedding,
        embedding
      )})`;

      const results = await db
        .select({
          id: schema.videosTable.id,
          title: schema.videosTable.title,
          videoUrl: schema.videosTable.videoUrl,
          thumbnailUrl: schema.videosTable.thumbnailUrl,
          similarity: similarity,
        })
        .from(schema.framesEmbeddingsTable)
        .leftJoin(
          schema.videosTable,
          eq(schema.framesEmbeddingsTable.videoId, schema.videosTable.id)
        )
        .orderBy((t) => desc(t.similarity))
        .limit(10);

      const resultSet = new Set<number | null>(
        results.map((result) => result.id)
      );

      const formattedResults = [];
      for (const id of resultSet) {
        formattedResults.push({
          id: id ?? null,
          title: results.find((result) => result.id === id)?.title ?? "",
          videoUrl: results.find((result) => result.id === id)?.videoUrl ?? "",
          thumbnailUrl:
            results.find((result) => result.id === id)?.thumbnailUrl ?? "",
          similarity:
            results.find((result) => result.id === id)?.similarity ?? 0,
        });
      }

      return formattedResults;
    }),
});
