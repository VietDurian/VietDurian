import express from "express";
import { gardenController } from "../controllers/gardenController.js";
import { authMiddleware } from "../middlewares/authentication";

const Router = express.Router();

Router.get("/map", gardenController.viewMap);

// Get garden details by ID (public)
Router.get("/details", gardenController.getGardenDetails);

Router.get(
  "/my-gardens",
  authMiddleware.protect,
  gardenController.getUserGardens
);

Router.post(
  "/register",
  authMiddleware.protect,
  gardenController.registerGarden
);

Router.put("/edit", authMiddleware.protect, gardenController.editGarden);

// Router.delete("/delete", authMiddleware.protect, gardenController.deleteGarden);

export default Router;
