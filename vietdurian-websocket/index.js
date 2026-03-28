import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./lib/mongo.js";
import { initSocket } from "./socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.get("/", (req, res) => res.send("OK")); // ← health check
app.get("/health", (req, res) => res.json({ status: "ok" })); // ← Render ping

await connectDB();
initSocket(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
