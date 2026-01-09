import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { requireAuth } from "../middlewares/better-auth.middleware";

const router = Router();
const controller = new ChatController();

router.use(requireAuth);
router.get("/conversations", controller.getUserConversations);

export default router;
