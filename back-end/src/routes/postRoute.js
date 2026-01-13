import express from 'express';
import { postController } from '@/controllers/postController';
import { authMiddleware } from '@/middlewares/authentication';

const Router = express.Router();

/**
 * @swagger
 * /post/general:
 *   get:
 *     tags: [post]
 *     summary: Get general blogs
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a list of general blogs
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [progressing, active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác']
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by content
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         description: Sort by creation date
 *       - in: query
 *         name: author_id
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *     responses:
 *       200:
 *         description: A list of general blogs
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
 *                   example: "General blogs retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       category:
 *                         type: string
 *                         enum: ['Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác']
 *                         example: "Dịch vụ"
 *                       content:
 *                         type: string
 *                         example: "General blog content"
 *                       image:
 *                         type: string
 *                         example: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg"
 *                       contact:
 *                         type: string
 *                         example: "contact@example.com"
 *                       author_id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109cb"
 *                       status:
 *                         type: string
 *                         example: "active"
 *   post:
 *     tags: [post]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new general blog
 *     description: Create a new general blog post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - content
 *               - contact
 *             properties:
 *               category:
 *                 type: string
 *                 enum: ['Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác']
 *                 description: "Các loại danh mục: 'Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác'"
 *                 example: "Dịch vụ"
 *               content:
 *                 type: string
 *                 example: "Content of the general blog"
 *               image:
 *                 type: string
 *                 example: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg"
 *               contact:
 *                 type: string
 *                 example: "contact@example.com"
 *     responses:
 *       201:
 *         description: General blog created successfully
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
 *                   example: "General blog created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     category:
 *                       type: string
 *                       example: "Dịch vụ"
 *                     content:
 *                       type: string
 *                       example: "Content of the general blog"
 *                     image:
 *                       type: string
 *                       example: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg"
 *                     contact:
 *                       type: string
 *                       example: "contact@example.com"
 *                     author_id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109cb"
 *                     status:
 *                       type: string
 *                       example: "active"
 *
 * /post/general/{post_id}:
 *   get:
 *     tags: [post]
 *     summary: Get general blog details
 *     description: Retrieve details of a specific general blog
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: General blog details retrieved successfully
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
 *                   example: "General blog details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     category:
 *                       type: string
 *                       example: "Dịch vụ"
 *                     content:
 *                       type: string
 *                       example: "General blog content"
 *                     image:
 *                       type: string
 *                       example: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg"
 *                     contact:
 *                       type: string
 *                       example: "contact@example.com"
 *                     author_id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109cb"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       404:
 *         description: General blog not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "General blog not found"
 *
 * /post/{post_id}/general:
 *   patch:
 *     tags: [post]
 *     security:
 *       - bearerAuth: []
 *     summary: Update a general blog
 *     description: Update an existing general blog post
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: ['Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác']
 *                 description: "Các loại danh mục: 'Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác'"
 *                 example: "Dịch vụ"
 *               content:
 *                 type: string
 *                 example: "Updated content of the general blog"
 *               image:
 *                 type: string
 *                 example: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg"
 *               contact:
 *                 type: string
 *                 example: "updated-contact@example.com"
 *     responses:
 *       200:
 *         description: General blog updated successfully
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
 *                   example: "General blog updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     category:
 *                       type: string
 *                       example: "Dịch vụ"
 *                     content:
 *                       type: string
 *                       example: "Updated content"
 *                     image:
 *                       type: string
 *                       example: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg"
 *                     contact:
 *                       type: string
 *                       example: "updated-contact@example.com"
 *                     status:
 *                       type: string
 *                       example: "active"
 *   delete:
 *     tags: [post]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a general blog
 *     description: Delete a general blog post
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: General blog deleted successfully
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
 *                   example: "General blog deleted successfully"
 *
 * /post/{post_id}/approve-general:
 *   patch:
 *     tags: [post]
 *     security:
 *       - bearerAuth: []
 *     summary: Approve a general blog
 *     description: Approve a general blog post (change status to active)
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: General blog approved successfully
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
 *                   example: "General blog approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     status:
 *                       type: string
 *                       example: "active"
 */

Router.get('/general', authMiddleware.protect, postController.getGeneralPost);
Router.get('/general/:post_id', postController.getGeneralPostDetails);
Router.post(
	'/general',
	authMiddleware.protect,
	postController.createGeneralPost
);
Router.patch(
	'/:post_id/general',
	authMiddleware.protect,
	postController.updateGeneralPost
);
Router.delete(
	'/:post_id/general',
	authMiddleware.protect,
	postController.deleteGeneralPost
);

Router.patch(
	'/:post_id/approve-general',
	authMiddleware.protect,
	postController.approveGeneralPost
);
export { Router as postRoute };
