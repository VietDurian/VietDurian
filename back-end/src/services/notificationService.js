import { NotificationModel } from '@/model/notificationModel.js';

const createNotification = async ({ receiver_id, sender_id, entity_type, post_id, message }) => {
    try {
        const newNotification = new NotificationModel({
            receiver_id,
            sender_id,
            entity_type,
            post_id,
            message
        });
        return await newNotification.save();
    } catch (error) {
        throw error;
    }
};

const getNotifications = async (userId) => {
    try {
        return await NotificationModel.find({ receiver_id: userId })
            .sort({ created_at: -1 })
            .populate('sender_id', 'username avatar')
            .populate('post_id', 'title');
    } catch (error) {
        throw error;
    }
};

const getNotification = async (id) => {
    try {
        return await NotificationModel.findById(id)
            .populate('sender_id', 'username avatar')
            .populate('post_id');
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

export const notificationService = {
    createNotification,
    getNotifications,
    getNotification,
    deleteNotification
};
