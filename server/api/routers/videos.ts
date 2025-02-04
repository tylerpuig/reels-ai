// import { initTRPC } from "@trpc/server";
import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";

export const videosRouter = createTRPCRouter({
  getVideos: protectedProcedure
    .input(z.object({ skip: z.number() }))
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
          })
          .from(schema.videosTable);
        // .offset(input.skip);

        console.log(videos);

        return videos;
      } catch (error) {
        console.log(error);
        return [];
      }
    }),
});
