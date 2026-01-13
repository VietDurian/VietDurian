import express from "express";
import { ratingController } from "@/controllers/ratingController.js";
import { authMiddleware } from "@/middlewares/authentication.js";
import { authorizationMiddleware } from "@/middlewares/authorization.js";

const Router = express.Router();

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create Rating
 *     description: Submit a rating (1-5 stars) for a product
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - stars
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               content:
 *                 type: string
 *                 example: "Great quality product! Highly recommended."
 *     responses:
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input or user already rated this product
 *       401:
 *         description: User not authenticated
 */

/**
 * @swagger
 * /ratings/product/{productId}:
 *   get:
 *     summary: View Rating
 *     description: Display rating information including average score, total ratings, and distribution
 *     tags:
 *       - Ratings
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *     responses:
 *       200:
 *         description: Product ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalRatings:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     ratingDistribution:
 *                       type: object
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Product ID is required
 */

/**
 * @swagger
 * /ratings/product/{productId}/my-rating:
 *   get:
 *     summary: Get User's Rating for Product
 *     description: Retrieve the current user's rating for a specific product
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User rating retrieved successfully
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Rating not found
 */

/**
 * @swagger
 * /ratings/{ratingId}:
 *   put:
 *     summary: Update Rating
 *     description: Edit your previous rating for a product
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               content:
 *                 type: string
 *                 example: "Good product, but delivery was slow"
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: You can only update your own ratings
 *       404:
 *         description: Rating not found
 */

/**
 * @swagger
 * /ratings/{ratingId}:
 *   delete:
 *     summary: Delete Rating
 *     description: Remove your rating from a product
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: You can only delete your own ratings
 *       404:
 *         description: Rating not found
 */

/**
 * @swagger
 * /ratings/user/my-ratings:
 *   get:
 *     summary: Get User's All Ratings
 *     description: Retrieve all ratings submitted by the current user
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User ratings retrieved successfully
 *       401:
 *         description: User not authenticated
 */
Router.post(
  "/",
  authMiddleware.protect,
  authorizationMiddleware.restrictTo(
    "farmer",
    "trader",
    "serviceProvider",
    "contentExpert"
  ),
  ratingController.createRating
);
Router.get("/product/:productId", ratingController.getProductRatings);
Router.put(
  "/:ratingId",
  authMiddleware.protect,
  authorizationMiddleware.restrictTo(
    "farmer",
    "trader",
    "serviceProvider",
    "contentExpert"
  ),
  ratingController.updateRating
);
Router.get(
  "/product/:productId/my-rating",
  authMiddleware.protect,
  authorizationMiddleware.isUser,
  ratingController.getUserProductRating
);

Router.get(
  "/user/my-ratings",
  authMiddleware.protect,
  authorizationMiddleware.isUser,
  ratingController.getUserRatings
);
Router.delete(
  "/:ratingId",
  authMiddleware.protect,
  authorizationMiddleware.restrictTo(
    "farmer",
    "trader",
    "serviceProvider",
    "contentExpert"
  ),
  ratingController.deleteRating
);

export const ratingRoute = Router;
