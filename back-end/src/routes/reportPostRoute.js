import express from 'express';
import { reportPostController } from '@/controllers/reportPostController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /report:
 *   get:
 *     summary: Returns the list of all reports
 *     tags: [report-post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search reports by post content
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: The list of the reports
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
 *                       post_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                       user_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                       reason:
 *                         type: string
 *                       image:
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
 */

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Create a new report
 *     tags: [report-post]
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
 *               - reason
 *             properties:
 *               post_id:
 *                 type: string
 *                 example: "64a7f0c2e1b2c3d4e5f67890"
 *               reason:
 *                 type: string
 *                 example: "Inappropriate content"
 *               image:
 *                 type: string
 *                 example: "http://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: The report was successfully created
 */

/**
 * @swagger
 * /report/{id}:
 *   patch:
 *     summary: Update the report status to Resolved
 *     tags: [report-post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The report id
 *     responses:
 *       200:
 *         description: The report was updated

 * 
 *   delete:
 *     summary: Remove the report by id
 *     tags: [report-post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The report id
 *     responses:
 *       200:
 *         description: The report was deleted
 */

Router.get('/', authMiddleware.protect, reportPostController.getAllReport);
Router.post('/', authMiddleware.protect, reportPostController.createReport);
Router.patch('/:id', authMiddleware.protect, reportPostController.updateReport);
Router.delete(
	'/:id',
	authMiddleware.protect,
	reportPostController.deleteReport
);

export { Router as reportPostRoute };
