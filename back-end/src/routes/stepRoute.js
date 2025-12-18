import express from 'express';
import { stepController } from '@/controllers/stepController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /step:
 *   get:
 *     tags: [step]
 *     security:
 *       - bearerAuth: []
 *     summary: Get all steps
 *     description: Retrieve a list of all steps
 *     responses:
 *       200:
 *         description: A list of steps
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
 *                   example: "Steps retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       parent_id:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       title:
 *                         type: string
 *                         example: "Step 1"
 *                       description:
 *                         type: string
 *                         example: "Description for step 1"
 *                       order_index:
 *                         type: integer
 *                         example: 1
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *                           description: Recursive structure of steps
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *   post:
 *     tags: [step]
 *     summary: Create a new step
 *     description: Create a new step
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               parent_id:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *                 nullable: true
 *               title:
 *                 type: string
 *                 example: "New Step"
 *               description:
 *                 type: string
 *                 example: "Description for new step"
 *     responses:
 *       201:
 *         description: Step created successfully
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
 *                   example: "Step created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     parent_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     title:
 *                       type: string
 *                       example: "New Step"
 *                     description:
 *                       type: string
 *                       example: "Description for new step"
 *                     order_index:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /step/{id}:
 *   get:
 *     tags: [step]
 *     summary: Get step by ID
 *     description: Retrieve a step by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The step ID
 *     responses:
 *       200:
 *         description: Step retrieved successfully
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
 *                   example: "Step retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     parent_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     title:
 *                       type: string
 *                       example: "Step 1"
 *                     description:
 *                       type: string
 *                       example: "Description for step 1"
 *                     order_index:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Step not found
 *   patch:
 *     tags: [step]
 *     summary: Update a step
 *     description: Update a step by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Step Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Step updated successfully
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
 *                   example: "Step updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     title:
 *                       type: string
 *                       example: "Updated Step Title"
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Step not found
 *   delete:
 *     tags: [step]
 *     summary: Delete a step
 *     description: Delete a step by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The step ID
 *     responses:
 *       200:
 *         description: Step deleted successfully
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
 *                   example: "Step deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     parent_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     title:
 *                       type: string
 *                       example: "Step 1"
 *                     description:
 *                       type: string
 *                       example: "Description for step 1"
 *                     order_index:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 */

Router.get('/', authMiddleware.protect, stepController.getAllSteps);
Router.post('/', authMiddleware.protect, authorizationMiddleware.isAdmin, stepController.createStep);
Router.get('/:id', stepController.getStepById);
Router.patch('/:id', stepController.updateStep);
Router.delete('/:id', stepController.deleteStep);

export { Router as stepRoute };
