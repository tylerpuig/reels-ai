import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { eq, and } from "drizzle-orm";

export const listingsRouter = createTRPCRouter({
  getListingDetails: protectedProcedure
    .input(z.object({ listingId: z.number() }))
    .query(async ({ input }) => {
      try {
        const [result] = await db
          .select({
            user: {
              id: schema.usersTable.id,
              name: schema.usersTable.name,
              avatarUrl: schema.usersTable.avatarUrl,
            },
            listing: {
              id: schema.listingsTable.id,
              price: schema.listingsTable.price,
              address: schema.listingsTable.address,
              city: schema.listingsTable.city,
              state: schema.listingsTable.state,
              zip: schema.listingsTable.zip,
              beds: schema.listingsTable.beds,
              baths: schema.listingsTable.baths,
              sqft: schema.listingsTable.sqft,
              description: schema.listingsTable.description,
              agentPhone: schema.listingsTable.agentPhone,
              agentAgency: schema.listingsTable.agentAgency,
              agentName: schema.listingsTable.agentName,
            },
            images: {
              id: schema.listingImagesTable.id,
              url: schema.listingImagesTable.url,
            },
          })
          .from(schema.listingsTable)
          .where(eq(schema.listingsTable.id, input.listingId))
          .leftJoin(
            schema.usersTable,
            eq(schema.listingsTable.userId, schema.usersTable.id)
          )
          .leftJoin(
            schema.listingImagesTable,
            eq(schema.listingsTable.id, schema.listingImagesTable.listingId)
          );

        return result;
      } catch (error) {
        console.log(error);
      }
    }),
  isListingLikedByUser: protectedProcedure
    .input(z.object({ listingId: z.number(), userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const [result] = await db
          .select({
            isLiked: schema.likedListingsTable.userId,
          })
          .from(schema.likedListingsTable)
          .where(
            and(
              eq(schema.likedListingsTable.listingId, input.listingId),
              eq(schema.likedListingsTable.userId, input.userId)
            )
          );

        return result;
      } catch (error) {
        console.log(error);
      }
    }),
  updateListingLike: protectedProcedure
    .input(
      z.object({
        listingId: z.number(),
        userId: z.string(),
        action: z.enum(["like", "unlike"]),
      })
    )
    .mutation(async ({ input }) => {
      if (input.action === "like") {
        await db.insert(schema.likedListingsTable).values({
          userId: input.userId,
          listingId: input.listingId,
        });
      } else {
        await db
          .delete(schema.likedListingsTable)
          .where(eq(schema.likedListingsTable.userId, input.userId));
      }
    }),
});
