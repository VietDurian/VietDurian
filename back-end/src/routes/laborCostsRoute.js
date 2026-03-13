import express from 'express';
import { laborCostsController } from '@/controllers/laborCostsController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /labor-costs:
 *   get:
 *     tags: [labor-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: View labor costs logs (pagination)
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
 *         description: Labor costs logs retrieved successfully
 *   post:
 *     tags: [labor-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: Create labor costs log
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
 *                   labor_hire_date:
 *                     type: string
 *                     format: date
 *                     description: Date value (YYYY-MM-DD)
 *                     example: "2026-03-13"
 *                   work_description:
 *                     type: string
 *                     example: "Tỉa cành, dọn cỏ"
 *                   worker_quantity:
 *                     type: number
 *                     format: double
 *                     example: 6
 *                   working_time:
 *                     type: object
 *                     properties:
 *                       hours:
 *                         type: number
 *                         format: double
 *                         example: 7
 *                       minutes:
 *                         type: number
 *                         example: 30
 *                   unit_price_vnd:
 *                     type: number
 *                     format: double
 *                     example: 300000
 *                   worker_or_team_name:
 *                     type: string
 *                     example: "Tổ lao động Minh Tâm"
 *                   supervisor_name:
 *                     type: string
 *                     example: "Nguyễn Văn A"
 *     responses:
 *       201:
 *         description: Labor costs log created successfully
 *
 * /labor-costs/{labor_cost_id}:
 *   patch:
 *     tags: [labor-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: Update labor costs log
 *     parameters:
 *       - in: path
 *         name: labor_cost_id
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
 *                   labor_hire_date:
 *                     type: string
 *                     format: date
 *                     description: Date value (YYYY-MM-DD)
 *                   work_description:
 *                     type: string
 *                   worker_quantity:
 *                     type: number
 *                     format: double
 *                   working_time:
 *                     type: object
 *                     properties:
 *                       hours:
 *                         type: number
 *                         format: double
 *                       minutes:
 *                         type: number
 *                   unit_price_vnd:
 *                     type: number
 *                     format: double
 *                   worker_or_team_name:
 *                     type: string
 *                   supervisor_name:
 *                     type: string
 *     responses:
 *       200:
 *         description: Labor costs log updated successfully
 *   delete:
 *     tags: [labor-costs]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete labor costs log
 *     parameters:
 *       - in: path
 *         name: labor_cost_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Labor costs log deleted successfully
 */

Router.get('/', authMiddleware.protect, laborCostsController.viewLaborCostsList);
Router.post('/', authMiddleware.protect, laborCostsController.createLaborCosts);
Router.patch(
	'/:labor_cost_id',
	authMiddleware.protect,
	laborCostsController.updateLaborCosts,
);
Router.delete(
	'/:labor_cost_id',
	authMiddleware.protect,
	laborCostsController.deleteLaborCosts,
);

export { Router as laborCostsRoute };
