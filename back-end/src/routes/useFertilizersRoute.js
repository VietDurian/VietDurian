import express from 'express';
import { useFertilizersController } from '@/controllers/useFertilizersController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /use-fertilizers:
 *   get:
 *     tags: [use-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: View use fertilizers list (pagination)
 *     description: Retrieve fertilizer and pesticide usage logs with pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Items per page (default 10, max 100)
 *       - in: query
 *         name: season_diary_id
 *         schema:
 *           type: string
 *         description: Filter by season diary id
 *         example: "67f13a9f2d8b6a0012c9a101"
 *     responses:
 *       200:
 *         description: Use fertilizers list retrieved successfully
 *   post:
 *     tags: [use-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: Create use fertilizers log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season_diary_id
 *               - usage_date
 *             properties:
 *               season_diary_id:
 *                 type: string
 *                 example: "67f13a9f2d8b6a0012c9a101"
 *               usage_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-10T07:00:00.000Z"
 *               fertilizer_name:
 *                 type: string
 *                 example: "NPK 16-16-8"
 *               fertilizer_amount:
 *                 type: string
 *                 example: "20 kg"
 *               pesticide_name:
 *                 type: string
 *                 example: "Abamectin"
 *               pesticide_concentration_amount:
 *                 type: string
 *                 example: "1.8EC - 400ml/200L"
 *               preharvest_interval:
 *                 type: string
 *                 example: "14 ngày"
 *     responses:
 *       201:
 *         description: Use fertilizers created successfully
 *
 * /use-fertilizers/{use_fertilizers_id}:
 *   patch:
 *     tags: [use-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: Update use fertilizers log
 *     parameters:
 *       - in: path
 *         name: use_fertilizers_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Use fertilizers log id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usage_date:
 *                 type: string
 *                 format: date-time
 *               fertilizer_name:
 *                 type: string
 *               fertilizer_amount:
 *                 type: string
 *               pesticide_name:
 *                 type: string
 *               pesticide_concentration_amount:
 *                 type: string
 *               preharvest_interval:
 *                 type: string
 *     responses:
 *       200:
 *         description: Use fertilizers updated successfully
 *   delete:
 *     tags: [use-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete use fertilizers log
 *     parameters:
 *       - in: path
 *         name: use_fertilizers_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Use fertilizers log id
 *     responses:
 *       200:
 *         description: Use fertilizers deleted successfully
 */

Router.get('/', authMiddleware.protect, useFertilizersController.viewUseFertilizersList);
Router.post('/', authMiddleware.protect, useFertilizersController.createUseFertilizers);
Router.patch(
	'/:use_fertilizers_id',
	authMiddleware.protect,
	useFertilizersController.updateUseFertilizers,
);
Router.delete(
	'/:use_fertilizers_id',
	authMiddleware.protect,
	useFertilizersController.deleteUseFertilizers,
);

export { Router as useFertilizersRoute };
