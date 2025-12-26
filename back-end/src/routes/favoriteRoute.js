import express from 'express';
import { favoriteController } from '@/controllers/favoriteController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /favorite:
 *   post:
 *     summary: Add a post to favorites
 *     tags: [favorite]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Added to favorites successfully
 *
 */

/**
 * @swagger
 * /favorite/{post_id}:
 *   delete:
 *     summary: Remove a post from favorites
 *     tags: [favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to remove from favorites
 *     responses:
 *       200:
 *         description: Removed from favorites successfully
 */

/**
 * @swagger
 * /favorite:
 *   get:
 *     summary: View user's favorite posts
 *     tags: [favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieved favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Retrieved favorites successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60d0fe4f5311236168a109ca
 *                       user_id:
 *                         type: string
 *                         example: 60d0fe4f5311236168a109cb
 *                       post_id:
 *                         type: object
 *                         description: Full post details populated
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           category:
 *                             type: string
 *                           image:
 *                             type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */

Router.get('/', authMiddleware.protect, favoriteController.viewFavorites);
Router.post('/', authMiddleware.protect, favoriteController.addToFavorites);
Router.delete(
	'/:post_id',
	authMiddleware.protect,
	favoriteController.deleteFromFavorites
);

export const favoriteRoute = Router;
