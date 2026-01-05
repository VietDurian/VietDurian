class SocketHelper {
	constructor() {
		this.io = null;
	}

	// Initialize socket instance
	setSocketIO(io) {
		this.io = io;
	}

	// Get socket instance
	getSocketIO() {
		return this.io;
	}

	// Chat-related socket emissions
	chat = {
		// EMIT: new message to relevant rooms
		emitNewMessage: (messageData, receiverId = null) => {
			if (!this.io) return;

			// Emit to conversation room
			if (messageData.conversation_id) {
				this.io
					.to(`conversation_${messageData.conversation_id}`)
					.emit('new_message', messageData);
			}

			// Send to specific user if receiverId exists (admin -> user)
			if (receiverId) {
				this.io.to(`user_${receiverId}`).emit('new_message', messageData);
			}

			// Send to admin room
			this.io.to('admin_room').emit('new_message', messageData);

			// Send back to sender for confirmation
			this.io
				.to(`user_${messageData.senderId}`)
				.emit('message_sent', messageData);
		},

		// EMIT: message update
		emitMessageUpdate: (updateData, userId = null) => {
			if (!this.io) return;

			if (updateData.conversation_id) {
				this.io
					.to(`conversation_${updateData.conversation_id}`)
					.emit('message_updated', updateData);
			}

			if (userId) {
				this.io.to(`user_${userId}`).emit('message_updated', updateData);
			}

			// Also emit to admin room
			this.io.to('admin_room').emit('message_updated', updateData);
		},

		// EMIT: message deletion
		emitMessageDelete: (deleteData, conversationId = null, senderId = null) => {
			if (!this.io) return;

			// Emit to conversation participants
			if (conversationId) {
				this.io
					.to(`conversation_${conversationId}`)
					.emit('message_deleted', deleteData);
			}

			// Also emit to admin room and user room
			this.io.to('admin_room').emit('message_deleted', deleteData);

			if (senderId) {
				this.io.to(`user_${senderId}`).emit('message_deleted', deleteData);
			}
		},

		// EMIT: messages seen status
		emitMessagesSeen: (seenData, conversationId = null, userId = null) => {
			if (!this.io) return;

			// Emit to conversation participants
			if (conversationId) {
				this.io
					.to(`conversation_${conversationId}`)
					.emit('messages_seen', seenData);
			}

			// Also emit to admin room and user room
			this.io.to('admin_room').emit('messages_seen', seenData);

			if (userId) {
				this.io.to(`user_${userId}`).emit('messages_seen', seenData);
			}
		},

		// EMIT: conversation updates to admin
		emitConversationUpdate: (conversationData) => {
			if (!this.io) return;

			this.io.to('admin_room').emit('admin_conversation', conversationData);
		},

		// EMIT: conversations list update to admin
		emitConversationsUpdate: (conversationsData) => {
			if (!this.io) return;

			this.io.to('admin_room').emit('conversations_updated', conversationsData);
		},
	};

	// Generic room management
	rooms = {
		// Join user to room
		joinRoom: (socketId, roomName) => {
			if (!this.io) return;

			const socket = this.io.sockets.sockets.get(socketId);
			if (socket) {
				socket.join(roomName);
			}
		},

		// Leave room
		leaveRoom: (socketId, roomName) => {
			if (!this.io) return;

			const socket = this.io.sockets.sockets.get(socketId);
			if (socket) {
				socket.leave(roomName);
			}
		},

		// EMIT: to specific room
		emitToRoom: (roomName, event, data) => {
			if (!this.io) return;

			this.io.to(roomName).emit(event, data);
		},
	};

	// Utility methods
	utils = {
		// Get connected clients count
		getConnectedClientsCount: () => {
			return this.io ? this.io.engine.clientsCount : 0;
		},

		// Check if socket instance exists
		isConnected: () => {
			return !!this.io;
		},
	};
}

// Export singleton instance
export const socketHelper = new SocketHelper();
