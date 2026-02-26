import express from 'express';
import { gardenController } from '../controllers/gardenController.js';
import { authMiddleware } from '../middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';

const Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Garden:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của vườn
 *         user_id:
 *           type: string
 *           description: ID chủ vườn
 *         name:
 *           type: string
 *           description: Tên vườn
 *         crop_type:
 *           type: string
 *           description: Loại cây trồng
 *         area:
 *           type: number
 *           description: Diện tích (m2)
 *         location:
 *           type: string
 *           description: Tên vị trí vườn
 *         longitude:
 *           type: number
 *         latitude:
 *           type: number
 *         description:
 *           type: string
 *         image:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - crop_type
 *         - area
 *         - location
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Error message
 *
 * /garden/map:
 *   get:
 *     summary: Xem bản đồ vườn (chỉ admin)
 *     tags: [gardens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Garden'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

Router.get(
	'/map',
	authMiddleware.protect,
	authorizationMiddleware.isAdmin,
	gardenController.viewMap,
);

Router.post(
	'/geocode',
	authMiddleware.protect,
	authorizationMiddleware.isAdmin,
	gardenController.geocodeGardens,
);

/**
 * @swagger
 * /garden/{garden_id}:
 *   get:
 *     summary: Lấy chi tiết vườn theo ID
 *     tags: [gardens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garden_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của vườn
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Garden'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Không tìm thấy vườn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
Router.get(
	'/:garden_id',
	authMiddleware.protect,
	gardenController.getGardenDetails,
);

/**
 * @swagger
 * /garden/user/{user_id}:
 *   get:
 *     summary: Xem danh sách vườn của người dùng bất kỳ
 *     tags: [gardens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người dùng
 *         example: 69429eee21eeba96cd1c3f71
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Garden'
 */
Router.get(
	'/user/:user_id',
	authMiddleware.protect,
	gardenController.getUserGardens,
);

/**
 * @swagger
 * /garden:
 *   post:
 *     summary: Đăng ký vườn mới (chỉ farmer)
 *     tags: [gardens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - crop_type
 *               - area
 *               - location
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên vườn
 *                 example: Vườn sầu riêng Cái Mơn
 *               crop_type:
 *                 type: [string]
 *                 description: Loại cây trồng (có thể là nhiều loại)
 *                 example: ["Sầu riêng Ri6", "Sầu riêng Musang King"]
 *               area:
 *                 type: number
 *                 description: Diện tích vườn (m2)
 *                 example: 500
 *               location:
 *                 type: string
 *                 description: Vị trí vườn (tên)
 *                 example: Cái Mơn, Bến Tre
 *               longitude:
 *                 type: number
 *                 description: Kinh độ
 *                 example: 106.4567
 *               latitude:
 *                 type: number
 *                 description: Vĩ độ
 *                 example: 10.1234
 *               description:
 *                 type: string
 *                 description: Mô tả thêm
 *                 example: Vườn có hệ thống tưới tiêu tự động và chăm sóc theo tiêu chuẩn hữu cơ.
 *               image:
 *                 type: string
 *                 description: URL hình ảnh của vườn
 *                 example: https://res.cloudinary.com/di6lwnmsm/image/upload/v1771911818/vietdurian/pgs5xaqvjp5iplzlymcz.jpg
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Garden'
 */
Router.post(
	'/',
	authMiddleware.protect,
	authorizationMiddleware.isFarmer,
	gardenController.registerGarden,
);

/**
 * @swagger
 * /garden/{garden_id}:
 *   patch:
 *     summary: Chỉnh sửa thông tin vườn (chỉ farmer)
 *     tags: [gardens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garden_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của vườn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên vườn
 *                 example: Vườn sầu riêng Cái Mơn cập nhật
 *               crop_type:
 *                 type: [string]
 *                 description: Loại cây trồng (có thể là nhiều loại)
 *                 example: ["Sầu riêng Ri6 cập nhật", "Sầu riêng Musang King cập nhật"]
 *               area:
 *                 type: number
 *                 description: Diện tích vườn (m2)
 *                 example: 600
 *               location:
 *                 type: string
 *                 description: Vị trí vườn (tên)
 *                 example: Cái Mơn, Bến Tre cập nhật
 *               longitude:
 *                 type: number
 *                 description: Kinh độ
 *                 example: 106.5678
 *               latitude:
 *                 type: number
 *                 description: Vĩ độ
 *                 example: 10.2345
 *               description:
 *                 type: string
 *                 description: Mô tả thêm
 *               image:
 *                 type: string
 *                 description: URL hình ảnh của vườn
 *                 example: https://res.cloudinary.com/di6lwnmsm/image/upload/v1771911818/vietdurian/pgs5xaqvjp5iplzlymcz.jpg
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
Router.patch(
	'/:garden_id',
	authMiddleware.protect,
	authorizationMiddleware.isFarmer,
	gardenController.editGarden,
);

/**
 * @swagger
 * /garden/{garden_id}:
 *   delete:
 *     summary: Xóa vườn (chỉ farmer)
 *     tags: [gardens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garden_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của vườn
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Garden deleted successfully
 */
Router.delete(
	'/:garden_id',
	authMiddleware.protect,
	authorizationMiddleware.isFarmer,
	gardenController.deleteGarden,
);

export const gardenRoute = Router;
