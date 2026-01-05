import { notificationService } from '@/services/notificationService.js';

const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const notifications = await notificationService.getNotifications(userId);
        res.status(200).json({
            code: 200,
            message: 'Notifications retrieved successfully',
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

const getNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.getNotification(id);
        if (!notification) {
            return res.status(404).json({
                code: 404,
                message: 'Notification not found'
            });
        }
        res.status(200).json({
            code: 200,
            message: 'Notification retrieved successfully',
            data: notification
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
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const notificationController = {
    getNotifications,
    getNotification,
    deleteNotification
};
