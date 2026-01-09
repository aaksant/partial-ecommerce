import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { conversations, messages } from "../db/schema";

export class MessagesRepository {
  async getByConversation(conversationId: string, limit = 50, offset = 0) {
    return await db.query.messages.findMany({
      where: and(eq(messages.conversationId, conversationId)),
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            role: true
          }
        },
        attachments: true
      },
      orderBy: [desc(messages.createdAt)],
      limit,
      offset
    });
  }

  async create(data: {
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    return db.transaction(async (tx) => {
      const [message] = await tx
        .insert(messages)
        .values({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content
        })
        .returning();

      await tx
        .update(conversations)
        .set({ lastMessageAt: message.createdAt })
        .where(eq(conversations.id, data.conversationId));

      return message;
    });
  }
}
