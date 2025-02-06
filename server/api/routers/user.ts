import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

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
});
