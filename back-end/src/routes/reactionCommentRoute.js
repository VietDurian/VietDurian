import express from 'express';
import { reactionCommentController } from '@/controllers/reactionCommentController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /reaction:
 *   get:
 *     summary: Get all reaction comments
 *     tags: [reaction-comment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reaction comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   comment_id:
 *                     type: string
 *                   user_id:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [like, dislike, love, haha, wow, sad, angry]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *   post:
 *     summary: Add a reaction to a comment
 *     tags: [reaction-comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment_id
 *               - type
 *             properties:
 *               comment_id:
 *                 type: string
 *                 example: "64a7f0c2e1b2c3d4e5f67890"
 *               type:
 *                 type: string
 *                 enum: [like, dislike, love, haha, wow, sad, angry]
 *                 example: "like"
 *     responses:
 *       201:
 *         description: Reaction added successfully
 *       400:
 *         description: Invalid input
 *
 * /reaction/{commentId}/comment:
 *   get:
 *     summary: Get reactions by comment ID
 *     tags: [reaction-comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: List of reactions for the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Reactions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: integer
 *                           example: 5
 *                         dislike:
 *                           type: integer
 *                           example: 0
 *                         love:
 *                           type: integer
 *                           example: 2
 *                         haha:
 *                           type: integer
 *                           example: 1
 *                         wow:
 *                           type: integer
 *                           example: 1
 *                         sad:
 *                           type: integer
 *                           example: 1
 *                         angry:
 *                           type: integer
 *                           example: 0
 *                     reactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           comment_id:
 *                             type: string
 *                           user_id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [like, dislike, love, haha, wow, sad, angry]
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *
 * /reaction/{id}:
 *   patch:
 *     summary: Update a reaction
 *     tags: [reaction-comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike, love, haha, wow, sad, angry]
 *     responses:
 *       200:
 *         description: Reaction updated successfully
 *       400:
 *         description: Invalid input
 *   delete:
 *     summary: Delete a reaction
 *     tags: [reaction-comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The reaction ID
 *     responses:
 *       200:
 *         description: Reaction deleted successfully
 */

Router.get(
	'/',
	authMiddleware.protect,
	reactionCommentController.getAllReactionComments
);
Router.post('/', authMiddleware.protect, reactionCommentController.addReaction);
Router.get(
	'/:commentId/comment',
	authMiddleware.protect,
	reactionCommentController.getReactionCommentsByCommentId
);
Router.patch(
	'/:id',
	authMiddleware.protect,
	reactionCommentController.updateReaction
);
Router.delete(
	'/:id',
	authMiddleware.protect,
	reactionCommentController.deleteReaction
);
export { Router as reactionCommentRoute };
