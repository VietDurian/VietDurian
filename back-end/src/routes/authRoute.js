/** Vo Lam Thuy Vi */
import express from "express";
import * as authController from "../controllers/authController";

const Router = express.Router();
Router.post("/register", authController.register);
Router.post("/verify-email", authController.verifyEmail);
export const authRoute = Router;
