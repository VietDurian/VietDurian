import express from "express";
import * as packagingHandlingController from "@/controllers/packagingHandlingController";
import { authMiddleware } from '@/middlewares/authentication';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PackagingHandling
 *   description: Quản lý xử lý đóng gói
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PackagingHandling:
 *       type: object
 *       required:
 *         - season_diary_id
 *         - handling_date
 *         - packaging_type
 *         - storage_location
 *         - treatment_method
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f7a1b2c3d4e5f6g7h8i9j0
 *         season_diary_id:
 *           type: string
 *           example: 65f7a1b2c3d4e5f6g7h8i9j0
 *         handling_date:
 *           type: string
 *           format: date-time
 *           example: 2025-03-13T10:00:00Z
 *         packaging_type:
 *           type: string
 *           example: Thùng chứa thuốc dư thừa
 *         storage_location:
 *           type: string
 *           example: Kho phía Bắc
 *         treatment_method:
 *           type: string
 *           example: Đốt
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/packaging-handling:
 *   post:
 *     summary: Tạo bản ghi xử lý đóng gói
 *     tags: [PackagingHandling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackagingHandling'
 *           example:
 *             season_diary_id: 65f7a1b2c3d4e5f6g7h8i9j0
 *             handling_date: 2025-03-13T10:00:00Z
 *             packaging_type: Thùng chứa thuốc dư thừa
 *             storage_location: Kho phía Bắc
 *             treatment_method: Đốt
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackagingHandling'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post("/", authMiddleware.protect, packagingHandlingController.create);

/**
 * @swagger
 * /api/packaging-handling:
 *   get:
 *     summary: Lấy danh sách xử lý đóng gói
 *     tags: [PackagingHandling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: season_diary_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID nhật ký mùa vụ
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số bản ghi trên trang
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Số bản ghi bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách bản ghi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PackagingHandling'
 *       401:
 *         description: Chưa xác thực
 */
router.get("/", authMiddleware.protect, packagingHandlingController.list);

/**
 * @swagger
 * /api/packaging-handling/{id}:
 *   get:
 *     summary: Xem chi tiết xử lý đóng gói
 *     tags: [PackagingHandling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bản ghi
 *     responses:
 *       200:
 *         description: Thông tin bản ghi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackagingHandling'
 *       404:
 *         description: Không tìm thấy
 *       401:
 *         description: Chưa xác thực
 */
router.get("/:id", authMiddleware.protect, packagingHandlingController.detail);

/**
 * @swagger
 * /api/packaging-handling/{id}:
 *   put:
 *     summary: Cập nhật xử lý đóng gói
 *     tags: [PackagingHandling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bản ghi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackagingHandling'
 *           example:
 *             handling_date: 2025-03-13T10:00:00Z
 *             packaging_type: Thùng chứa thuốc dư thừa
 *             storage_location: Kho phía Nam
 *             treatment_method: Chôn
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackagingHandling'
 *       404:
 *         description: Không tìm thấy
 *       401:
 *         description: Chưa xác thực
 */
router.put("/:id", authMiddleware.protect, packagingHandlingController.update);

/**
 * @swagger
 * /api/packaging-handling/{id}:
 *   delete:
 *     summary: Xóa xử lý đóng gói
 *     tags: [PackagingHandling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bản ghi
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy
 *       401:
 *         description: Chưa xác thực
 */
router.delete("/:id", authMiddleware.protect, packagingHandlingController.remove);

export const packagingHandlingRoute = router;
