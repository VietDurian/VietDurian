import express from 'express';
import { typeProductController } from '@/controllers/typeProductController';

const Router = express.Router();

/**
 * @swagger
 * /api/v1/type-product:
 *   get:
 *     tags: [type-product]
 *     summary: Get all type products
 *     description: Retrieve a list of all type products
 *     responses:
 *       200:
 *        description: A list of type products
 *        content: 
 *         application/json:
 *          schema:
 *          type: object
 *          properties:
 *           code:
 *            type: integer
 *            example: 200
 *            message:
 *            type: string
 *            example: "Type products retrieved successfully
 *            data:
 *              type: array
 *              properties:
 *               _id:
 *                  type: string
 *                  example: "64a7f0c2e1b2c3d4e5f67890"
 *           
 */

Router.get('/', typeProductController.getAllTypeProducts);

export { Router as typeProductRoute };