import express from "express";
import multer from "multer";

import { aiController } from "@/controllers/aiController.js";

const Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Frontend should send multipart/form-data with field name: image
Router.post("/predict", upload.single("image"), aiController.predict);

export const aiRoute = Router;
