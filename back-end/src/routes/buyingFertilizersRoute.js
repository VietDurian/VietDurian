import express from 'express';
import { buyingFertilizersController } from '@/controllers/buyingFertilizersController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /buying-fertilizers:
 *   get:
 *     tags: [buying-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: View buying fertilizers list (pagination)
 *     description: Retrieve fertilizer/material purchase list with pagination.
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
 *         description: Buying fertilizers list retrieved successfully
 *   post:
 *     tags: [buying-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: Create buying fertilizers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season_diary_id
 *               - purchase_date
 *               - material_name
 *               - quantity
 *               - total_price
 *               - unit
 *               - supplier_name
 *               - supplier_address
 *             properties:
 *               season_diary_id:
 *                 type: string
 *                 example: "67f13a9f2d8b6a0012c9a101"
 *               purchase_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-12T07:00:00.000Z"
 *               material_name:
 *                 type: string
 *                 example: "NPK 16-16-8"
 *               quantity:
 *                 type: number
 *                 example: 200
 *               total_price:
 *                 type: number
 *                 example: 4800000
 *               unit:
 *                 type: string
 *                 enum: [kg, g, l, ml]
 *                 example: "kg"
 *               supplier_name:
 *                 type: string
 *                 example: "Đại lý vật tư An Phát"
 *               supplier_address:
 *                 type: string
 *                 example: "Cái Mơn, Bến Tre"
 *     responses:
 *       201:
 *         description: Buying fertilizers created successfully
 *
 * /buying-fertilizers/{buying_fertilizers_id}:
 *   patch:
 *     tags: [buying-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: Update buying fertilizers
 *     parameters:
 *       - in: path
 *         name: buying_fertilizers_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Buying fertilizers id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purchase_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-15T07:00:00.000Z"
 *               material_name:
 *                 type: string
 *                 example: "Canxi Bo"
 *               quantity:
 *                 type: number
 *                 example: 20
 *               total_price:
 *                 type: number
 *                 example: 1250000
 *               unit:
 *                 type: string
 *                 enum: [kg, g, l, ml]
 *                 example: "kg"
 *               supplier_name:
 *                 type: string
 *                 example: "Đại lý vật tư Krông Pắc"
 *               supplier_address:
 *                 type: string
 *                 example: "Phước An, Đắk Lắk"
 *     responses:
 *       200:
 *         description: Buying fertilizers updated successfully
 *   delete:
 *     tags: [buying-fertilizers]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete buying fertilizers
 *     parameters:
 *       - in: path
 *         name: buying_fertilizers_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Buying fertilizers id
 *     responses:
 *       200:
 *         description: Buying fertilizers deleted successfully
 */

Router.get(
	'/',
	authMiddleware.protect,
	buyingFertilizersController.viewBuyingFertilizersList,
);
Router.post(
	'/',
	authMiddleware.protect,
	buyingFertilizersController.createBuyingFertilizers,
);
Router.patch(
	'/:buying_fertilizers_id',
	authMiddleware.protect,
	buyingFertilizersController.updateBuyingFertilizers,
);
Router.delete(
	'/:buying_fertilizers_id',
	authMiddleware.protect,
	buyingFertilizersController.deleteBuyingFertilizers,
);

export { Router as buyingFertilizersRoute };