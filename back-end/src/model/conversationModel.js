import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
	{
		parent_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		admin_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
