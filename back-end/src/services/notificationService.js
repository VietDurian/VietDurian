import { NotificationModel } from '@/model/notificationModel.js';

const createNotification = async ({
	receiver_id,
	sender_id,
	entity_type,
	post_id,
	message,
}) => {
	try {
		const newNotification = new NotificationModel({
			receiver_id,
			sender_id,
			entity_type,
			post_id,
			message,
		});
		return await newNotification.save();
	} catch (error) {
		throw error;
	}
};

const getNotifications = async (userId) => {
	try {
		const notifications = await NotificationModel.find({ receiver_id: userId })
			.sort({ created_at: -1 })
			.populate('sender_id', 'full_name avatar')
			.populate('post_id', 'title');
		return notifications;
	} catch (error) {
		throw error;
	}
};

const deleteNotification = async (id) => {
	try {
		return await NotificationModel.findByIdAndDelete(id);
	} catch (error) {
		throw error;
	}
};

const markAsRead = async (id) => {
	try {
		return await NotificationModel.findByIdAndUpdate(id, { is_read: true }, { new: true });
	} catch (error) {
		throw error;
	}
};

export const notificationService = {
	createNotification,
	getNotifications,
	deleteNotification,
	markAsRead,
};
