// import { initTRPC } from "@trpc/server";
import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { and, eq, sql } from "drizzle-orm";

export const videosRouter = createTRPCRouter({
  getVideos: protectedProcedure
    .input(z.object({ skip: z.number(), userId: z.string() }))
    .query(async ({ input, ctx }) => {
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
            updatedAt: schema.videosTable.updatedAt,
            // Add a boolean field that will be true if the user has liked the video
            hasLiked: sql`CASE WHEN ${schema.videoLikesTable.userId} IS NOT NULL THEN true ELSE false END`,
          })
          .from(schema.videosTable)
          .leftJoin(
            schema.videoLikesTable,
            and(
              eq(schema.videoLikesTable.videoId, schema.videosTable.id),
              eq(schema.videoLikesTable.userId, input.userId)
            )
          )
          .offset(input.skip);

        console.log(videos);

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
});
