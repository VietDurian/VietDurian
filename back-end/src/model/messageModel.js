import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		conversation_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Conversation',
			required: true,
		},
		sender_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			default: 'text',
		},
		recall: {
			type: Boolean,
			default: false,
		},
		edited: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
