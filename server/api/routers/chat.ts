import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { and, eq, or, desc } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  createConversationWithAgent: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        agentId: z.string(),
        listingId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.insert(schema.conversationsTable).values([
          {
            initiatorId: input.userId,
            recipientId: input.agentId,
            listingId: input.listingId,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
    }),
  getUserConversations: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const results = await db
        .select()
        .from(schema.conversationsTable)
        .where(
          or(
            eq(schema.conversationsTable.initiatorId, input.userId),
            eq(schema.conversationsTable.recipientId, input.userId)
          )
        )
        .orderBy(desc(schema.conversationsTable.lastMessageAt));

      return results;
    }),
  sendConversationMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string(),
        senderId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(schema.messagesTable).values([
        {
          conversationId: input.conversationId,
          senderId: input.senderId,
          content: input.content,
        },
      ]);

      // update conversation last message time
      await db
        .update(schema.conversationsTable)
        .set({
          lastMessageAt: new Date(),
        })
        .where(eq(schema.conversationsTable.id, input.conversationId));
    }),
});
