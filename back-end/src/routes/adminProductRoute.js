import express from "express";
import { adminProductController } from "@/controllers/adminProductController.js";
import { authMiddleware } from "@/middlewares/authentication.js";
import { authorizationMiddleware } from "@/middlewares/authorization.js";

const Router = express.Router();

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Admin - Get all products with search, filter, and sort
 *     description: Retrieve all products for admin dashboard with pagination and optional filters.
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: string
 *         description: Filter by product type ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by owner (user) ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, name, view_count, rating]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */


/**
 * @swagger
 * /admin/products/search:
 *   get:
 *     summary: Admin - Search products
 *     description: Search products by keyword with pagination.
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
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
 *         description: Products searched successfully
 *       400:
 *         description: keyword is required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */

/**
 * @swagger
 * /admin/products/filter:
 *   get:
 *     summary: Admin - Filter products
 *     description: Filter products by type and price range, with sorting and pagination.
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: string
 *         description: Filter by type ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price (VND)
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price (VND)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, name, view_count, rating]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
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
 *         description: Products filtered successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */


/**
 * @swagger
 * /admin/products/sort:
 *   get:
 *     summary: Admin - Sort products
 *     description: Sort products by various criteria with pagination.
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, name, view_count, rating]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
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
 *         description: Products sorted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */

/**
 * @swagger
 * /admin/products/{productId}:
 *   get:
 *     summary: Admin - Get product detail
 *     description: Retrieve detailed information of a product.
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /admin/products/{productId}:
 *   patch:
 *     summary: Admin - Delete (deactivate) product
 *     description: Soft-delete or deactivate a product by ID.
 *     tags:
 *       - Admin Products
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
 *         description: Product deactivated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Product not found
 */
Router.get(
    "/",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminGetAllProducts
);
Router.get(
    "/filter",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminFilterProducts
);
Router.get(
    "/search",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminSearchProducts
);
Router.get(
    "/sort",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminSortProducts
);

Router.patch(
    "/:productId",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminDeleteProduct
);
Router.get(
    "/:productId",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminGetProductDetail
);

export const adminProductRoute = Router;
