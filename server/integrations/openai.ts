import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { zodResponseFormat } from "openai/helpers/zod";
import openAI from "openai";
import { z } from "zod";
import { type ListingInfo } from "../db/types.js";

export const openai = new openAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const eventDetailsSchema = z.object({
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const agentAutoReplySchema = z.object({
  message: z.string(),
  eventDetails: eventDetailsSchema,
  eventScheduled: z.boolean(),
});

export async function autoAgentReply(
  conversationId: number,
  userMessage: string,
  userId: string
) {
  try {
    // first get previous messages
    const prevMessages = await db
      .select({
        id: schema.messagesTable.id,
        content: schema.messagesTable.content,
        senderId: schema.messagesTable.senderId,
        createdAt: schema.messagesTable.createdAt,
        metadata: schema.messagesTable.metadata,
      })
      .from(schema.messagesTable)
      .where(eq(schema.messagesTable.conversationId, conversationId))
      .orderBy(asc(schema.messagesTable.createdAt))
      .limit(10);

    if (!prevMessages.length) return;

    const [conversationDetails] = await db
      .select()
      .from(schema.conversationsTable)
      .where(eq(schema.conversationsTable.id, conversationId))
      .limit(1);

    if (!conversationDetails) return;

    const { listingId } = conversationDetails;

    let listingInfo: ListingInfo | undefined = undefined;

    if (listingId) {
      const findListingInfo = await db.query.listingsTable.findFirst({
        where: eq(schema.listingsTable.id, listingId),
      });

      if (findListingInfo) {
        listingInfo = findListingInfo;
      }
    }

    const formattedMessages = prevMessages.map((message) => {
      return {
        role: message.senderId === userId ? "user" : "agent",
        content: message.content,
        metadata: message.metadata,
      };
    });

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a help ful assistant that is replying on the behlf of a real estate agent. You are helping the user with their real estate listing. You will be replying to the user's messages in a helpful way. You can also provide event details if the user mentions wanting to view a home in person. Use the previous messages to provide context for your reply and for gatheting information about the event details if applicable. If not all of the event details are known, ask the user for more information, such as the time they would like to view the home. If you you have all the available information, follow up with the user with the event time to confirm with them. Use the metadata field to reference the event details that have been parsed so far.
          
          Do not put the startDate yourself unless you get confirmation from the user. Do 60 minutes by default for the startdate and endtime time difference. Try to keep all your responses around 1-2 sentences. You may make up information if needed to simulate a real estate agent's response to a user's message.

          Curent time: ${new Date().toISOString()}

          Examples:

          Previous Message From Agent: 
          I have scheduled a viewing for tomorrow at 10am!
          metadata: {
          {
          eventDetails: {
            title: "Viewing",
            startDate: "2025-02-08T17:55:21.000Z",
            endDate: "2025-02-08T18:55:21.000Z",
            description: "Meeting with [client name]"
          }
            eventScheduled: true          
          }
        }

        Next message the user is asking questions about the home:
        New event details object:
        {
          eventDetails: {
            title: "Viewing",
            startDate: "2025-02-08T17:55:21.000Z",
            endDate: "2025-02-08T18:55:21.000Z",
            description: "Meeting with [client name]"
          }
            eventScheduled: false, // we already scheduled it
            message: "Your reply here"          
          }
        }

        If you notice eventScheduled is true in a previous messages's metadata, you should reply with false for eventScheduled field. However, if you are ready to schedule the event, you should mark eventScheduled as true and reply with the event details.

        IT IS CRITICAL THAT IF YOU SEE A PREVIOUS METADATA SHOWS THAT THE EVENT HAS BEEN SCHEDULED (eventScheduled = true), YOU REPLY WITH FALSE FOR eventScheduled FIELD.

          
          Previous messages:
          ${JSON.stringify(formattedMessages, null, 2)}

          Here is the home listing information:
          ${JSON.stringify(listingInfo, null, 2)}
          
          `,
        },
        {
          role: "user",
          content: `${userMessage}`,
        },
      ],
      response_format: zodResponseFormat(agentAutoReplySchema, "reply"),
    });

    const result = response?.choices?.[0]?.message?.parsed;
    if (!result) return;

    console.log(result);

    // insert message into database
    await db.insert(schema.messagesTable).values({
      conversationId: conversationId,
      senderId: conversationDetails.recipientId,
      content: result.message,
      metadata: {
        eventDetails: result.eventDetails,
        eventScheduled: result.eventScheduled,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getEmbeddingFromText(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 1536,
    });

    if (response.data[0].embedding) {
      return response.data[0].embedding;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
