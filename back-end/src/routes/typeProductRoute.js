import express from 'express';
import { typeProductController } from '@/controllers/typeProductController';

const Router = express.Router();

/**
 * @swagger
 * /type-product:
 *   get:
 *     tags: [type-product]
 *     summary: Get all type products
 *     description: Retrieve a list of all type products
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by type product name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: A list of type products
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
 *                   example: "Type products retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64a7f0c2e1b2c3d4e5f67890"
 *                       name:
 *                         type: string
 *                         example: "Durian"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-01T12:00:00Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-01T12:00:00Z"
 *   post:
 *     tags: [type-product]
 *     summary: Create a new type product
 *     description: Create a new type product with the provided name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Durian"
 *               description:
 *                 type: string
 *                 example: "A tropical fruit known for its strong odor."
 *     responses:
 *       201:
 *         description: Type product created successfully
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
 *                   example: "Type product created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64a7f0c2e1b2c3d4e5f67890"
 *                     name:
 *                       type: string
 *                       example: "Durian"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00Z"
 *   patch:
 *     tags: [type-product]
 *     summary: Update a type product
 *     description: Update the name of an existing type product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64a7f0c2e1b2c3d4e5f67890"
 *               name:
 *                 type: string
 *                 example: "Updated Durian"
 *               description:
 *                 type: string
 *                 example: "A tropical fruit known for its strong odor."
 *     responses:
 *       200:
 *         description: Type product updated successfully
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
 *                   example: "Type product updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64a7f0c2e1b2c3d4e5f67890"
 *                     name:
 *                       type: string
 *                       example: "Updated Durian"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-01T12:00:00Z"
 *   delete:
 *     tags: [type-product]
 *     summary: Delete a type product
 *     description: Delete a type product by ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64a7f0c2e1b2c3d4e5f67890"
 *     responses:
 *       200:
 *         description: Type product deleted successfully
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
 *                   example: "Type product deleted successfully"
 */

Router.get('/', typeProductController.getAllTypeProducts);
Router.post('/', typeProductController.createTypeProduct);
Router.patch('/:id', typeProductController.updateTypeProduct);
Router.delete('/:id', typeProductController.deleteTypeProduct);

export { Router as typeProductRoute };
