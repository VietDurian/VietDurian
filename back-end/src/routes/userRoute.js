// Vo Lam Thuy Vi
import express from "express";
import { userController } from "../controllers/userController.js";
import { authMiddleware } from '@/middlewares/authentication';
import { authorizationMiddleware } from '@/middlewares/authorization';


const Router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Only admin can access
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve user details by ID
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/ban/{id}:
 *   patch:
 *     summary: Toggle user ban status
 *     description: Lock or unlock user account (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_banned
 *             properties:
 *               is_banned:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Ban status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: is_banned must be boolean
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Only admin can access
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/search/{keyword}:
 *   get:
 *     summary: Search users
 *     description: Search users by name or email (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (name or email)
 *         example: "john"
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Only admin can access
 */

/**
 * @swagger
 * /api/users/filter:
 *   get:
 *     summary: Filter users
 *     description: Filter users by role and/or ban status (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, trader, farmer, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: is_banned
 *         schema:
 *           type: boolean
 *         description: Filter by ban status (true or false)
 *     responses:
 *       200:
 *         description: Filtered users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Only admin can access
 */

/**
 * @swagger
 * /api/users/sort:
 *   get:
 *     summary: Sort users
 *     description: Get users sorted by specified field (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by (e.g., createdAt, name, email)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Sorted users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Only admin can access
 */
Router.get(
  "/",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  userController.getAllUsers
);
Router.get(
  "/:id",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  userController.getUserById
);
Router.patch(
  "/ban/:id",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  userController.toggleBan
);
Router.get(
  "/search/:keyword",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  userController.searchUser
);
Router.get(
  "/filter",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  userController.filterUsers
);
Router.get(
  "/sort",
  authMiddleware.protect,
  authorizationMiddleware.isAdmin,
  userController.sortUsers
);

export { Router as userRoute };