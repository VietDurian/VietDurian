import express from "express";
import * as packagingHandlingController from "@/controllers/packagingHandlingController";
import { authMiddleware } from '@/middlewares/authentication';

const router = express.Router();

/**
 * @swagger
 * /packaging-handling:
 *   post:
 *     tags: [packaging-handling]
 *     security:
 *       - bearerAuth: []
 *     summary: Tạo bản ghi xử lý đóng gói
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season_diary_id
 *               - handling_date
 *               - packaging_type
 *               - storage_location
 *               - treatment_method
 *             properties:
 *               season_diary_id:
 *                 type: string
 *                 example: "67f13a9f2d8b6a0012c9a101"
 *               handling_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-16T07:00:00.000Z"
 *               packaging_type:
 *                 type: string
 *                 example: "Thung carton"
 *               storage_location:
 *                 type: string
 *                 example: "Kho A - Cho Lach"
 *               treatment_method:
 *                 type: string
 *                 example: "Khu trung va dong goi hut am"
 *     responses:
 *       201:
 *         description: Tạo bản ghi xử lý đóng gói thành công
 *   get:
 *     tags: [packaging-handling]
 *     security:
 *       - bearerAuth: []
 *     summary: Lấy danh sách xử lý đóng gói (phân trang)
 *     parameters:
 *       - in: query
 *         name: season_diary_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID nhật ký mùa vụ
 *         example: "67f13a9f2d8b6a0012c9a101"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *         description: Số lượng bản ghi lấy ra
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Số lượng bản ghi bỏ qua
 *     responses:
 *       200:
 *         description: Lấy danh sách xử lý đóng gói thành công
 *       404:
 *         description: Nhật ký mùa vụ không tồn tại
 *
 * /packaging-handling/{id}:
 *   put:
 *     tags: [packaging-handling]
 *     security:
 *       - bearerAuth: []
 *     summary: Cập nhật bản ghi xử lý đóng gói
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bản ghi xử lý đóng gói
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               handling_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-18T07:00:00.000Z"
 *               packaging_type:
 *                 type: string
 *                 example: "Tui luoi"
 *               storage_location:
 *                 type: string
 *                 example: "Kho B - Cai Mon"
 *               treatment_method:
 *                 type: string
 *                 example: "Xu ly lanh truoc khi van chuyen"
 *     responses:
 *       200:
 *         description: Cập nhật bản ghi xử lý đóng gói thành công
 *
 *   delete:
 *     tags: [packaging-handling]
 *     security:
 *       - bearerAuth: []
 *     summary: Xóa bản ghi xử lý đóng gói
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bản ghi xử lý đóng gói
 *     responses:
 *       200:
 *         description: Xóa bản ghi xử lý đóng gói thành công
 */

router.post("/", authMiddleware.protect, packagingHandlingController.create);

router.get("/", authMiddleware.protect, packagingHandlingController.list);

router.put("/:id", authMiddleware.protect, packagingHandlingController.update);

router.delete("/:id", authMiddleware.protect, packagingHandlingController.remove);

export const packagingHandlingRoute = router;
