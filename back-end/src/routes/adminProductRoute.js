import express from "express";
import { adminProductController } from "@/controllers/adminProductController.js";
import { authMiddleware } from "@/middlewares/authentication.js";
import { authorizationMiddleware } from "@/middlewares/authorization.js";

const Router = express.Router();

Router.get(
    "/",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminGetAllProducts
);

Router.get(
    "/search",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminSearchProducts
);

Router.get(
    "/filter",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminFilterProducts
);

Router.get(
    "/sort",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminSortProducts
);

Router.get(
    "/:productId",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminGetProductDetail
);

Router.delete(
    "/:productId",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    adminProductController.adminDeleteProduct
);

export const adminProductRoute = Router;
