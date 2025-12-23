import express from 'express';
import { blogController } from '@/controllers/blogController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 *
 * /blog/knowledge:
 *   get:
 *     tags: [blog]
 *     summary: Get knowledge blogs
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a list of knowledge blogs with their blocks
 *     responses:
 *       200:
 *         description: A list of knowledge blogs
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
 *                   example: "Knowledge blogs retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       title:
 *                         type: string
 *                         example: "Knowledge Blog Title"
 *                       content:
 *                         type: string
 *                         example: "Introduction content"
 *                       author_id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109cb"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       knowledgeBlocks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             title:
 *                               type: string
 *                               example: "Chapter 1"
 *                             content:
 *                               type: string
 *                               example: "Content of chapter 1"
 *                             image:
 *                               type: string
 *                               example: "https://example.com/img.jpg"
 *   post:
 *     tags: [blog]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new knowledge blog
 *     description: Create a new knowledge blog post with blocks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My New Knowledge Blog"
 *               content:
 *                 type: string
 *                 example: "Introduction to the topic"
 *               knowledgeBlocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Chapter 1"
 *                     content:
 *                       type: string
 *                       example: "Content of chapter 1"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/chapter1.jpg"
 *     responses:
 *       201:
 *         description: Knowledge blog created successfully
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
 *                   example: "Knowledge blog created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     title:
 *                       type: string
 *                       example: "My New Knowledge Blog"
 *                     content:
 *                       type: string
 *                       example: "Introduction to the topic"
 *                     author_id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109cb"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     knowledgeBlocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Chapter 1"
 *                           content:
 *                             type: string
 *                             example: "Content of chapter 1"
 *                           image:
 *                             type: string
 *                             example: "https://example.com/chapter1.jpg"
 */

Router.get(
	'/knowledge',
	authMiddleware.protect,
	blogController.getKnowledgeBlogs
);
Router.post(
	'/knowledge',
	authMiddleware.protect,
	blogController.createKnowledgeBlog
);

export { Router as blogRoute };
