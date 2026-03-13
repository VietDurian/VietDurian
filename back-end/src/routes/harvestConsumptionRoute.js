import express from 'express';
import { harvestConsumptionController } from '@/controllers/harvestConsumptionController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /harvest-consumption:
 *   get:
 *     tags: [harvest-consumption]
 *     security:
 *       - bearerAuth: []
 *     summary: View harvest and product consumption logs (pagination)
 *     parameters:
 *       - in: query
 *         name: season_diary_id
 *         schema:
 *           type: string
 *         description: Filter by season diary id
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Harvest and product consumption logs retrieved successfully
 *   post:
 *     tags: [harvest-consumption]
 *     security:
 *       - bearerAuth: []
 *     summary: Create harvest and product consumption log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season_diary_id
 *             properties:
 *               season_diary_id:
 *                 type: string
 *                 example: "67f13a9f2d8b6a0012c9a101"
 *               seasonDiary:
 *                 type: object
 *                 properties:
 *                   harvest_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-03-20"
 *                   harvest_quantity_kg:
 *                     type: number
 *                     format: double
 *                     example: 1200.5
 *                   sale_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-03-25"
 *                   buyer_or_consumption_address:
 *                     type: string
 *                     example: "Co so thu mua Thanh Cong, Cho Lach, Ben Tre"
 *                   consumed_weight_kg:
 *                     type: number
 *                     format: double
 *                     example: 980.75
 *     responses:
 *       201:
 *         description: Harvest and product consumption log created successfully
 *
 * /harvest-consumption/{harvest_consumption_id}:
 *   patch:
 *     tags: [harvest-consumption]
 *     security:
 *       - bearerAuth: []
 *     summary: Update harvest and product consumption log
 *     parameters:
 *       - in: path
 *         name: harvest_consumption_id
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
 *               season_diary_id:
 *                 type: string
 *               seasonDiary:
 *                 type: object
 *                 properties:
 *                   harvest_date:
 *                     type: string
 *                     format: date
 *                   harvest_quantity_kg:
 *                     type: number
 *                     format: double
 *                   sale_date:
 *                     type: string
 *                     format: date
 *                   buyer_or_consumption_address:
 *                     type: string
 *                   consumed_weight_kg:
 *                     type: number
 *                     format: double
 *     responses:
 *       200:
 *         description: Harvest and product consumption log updated successfully
 *   delete:
 *     tags: [harvest-consumption]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete harvest and product consumption log
 *     parameters:
 *       - in: path
 *         name: harvest_consumption_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Harvest and product consumption log deleted successfully
 */

Router.get(
	'/',
	authMiddleware.protect,
	harvestConsumptionController.viewHarvestConsumptionList,
);
Router.post(
	'/',
	authMiddleware.protect,
	harvestConsumptionController.createHarvestConsumption,
);
Router.patch(
	'/:harvest_consumption_id',
	authMiddleware.protect,
	harvestConsumptionController.updateHarvestConsumption,
);
Router.delete(
	'/:harvest_consumption_id',
	authMiddleware.protect,
	harvestConsumptionController.deleteHarvestConsumption,
);

export { Router as harvestConsumptionRoute };
