import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { faker } from "@faker-js/faker";
import { eq, and, desc } from "drizzle-orm";
import { generatePresignedUrl } from "../../integrations/s3.js";

export const userRouter = createTRPCRouter({
  newUser: publicProcedure
    .input(z.object({ name: z.string(), email: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.insert(schema.usersTable).values([
          {
            id: input.id,
            name: input.name,
            email: input.email,
            avatarUrl: faker.image.avatar(),
          },
        ]);
      } catch (error) {
        console.log(error);
      }
    }),
  getUserProfileData: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const [result] = await db
          .select({
            id: schema.usersTable.id,
            name: schema.usersTable.name,
            email: schema.usersTable.email,
            avatarUrl: schema.usersTable.avatarUrl,
          })
          .from(schema.usersTable)
          .where(eq(schema.usersTable.id, input.userId));

        return result;
      } catch (error) {
        console.log(error);
      }
    }),
  getPresignedS3Url: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generatePresignedUrl(input.fileName);

      if (!result) {
        throw new Error("Failed to generate pre-signed URL");
      }

      return { uploadUrl: result.uploadUrl, fileUrl: result.fileUrl };
    }),
  updateUserProfileImage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(schema.usersTable)
        .set({
          avatarUrl: input.url,
        })
        .where(eq(schema.usersTable.id, input.userId));
    }),
  updateUserProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(schema.usersTable)
        .set({
          name: input.name,
          email: input.email,
        })
        .where(eq(schema.usersTable.id, input.userId));
    }),
  getPublicProfileData: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ input }) => {
      const userData = await db.query.usersTable.findFirst({
        where: eq(schema.usersTable.id, input.profileId),
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      });

      const userVideos = await db
        .select({
          id: schema.videosTable.id,
          title: schema.videosTable.title,
          videoUrl: schema.videosTable.videoUrl,
          thumbnailUrl: schema.videosTable.thumbnailUrl,
        })
        .from(schema.videosTable)
        .where(eq(schema.videosTable.userId, input.profileId))
        .orderBy(desc(schema.videosTable.createdAt))
        .limit(10);

      return { profile: userData, videos: userVideos };
    }),
});
