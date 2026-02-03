/** Vo Lam Thuy Vi */
import express from "express";
const { authController } = require("../controllers/authController");
import { authMiddleware } from "../middlewares/authentication";
const Router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new account
 *     description: Create new user account and send OTP verification via email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *               role:
 *                 type: string
 *                 enum: [trader, farmer, admin]
 *                 example: "trader"
 *     responses:
 *       201:
 *         description: Registration successful
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
 *                   example: "User registered successfully. Please verify your email."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     token:
 *                       type: string
 *                     otp:
 *                       type: string
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email
 *     description: Verify account with OTP sent to email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: "Email verified successfully"
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Email not found
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Login with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Logged in successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid email or password
 *       401:
 *         description: Incorrect email or password
 *       403:
 *         description: Account is locked or email not verified
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logout user and blacklist current token
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: "Logged out successfully"
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Send OTP to user's email for password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent to email (if the email exists)
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
 *                   example: "OTP sent to your email if it exists"
 *       400:
 *         description: Email is required
 *       404:
 *         description: Email not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /auth/verify-reset-otp:
 *   post:
 *     summary: Verify reset OTP
 *     description: Verify OTP sent to email for password reset and return a short-lived reset token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified; reset token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Email not found
 */
/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset Password
 *     description: Reset user password with valid reset token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Password reset token sent to email
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid input or passwords do not match
 *       401:
 *         description: Invalid or expired reset token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Login with Google
 *     description: Login user using Google OAuth token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4YTJjNzcxNjYwNzI5ZmE1Yzc4N2Y5Y2Y3YTc2NjI4MmM1ZDY3ZDEiLCJ0eXAiOiJKV1QifQ..."
 *                 description: Google OAuth ID token from Google Sign-In
 *     responses:
 *       200:
 *         description: Google login successful
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
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         isVerify:
 *                           type: boolean
 *                           example: true
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *       400:
 *         description: Google token is required
 *       401:
 *         description: Invalid Google token
 */

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     description: Change current user's password (requires JWT Bearer token)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request (missing/invalid fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *       401:
 *         description: Unauthorized (missing/invalid token OR wrong current password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not authorized to access this route"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 */

// Register new user
Router.post("/register", authController.register);
Router.post("/verify-email", authController.verifyEmail);
// Login
Router.post("/login", authController.login);
Router.post("/logout", authMiddleware.protect, authController.logout);
// Forgot password and reset password
Router.post("/forgot-password", authController.forgotPassword);
Router.post("/verify-reset-otp", authController.verifyResetOtp);
Router.post("/reset-password/:token", authController.resetPassword);
// Google login
Router.post("/google-login", authController.googleLogin);
//change password
Router.post(
  "/change-password",
  authMiddleware.protect,
  authController.changePassword,
);

Router.get("/check", authController.checkAuth);

export const authRoute = Router;
