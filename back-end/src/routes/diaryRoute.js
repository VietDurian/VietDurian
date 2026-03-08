import express from 'express';
import { diaryController } from '@/controllers/diaryController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /diary:
 *   get:
 *     summary: Get all diaries by user
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: garden_id
 *         schema:
 *           type: string
 *           description: Filter by garden ID
 *           example: 66a002222222222222222222
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by start_date year (e.g. 2024)
 *         example: 2025
 *     responses:
 *       200:
 *         description: Diaries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Diaries retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Diary'
 */

/**
 * @swagger
 * /diary:
 *   post:
 *     summary: Create a new diary
 *     description: Create a new diary and automatically initialize diary steps based on parent steps.
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - garden_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: Vụ sầu riêng Dona 2025
 *               description:
 *                 type: string
 *                 example: Mô tả về vụ sầu riêng Dona 2025
 *               garden_id:
 *                 type: string
 *                 example: 66a002222222222222222222
 *     responses:
 *       201:
 *         description: Diary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Diary created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Diary'
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Diary title is required
 *       409:
 *         description: Diary title already exists in the same garden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Tên nhật ký đã tồn tại trong vườn này
 */

/**
 * @swagger
 * /diary/{diaryId}:
 *   get:
 *     summary: Get diary details
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Diary ID
 *     responses:
 *       200:
 *         description: Diary details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Diary details retrieved successfully
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Diary'
 *                     - type: object
 *                       properties:
 *                         stages:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               stage_id:
 *                                 type: string
 *                               stage_title:
 *                                 type: string
 *                               stage_description:
 *                                 type: string
 *                               order_index:
 *                                 type: integer
 *                               steps:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/DiaryStep'
 *       404:
 *         description: Diary not found
 */

/**
 * @swagger
 * /diary/{diaryId}:
 *   patch:
 *     summary: Update a diary (general info)
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Diary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Vụ sầu riêng Dona 2025 - Cập nhật
 *               description:
 *                 type: string
 *                 example: Mô tả về vụ sầu riêng Dona 2025 - Cập nhật
 *     responses:
 *       200:
 *         description: Diary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Diary updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Diary'
 */

/**
 * @swagger
 * /diary/{diaryId}:
 *   delete:
 *     summary: Delete a diary
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Diary ID
 *     responses:
 *       200:
 *         description: Diary deleted successfully
 *       404:
 *         description: Diary not found
 */

/**
 * @swagger
 * /diary/{diaryId}/step:
 *   post:
 *     summary: Add a new step to a diary
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the diary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action_type
 *               - step_name
 *             properties:
 *               stage_id:
 *                 type: string
 *                 description: The ID of the stage (step template)
 *                 example: 6965ea23a28794347e5a459c
 *               action_type:
 *                 type: string
 *                 enum: [Vật tư, Công việc, Chỉ số]
 *                 example: Vật tư
 *               step_name:
 *                 type: string
 *                 example: Mua 24 bao phân NPK
 *               description:
 *                 type: string
 *                 example: Mô tả về bước nhật ký
 *               cost:
 *                 type: number
 *                 example: 500000
 *               item_name:
 *                 type: string
 *                 example: Phân NPK 16-16-8
 *               dosage:
 *                 type: string
 *                 example: 200ml/phuy
 *               supplier:
 *                 type: string
 *                 example: Đại lý Nông Nghiệp A
 *               image:
 *                 type: string
 *                 example: https://res.cloudinary.com/di6lwnmsm/image/upload/v1769954669/bao-pp-phan-bon-3_vued15.jpg
 *     responses:
 *       201:
 *         description: Diary step added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Diary step added successfully
 *                 data:
 *                   $ref: '#/components/schemas/DiaryStep'
 */

/**
 * @swagger
 * /diary/step/{stepId}:
 *   patch:
 *     summary: Update a diary step
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the diary step to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action_type:
 *                 type: string
 *                 enum: [Vật tư, Công việc, Chỉ số]
 *                 example: Công việc
 *               step_name:
 *                 type: string
 *                 example: Cập nhật tên bước nhật ký
 *               description:
 *                 type: string
 *                 example: Cập nhật mô tả về bước nhật ký
 *               cost:
 *                 type: number
 *                 example: 600000
 *               item_name:
 *                 type: string
 *                 example: Thuốc nấm Ridomil Gold
 *               dosage:
 *                 type: string
 *                 example: 100g/bình 25 lít
 *               supplier:
 *                 type: string
 *                 example: Đại lý VTNN B
 *               image:
 *                 type: string
 *                 example: https://res.cloudinary.com/di6lwnmsm/image/upload/v1769954669/bao-pp-phan-bon-3_vued15.jpg
 *     responses:
 *       200:
 *         description: Diary step updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Diary step updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/DiaryStep'
 */

/**
 * @swagger
 * /diary/step/{stepId}:
 *   delete:
 *     summary: Delete a diary step
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the diary step
 *     responses:
 *       200:
 *         description: Diary step deleted successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Diary:
 *       type: object
 *       required:
 *         - user_id
 *         - garden_id
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         garden_id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [In progressing, Completed]
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         weight_durian:
 *           type: number
 *         price:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     DiaryStep:
 *       type: object
 *       required:
 *         - diary_id
 *         - action_type
 *         - step_name
 *       properties:
 *         _id:
 *           type: string
 *         diary_id:
 *           type: string
 *         stage_id:
 *           type: string
 *         action_type:
 *           type: string
 *           enum: [Vật tư, Công việc, Chỉ số]
 *         step_name:
 *           type: string
 *         description:
 *           type: string
 *         cost:
 *           type: number
 *         item_name:
 *           type: string
 *         dosage:
 *           type: string
 *         supplier:
 *           type: string
 *         image:
 *           type: string
 *         action_date:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
Router.post(
	'/:diaryId/step',
	authMiddleware.protect,
	diaryController.addDiaryStep,
);

Router.get(
	'/',
	authMiddleware.protect,
	authorizationMiddleware.isFarmer,
	diaryController.getDiariesByUser,
);

Router.post('/', authMiddleware.protect, diaryController.createDiary);

Router.get(
	'/:diaryId',
	authMiddleware.protect,
	diaryController.getDiaryDetails,
);

Router.patch(
	'/step/:stepId',
	authMiddleware.protect,
	diaryController.updateDiaryStep,
);

Router.patch('/:diaryId', authMiddleware.protect, diaryController.updateDiary);

/**
 * @swagger
 * /diary/{diaryId}/finish:
 *   patch:
 *     summary: Mark a diary as completed (requires weight and price)
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Diary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weight_durian
 *               - price
 *             properties:
 *               weight_durian:
 *                 type: number
 *                 example: 1200
 *               price:
 *                 type: number
 *                 example: 45000
 *     responses:
 *       200:
 *         description: Diary marked as completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Diary marked as completed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Diary'
 */
Router.patch(
	'/:diaryId/finish',
	authMiddleware.protect,
	diaryController.finishDiary,
);

Router.delete('/:diaryId', authMiddleware.protect, diaryController.deleteDiary);
Router.delete(
	'/step/:stepId',
	authMiddleware.protect,
	diaryController.deleteDiaryStep,
);

Router.get(
	'/:diaryId/statistics',
	authMiddleware.protect,
	diaryController.statisticsDiary,
);

export { Router as diaryRoute };

/**
 * @swagger
 * /diary/{diaryId}/statistics:
 *   get:
 *     summary: Get diary statistics (revenue, cost, profit)
 *     tags: [diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Diary ID
 *     responses:
 *       200:
 *         description: Diary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Diary statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     diary_id:
 *                       type: string
 *                     total_cost:
 *                       type: number
 *                       example: 1500000
 *                     total_revenue:
 *                       type: number
 *                       example: 54000000
 *                     profit:
 *                       type: number
 *                       example: 52500000
 */
