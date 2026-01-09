import { desc, eq, or } from "drizzle-orm";
import { db } from "../db";
import { conversations, messages } from "../db/schema";

export class ConversationsRepository {
  async getByUserId(userId: string) {
    return await db.query.conversations.findMany({
      where: or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId)
      ),
      with: {
        buyer: {
          columns: {
            id: true,
            name: true
          }
        },
        seller: {
          columns: {
            id: true,
            name: true
          }
        },
        product: true,
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
          with: {
            sender: true
          }
        }
      },
      orderBy: [desc(conversations.lastMessageAt)]
    });
  }

  async getByConversationId(conversationId: string) {
    return await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        buyer: {
          columns: {
            id: true,
            name: true
          }
        },
        seller: {
          columns: {
            id: true,
            name: true
          }
        },
        product: true
      }
    });
  }

  async create(data: {
    buyerId: string;
    sellerId: string;
    productId?: string;
  }) {
    const [conversation] = await db
      .insert(conversations)
      .values(data)
      .returning();

    return conversation;
  }
}
