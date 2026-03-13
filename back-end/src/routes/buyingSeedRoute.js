import express from 'express';
import { buyingSeedController } from '@/controllers/buyingSeedController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /buying-seed:
 *   get:
 *     tags: [buying-seed]
 *     security:
 *       - bearerAuth: []
 *     summary: View buying seed list (pagination)
 *     description: Retrieve buying seed entries with pagination. Can filter by season_diary_id.
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
 *         description: Buying seed list retrieved successfully
 *   post:
 *     tags: [buying-seed]
 *     security:
 *       - bearerAuth: []
 *     summary: Create buying seed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season_diary_id
 *               - purchase_date
 *               - seed_name
 *               - quantity
 *               - total_price
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
 *               seed_name:
 *                 type: string
 *                 example: "Ri6"
 *               quantity:
 *                 type: number
 *                 example: 200
 *               total_price:
 *                 type: number
 *                 example: 3500000
 *               supplier_name:
 *                 type: string
 *                 example: "Đại lý cây giống An Phát"
 *               supplier_address:
 *                 type: string
 *                 example: "Cái Mơn, Bến Tre"
 *     responses:
 *       201:
 *         description: Buying seed created successfully
 *
 * /buying-seed/{buying_seed_id}:
 *   patch:
 *     tags: [buying-seed]
 *     security:
 *       - bearerAuth: []
 *     summary: Update buying seed
 *     parameters:
 *       - in: path
 *         name: buying_seed_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Buying seed id
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
 *               seed_name:
 *                 type: string
 *                 example: "Dona"
 *               quantity:
 *                 type: number
 *                 example: 150
 *               total_price:
 *                 type: number
 *                 example: 4200000
 *               supplier_name:
 *                 type: string
 *                 example: "Đại lý cây giống Cái Mơn"
 *               supplier_address:
 *                 type: string
 *                 example: "Chợ Lách, Bến Tre"
 *     responses:
 *       200:
 *         description: Buying seed updated successfully
 *   delete:
 *     tags: [buying-seed]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete buying seed
 *     parameters:
 *       - in: path
 *         name: buying_seed_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Buying seed id
 *     responses:
 *       200:
 *         description: Buying seed deleted successfully
 */

Router.get('/', authMiddleware.protect, buyingSeedController.viewBuyingSeedList);
Router.post('/', authMiddleware.protect, buyingSeedController.createBuyingSeed);
Router.patch(
	'/:buying_seed_id',
	authMiddleware.protect,
	buyingSeedController.updateBuyingSeed,
);
Router.delete(
	'/:buying_seed_id',
	authMiddleware.protect,
	buyingSeedController.deleteBuyingSeed,
);

export { Router as buyingSeedRoute };