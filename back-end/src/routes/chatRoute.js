import express from "express";
import { chatController } from "@/controllers/chatController";
import { authMiddleware } from "@/middlewares/authentication";
import { authorizationMiddleware } from "@/middlewares/authorization";

const router = express.Router();

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Get all conversations (Admin)
 *     description: Get all chat conversations with latest message. Admin only.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin role required)
 *       500:
 *         description: Internal server error
 */

// Get all conversation of admin
router.get(
  "/conversations",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  chatController.getAllConversations,
);

/**
 * @swagger
 * /chat/user-conversations:
 *   get:
 *     summary: Get current user conversations
 *     description: Get all conversations related to current authenticated user.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user role required)
 *       500:
 *         description: Internal server error
 */

// Get user's conversations
router.get(
  "/user-conversations",
  authMiddleware.protect,
  authorizationMiddleware.isUser,
  chatController.getUserConversations,
);

/**
 * @swagger
 * /chat/conversation:
 *   get:
 *     summary: Get conversation details
 *     description: Get a conversation and its messages by query param conversationId.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: false
 *         description: Conversation ID. Optional for non-admin users.
 *     responses:
 *       200:
 *         description: Conversation details retrieved successfully
 *       400:
 *         description: Conversation ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */

// Get details of a conversation
router.get(
  "/conversation",
  authMiddleware.protect,
  chatController.getConversationDetails,
);

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send a message
 *     description: Send a message to an existing conversation or create/select conversation by receiver.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Xin chao, toi can ho tro ve vuon sau rieng"
 *               conversationId:
 *                 type: string
 *                 example: "67d6f1f4c8f2b21d9f8a1234"
 *               receiverId:
 *                 type: string
 *                 example: "67d6f1f4c8f2b21d9f8a5678"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input or admin missing receiver/conversation
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found or no admin available
 *       500:
 *         description: Internal server error
 */

// Send message
router.post("/message", authMiddleware.protect, chatController.sendMessage);

/**
 * @swagger
 * /chat/message/{messageId}:
 *   put:
 *     summary: Update message
 *     description: Edit message content or recall a message.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Noi dung da chinh sua"
 *               recall:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */

// Update message (recall or edit)
router.put(
  "/message/:messageId",
  authMiddleware.protect,
  chatController.updateMessage,
);

/**
 * @swagger
 * /chat/message/{messageId}:
 *   delete:
 *     summary: Delete message
 *     description: Delete a message by ID.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */

// Delete message
router.delete(
  "/message/:messageId",
  authMiddleware.protect,
  chatController.deleteMessage,
);

export { router as chatRoute };
