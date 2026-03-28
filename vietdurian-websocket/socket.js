import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerChatHandlers } from "./handlers/chat.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://viet-durian.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) throw new Error("No token");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        userId: decoded.id,
        username: decoded.username || "",
        avatar: decoded.avatar || "",
        role: decoded.role || "user",
      };
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.user.userId);

    // Join room theo userId
    socket.join(`user:${socket.user.userId}`);

    // Register handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.user.userId);
    });
  });

  return io;
};
