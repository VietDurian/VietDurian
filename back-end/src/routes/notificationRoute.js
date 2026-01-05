import express from 'express';
import { notificationController } from '@/controllers/notificationController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: notifications
 *   description: Notification management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the notification
 *           example: 60d0fe4f5311236168a109ca
 *         receiver_id:
 *           type: string
 *           description: The user ID of the receiver
 *           example: 60d0fe4f5311236168a109cb
 *         sender_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 60d0fe4f5311236168a109cc
 *             username:
 *               type: string
 *               example: "John Doe"
 *             avatar:
 *               type: string
 *               example: "https://example.com/avatar.jpg"
 *         entity_type:
 *           type: string
 *           description: Type of entity (e.g., comment, post_approval)
 *           example: "comment"
 *         post_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 60d0fe4f5311236168a109cd
 *             title:
 *               type: string
 *               example: "My Post Title"
 *         message:
 *           type: string
 *           description: Notification message
 *           example: "John Doe commented on your post."
 *         is_read:
 *           type: boolean
 *           description: Read status
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2021-06-21T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2021-06-21T10:00:00.000Z"
 */

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get all notifications
 *     tags: [notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/notification'
 *       500:
 *         description: Internal server error
 */
Router.get(
	'/',
	authMiddleware.protect,
	notificationController.getNotifications
);

/**
 * @swagger
 * /notification/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       500:
 *         description: Internal server error
 */
Router.delete(
	'/:id',
	authMiddleware.protect,
	notificationController.deleteNotification
);

export const notificationRouter = Router;
