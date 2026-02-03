import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "@/config/swagger";
import { API_v1 } from "@/routes/index";
import connectDB from "@/config/mongoose";
import { app, server } from "./lib/socket";
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Cors
app.use(cors());

// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Api V1 Routes
app.use("/api/v1", API_v1);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});
