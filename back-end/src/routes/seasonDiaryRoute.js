import express from 'express';
import { seasonDiaryController } from '@/controllers/seasonDiaryController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /season-diary:
 *   get:
 *     tags: [season-diary]
 *     security:
 *       - bearerAuth: []
 *     summary: View season diary list
 *     description: Retrieve season diary list with optional filter by status and userId.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['In progressing', 'Completed']
 *         description: Filter by diary status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by owner user id
 *         example: "69429eee21eeba96cd1c3f71"
 *     responses:
 *       200:
 *         description: Season diary list retrieved successfully
 *   post:
 *     tags: [season-diary]
 *     security:
 *       - bearerAuth: []
 *     summary: Create season diary
 *     description: Create a new season diary for current authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - garden_name
 *               - farmer_name
 *               - location
 *               - longitude
 *               - latitude
 *               - crop_variety
 *               - area
 *             properties:
 *               garden_name:
 *                 type: string
 *                 example: "Vườn số 1"
 *               farmer_name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               location:
 *                 type: string
 *                 example: "Cái Mơn, Bến Tre"
 *               longitude:
 *                 type: string
 *                 example: "106.2712"
 *               latitude:
 *                 type: string
 *                 example: "10.2379"
 *               members:
 *                 type: string
 *                 example: "Nguyễn Văn A, Trần Văn B"
 *               planting_area_code:
 *                 type: string
 *                 example: "VT-123456"
 *               crop_variety:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Ri6", "Monthong"]
 *               farmer_code:
 *                 type: string
 *                 example: "FARM-01"
 *               row_bed_count:
 *                 type: number
 *                 example: 30
 *               area:
 *                 type: number
 *                 example: 5000
 *               land_use_history:
 *                 type: string
 *                 example: "Đất trồng cây ăn trái 5 năm"
 *     responses:
 *       201:
 *         description: Season diary created successfully
 *
 * /season-diary/{season_diary_id}:
 *   get:
 *     tags: [season-diary]
 *     security:
 *       - bearerAuth: []
 *     summary: View season diary detail
 *     parameters:
 *       - in: path
 *         name: season_diary_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season diary id
 *     responses:
 *       200:
 *         description: Season diary detail retrieved successfully
 *   patch:
 *     tags: [season-diary]
 *     security:
 *       - bearerAuth: []
 *     summary: Update season diary
 *     parameters:
 *       - in: path
 *         name: season_diary_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season diary id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               garden_name:
 *                 type: string
 *               farmer_name:
 *                 type: string
 *               location:
 *                 type: string
 *               longitude:
 *                 type: string
 *               latitude:
 *                 type: string
 *               members:
 *                 type: string
 *               planting_area_code:
 *                 type: string
 *               crop_variety:
 *                 type: array
 *                 items:
 *                   type: string
 *               farmer_code:
 *                 type: string
 *               row_bed_count:
 *                 type: number
 *               area:
 *                 type: number
 *               land_use_history:
 *                 type: string
 *     responses:
 *       200:
 *         description: Season diary updated successfully
 *   delete:
 *     tags: [season-diary]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete season diary
 *     description: Delete only when status is In progressing.
 *     parameters:
 *       - in: path
 *         name: season_diary_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season diary id
 *     responses:
 *       200:
 *         description: Season diary deleted successfully
 *
 * /season-diary/{season_diary_id}/finish:
 *   patch:
 *     tags: [season-diary]
 *     security:
 *       - bearerAuth: []
 *     summary: Finish season diary
 *     description: Mark season diary as Completed and set end_date to current datetime.
 *     parameters:
 *       - in: path
 *         name: season_diary_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season diary id
 *     responses:
 *       200:
 *         description: Season diary marked as completed successfully
 */

Router.get('/', authMiddleware.protect, seasonDiaryController.viewSeasonDiaryList);
Router.get(
	'/:season_diary_id',
	authMiddleware.protect,
	seasonDiaryController.viewSeasonDiaryDetail,
);
Router.post('/', authMiddleware.protect, seasonDiaryController.createSeasonDiary);
Router.patch(
	'/:season_diary_id',
	authMiddleware.protect,
	seasonDiaryController.updateSeasonDiary,
);
Router.delete(
	'/:season_diary_id',
	authMiddleware.protect,
	seasonDiaryController.deleteSeasonDiary,
);
Router.patch(
	'/:season_diary_id/finish',
	authMiddleware.protect,
	seasonDiaryController.finishSeasonDiary,
);

export { Router as seasonDiaryRoute };
