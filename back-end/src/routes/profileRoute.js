import express from "express";
const { profileController } = require("../controllers/profileController");
import { authMiddleware } from "../middlewares/authentication";
const Router = express.Router();

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     role:
 *                       type: string
 *                     is_banned:
 *                       type: boolean
 *                     isVerify:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /profile/update:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /profile/public/{userId}:
 *   get:
 *     summary: Get public profile of a user
 *     description: Retrieve the public profile information of another user (accessible without authentication)
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose public profile to retrieve
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Public profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: User ID is required
 *       404:
 *         description: User not found
 */
Router.get("/me", authMiddleware, profileController.getProfile);
Router.put("/update", authMiddleware, profileController.updateProfile);
Router.get("/public/:userId", profileController.getPublicProfile);

export const profileRoute = Router;
