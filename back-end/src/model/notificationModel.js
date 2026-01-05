import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		receiver_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		sender_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		entity_type: {
			type: String,
			required: true,
		},
		post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'GeneralPost',
		},
		message: {
			type: String,
			required: true,
		},
		is_read: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const NotificationModel = mongoose.model('Notification', notificationSchema);
export { NotificationModel };
