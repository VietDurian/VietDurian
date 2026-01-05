import express from "express";
import {chatController} from "@/controllers/chatController";
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const router = express.Router();

// Get all conversation of admin
router.get('/conversations', authMiddleware.protect, authorizationMiddleware.isAdmin, chatController.getAllConversations);

// Get user's conversations
router.get('/user-conversations', authMiddleware.protect,authorizationMiddleware.isUser, chatController.getUserConversations);

// Get details of a conversation
router.get('/conversation', authMiddleware.protect, chatController.getConversationDetails);

// Send message
router.post('/message', authMiddleware.protect, chatController.sendMessage);

// Update message (recall or edit)
router.put('/message/:messageId', authMiddleware.protect, chatController.updateMessage);

// Delete message
router.delete('/message/:messageId', authMiddleware.protect, chatController.deleteMessage);

export { router as chatRoute };