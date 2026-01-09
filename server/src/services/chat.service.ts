import { AttachmentsRepository } from "../repositories/attachments.repository";
import { ConversationsRepository } from "../repositories/conversations.repository";
import { MessagesRepository } from "../repositories/messages.repository";
import { sendMessageSchema } from "../validators/messages.schema";

export class ChatService {
  private messagesRepository: MessagesRepository;
  private attachmentsRepository: AttachmentsRepository;
  private conversationsRepository: ConversationsRepository;

  constructor() {
    this.messagesRepository = new MessagesRepository();
    this.attachmentsRepository = new AttachmentsRepository();
    this.conversationsRepository = new ConversationsRepository();
  }

  private getFileNameFromUrl(url: string): string {
    return url.split("/").pop() || "attachment";
  }

  private getMimeTypeFromUrl(url: string): string {
    const extension = url.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      wepb: "image/webp",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    return mimeTypes[extension || ""] || "application/octet-stream";
  }

  private getAttachmentType(url: string): "image" | "document" | "other" {
    const mimeType = this.getMimeTypeFromUrl(url);
    if (mimeType.startsWith("image/")) {
      return "image";
    }
    if (mimeType.includes("pdf") || mimeType.includes("document")) {
      return "document";
    }
    return "other";
  }

  async sendMessage(senderId: string, input: unknown) {
    const validatedInput = sendMessageSchema.parse(input);
    const message = await this.messagesRepository.create({
      conversationId: validatedInput.conversationId,
      senderId,
      content: validatedInput.content || ""
    });
    // Create attachments if provided
    if (validatedInput.attachments && validatedInput.attachments.length > 0) {
      const attachmentsData = validatedInput.attachments.map(
        ({ url, size }) => ({
          name: this.getFileNameFromUrl(url),
          url: url,
          size: size,
          type: this.getAttachmentType(url),
          mimeType: this.getMimeTypeFromUrl(url)
        })
      );

      await this.attachmentsRepository.createAttachments(
        message.id,
        attachmentsData
      );
    }
  }

  async getConversations(userId: string) {
    return await this.conversationsRepository.getByUserId(userId);
  }
}
