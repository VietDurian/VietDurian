import express from 'express';
import { irrigationCostsController } from '@/controllers/irrigationCostsController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /irrigation-costs:
 *   get:
 *     tags: [irrigation-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: View irrigation cost/system logs (pagination)
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
 *         description: Irrigation costs logs retrieved successfully
 *   post:
 *     tags: [irrigation-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: Create irrigation costs log
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
 *                 description: Season diary id (required)
 *                 example: "67f13a9f2d8b6a0012c9a101"
 *               seasonDiary:
 *                 type: object
 *                 properties:
 *                   execution_date:
 *                     type: string
 *                     description: Clear date format YYYY-MM-DD
 *                     example: "2026-03-13"
 *                   irrigation_item:
 *                     type: string
 *                     example: "Tưới giai đoạn ra hoa"
 *                   irrigation_method:
 *                     type: string
 *                     enum: [nho_giot, phun_mua, thu_cong]
 *                     description: nho_giot (Nhỏ giọt), phun_mua (Phun mưa), thu_cong (Thủ công)
 *                     example: "nho_giot"
 *                   irrigation_duration_hours:
 *                     type: number
 *                     example: 2.5
 *                   irrigation_area:
 *                     type: string
 *                     example: "2500 m2"
 *                   electricity_fuel_cost:
 *                     type: number
 *                     format: double
 *                     description: Chi phi dien/nhien lieu phai la so (double), khong nhan chuoi
 *                     example: 350000.5
 *                   performed_by:
 *                     type: string
 *                     example: "Nguyễn Văn A"
 *     responses:
 *       201:
 *         description: Irrigation costs log created successfully
 *
 * /irrigation-costs/{irrigation_cost_id}:
 *   patch:
 *     tags: [irrigation-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: Update irrigation costs log
 *     parameters:
 *       - in: path
 *         name: irrigation_cost_id
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
 *               seasonDiary:
 *                 type: object
 *                 properties:
 *                   execution_date:
 *                     type: string
 *                     description: YYYY-MM-DD
 *                   irrigation_item:
 *                     type: string
 *                   irrigation_method:
 *                     type: string
 *                     enum: [nho_giot, phun_mua, thu_cong]
 *                     description: nho_giot (Nhỏ giọt), phun_mua (Phun mưa), thu_cong (Thủ công)
 *                   irrigation_duration_hours:
 *                     type: number
 *                   irrigation_area:
 *                     type: string
 *                   electricity_fuel_cost:
 *                     type: number
 *                     format: double
 *                     description: Chi phi dien/nhien lieu phai la so (double), khong nhan chuoi
 *                   performed_by:
 *                     type: string
 *     responses:
 *       200:
 *         description: Irrigation costs log updated successfully
 *   delete:
 *     tags: [irrigation-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete irrigation costs log
 *     parameters:
 *       - in: path
 *         name: irrigation_cost_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Irrigation costs log deleted successfully
 */

Router.get(
	'/',
	authMiddleware.protect,
	irrigationCostsController.viewIrrigationCostsList,
);
Router.post(
	'/',
	authMiddleware.protect,
	irrigationCostsController.createIrrigationCosts,
);
Router.patch(
	'/:irrigation_cost_id',
	authMiddleware.protect,
	irrigationCostsController.updateIrrigationCosts,
);
Router.delete(
	'/:irrigation_cost_id',
	authMiddleware.protect,
	irrigationCostsController.deleteIrrigationCosts,
);

export { Router as irrigationCostsRoute };
