import { eq } from "drizzle-orm";
import { db } from "../db";
import { attachments } from "../db/schema";

export class AttachmentsRepository {
  async getByAttachmentId(attachmentId: string) {
    return await db.query.attachments.findFirst({
      where: eq(attachments.id, attachmentId)
    });
  }

  async getByMessageId(messageId: string) {
    return await db.query.attachments.findMany({
      where: eq(attachments.messageId, messageId)
    });
  }

  async createAttachments(
    messageId: string,
    attachmentsData: Array<{
      name: string;
      url: string;
      type: "image" | "document" | "other";
      size: string;
      mimeType: string;
    }>
  ) {
    if (attachmentsData.length === 0) return [];

    const attachmentsToInsert = attachmentsData.map((attachment) => ({
      messageId,
      ...attachment
    }));
    const created = await db
      .insert(attachments)
      .values(attachmentsToInsert)
      .returning();

    return created;
  }

  async deleteByAttachmentId(attachmentId: string) {
    return await db.delete(attachments).where(eq(attachments.id, attachmentId));
  }
}
