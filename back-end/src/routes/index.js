import express from "express";

import { authRoute } from "@/routes/authRoute";
// import { profileRoute } from "@/routes/profileRoute";
import { typeProductRoute } from "@/routes/typeProductRoute";
import { stepRoute } from "@/routes/stepRoute";
import { blogRoute } from "@/routes/blogRoute";
import { postRoute } from "@/routes/postRoute";
import { commentPostRoute } from "@/routes/commentPostRoute";
import { reactionCommentRoute } from "@/routes/reactionCommentRoute";
import { reportPostRoute } from "@/routes/reportPostRoute";

const Router = express.Router();

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Health check API
 *     description: Check if the server is running
 *     responses:
 *       200:
 *         description: Server is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
Router.get("/status", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

Router.use("/auth", authRoute);
// Router.use('/user', userRoute);
// Router.use("/profile", profileRoute);
Router.use("/type-product", typeProductRoute);
Router.use("/step", stepRoute);
Router.use("/blog", blogRoute);
Router.use("/post", postRoute);
Router.use("/report", reportPostRoute);
Router.use("/comment", commentPostRoute);
Router.use("/reaction", reactionCommentRoute);
export const API_v1 = Router;
