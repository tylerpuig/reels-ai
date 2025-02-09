import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { listingSchema, videoSchema } from "../../api/schemas.js";

export const listingsRouter = createTRPCRouter({
  getListingDetails: protectedProcedure
    .input(z.object({ listingId: z.number() }))
    .query(async ({ input }) => {
      try {
        const [listing] = await db
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
          })
          .from(schema.listingsTable)
          .where(eq(schema.listingsTable.id, input.listingId))
          .leftJoin(
            schema.usersTable,
            eq(schema.listingsTable.userId, schema.usersTable.id)
          );

        const listingImages = await db
          .select({
            id: schema.listingImagesTable.id,
            url: schema.listingImagesTable.url,
          })
          .from(schema.listingImagesTable)
          .where(eq(schema.listingImagesTable.listingId, input.listingId))
          .limit(4);

        return {
          listing: listing.listing,
          user: listing.user,
          images: listingImages,
        };
      } catch (error) {
        console.log(error);
      }
    }),
  isListingLikedByUser: protectedProcedure
    .input(z.object({ listingId: z.number(), userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const results = await db
          .select({
            isLiked: schema.likedListingsTable.userId,
          })
          .from(schema.likedListingsTable)
          .where(
            and(
              eq(schema.likedListingsTable.listingId, input.listingId),
              eq(schema.likedListingsTable.userId, input.userId)
            )
          )
          .limit(1);

        return {
          isLiked: results.length > 0,
        };
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
          .where(
            and(
              eq(schema.likedListingsTable.userId, input.userId),
              eq(schema.likedListingsTable.listingId, input.listingId)
            )
          );
      }
    }),
  unLikeListing: protectedProcedure
    .input(
      z.object({
        listingId: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.likedListingsTable)
        .where(
          and(
            eq(schema.likedListingsTable.userId, input.userId),
            eq(schema.likedListingsTable.listingId, input.listingId)
          )
        );
    }),
  getLikedListings: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          id: schema.listingsTable.id,
          address: schema.listingsTable.address,
          price: schema.listingsTable.price,
          beds: schema.listingsTable.beds,
          baths: schema.listingsTable.baths,
          sqft: schema.listingsTable.sqft,
          imageUrl: sql<string>`(
      SELECT url 
      FROM ${schema.listingImagesTable} 
      WHERE listing_id = ${schema.listingsTable.id} 
      LIMIT 1
    )`.as("image_url"),
        })
        .from(schema.likedListingsTable)
        .where(eq(schema.likedListingsTable.userId, input.userId))
        .innerJoin(
          schema.listingsTable,
          eq(schema.listingsTable.id, schema.likedListingsTable.listingId)
        )
        .orderBy(desc(schema.likedListingsTable.createdAt))
        .limit(10);

      return results;
    }),
  createNewListing: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        listing: listingSchema,
        video: videoSchema,
        listingImages: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const agent = await db.query.usersTable.findFirst({
        where: eq(schema.usersTable.id, input.userId),
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      });

      if (!agent) {
        throw new Error("User not found");
      }

      const fullListing = {
        ...input.listing,
        userId: input.userId,
        agentName: agent.name,
      };

      // Insert listing
      const [newListing] = await db
        .insert(schema.listingsTable)
        .values(fullListing)
        .returning();

      const listingImages = input.listingImages.map((imageUrl) => ({
        listingId: newListing.id,
        url: imageUrl,
      }));

      // Insert images
      await db.insert(schema.listingImagesTable).values(listingImages);

      // Insert video
      await db
        .insert(schema.videosTable)
        .values({
          userId: input.userId,
          listingId: newListing.id,
          title: input.video.title,
          description: input.video.description,
          videoUrl: input.video.videoUrl,
        })
        .returning();
    }),
  getListingsByAgent: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          id: schema.listingsTable.id,
          address: schema.listingsTable.address,
          price: schema.listingsTable.price,
          beds: schema.listingsTable.beds,
          baths: schema.listingsTable.baths,
          sqft: schema.listingsTable.sqft,
          imageUrl: sql<string>`(
      SELECT url 
      FROM ${schema.listingImagesTable} 
      WHERE listing_id = ${schema.listingsTable.id} 
      LIMIT 1
    )`.as("image_url"),
        })
        .from(schema.listingsTable)
        .where(eq(schema.listingsTable.userId, input.agentId))
        .orderBy(desc(schema.listingsTable.createdAt))
        .limit(10);

      console.log(results);

      return results;
    }),
});
