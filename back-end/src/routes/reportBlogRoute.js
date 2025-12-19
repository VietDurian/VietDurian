import express from 'express';
import { reportBlogController } from '../controllers/reportBlogController.js';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /report-blog:
 *   get:
 *     summary: Returns the list of all reports
 *     tags: [report-blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search reports by blog title
 *     responses:
 *       200:
 *         description: The list of the reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportBlog'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /report-blog:
 *   post:
 *     summary: Create a new report
 *     tags: [report-blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blog_id
 *               - reason
 *             properties:
 *               blog_id:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportBlog'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /report-blog/{id}:
 *   patch:
 *     summary: Update the report status to Resolved
 *     tags: [report-blog]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportBlog'
 *       404:
 *         description: The report was not found
 *       500:
 *         description: Some server error
 *   delete:
 *     summary: Remove the report by id
 *     tags: [report-blog]
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
 *       404:
 *         description: The report was not found
 *       500:
 *         description: Some server error
 */

Router.get(
	'/',
	authMiddleware.protect,
	reportBlogController.getAllReport
);
Router.post(
	'/report-blog',
	authMiddleware.protect,
	reportBlogController.createReport
);
Router.patch(
	'/:id',
	authMiddleware.protect,
	reportBlogController.updateReport
);
Router.delete(
	'/:id',
	authMiddleware.protect,
	reportBlogController.deleteReport
);

export { Router as reportBlogRoute };
