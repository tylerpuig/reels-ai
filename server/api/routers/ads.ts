import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { asc, eq, or, desc, aliasedTable } from "drizzle-orm";

export const adsRouter = createTRPCRouter({
  getUserAds: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const results = await db
        .select()
        .from(schema.adsTable)
        .where(eq(schema.adsTable.userId, input.userId));

      return results;
    }),
  getAdMetrics: protectedProcedure
    .input(
      z.object({
        adId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const [adDetails] = await db
        .select()
        .from(schema.adsTable)
        .where(eq(schema.adsTable.id, input.adId))
        .limit(1);

      const dailyImpressions = await db
        .select()
        .from(schema.adDailyImpressionsTable)
        .where(eq(schema.adDailyImpressionsTable.adId, input.adId))
        .orderBy(desc(schema.adDailyImpressionsTable.date));

      return { adDetails, impressions: dailyImpressions };
    }),
  deleteAd: protectedProcedure
    .input(
      z.object({
        adId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.adsTable)
        .where(eq(schema.adsTable.id, input.adId));
    }),
});
