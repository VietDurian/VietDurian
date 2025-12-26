import express from 'express';
import { diaryController } from '@/controllers/diaryController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Diary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the diary
 *         user_id:
 *           type: string
 *           description: The user id
 *         title:
 *           type: string
 *           description: The title of the diary
 *         description:
 *           type: string
 *           description: The description of the diary
 *         crop_type:
 *           type: string
 *           description: The crop type
 *         status:
 *           type: string
 *           enum: [In progressing, Completed]
 *           description: The status of the diary
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: The start date of the diary
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: The end date of the diary
 *         quatity_durian:
 *           type: number
 *           description: The quantity of durian
 *         price:
 *           type: number
 *           description: The price
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the diary was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the diary was updated
 *     DiaryStep:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the diary step
 *         diary_id:
 *           type: string
 *           description: The id of the diary
 *         stage_id:
 *           type: string
 *           description: The id of the stage (step template)
 *         step_name:
 *           type: string
 *           description: The name of the step
 *         description:
 *           type: string
 *           description: The description of the step
 *         cost:
 *           type: number
 *           description: The cost associated with this step
 *         image:
 *           type: string
 *           description: Image URL for this step
 *         action_date:
 *           type: string
 *           format: date-time
 *           description: The date this step was performed
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

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
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
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
 *               - crop_type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               crop_type:
 *                 type: string
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
 *     summary: Update a diary
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
 *               description:
 *                 type: string
 *               crop_type:
 *                 type: string
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
Router.get('/', authMiddleware.protect, diaryController.getDiariesByUser);
Router.post('/', authMiddleware.protect, diaryController.createDiary);
Router.get(
	'/:diaryId',
	authMiddleware.protect,
	diaryController.getDiaryDetails
);
Router.patch('/:diaryId', authMiddleware.protect, diaryController.updateDiary);
Router.delete('/:diaryId', authMiddleware.protect, diaryController.deleteDiary);
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
 *               - step_name
 *             properties:
 *               stage_id:
 *                 type: string
 *                 description: The ID of the stage (step template)
 *               step_name:
 *                 type: string
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               image:
 *                 type: string
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
Router.post(
	'/:diaryId/step',
	authMiddleware.protect,
	diaryController.addDiaryStep
);

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
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               image:
 *                 type: string
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
Router.patch(
	'/step/:stepId',
	authMiddleware.protect,
	diaryController.updateDiaryStep
);

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
Router.delete(
	'/step/:stepId',
	authMiddleware.protect,
	diaryController.deleteDiaryStep
);

export { Router as diaryRoute };
