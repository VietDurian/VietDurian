import express from "express";
import { messageController } from "@/controllers/messageController.js";
import { authMiddleware } from "@/middlewares/authentication";

const router = express.Router();

router.get("/contacts", authMiddleware.protect, messageController.getContacts);

router.get(
  "/users",
  authMiddleware.protect,
  messageController.getUsersForSidebar,
);
router.delete(
  "/conversation/:id",
  authMiddleware.protect,
  messageController.deleteConversation,
);
router.get("/:id", authMiddleware.protect, messageController.getMessages);

router.post("/send/:id", authMiddleware.protect, messageController.sendMessage);

export { router as messageRoute };
