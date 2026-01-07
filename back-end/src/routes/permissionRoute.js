// Vo Lam Thuy Vi
import express from "express";
import { permissionController } from "@/controllers/permissionController.js";
import { authMiddleware } from "@/middlewares/authentication.js";
import { authorizationMiddleware } from "@/middlewares/authorization.js";

const Router = express.Router();

Router.get(
    "/requests",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    permissionController.getPermissionRequests
);
Router.get(
    "/requests/search",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    permissionController.searchPermissionRequests
);

Router.get(
    "/requests/sort",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    permissionController.sortPermissionRequests
);
Router.get(
    "/requests/:request_id",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    permissionController.getPermissionRequestDetail
);
Router.post(
    "/requests/:request_id/confirm",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    permissionController.confirmAccount
);

Router.post(
    "/requests/:request_id/reject",
    authMiddleware.protect,
    authorizationMiddleware.isAdmin,
    permissionController.rejectAccount
);

export const permissionRoute = Router;
