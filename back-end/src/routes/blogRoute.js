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
 *                       example: "1. Chapter 1"
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
 *                             example: "1. Chapter 1"
 *                           content:
 *                             type: string
 *                             example: "Content of chapter 1"
 *                           image:
 *                             type: string
 *                             example: "https://example.com/chapter1.jpg"
 *
 * /blog/knowledge/{blog_id}/block:
 *   post:
 *     tags: [blog]
 *     summary: Create a new knowledge block
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
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
 *                 example: "2. Block Title"
 *               content:
 *                 type: string
 *                 example: "Block Content"
 *               image:
 *                 type: string
 *                 example: "base64 string or url"
 *     responses:
 *       201:
 *         description: Knowledge block created successfully
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
 *                   example: "Knowledge block created successfully"
 *                 data:
 *                   type: object
 *
 * /blog/knowledge/{blog_id}:
 *   delete:
 *     tags: [blog]
 *     summary: Delete a knowledge blog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Knowledge blog deleted successfully
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
 *                   example: "Knowledge blog deleted successfully"
 *   patch:
 *     tags: [blog]
 *     summary: Update a knowledge blog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Blog Title"
 *               content:
 *                 type: string
 *                 example: "Updated Blog Content"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Knowledge blog updated successfully
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
 *                   example: "Knowledge blog updated successfully"
 *
 * /blog/knowledge/block/{block_id}:
 *   delete:
 *     tags: [blog]
 *     summary: Delete a knowledge block
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: block_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The block ID
 *     responses:
 *       200:
 *         description: Knowledge block deleted successfully
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
 *                   example: "Knowledge block deleted successfully"
 *   patch:
 *     tags: [blog]
 *     summary: Update a knowledge block
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: block_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The block ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Block Title"
 *               content:
 *                 type: string
 *                 example: "Updated Block Content"
 *               image:
 *                 type: string
 *                 example: "base64 string or url"
 *     responses:
 *       200:
 *         description: Knowledge block updated successfully
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
 *                   example: "Knowledge block updated successfully"
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
Router.post(
	'/knowledge/:blog_id/block',
	authMiddleware.protect,
	blogController.createKnowledgeBlock
);
Router.patch(
	'/knowledge/:blog_id',
	authMiddleware.protect,
	blogController.updateKnowledgeBlog
);
Router.patch(
	'/knowledge/block/:block_id',
	authMiddleware.protect,
	blogController.updateKnowledgeBlock
);

Router.delete(
	'/knowledge/:blog_id',
	authMiddleware.protect,
	blogController.deleteKnowledgeBlog
);
Router.delete(
	'/knowledge/block/:block_id',
	authMiddleware.protect,
	blogController.deleteKnowledgeBlock
);

export { Router as blogRoute };
