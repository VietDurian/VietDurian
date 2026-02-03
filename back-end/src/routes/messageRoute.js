import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "@/controllers/messageController.js";

const router = express.Router();

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);

router.post("/send/:id", sendMessage);

export { router as messageRoute };
