import { createTRPCRouter } from "../trpc.js";
import { z } from "zod";
import { protectedProcedure } from "../trpc.js";
import * as schema from "../../db/schema.js";
import { db } from "../../db/index.js";
import { asc, eq, or, desc, aliasedTable } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  createConversationWithAgent: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        agentId: z.string(),
        listingId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const [conversation] = await db
        .insert(schema.conversationsTable)
        .values([
          {
            initiatorId: input.userId,
            recipientId: input.agentId,
            listingId: input.listingId,
          },
        ])
        .returning();

      if (!conversation) {
        throw new Error("Failed to create conversation");
      }

      await db.insert(schema.messagesTable).values([
        {
          conversationId: conversation.id,
          senderId: input.userId,
          content: input.message,
        },
      ]);

      return { success: true };
    }),
  getUserConversations: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const initiatorTable = aliasedTable(schema.usersTable, "initiator_users");
      const recipientTable = aliasedTable(schema.usersTable, "recipient_users");

      const results = await db
        .select({
          id: schema.conversationsTable.id,
          initiatorId: schema.conversationsTable.initiatorId,
          recipientId: schema.conversationsTable.recipientId,
          listingId: schema.conversationsTable.listingId,
          lastMessageAt: schema.conversationsTable.lastMessageAt,
          // Listing details
          listingAddress: schema.listingsTable.address,
          listingCity: schema.listingsTable.city,
          listingState: schema.listingsTable.state,
          listingZip: schema.listingsTable.zip,
          // User details
          initiatorAvatarUrl: initiatorTable.avatarUrl,
          initiatorName: initiatorTable.name,
          recipientAvatarUrl: recipientTable.avatarUrl,
          recipientName: recipientTable.name,
        })
        .from(schema.conversationsTable)
        .leftJoin(
          schema.listingsTable,
          eq(schema.conversationsTable.listingId, schema.listingsTable.id)
        )
        .leftJoin(
          initiatorTable,
          eq(schema.conversationsTable.initiatorId, initiatorTable.id)
        )
        .leftJoin(
          recipientTable,
          eq(schema.conversationsTable.recipientId, recipientTable.id)
        )
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
  getConversationMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const messages = await db
        .select({
          id: schema.messagesTable.id,
          content: schema.messagesTable.content,
          senderId: schema.messagesTable.senderId,
          createdAt: schema.messagesTable.createdAt,
        })
        .from(schema.messagesTable)
        .where(eq(schema.messagesTable.conversationId, input.conversationId))
        .orderBy(asc(schema.messagesTable.createdAt))
        .limit(10);

      return messages;
    }),
});
