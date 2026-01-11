// Vo Lam Thuy Vi
import express from "express";
import { productController } from "@/controllers/productController.js";
import { authMiddleware } from "@/middlewares/authentication.js";

const Router = express.Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new agricultural product to the marketplace
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Organic Tomatoes"
 *               description:
 *                 type: string
 *                 example: "Fresh organic tomatoes grown without pesticides"
 *               price:
 *                 type: number
 *                 example: 50000
 *               discount:
 *                 type: number
 *                 example: 10000
 *               stock:
 *                 type: number
 *                 example: 100
 *               origin:
 *                 type: string
 *                 example: "Da Lat, Vietnam"
 *               weight:
 *                 type: number
 *                 example: 2.5
 *               typeId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg"]
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: User not authenticated
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with search, filter, and sort
 *     description: Browse all available products on the platform with pagination
 *     tags:
 *       - Products
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, name, view_count]
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
 *                 code:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     description: Find products using search functionality
 *     tags:
 *       - Products
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
 *         description: Search keyword is required
 */

/**
 * @swagger
 * /products/filter:
 *   get:
 *     summary: Filter products
 *     description: Apply filters to narrow product search results
 *     tags:
 *       - Products
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
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
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
 */

/**
 * @swagger
 * /products/sort:
 *   get:
 *     summary: Sort products
 *     description: Organize products by various criteria
 *     tags:
 *       - Products
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
 */

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get product detail
 *     description: View comprehensive product information and specifications
 *     tags:
 *       - Products
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
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{productId}:
 *   put:
 *     summary: Update product
 *     description: Modify existing product information
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               stock:
 *                 type: number
 *               origin:
 *                 type: string
 *               weight:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete product
 *     description: Remove products from the marketplace
 *     tags:
 *       - Products
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
 *         description: Product deleted successfully
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Product not found
 */
Router.post("/", authMiddleware.protect, productController.createProduct);
Router.get("/", productController.getAllProducts);
Router.get("/search", productController.searchProducts);
Router.get("/sort", productController.sortProducts);
Router.get("/filter", productController.filterProducts);
Router.get("/:productId", productController.getProductDetail);

Router.put(
  "/:productId",
  authMiddleware.protect,
  productController.updateProduct
);
Router.delete(
  "/:productId",
  authMiddleware.protect,
  productController.deleteProduct
);

export const productRoute = Router;
