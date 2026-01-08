//Vo Lam Thuy Vi
import express from "express";
import { serviceProviderProfileController } from "@/controllers/serviceProviderProfileController.js";
import { authMiddleware } from "@/middlewares/authentication.js";
import { authorizationMiddleware } from "@/middlewares/authorization.js";

const Router = express.Router();

Router.post(
    "/",
    authMiddleware.protect,
    authorizationMiddleware.hasRole("serviceProvider"),
    serviceProviderProfileController.addCapabilityProfile
);

Router.put(
    "/",
    authMiddleware.protect,
    authorizationMiddleware.hasRole("serviceProvider"),
    serviceProviderProfileController.updateCapabilityProfile
);

export const serviceProviderProfileRoute = Router;
