import express from 'express';
import { blogController } from '@/controllers/blogController';
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * /blog:
 *   get:
 *     tags: [blog]
 *     summary: Get all blogs
 *     security: 
 *       - bearerAuth: []
 *     description: Retrieve a list of all blogs
 *     responses:
 *       200:
 *         description: A list of blogs
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
 *                   example: "Blogs retrieved successfully"
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
 *                         example: "My First Blog Post"
 *                       content:
 *                         type: string
 *                         example: "This is the content of the blog post."
 *                       author_id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109cb"
 *                       image:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *   post:
 *     tags: [blog]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new blog
 *     description: Create a new blog post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - author_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My New Blog Post"
 *               content:
 *                 type: string
 *                 example: "Content of the new blog post"
 *               image:
 *                 type: string
 *                 example: "https://example.com/new-image.jpg"
 *     responses:
 *       201:
 *         description: Blog created successfully
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
 *                   example: "Blog created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     title:
 *                       type: string
 *                       example: "My New Blog Post"
 *                     content:
 *                       type: string
 *                       example: "Content of the new blog post"
 *                     author_id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109cb"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/new-image.jpg"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 */

Router.get('/', authMiddleware.protect, blogController.getAllBlogs);
Router.post('/', authMiddleware.protect, blogController.createBlog);

export { Router as blogRoute };
