import express from 'express';
import { reportCommentController } from '@/controllers/reportCommentController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /report-comment:
 *   get:
 *     summary: Get report comments
 *     tags: [report-comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (e.g., pending, reviewed) or 'all'
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       comment:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                       reporter:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       user_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       reason:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *
 *   post:
 *     summary: Create a new report for a comment
 *     tags: [report-comments]
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
 *               - reason
 *             properties:
 *               comment_id:
 *                 type: string
 *                 example: "64a7f0c2e1b2c3d4e5f67890"
 *               reason:
 *                 type: string
 *                 example: "Inappropriate content"
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     comment_id:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     status:
 *                       type: string
 *                 message:
 *                   type: string
 *
 * /report-comment/{id}:
 *   patch:
 *     summary: Update a report's status
 *     tags: [report-comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: reviewed
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                 message:
 *                   type: string
 *
 * /report-comment/ban/{id}:
 *   patch:
 *     summary: Ban (mark inactive) the reported comment and its descendants
 *     tags: [report-comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment(s) banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bannedCount:
 *                   type: integer
 */

Router.get('/', authMiddleware.protect, reportCommentController.getAllReport);
Router.post('/', authMiddleware.protect, reportCommentController.createReport);
Router.patch(
	'/:id',
	authMiddleware.protect,
	reportCommentController.updateReport,
);
Router.patch(
	'/ban/:id',
	authMiddleware.protect,
	reportCommentController.banReport,
);

export { Router as reportCommentRoute };
