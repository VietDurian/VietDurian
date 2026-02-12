import { notificationService } from '@/services/notificationService.js';

const getNotifications = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const notifications = await notificationService.getNotifications(userId);
		res.status(200).json({
			code: 200,
			message: 'Notifications retrieved successfully',
			data: notifications,
		});
	} catch (error) {
		next(error);
	}
};

const deleteNotification = async (req, res, next) => {
	try {
		const { id } = req.params;
		await notificationService.deleteNotification(id);
		res.status(200).json({
			code: 200,
			message: 'Notification deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

const markAsRead = async (req, res, next) => {
	try {
		const { id } = req.params;
		await notificationService.markAsRead(id);
		res.status(200).json({
			code: 200,
			message: 'Notification marked as read successfully',
		});
	} catch (error) {
		next(error);
	}
};

export const notificationController = {
	getNotifications,
	deleteNotification,
	markAsRead,
};
