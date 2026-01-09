import { ChatService } from "../services/chat.service";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/request.types";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async getUserConversations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      const userId = req.user.id;
      const conversations = await this.chatService.getConversations(userId);
      return res.json(conversations);
    } catch (error) {
      next(error);
    }
  }
}
