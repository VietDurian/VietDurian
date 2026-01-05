import Conversation from '@/model/conversationModel';
import Message from '@/model/messageModel';
import User from '@/model/userModel';
import { socketHelper } from '@/utils/socketHelper';

const chatService = {
	// Get all conversations (Admin only)
	getAllConversations: async () => {
		const conversations = await Conversation.find()
			.populate('parent_id', 'full_name avatar email')
			.populate('admin_id', 'full_name avatar email')
			.sort({ updated_at: -1 });

		// Get last message for each conversation
		const conversationsWithLastMessage = await Promise.all(
			conversations.map(async (conv) => {
				const lastMessage = await Message.findOne({ conversation_id: conv._id })
					.sort({ created_at: -1 })
					.limit(1);
				return {
					...conv.toObject(),
					lastMessage: lastMessage || null,
				};
			})
		);

		return conversationsWithLastMessage;
	},

	// Get user's conversations
	getUserConversations: async (userId) => {
		const conversations = await Conversation.find({
			$or: [{ parent_id: userId }, { admin_id: userId }],
		})
			.populate('parent_id', 'full_name avatar email')
			.populate('admin_id', 'full_name avatar email')
			.sort({ updated_at: -1 });

		const conversationsWithLastMessage = await Promise.all(
			conversations.map(async (conv) => {
				const lastMessage = await Message.findOne({ conversation_id: conv._id })
					.sort({ created_at: -1 })
					.limit(1);
				return {
					...conv.toObject(),
					lastMessage: lastMessage || null,
				};
			})
		);

		return conversationsWithLastMessage;
	},

	// Get conversation details (messages)
	getConversationDetails: async (conversationId, user) => {
		if (!conversationId) {
			// If no conversationId, try to find one for the user if they are not admin
			if (user.role !== 'admin') {
				const conversation = await Conversation.findOne({
					parent_id: user._id,
				});
				if (conversation) {
					const messages = await Message.find({
						conversation_id: conversation._id,
					}).sort({ created_at: 1 });
					return { conversation, messages };
				} else {
					return { conversation: null, messages: [] };
				}
			}
			throw new Error('Conversation ID is required');
		}

		const conversation = await Conversation.findById(conversationId)
			.populate('parent_id', 'full_name avatar email')
			.populate('admin_id', 'full_name avatar email');

		if (!conversation) {
			throw new Error('Conversation not found');
		}

		const messages = await Message.find({
			conversation_id: conversationId,
		}).sort({ created_at: 1 });

		return { conversation, messages };
	},

	// Send message
	sendMessage: async (
		senderId,
		userRole,
		userFullName,
		userAvatar,
		{ content, conversationId, receiverId }
	) => {
		let conversation;

		if (conversationId) {
			conversation = await Conversation.findById(conversationId);
		} else if (receiverId) {
			// Check if conversation exists
			conversation = await Conversation.findOne({
				$or: [
					{ parent_id: senderId, admin_id: receiverId },
					{ parent_id: receiverId, admin_id: senderId },
				],
			});

			if (!conversation) {
				// Determine who is admin and who is parent (user)
				const receiver = await User.findById(receiverId);
				if (!receiver) throw new Error('Receiver not found');

				let admin_id, parent_id;
				if (receiver.role === 'admin') {
					admin_id = receiverId;
					parent_id = senderId;
				} else if (userRole === 'admin') {
					admin_id = senderId;
					parent_id = receiverId;
				} else {
					parent_id = senderId;
					admin_id = receiverId;
				}

				conversation = new Conversation({
					parent_id,
					admin_id,
				});
				await conversation.save();

				// Notify admin about new conversation
				socketHelper.chat.emitConversationsUpdate({
					type: 'new_conversation',
					conversation,
				});
			}
		} else {
			// If user sends message without conversationId or receiverId, assume to Admin.
			if (userRole !== 'admin') {
				conversation = await Conversation.findOne({ parent_id: senderId });
				if (!conversation) {
					const admin = await User.findOne({ role: 'admin' });
					if (!admin) throw new Error('No admin available');

					conversation = new Conversation({
						parent_id: senderId,
						admin_id: admin._id,
					});
					await conversation.save();
					socketHelper.chat.emitConversationsUpdate({
						type: 'new_conversation',
						conversation,
					});
				}
			} else {
				throw new Error('Admin must specify conversationId or receiverId');
			}
		}

		const newMessage = new Message({
			conversation_id: conversation._id,
			sender_id: senderId,
			content,
		});

		await newMessage.save();

		// Update conversation timestamp
		conversation.updated_at = new Date();
		await conversation.save();

		// Emit socket event
		const messageData = {
			...newMessage.toObject(),
			sender: {
				_id: senderId,
				full_name: userFullName,
				avatar: userAvatar,
			},
		};

		// Determine receiver ID for socket emission
		const receiver_id =
			conversation.parent_id.toString() === senderId.toString()
				? conversation.admin_id
				: conversation.parent_id;

		socketHelper.chat.emitNewMessage(messageData, receiver_id);

		// Also emit conversation update to move it to top
		socketHelper.chat.emitConversationUpdate({
			conversationId: conversation._id,
			lastMessage: newMessage,
		});

		return newMessage;
	},

	// Update message
	updateMessage: async (messageId, userId, { content, recall }) => {
		const message = await Message.findById(messageId);
		if (!message) {
			throw new Error('Message not found');
		}

		if (message.sender_id.toString() !== userId.toString()) {
			throw new Error('Not authorized');
		}

		if (recall) {
			message.recall = true;
		} else if (content) {
			message.content = content;
			message.edited = true;
		}

		await message.save();

		socketHelper.chat.emitMessageUpdate(message, userId);

		return message;
	},

	// Delete message
	deleteMessage: async (messageId, userId) => {
		const message = await Message.findById(messageId);
		if (!message) {
			throw new Error('Message not found');
		}

		if (message.sender_id.toString() !== userId.toString()) {
			throw new Error('Not authorized');
		}

		await Message.findByIdAndDelete(messageId);

		socketHelper.chat.emitMessageDelete(
			{ messageId },
			message.conversation_id,
			userId
		);

		return { message: 'Message deleted' };
	},
};

export { chatService };
