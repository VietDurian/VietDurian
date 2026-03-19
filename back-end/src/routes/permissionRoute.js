// Vo Lam Thuy Vi
import express from "express";
import { permissionController } from "@/controllers/permissionController.js";
import { authMiddleware } from "@/middlewares/authentication.js";
import { authorizationMiddleware } from "@/middlewares/authorization.js";

const Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Permission
 *   description: Manage account upgrade requests (admin only)
 * components:
 *   schemas:
 *     PermissionRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Request ID
 *         user_id:
 *           type: string
 *           description: User ID of requester
 *         requested_role:
 *           type: string
 *           enum: [serviceProvider, contentExpert]
 *         description:
 *           type: string
 *         document:
 *           type: string
 *           description: Proof document URL
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     RejectRequestInput:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           example: Information provided is insufficient
 */

/**
 * @swagger
 * /permission/requests:
 *   get:
 *     summary: Get all permission requests
 *     description: Returns list of permission requests with user info. Admin only.
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission requests retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PermissionRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /permission/requests/search:
 *   get:
 *     summary: Search permission requests
 *     description: Search by requester name/email and filter by status. Admin only.
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by full name or email (case-insensitive)
 *     responses:
 *       200:
 *         description: Permission requests searched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PermissionRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /permission/requests/sort:
 *   get:
 *     summary: Sort permission requests by created time
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort by created_at
 *     responses:
 *       200:
 *         description: Permission requests sorted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PermissionRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /permission/requests/{request_id}:
 *   get:
 *     summary: Get permission request detail
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission request detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PermissionRequest'
 *       404:
 *         description: Permission request not found
 */

/**
 * @swagger
 * /permission/requests/{request_id}/confirm:
 *   post:
 *     summary: Admin xác nhận duyệt proofs của permission request
 *     description: Admin kiểm tra proofs (cccd_front, cccd_back, certificate) và xác nhận hợp lệ. Không đổi role user, chỉ cập nhật trạng thái request thành approved.
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission request approved successfully (proofs verified)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PermissionRequest'
 *       400:
 *         description: Request already processed, proofs thiếu hoặc không hợp lệ
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /permission/requests/{request_id}/reject:
 *   post:
 *     summary: Reject a permission request
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectRequestInput'
 *     responses:
 *       200:
 *         description: Account upgrade rejected successfully
 *       400:
 *         description: Request already processed or invalid
 *       404:
 *         description: Request not found
 */
/**
 * @swagger
 * /permission/requests/proofs:
 *   post:
 *     summary: Submit or update proof documents for pending request
 *     description: Authenticated users attach CCCD front/back images (and optional extra proofs) to their own pending permission request.
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proofs
 *             properties:
 *               proofs:
 *                 type: array
 *                 minItems: 2
 *                 description: Proof documents, requires both CCCD sides
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [cccd_front, cccd_back, certificate, other]
 *                     url:
 *                       type: string
 *                       format: uri
 *                 example:
 *                   - type: cccd_front
 *                     url: "https://cdn.example.com/cccd-front.jpg"
 *                   - type: cccd_back
 *                     url: "https://cdn.example.com/cccd-back.jpg"
 *                   - type: certificate
 *                     url: "https://cdn.example.com/certificate.jpg"
 *     responses:
 *       200:
 *         description: Proofs submitted successfully
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
 *                   example: "Proofs submitted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PermissionRequest'
 *       400:
 *         description: CCCD front/back missing or invalid payload
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pending permission request not found
 */
/**
 * @swagger
 * /permission/my-account/approved:
 *   get:
 *     summary: Check current account approval status
 *     description: Authenticated users verify whether their own upgrade request was approved.
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval status retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     approved:
 *                       type: boolean
 *                       description: Indicates whether the account has approved roles
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Permission request not found
 */
Router.post(
  "/requests/proofs",
  authMiddleware.protect,
  permissionController.submitProofs,
);

Router.post(
  "/upload-proof",
  authMiddleware.protect,
  permissionController.uploadProof,
);

Router.get(
  "/requests",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  permissionController.getPermissionRequests,
);
Router.get(
  "/requests/search",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  permissionController.searchPermissionRequests,
);
Router.get(
  "/requests/sort",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  permissionController.sortPermissionRequests,
);
Router.post(
  "/requests/:request_id/confirm",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  permissionController.confirmAccount,
);
Router.get(
  "/requests/:request_id",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  permissionController.getPermissionRequestDetail,
);
Router.patch(
  "/requests/:request_id/reject",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  permissionController.rejectAccount,
);
Router.get(
  "/my-account/approved",
  authMiddleware.protect,
  permissionController.isMyAccountApproved,
);

export const permissionRoute = Router;
