import express from 'express';
import { commentPostController } from '@/controllers/commentPostController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     tags: [comment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   post_id:
 *                     type: string
 *                   author_id:
 *                     type: string
 *                   parent_id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *   post:
 *     summary: Create a new comment
 *     tags: [comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *             properties:
 *               post_id:
 *                 type: string
 *                 example: "64a7f0c2e1b2c3d4e5f67890"
 *               parent_id:
 *                 type: string
 *                 example: null
 *               content:
 *                 type: string
 *                 example: "This is a comment."
 *     responses:
 *       201:
 *         description: Comment created successfully
 *
 * /comment/{postId}/post:
 *   get:
 *     summary: Get comments by Post ID
 *     tags: [comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [all, newest]
 *           default: all
 *         description: Sort order of comments (all = oldest first, newest = newest first)
 *     responses:
 *       200:
 *         description: List of comments for the post
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
 *                   example: "Comments retrieved successfully"
 *                 total:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       post_id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109cb"
 *                       author_id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109cc"
 *                       parent_id:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       content:
 *                         type: string
 *                         example: "This is a root comment"
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "60d0fe4f5311236168a109cd"
 *                             parent_id:
 *                               type: string
 *                               example: "60d0fe4f5311236168a109ca"
 *                             content:
 *                               type: string
 *                               example: "This is a reply"
 *
 * /comment/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *   delete:
 *     summary: Delete a comment
 *     tags: [comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */

Router.get('/', authMiddleware.protect, commentPostController.getAllComments);
Router.post('/', authMiddleware.protect, commentPostController.createComment);
Router.get(
	'/:postId/post',
	authMiddleware.protect,
	commentPostController.getCommentsByPostId
);
Router.patch(
	'/:id',
	authMiddleware.protect,
	commentPostController.updateComment
);
Router.delete(
	'/:id',
	authMiddleware.protect,
	commentPostController.deleteComment
);

export { Router as commentPostRoute };
