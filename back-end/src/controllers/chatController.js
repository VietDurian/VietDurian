import { chatService } from '@/services/chatService';

const chatController = {
	// Get all conversations (Admin only)
	getAllConversations: async (req, res) => {
		try {
			const conversations = await chatService.getAllConversations();
			res.status(200).json(conversations);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	},

	// Get user's conversations
	getUserConversations: async (req, res) => {
		try {
			const userId = req.user._id;
			const conversations = await chatService.getUserConversations(userId);
			res.status(200).json(conversations);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	},

	// Get conversation details (messages)
	getConversationDetails: async (req, res) => {
		try {
			const { conversationId } = req.query;
			const result = await chatService.getConversationDetails(
				conversationId,
				req.user
			);
			res.status(200).json(result);
		} catch (error) {
			if (error.message === 'Conversation not found') {
				return res.status(404).json({ message: error.message });
			}
			if (error.message === 'Conversation ID is required') {
				return res.status(400).json({ message: error.message });
			}
			res.status(500).json({ message: error.message });
		}
	},

	// Send message
	sendMessage: async (req, res) => {
		try {
			const { content, conversationId, receiverId } = req.body;
			const senderId = req.user._id;
			const userRole = req.user.role;
			const userFullName = req.user.full_name;
			const userAvatar = req.user.avatar;

			const newMessage = await chatService.sendMessage(
				senderId,
				userRole,
				userFullName,
				userAvatar,
				{ content, conversationId, receiverId }
			);

			res.status(201).json(newMessage);
		} catch (error) {
			if (
				error.message === 'Receiver not found' ||
				error.message === 'No admin available'
			) {
				return res.status(404).json({ message: error.message });
			}
			if (error.message === 'Admin must specify conversationId or receiverId') {
				return res.status(400).json({ message: error.message });
			}
			res.status(500).json({ message: error.message });
		}
	},

	// Update message
	updateMessage: async (req, res) => {
		try {
			const { messageId } = req.params;
			const { content, recall } = req.body;
			const userId = req.user._id;

			const updatedMessage = await chatService.updateMessage(
				messageId,
				userId,
				{ content, recall }
			);

			res.status(200).json(updatedMessage);
		} catch (error) {
			if (error.message === 'Message not found') {
				return res.status(404).json({ message: error.message });
			}
			if (error.message === 'Not authorized') {
				return res.status(403).json({ message: error.message });
			}
			res.status(500).json({ message: error.message });
		}
	},

	// Delete message
	deleteMessage: async (req, res) => {
		try {
			const { messageId } = req.params;
			const userId = req.user._id;

			const result = await chatService.deleteMessage(messageId, userId);

			res.status(200).json(result);
		} catch (error) {
			if (error.message === 'Message not found') {
				return res.status(404).json({ message: error.message });
			}
			if (error.message === 'Not authorized') {
				return res.status(403).json({ message: error.message });
			}
			res.status(500).json({ message: error.message });
		}
	},
};

export { chatController };
