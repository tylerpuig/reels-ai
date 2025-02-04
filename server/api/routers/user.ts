// import { initTRPC } from "@trpc/server";
import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { publicProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { faker } from "@faker-js/faker";

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
});
